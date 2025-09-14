import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import Task from "./tasks.model.js";

class TaskDal {
  
  // ========================================
  // OPERACIONES BÁSICAS CRUD
  // ========================================

  // 📋 Obtener todas las tareas de una columna
  getTasksByColumn = async (columnId) => {
    return await Task.scope('activeOrdered').findAll({
      where: { column_id: columnId },
      include: [
        {
          association: 'assignedUsers',
          attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar'],
          through: { attributes: [] } // No incluir datos de la tabla intermedia
        },
        {
          association: 'creator',
          attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar']
        }
      ]
    });
  };

  // 📋 Obtener todas las tareas de un tablero
  getTasksByBoard = async (boardId) => {
    return await Task.scope('activeOrdered').findAll({
      include: [
        {
          association: 'column',
          where: { board_id: boardId },
          attributes: ['column_id', 'column_name', 'position']
        },
        {
          association: 'assignedUsers',
          attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar'],
          through: { attributes: [] }
        },
        {
          association: 'creator',
          attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar']
        }
      ]
    });
  };

  // 📋 Obtener tarea por ID
  getTaskById = async (taskId) => {
    return await Task.findByPk(taskId, {
      include: [
        {
          association: 'column',
          attributes: ['column_id', 'column_name', 'board_id']
        },
        {
          association: 'assignedUsers',
          attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar'],
          through: { attributes: [] }
        },
        {
          association: 'creator',
          attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar']
        }
      ]
    });
  };

  // ✏️ Crear nueva tarea
  createTask = async (taskData) => {
    const nextPosition = await this.getNextPosition(taskData.column_id);
    
    const task = await Task.create({
      ...taskData,
      position: taskData.position || nextPosition
    });

    // Si hay usuarios asignados, crear las relaciones
    if (taskData.assignedUsers && taskData.assignedUsers.length > 0) {
      await this.assignUsersToTask(task.task_id, taskData.assignedUsers);
    }

    return await this.getTaskById(task.task_id);
  };

  // ✏️ Actualizar tarea
  updateTask = async (taskId, updateData) => {
    const [affectedRows] = await Task.update(updateData, {
      where: { task_id: taskId }
    });
    
    if (affectedRows === 0) {
      throw new Error('Tarea no encontrada');
    }
    
    return await this.getTaskById(taskId);
  };

