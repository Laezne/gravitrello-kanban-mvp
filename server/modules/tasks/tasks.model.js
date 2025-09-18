// Definición del modelo Task - Sequelize ORM
// Representa la entidad task (tarea) con todos sus campos y validaciones

import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const Task = sequelize.define(
  "Task", // Nombre del modelo
  {
    task_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    task_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El título de la tarea es obligatorio"
        },
        len: {
          args: [1, 255],
          msg: "El título debe tener entre 1 y 255 caracteres"
        }
      }
    },
    task_description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    task_is_completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    position: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          min: 0,
          msg: "La posición debe ser mayor o igual a 0"
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
    column_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'board_column',
        key: 'column_id'
      }
    }
  },
  {
    tableName: "task",
    timestamps: false,
    indexes: [
      {
        fields: ['column_id']
      },
      {
        fields: ['created_by']
      },
      {
        fields: ['position']
      },
      {
        fields: ['task_is_completed']
      },
      {
        // Índice compuesto para ordenar tareas por columna
        fields: ['column_id', 'position']
      }
    ],
    scopes: {
      // Scope para tareas completadas
      completed: {
        where: {
          task_is_completed: true
        }
      },
      // Scope para tareas pendientes
      pending: {
        where: {
          task_is_completed: false
        }
      },
      // Scope para ordenar por posición
      ordered: {
        order: [['position', 'ASC']]
      },
      // Scope combinado: ordenadas
      activeOrdered: {
        order: [['position', 'ASC']]
      }
    }
  }
);

// Asociaciones
Task.associate = (models) => {
  // Relación: Task pertenece a BoardColumn
  Task.belongsTo(models.BoardColumn, {
    foreignKey: 'column_id',
    as: 'column',
    onDelete: 'CASCADE'
  });

  // Relación: Task pertenece a User (creador)
  Task.belongsTo(models.User, {
    foreignKey: 'created_by',
    as: 'creator'
  });

  // Relación muchos a muchos: Task puede ser asignada a muchos Users
  Task.belongsToMany(models.User, {
    through: 'user_task',
    foreignKey: 'task_id',
    otherKey: 'user_id',
    as: 'assignedUsers'
  });

  // Relación indirecta: Task pertenece a Board a través de BoardColumn
  Task.belongsTo(models.Board, {
    through: models.BoardColumn,
    foreignKey: 'column_id',
    as: 'board'
  });
};

// Métodos de instancia útiles
Task.prototype.toggleComplete = function() {
  return this.update({ task_is_completed: !this.task_is_completed });
};

Task.prototype.isCompleted = function() {
  return this.task_is_completed;
};

Task.prototype.isPending = function() {
  return !this.task_is_completed;
};

Task.prototype.belongsToColumn = function(columnId) {
  return this.column_id === columnId;
};

Task.prototype.isCreatedBy = function(userId) {
  return this.created_by === userId;
};

export default Task;