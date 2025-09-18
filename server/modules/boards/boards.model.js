// Definición del modelo Board - Sequelize ORM
// Representa la entidad board (tablero) con todos sus campos y validaciones
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const Board = sequelize.define(
  "Board", // Nombre del modelo
  {
    board_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    board_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre del tablero es obligatorio"
        },
        len: {
          args: [1, 100],
          msg: "El nombre debe tener entre 1 y 100 caracteres"
        }
      }
    },
    created_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'user',
        key: 'user_id'
      }
    },
    board_is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "board",
    timestamps: false,
    indexes: [
      {
        fields: ['created_by']
      },
      {
        fields: ['board_is_deleted']
      }
    ],
    scopes: {
      // Scope para obtener solo tableros activos
      active: {
        where: {
          board_is_deleted: false
        }
      }
    }
  }
);

// Métodos de instancia útiles
Board.prototype.isOwnedBy = function(userId) {
  return this.created_by === userId;
};

Board.prototype.softDelete = function() {
  return this.update({ board_is_deleted: true });
};

Board.prototype.isActive = function() {
  return !this.board_is_deleted;
};

export default Board;