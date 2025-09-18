// Definición del modelo User - Sequelize ORM
// Representa la entidad usuario con todos sus campos y validaciones

import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

// Definición del modelo User 
const User = sequelize.define(
  "User", // Nombre del modelo
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
        isEmail: true, // Validación automática de formato de email
      },
    },
    password: {
      type: DataTypes.STRING(200), // 200 caracteres para alojar hash bcrypt
      allowNull: false, 
    },
    avatar: {
      type: DataTypes.STRING(200), // Almacena solo el nombre del archivo, no la ruta completa
      allowNull: true, 
    },
    // Flag para confirmación de email (funcionalidad futura)
    user_is_confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, 
    },
    // Soft delete 
    user_is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Token JWT temporal para recuperación de contraseña
    reset_token: {
      type: DataTypes.STRING, 
      allowNull: true, // Solo existe cuando se solicita recuperación
    },
    // Fecha de expiración del token
    reset_token_expires_at: {
      type: DataTypes.DATE, 
      allowNull: true, // Solo existe cuando hay token activo
    },
    // Código de autenticación de dos factores
    two_factor_code: {
      type: DataTypes.STRING, 
      allowNull: true, // Solo existe durante el proceso de login 2FA
    },
    // Fecha de expiración del código 2FA
    two_factor_expires_at: {
      type: DataTypes.DATE, 
      allowNull: true, // Solo existe cuando hay código 2FA activo
    },
    // Registro del último login exitoso
    last_login_at: {
      type: DataTypes.DATE, // Timestamp del último acceso
      allowNull: true, // Null hasta el primer login
    },
  },
  {
    // Configuración del modelo
    tableName: "user", // Nombre exacto de la tabla en la BD 
    timestamps: false, // No crear campos createdAt/updatedAt automáticos
    freezeTableName: true, // No pluralizar el nombre de la tabla automáticamente
  }
);

export default User;