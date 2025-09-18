import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import BoardColumn from "./boardColumns.model.js";

class BoardColumnDal {
  
  // OPERACIÓN PRINCIPAL PARA DASHBOARD:

  // Obtener columnas con sus tareas (para cargar todo el tablero)
  getColumnsWithTasks = async (boardId) => {
    return await BoardColumn.scope('activeOrdered').findAll({
      where: { board_id: boardId },
      include: [{
        model: sequelize.models.Task,
        as: 'tasks',
        required: false, // LEFT JOIN para incluir columnas sin tareas
        order: [['position', 'ASC']],
        include: [
          {
            model: sequelize.models.User,
            as: 'assignedUsers',
            attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar'],
            through: { attributes: [] },
            required: false
          },
          {
            model: sequelize.models.User,
            as: 'creator',
            attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar']
          }
        ]
      }]
    });
  }

  // OPERACIONES BÁSICAS DE APOYO:

  // Obtener todas las columnas de un tablero (sin tareas)
  getColumnsByBoard = async (boardId) => {
    return await BoardColumn.scope('activeOrdered').findAll({
      where: { board_id: boardId }
    });
  }

  // Obtener columna por ID
  getColumnById = async (columnId) => {
    return await BoardColumn.findByPk(columnId);
  }

  // Obtener columna activa por ID
  getActiveColumnById = async (columnId) => {
    return await BoardColumn.scope('active').findByPk(columnId);
  }

  // Buscar columna por nombre en un tablero
  findColumnByName = async (boardId, columnName) => {
    return await BoardColumn.scope('active').findOne({
      where: { 
        board_id: boardId,
        column_name: columnName 
      }
    });
  }

  // OPERACIONES PARA CREACIÓN DE TABLEROS:

  // Crear columnas FIJAS por defecto para un tablero nuevo
  createDefaultColumns = async (boardId, transaction = null) => {
    const defaultColumns = [
      { board_id: boardId, column_name: 'To Do', position: 1 },
      { board_id: boardId, column_name: 'Doing', position: 2 },
      { board_id: boardId, column_name: 'In revision', position: 3 },
      { board_id: boardId, column_name: 'Done', position: 4 }
    ];
    
    return await BoardColumn.bulkCreate(defaultColumns, { transaction });
  }

  // ESTADÍSTICAS:

  // Contar tareas de una columna
  countTasksByColumn = async (columnId) => {
    return await sequelize.models.Task.count({
      where: { column_id: columnId }
    });
  }

  // Contar tareas completadas de una columna
  countCompletedTasksByColumn = async (columnId) => {
    return await sequelize.models.Task.count({
      where: { 
        column_id: columnId,
        task_is_completed: true
      }
    });
  }
}

export default new BoardColumnDal();