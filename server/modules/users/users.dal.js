import User from "./users.model.js";

class UserDal {
  // Crear usuario (lastname puede ser null)
  async createUser(userData) {
    return await User.create(userData);
  }

  // Necesitamos password para login, así que no excluimos atributos
  async getUserByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  // Buscar usuario por id (aquí no necesitamos password)
  async getUserById(user_id) {
    return await User.findByPk(user_id, {
      attributes: ["user_id", "user_name", "lastname", "email", "avatar"], // 👈 solo los públicos
    });
  }
}

export default new UserDal();
