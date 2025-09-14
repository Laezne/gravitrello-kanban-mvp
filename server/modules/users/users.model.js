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
      allowNull: true,
    },
    user_is_confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    user_is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    reset_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_token_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    two_factor_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    two_factor_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "user", 
    timestamps: false, 
    freezeTableName: true,

    
  }
);

export default User;
