// Definición del modelo BoardColumn - Sequelize ORM
// Representa la entidad board_column (columna) con todos sus campos y validaciones
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const BoardColumn = sequelize.define(
  "BoardColumn", // Nombre del modelo
  {
    column_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    board_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'board',
        key: 'board_id'
      }
    },
    column_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre de la columna es obligatorio"
        },
        len: {
          args: [1, 100],
          msg: "El nombre debe tener entre 1 y 100 caracteres"
        }
      }
    },
    position: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: 0,
          msg: "La posición debe ser mayor o igual a 0"
        }
      }
    },
    column_is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "board_column",
    timestamps: false,
    indexes: [
      {
        fields: ['board_id']
      },
      {
        fields: ['position']
      },
      {
        fields: ['column_is_deleted']
      },
      {
        // Índice compuesto para ordenar columnas por tablero
        fields: ['board_id', 'position']
      }
    ],
    scopes: {
      // Scope para obtener solo columnas activas
      active: {
        where: {
          column_is_deleted: false
        }
      },
      // Scope para ordenar por posición
      ordered: {
        order: [['position', 'ASC']]
      },
      // Scope combinado: activas y ordenadas
      activeOrdered: {
        where: {
          column_is_deleted: false
        },
        order: [['position', 'ASC']]
      }
    }
  }
);

// Métodos de instancia útiles
BoardColumn.prototype.softDelete = function() {
  return this.update({ column_is_deleted: true });
};

BoardColumn.prototype.isActive = function() {
  return !this.column_is_deleted;
};

BoardColumn.prototype.belongsToBoard = function(boardId) {
  return this.board_id === boardId;
};

export default BoardColumn;