import User from "./users.model.js";

class UserDal {
  // Crear usuario
  createUser = async(userData) => {
    return await User.create(userData);
  }

  // Buscar por email (para login/registro/forgotPassword)
  getUserByEmail = async(email) => {
    return await User.findOne({ where: { email } });
  }

  // Buscar por id (perfil) -> aquí ocultamos la password
  getUserById= async(user_id) => {
    return await User.findByPk(user_id, {
      attributes: ["user_id", "user_name", "lastname", "email", "avatar"],
    });
  }

  // Buscar por reset_token
  getUserByResetToken = async(token) => {
    return await User.findOne({ where: { reset_token: token } });
  }
}

export default new UserDal();
