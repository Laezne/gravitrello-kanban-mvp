import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import BoardColumn from "./boardColumns.model.js";

class BoardColumnDal {
  
  // ========================================
  // OPERACIONES BÁSICAS CRUD
  // ========================================

  // 📋 Obtener todas las columnas de un tablero
  getColumnsByBoard = async (boardId) => {
    return await BoardColumn.scope('activeOrdered').findAll({
      where: { board_id: boardId }
    });
  };

  // 📋 Obtener columna por ID
  getColumnById = async (columnId) => {
    return await BoardColumn.findByPk(columnId);
  };

  // 📋 Obtener columna activa por ID
  getActiveColumnById = async (columnId) => {
    return await BoardColumn.scope('active').findByPk(columnId);
  };

  // ✏️ Crear nueva columna
  createColumn = async (columnData) => {
    const nextPosition = await this.getNextPosition(columnData.board_id);
    
    return await BoardColumn.create({
      ...columnData,
      position: columnData.position || nextPosition
    });
  };

  // ✏️ Actualizar columna
  updateColumn = async (columnId, updateData) => {
    const [affectedRows] = await BoardColumn.update(updateData, {
      where: { column_id: columnId }
    });
    
    if (affectedRows === 0) {
      throw new Error('Columna no encontrada');
    }
    
    return await this.getColumnById(columnId);
  };

  // 🗑️ Eliminar columna (soft delete)
  deleteColumn = async (columnId) => {
    const column = await this.getActiveColumnById(columnId);
    if (!column) {
      throw new Error('Columna no encontrada');
    }
    
    await column.softDelete();
    // Reorganizar posiciones después de eliminar
    await this.reorderPositions(column.board_id);
    
    return { success: true, message: 'Columna eliminada correctamente' };
  };

  // 🗑️ Eliminar físicamente columna
  hardDeleteColumn = async (columnId) => {
    const affectedRows = await BoardColumn.destroy({
      where: { column_id: columnId }
    });
    
    if (affectedRows === 0) {
      throw new Error('Columna no encontrada');
    }
    
    return { success: true, message: 'Columna eliminada permanentemente' };
  };

  // ========================================
  // OPERACIONES DE POSICIONAMIENTO
  // ========================================

  // 📊 Obtener siguiente posición disponible para un tablero
  getNextPosition = async (boardId) => {
    const maxPosition = await BoardColumn.max('position', {
      where: { 
        board_id: boardId,
        column_is_deleted: false 
      }
    });
    return (maxPosition || 0) + 1;
  };

  // 🔄 Mover columna a nueva posición
  moveColumnToPosition = async (columnId, newPosition) => {
    const column = await this.getActiveColumnById(columnId);
    if (!column) {
      throw new Error('Columna no encontrada');
    }
    
    const transaction = await sequelize.transaction();
    
    try {
      const oldPosition = column.position;
      
      if (newPosition === oldPosition) {
        await transaction.commit();
        return column;
      }
      
      if (newPosition > oldPosition) {
        // Mover hacia adelante: decrementar posiciones intermedias
        await BoardColumn.update(
          { position: sequelize.literal('position - 1') },
          {
            where: {
              board_id: column.board_id,
              position: { [Op.gt]: oldPosition, [Op.lte]: newPosition },
              column_id: { [Op.ne]: columnId },
              column_is_deleted: false
            },
            transaction
          }
        );
      } else {
        // Mover hacia atrás: incrementar posiciones intermedias
        await BoardColumn.update(
          { position: sequelize.literal('position + 1') },
          {
            where: {
              board_id: column.board_id,
              position: { [Op.gte]: newPosition, [Op.lt]: oldPosition },
              column_id: { [Op.ne]: columnId },
              column_is_deleted: false
            },
            transaction
          }
        );
      }
      
      // Actualizar la posición de esta columna
      await column.update({ position: newPosition }, { transaction });
      
      await transaction.commit();
      return await this.getColumnById(columnId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  // 🔄 Reorganizar todas las posiciones de las columnas de un tablero
  reorderPositions = async (boardId) => {
    const columns = await BoardColumn.findAll({
      where: { 
        board_id: boardId,
        column_is_deleted: false 
      },
      order: [['position', 'ASC']]
    });
    
    const transaction = await sequelize.transaction();
    
    try {
      for (let i = 0; i < columns.length; i++) {
        await columns[i].update({ position: i + 1 }, { transaction });
      }
      await transaction.commit();
      return { success: true, message: 'Posiciones reorganizadas correctamente' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  // ========================================
  // OPERACIONES ESPECIALES/CONSULTAS
  // ========================================

  // 📊 Contar columnas activas de un tablero
  countColumnsByBoard = async (boardId) => {
    return await BoardColumn.count({
      where: { 
        board_id: boardId,
        column_is_deleted: false 
      }
    });
  };

  // 📋 Obtener columnas con sus tareas
  getColumnsWithTasks = async (boardId) => {
    return await BoardColumn.scope('activeOrdered').findAll({
      where: { board_id: boardId },
      include: [{
        model: sequelize.models.Task, // Usar sequelize.models en lugar de association
        as: 'tasks',
        where: { task_is_completed: { [Op.ne]: true } }, // Solo tareas no completadas
        required: false // LEFT JOIN para incluir columnas sin tareas
      }]
    });
  };

  // 🔍 Buscar columna por nombre en un tablero
  findColumnByName = async (boardId, columnName) => {
    return await BoardColumn.scope('active').findOne({
      where: { 
        board_id: boardId,
        column_name: columnName 
      }
    });
  };

  // 📋 Crear columnas por defecto para un tablero nuevo
  createDefaultColumns = async (boardId) => {
    const defaultColumns = [
      { board_id: boardId, column_name: 'To Do', position: 1 },
      { board_id: boardId, column_name: 'Doing', position: 2 },
      { board_id: boardId, column_name: 'Done', position: 3 }
    ];
    
    return await BoardColumn.bulkCreate(defaultColumns);
  };
}

export default new BoardColumnDal();