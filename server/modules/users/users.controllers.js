import bcrypt from "bcrypt";
import userDal from "./users.dal.js";

class UserController {
  // Registro
  register = async (req, res) => {
    try {
      const { user_name, lastname, email, password } = req.body;

      if (!user_name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Nombre de usuario, email y contraseña son requeridos",
        });
      }

      // Verificar solo si el email ya existe
      const existingUser = await userDal.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "El email ya está registrado",
        });
      }

      // Hashear contraseña
      const hashedPassword = await bcrypt.hash(password, 12);

      // Crear usuario (lastname puede ser null)
      const user = await userDal.createUser({
        user_name,
        lastname: lastname || null,
        email,
        password: hashedPassword,
      });

      // Guardar en sesión
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
    } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  };


  // Login
  login = async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email y contraseña son requeridos",
        });
      }

      const user = await userDal.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Credenciales inválidas",
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Credenciales inválidas",
        });
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
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  };

  // Logout
  logout = (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error al cerrar sesión",
        });
      }

      res.clearCookie("connect.sid");
      res.json({
        success: true,
        message: "Logout exitoso",
      });
    });
  };

  // Perfil
  getProfile = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado",
        });
      }

      const user = await userDal.getUserById(req.session.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      console.error("Error obteniendo perfil:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  };
}

export default new UserController();
