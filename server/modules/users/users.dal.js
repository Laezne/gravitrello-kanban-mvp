import User from "./users.model.js";
import { Op } from "sequelize";

class UserDal {
  async createUser(userData) {
    return await User.create(userData);
  }

  // 👇 Necesitamos el password para comparar en login
  async getUserByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  async getUserByUsername(user_name) {
    return await User.findOne({ where: { user_name } });
  }

  // 👇 Aquí no necesitamos password, así que lo excluimos
  async getUserById(user_id) {
    return await User.findByPk(user_id, {
      attributes: ["user_id", "user_name", "lastname", "email", "avatar"], // 👈 solo estos
    });
  }


  // 👇 Esto lo puedes usar para login (necesitas el password)
  async getUserByEmailOrUsername(identifier) {
    return await User.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { user_name: identifier }],
      },
    });
  }
}

export default new UserDal();
