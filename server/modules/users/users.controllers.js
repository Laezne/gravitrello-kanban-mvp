// Controlador para todas las operaciones relacionadas con usuarios 
// Maneja req y res
import bcrypt from "bcrypt";
import userDal from "./users.dal.js";
import jwt from "jsonwebtoken";
import transporter from "../../utils/nodemailer.js";

class UserController {
  // Registro con regeneración de sesión y avatar opcional
  register = async(req, res) => {
    try {
      const { user_name, lastname, email, password } = req.body;

      if (!user_name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Nombre de usuario, email y contraseña son requeridos",
        });
      }

      // Regenerar sesión para asegurar limpieza completa
      req.session.regenerate(async (err) => {
        if (err) {
          return res.status(500).json({ 
            success: false, 
            message: "Error de sesión" 
          });
        }
        
        try {
          // Verificar si el email ya existe
          const existingUser = await userDal.getUserByEmail(email);
          if (existingUser) {
            return res.status(400).json({
              success: false,
              message: "El email ya está registrado",
            });
          }

          // Hashear contraseña
          const hashedPassword = await bcrypt.hash(password, 12);

          // Preparar datos del usuario
          const userData = {
            user_name,
            lastname: lastname || null,
            email,
            password: hashedPassword,
          };

          // 🔑 Si se subió un archivo de avatar, añadirlo
          if (req.file) {
            userData.avatar = req.file.filename;
          }

          // Crear usuario
          const user = await userDal.createUser(userData);

          // Guardar en la nueva sesión limpia
          req.session.userId = user.user_id;

          res.status(201).json({
            success: true,
            message: "Usuario registrado exitosamente",
            user: {
              user_id: user.user_id,
              user_name: user.user_name,
              lastname: user.lastname,
              email: user.email,
              avatar: user.avatar,
            },
          });
        } catch (innerError) {
          console.error("Error en registro:", innerError);
          res.status(500).json({ success: false, message: "Error interno del servidor" });
        }
      });

    } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
  };

  // PASO 1: Login inicial - valida credenciales y envía código 2FA
  loginStep1 = async(req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: "Email y contraseña son requeridos" 
        });
      }

      // Función para continuar con validación de credenciales
      const continueLogin = async () => {
        try {
          const user = await userDal.getUserByEmailWithPassword(email);
          if (!user) {
            return res.status(401).json({ 
              success: false, 
              message: "Credenciales incorrectas" 
            });
          }

          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return res.status(401).json({ 
              success: false, 
              message: "Credenciales incorrectas" 
            });
          }

          // Credenciales válidas - generar código 2FA
          const twoFactorCode = this.generateTwoFactorCode();
          const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

          // Actualizar usuario con código 2FA
          await userDal.updateTwoFactorCode(user.user_id, twoFactorCode, expiresAt);

          // Enviar email con código
          await this.sendTwoFactorEmail(user.email, user.user_name, twoFactorCode);

          // Guardar temporalmente el user_id para el paso 2
          req.session.tempUserId = user.user_id;

          res.json({
            success: true,
            message: "Código de verificación enviado a tu email",
            requiresTwoFactor: true,
            email: user.email.replace(/(.{2}).*(@.*)/, '$1***$2') // Mostrar email parcialmente
          });

        } catch (innerError) {
          console.error("Error en loginStep1:", innerError);
          res.status(500).json({ 
            success: false, 
            message: "Error interno del servidor" 
          });
        }
      };

      // Si ya hay una sesión activa, regenerarla para evitar conflictos
      if (req.session.userId) {
        req.session.regenerate((err) => {
          if (err) {
            return res.status(500).json({ 
              success: false, 
              message: "Error de sesión" 
            });
          }
          continueLogin();
        });
      } else {
        continueLogin();
      }

    } catch (error) {
      console.error("Error en loginStep1:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error interno del servidor" 
      });
    }
  }

  // PASO 2: Verificar código 2FA y completar login
  loginStep2 = async(req, res) => {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ 
          success: false, 
          message: "Código de verificación requerido" 
        });
      }

      if (!req.session.tempUserId) {
        return res.status(400).json({ 
          success: false, 
          message: "Sesión inválida. Inicia el proceso de login nuevamente" 
        });
      }

      const user = await userDal.getUserById(req.session.tempUserId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "Usuario no encontrado" 
        });
      }

      const userWithCodes = await userDal.getUserByEmailWithPassword(user.email);

      // Verificar código y expiración
      if (!userWithCodes.two_factor_code || 
          userWithCodes.two_factor_code !== code || 
          userWithCodes.two_factor_expires_at < new Date()) {
        return res.status(401).json({ 
          success: false, 
          message: "Código inválido o expirado" 
        });
      }

      // Código válido - completar login
      // Limpiar código 2FA
      await userDal.clearTwoFactorCode(user.user_id);
      
      // Actualizar último login
      await userDal.updateLastLogin(user.user_id);

      // Crear sesión definitiva
      req.session.userId = user.user_id;
      delete req.session.tempUserId;

      res.json({
        success: true,
        message: "Login exitoso",
        user: {
          user_id: user.user_id,
          user_name: user.user_name,
          lastname: user.lastname,
          email: user.email,
          avatar: user.avatar,
        },
      });

    } catch (error) {
      console.error("Error en loginStep2:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error interno del servidor" 
      });
    }
  };

  // Reenviar código 2FA
  resendTwoFactorCode = async(req, res) => {
    try {
      if (!req.session.tempUserId) {
        return res.status(400).json({ 
          success: false, 
          message: "No hay sesión válida para reenvío" 
        });
      }

      const user = await userDal.getUserById(req.session.tempUserId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "Usuario no encontrado" 
        });
      }

      // Generar nuevo código
      const twoFactorCode = this.generateTwoFactorCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

      // Actualizar código
      await userDal.updateTwoFactorCode(user.user_id, twoFactorCode, expiresAt);

      // Reenviar email
      await this.sendTwoFactorEmail(user.email, user.user_name, twoFactorCode);

      res.json({
        success: true,
        message: "Código reenviado exitosamente"
      });

    } catch (error) {
      console.error("Error en resendTwoFactorCode:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error interno del servidor" 
      });
    }
  };

  // Generar código aleatorio de 6 dígitos
  generateTwoFactorCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Enviar email con código 2FA
  sendTwoFactorEmail = async(email, userName, code) => {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2D3748;">🔐 Código de Verificación</h2>
        <p>¡Hola, <strong>${userName}</strong>!</p>
        <p>Tu código de verificación de dos factores es:</p>
        
        <div style="background: #EDF2F7; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #2D3748; font-size: 32px; letter-spacing: 8px; margin: 0;">
            ${code}
          </h1>
        </div>
        
        <p>Este código expirará en <strong>10 minutos</strong>.</p>
        <p>Si no solicitaste este código, puedes ignorar este email.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E2E8F0;">
        <p style="color: #718096; font-size: 12px;">
          Este es un email automático, por favor no respondas.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "🔐 Tu código de verificación",
      html: htmlContent,
    });
  };

  // Logout
  logout = (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: "Error al cerrar sesión" 
        });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true, message: "Logout exitoso" });
    });
  };

  // Perfil
  getProfile = async(req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ 
          success: false, 
          message: "No autenticado" 
        });
      }

      const user = await userDal.getUserById(req.session.userId);

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "Usuario no encontrado" 
        });
      }

      res.json({ success: true, user });
    } catch (error) {
      console.error("Error obteniendo perfil:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error interno del servidor" 
      });
    }
  };

  // 1. Solicitud de recuperación
  forgotPassword = async(req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          message: "Email requerido" 
        });
      }

      const user = await userDal.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "Usuario no encontrado" 
        });
      }

      // Generar token
      const resetToken = jwt.sign(
        { userId: user.user_id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_RESET_EXPIRES || "15m" }
      );

      user.reset_token = resetToken;
      user.reset_token_expires_at = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      // Enviar correo
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: user.email,
        subject: "Recupera tu contraseña",
        html: `
          <p>¡Hola, ${user.user_name}!</p>
          <p>Haz click en el siguiente enlace para restablecer tu contraseña:</p>
          <a href="${resetUrl}" target="_blank">${resetUrl}</a>
          <p>Este enlace expirará en 15 minutos.</p>
        `,
      });

      res.json({ success: true, message: "Correo de recuperación enviado" });
    } catch (error) {
      console.error("Error en forgotPassword:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error interno del servidor" 
      });
    }
  };

  // 2. Resetear contraseña
  resetPassword = async(req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ 
          success: false, 
          message: "Contraseña requerida" 
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(400).json({ 
          success: false, 
          message: "El token no es válido o ha expirado" 
        });
      }

      const user = await userDal.getUserByResetToken(token);

      if (!user || user.user_id !== decoded.userId || user.reset_token_expires_at < new Date()) {
        return res.status(400).json({ 
          success: false, 
          message: "El token no es válido o ha expirado" 
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
      user.reset_token = null;
      user.reset_token_expires_at = null;
      await user.save();

      res.json({ success: true, message: "Contraseña actualizada con éxito" });
    } catch (error) {
      console.error("Error en resetPassword:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error interno del servidor" 
      });
    }
  };
}

export default new UserController();