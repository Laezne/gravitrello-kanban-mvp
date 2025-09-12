// Creo el modelo para mi entidad user de la BD
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    user_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    lastname: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING(200),
    },
    user_is_confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    user_is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reset_token: DataTypes.STRING,
    reset_token_expires_at: DataTypes.DATE,
    two_factor_code: DataTypes.STRING,
    two_factor_expires_at: DataTypes.DATE,
    last_login_at: DataTypes.DATE,
  },
  {
    tableName: "user", // 👈 coincide con tu SQL
    timestamps: false, // porque tu tabla no tiene createdAt/updatedAt
    freezeTableName: true,
  }
);

export default User;