  // 🗑️ Eliminar tarea
  deleteTask = async (taskId) => {
    const task = await this.getTaskById(taskId);
    if (!task) {
      throw new Error('Tarea no encontrada');
    }
    
    const transaction = await sequelize.transaction();
    
    try {
      // Eliminar primero las asignaciones de usuarios
      await sequelize.query(
        'DELETE FROM user_task WHERE task_id = ?',
        { 
          replacements: [taskId], 
          transaction 
        }
      );
      
      // Eliminar la tarea
      await Task.destroy({
        where: { task_id: taskId },
        transaction
      });
      
      // Reorganizar posiciones después de eliminar
      await this.reorderPositions(task.column_id, transaction);
      
      await transaction.commit();
      return { success: true, message: 'Tarea eliminada correctamente' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  // ========================================
  // OPERACIONES DE POSICIONAMIENTO
  // ========================================

  // 📊 Obtener siguiente posición disponible para una columna
  getNextPosition = async (columnId) => {
    const maxPosition = await Task.max('position', {
      where: { column_id: columnId }
    });
    return (maxPosition || 0) + 1;
  };

  // 🔄 Mover tarea a nueva posición dentro de la misma columna
  moveTaskToPosition = async (taskId, newPosition) => {
    const task = await this.getTaskById(taskId);
    if (!task) {
      throw new Error('Tarea no encontrada');
    }
    
    const transaction = await sequelize.transaction();
    
    try {
      const oldPosition = task.position;
      
      if (newPosition === oldPosition) {
        await transaction.commit();
        return task;
      }
      
      if (newPosition > oldPosition) {
        // Mover hacia adelante: decrementar posiciones intermedias
        await Task.update(
          { position: sequelize.literal('position - 1') },
          {
            where: {
              column_id: task.column_id,
              position: { [Op.gt]: oldPosition, [Op.lte]: newPosition },
              task_id: { [Op.ne]: taskId }
            },
            transaction
          }
        );
      } else {
        // Mover hacia atrás: incrementar posiciones intermedias
        await Task.update(
          { position: sequelize.literal('position + 1') },
          {
            where: {
              column_id: task.column_id,
              position: { [Op.gte]: newPosition, [Op.lt]: oldPosition },
              task_id: { [Op.ne]: taskId }
            },
            transaction
          }
        );
      }
      
      // Actualizar la posición de esta tarea
      await task.update({ position: newPosition }, { transaction });
      
      await transaction.commit();
      return await this.getTaskById(taskId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  // 🔄 Mover tarea a otra columna
  moveTaskToColumn = async (taskId, newColumnId, newPosition = null) => {
    const task = await this.getTaskById(taskId);
    if (!task) {
      throw new Error('Tarea no encontrada');
    }
    
    const transaction = await sequelize.transaction();
    
    try {
      const oldColumnId = task.column_id;
      const targetPosition = newPosition || await this.getNextPosition(newColumnId);
      
      // Si es la misma columna, solo cambiar posición
      if (oldColumnId === newColumnId) {
        await transaction.rollback();
        return await this.moveTaskToPosition(taskId, targetPosition);
      }
      
      // Reorganizar posiciones en columna origen (cerrar hueco)
      await Task.update(
        { position: sequelize.literal('position - 1') },
        {
          where: {
            column_id: oldColumnId,
            position: { [Op.gt]: task.position }
          },
          transaction
        }
      );
      
      // Hacer espacio en columna destino
      await Task.update(
        { position: sequelize.literal('position + 1') },
        {
          where: {
            column_id: newColumnId,
            position: { [Op.gte]: targetPosition }
          },
          transaction
        }
      );
      
      // Mover la tarea a la nueva columna y posición
      await task.update({
        column_id: newColumnId,
        position: targetPosition
      }, { transaction });
      
      await transaction.commit();
      return await this.getTaskById(taskId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  // 🔄 Reorganizar todas las posiciones de las tareas de una columna
  reorderPositions = async (columnId, transaction = null) => {
    const tasks = await Task.findAll({
      where: { column_id: columnId },
      order: [['position', 'ASC']],
      transaction
    });
    
    const shouldCommit = !transaction;
    if (shouldCommit) {
      transaction = await sequelize.transaction();
    }
    
    try {
      for (let i = 0; i < tasks.length; i++) {
        await tasks[i].update({ position: i + 1 }, { transaction });
      }
      
      if (shouldCommit) {
        await transaction.commit();
      }
      
      return { success: true, message: 'Posiciones reorganizadas correctamente' };
    } catch (error) {
      if (shouldCommit) {
        await transaction.rollback();
      }
      throw error;
    }
  };

  // ========================================
  // OPERACIONES DE ASIGNACIÓN DE USUARIOS
  // ========================================

  // 👤 Asignar usuarios a una tarea
  assignUsersToTask = async (taskId, userIds) => {
    const transaction = await sequelize.transaction();
    
    try {
      // Eliminar asignaciones existentes
      await sequelize.query(
        'DELETE FROM user_task WHERE task_id = ?',
        { 
          replacements: [taskId], 
          transaction 
        }
      );
      
      // Crear nuevas asignaciones
      if (userIds && userIds.length > 0) {
        const assignments = userIds.map(userId => ({ user_id: userId, task_id: taskId }));
        await sequelize.getQueryInterface().bulkInsert('user_task', assignments, { transaction });
      }
      
      await transaction.commit();
      return await this.getTaskById(taskId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  // 👤 Agregar usuario a tarea
  addUserToTask = async (taskId, userId) => {
    try {
      await sequelize.query(
        'INSERT IGNORE INTO user_task (user_id, task_id) VALUES (?, ?)',
        { replacements: [userId, taskId] }
      );
      return await this.getTaskById(taskId);
    } catch (error) {
      throw error;
    }
  };

  // 👤 Remover usuario de tarea
  removeUserFromTask = async (taskId, userId) => {
    await sequelize.query(
      'DELETE FROM user_task WHERE user_id = ? AND task_id = ?',
      { replacements: [userId, taskId] }
    );
    return await this.getTaskById(taskId);
  };

  // ========================================
  // OPERACIONES DE ESTADO
  // ========================================

  // ✅ Marcar tarea como completada/no completada
  toggleTaskComplete = async (taskId) => {
    const task = await this.getTaskById(taskId);
    if (!task) {
      throw new Error('Tarea no encontrada');
    }
    
    await task.toggleComplete();
    return await this.getTaskById(taskId);
  };

  // ========================================
  // CONSULTAS Y FILTROS
  // ========================================

  // 📊 Contar tareas de una columna
  countTasksByColumn = async (columnId) => {
    return await Task.count({
      where: { column_id: columnId }
    });
  };

  // 📊 Contar tareas completadas de una columna
  countCompletedTasksByColumn = async (columnId) => {
    return await Task.count({
      where: { 
        column_id: columnId,
        task_is_completed: true
      }
    });
  };

  // 🔍 Obtener tareas asignadas a un usuario
  getTasksByUser = async (userId) => {
    return await Task.findAll({
      include: [
        {
          association: 'assignedUsers',
          where: { user_id: userId },
          attributes: [],
          through: { attributes: [] }
        },
        {
          association: 'column',
          attributes: ['column_id', 'column_name', 'board_id']
        },
        {
          association: 'creator',
          attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar']
        }
      ],
      order: [['position', 'ASC']]
    });
  };

  // 🔍 Obtener tareas completadas/pendientes
  getTasksByStatus = async (columnId, isCompleted) => {
    return await Task.scope('activeOrdered').findAll({
      where: { 
        column_id: columnId,
        task_is_completed: isCompleted
      },
      include: [
        {
          association: 'assignedUsers',
          attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar'],
          through: { attributes: [] }
        }
      ]
    });
  };

  // 🔍 Buscar tareas por título
  searchTasksByTitle = async (columnId, searchTerm) => {
    return await Task.scope('activeOrdered').findAll({
      where: {
        column_id: columnId,
        task_title: { [Op.like]: `%${searchTerm}%` }
      },
      include: [
        {
          association: 'assignedUsers',
          attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar'],
          through: { attributes: [] }
        }
      ]
    });
  };

  // 📋 Obtener estadísticas de tareas por tablero
  getTaskStatsByBoard = async (boardId) => {
    const stats = await Task.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('*')), 'total'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN task_is_completed = true THEN 1 ELSE 0 END')), 'completed']
      ],
      include: [{
        association: 'column',
        where: { board_id: boardId },
        attributes: []
      }],
      raw: true
    });
    
    return stats[0] || { total: 0, completed: 0 };
  };
}

export default new TaskDal();