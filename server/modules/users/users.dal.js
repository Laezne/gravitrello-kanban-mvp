// Capa de Acceso a Datos para la entidad Usuario
// Contiene todas las consultas y operaciones de base de datos relacionadas con usuarios
import User from "./users.model.js";

class UserDal {
  // Crear usuario
  createUser = async(userData) => {
    return await User.create(userData);
  }

  // Buscar por email (para login/registro/forgotPassword) - SIN password
  getUserByEmail = async(email) => {
    return await User.findOne({ 
      where: { email },
      attributes: ["user_id", "user_name", "lastname", "email", "avatar"]
    });
  }

  // Buscar por email CON password y códigos 2FA (para validación de credenciales)
  getUserByEmailWithPassword = async(email) => {
    return await User.findOne({ 
      where: { email },
      attributes: [
        "user_id", 
        "user_name", 
        "lastname", 
        "email", 
        "avatar", 
        "password",
        "two_factor_code",
        "two_factor_expires_at"
      ]
    });
  }

  // Buscar por id (perfil) 
  getUserById = async(user_id) => {
    return await User.findByPk(user_id, {
      attributes: ["user_id", "user_name", "lastname", "email", "avatar"],
    });
  }

  // Buscar por reset_token
  getUserByResetToken = async(token) => {
    return await User.findOne({ where: { reset_token: token } });
  }

  // Actualizar código 2FA
  updateTwoFactorCode = async(user_id, code, expiresAt) => {
    return await User.update(
      {
        two_factor_code: code,
        two_factor_expires_at: expiresAt
      },
      {
        where: { user_id }
      }
    );
  }

  // Limpiar código 2FA después de uso exitoso
  clearTwoFactorCode = async(user_id) => {
    return await User.update(
      {
        two_factor_code: null,
        two_factor_expires_at: null
      },
      {
        where: { user_id }
      }
    );
  }

  // Actualizar último login (útil para futuras funcionalidades)
  updateLastLogin = async(user_id) => {
    return await User.update(
      {
        last_login_at: new Date()
      },
      {
        where: { user_id }
      }
    );
  }
}

export default new UserDal();