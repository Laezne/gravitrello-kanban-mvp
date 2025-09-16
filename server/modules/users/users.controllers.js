import bcrypt from "bcrypt";
import userDal from "./users.dal.js";
import jwt from "jsonwebtoken";
import transporter from "../../utils/nodemailer.js";

class UserController {
// Registro con regeneración de sesión
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

          // Crear usuario
          const user = await userDal.createUser({
            user_name,
            lastname: lastname || null,
            email,
            password: hashedPassword,
          });

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

// Login con regeneración de sesión si ya existe una sesión activa
  login = async(req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email y contraseña son requeridos" });
      }

      // Función para continuar con el login
      const continueLogin = async () => {
        try {
          const user = await userDal.getUserByEmail(email);
          if (!user) {
            return res.status(401).json({ success: false, message: "Credenciales incorrectas" });
          }

          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return res.status(401).json({ success: false, message: "Credenciales incorrectas" });
          }

          req.session.userId = user.user_id;

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
        } catch (innerError) {
          console.error("Error en login:", innerError);
          res.status(500).json({ success: false, message: "Error interno del servidor" });
        }
      };

      // Si ya hay una sesión activa, regenerarla para evitar conflictos
      if (req.session.userId) {
        req.session.regenerate((err) => {
          if (err) {
            return res.status(500).json({ success: false, message: "Error de sesión" });
          }
          continueLogin();
        });
      } else {
        continueLogin();
      }

    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
  };

  // Logout
  logout = (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Error al cerrar sesión" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true, message: "Logout exitoso" });
    });
  };

  // Perfil
  getProfile = async(req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ success: false, message: "No autenticado" });
      }

      const user = await userDal.getUserById(req.session.userId);

      if (!user) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado" });
      }

      res.json({ success: true, user });
    } catch (error) {
      console.error("Error obteniendo perfil:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
  };

  // 1. Solicitud de recuperación
  forgotPassword = async(req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: "Email requerido" });
      }

      const user = await userDal.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado" });
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
      res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
  };

  // 2. Resetear contraseña
  resetPassword = async(req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ success: false, message: "Contraseña requerida" });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(400).json({ success: false, message: "El token no es válido o ha expirado" });
      }

      const user = await userDal.getUserByResetToken(token);

      if (!user || user.user_id !== decoded.userId || user.reset_token_expires_at < new Date()) {
        return res.status(400).json({ success: false, message: "El token no es válido o ha expirado" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
      user.reset_token = null;
      user.reset_token_expires_at = null;
      await user.save();

      res.json({ success: true, message: "Contraseña actualizada con éxito" });
    } catch (error) {
      console.error("Error en resetPassword:", error);
      res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
  };
}

export default new UserController();
