import { Op } from "sequelize";
import sequelize from "../../config/db.js";
import Board from "./boards.model.js";
import boardColumnDal from "../boardColumns/boardColumns.dal.js"; // 🔑 Importar DAL de columnas

class BoardDal {
  
  // OPERACIONES BÁSICAS CRUD:

  // Obtener todos los tableros de un usuario (propios + compartidos)
  getBoardsByUser = async (userId) => {
    // Tableros propios
    const ownBoards = await Board.scope('active').findAll({
      where: { created_by: userId },
      include: [
        {
          model: sequelize.models.User,
          as: 'creator',
          attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar']
        }
      ],
      order: [['board_id', 'DESC']]
    });

    // Tableros compartidos
    const sharedBoards = await Board.scope('active').findAll({
      include: [
        {
          model: sequelize.models.User,
          as: 'creator',
          attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar']
        },
        {
          model: sequelize.models.User,
          as: 'sharedUsers',
          where: { user_id: userId },
          attributes: [],
          through: { attributes: [] }
        }
      ],
      order: [['board_id', 'DESC']]
    });

    return {
      ownBoards,
      sharedBoards,
      allBoards: [...ownBoards, ...sharedBoards]
    };
  };

  // 📋 Obtener tablero por ID
  getBoardById = async (boardId) => {
    return await Board.findByPk(boardId, {
      include: [
        {
          model: sequelize.models.User,
          as: 'creator',
          attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar']
        }
      ]
    });
  }

  // Obtener tablero activo por ID
  getActiveBoardById = async (boardId) => {
    return await Board.scope('active').findByPk(boardId, {
      include: [
        {
          model: sequelize.models.User,
          as: 'creator',
          attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar']
        }
      ]
    });
  }

  // Obtener tablero completo con columnas y tareas
  getBoardWithDetails = async (boardId) => {
    return await Board.scope('active').findByPk(boardId, {
      include: [
        {
          model: sequelize.models.User,
          as: 'creator',
          attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar']
        },
        {
          model: sequelize.models.BoardColumn,
          as: 'columns',
          where: { column_is_deleted: false },
          required: false,
          order: [['position', 'ASC']],
          include: [
            {
              model: sequelize.models.Task,
              as: 'tasks',
              required: false,
              order: [['position', 'ASC']],
              include: [
                {
                  model: sequelize.models.User,
                  as: 'assignedUsers',
                  attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar'],
                  through: { attributes: [] }
                },
                {
                  model: sequelize.models.User,
                  as: 'creator',
                  attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar']
                }
              ]
            }
          ]
        },
        {
          model: sequelize.models.User,
          as: 'sharedUsers',
          attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar'],
          through: { 
            attributes: ['shared_at']
          }
        }
      ]
    });
  }

  // Crear nuevo tablero
  createBoard = async (boardData) => {
    const transaction = await sequelize.transaction();
    
    try {
      // Crear el tablero
      const board = await Board.create(boardData, { transaction });
      
      // 🔑 Usar boardColumnDal para crear las 5 columnas por defecto
      await boardColumnDal.createDefaultColumns(board.board_id, transaction);
      
      await transaction.commit();
      return await this.getBoardById(board.board_id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Actualizar tablero
  updateBoard = async (boardId, updateData) => {
    const [affectedRows] = await Board.update(updateData, {
      where: { board_id: boardId }
    });
    
    if (affectedRows === 0) {
      throw new Error('Tablero no encontrado');
    }
    
    return await this.getBoardById(boardId);
  }

  // Eliminar tablero (soft delete)
  deleteBoard = async (boardId) => {
    const board = await this.getActiveBoardById(boardId);
    if (!board) {
      throw new Error('Tablero no encontrado');
    }
    
    await board.softDelete();
    return { success: true, message: 'Tablero eliminado correctamente' };
  }

  // Eliminar físicamente tablero
  hardDeleteBoard = async (boardId) => {
    const affectedRows = await Board.destroy({
      where: { board_id: boardId }
    });
    
    if (affectedRows === 0) {
      throw new Error('Tablero no encontrado');
    }
    
    return { success: true, message: 'Tablero eliminado permanentemente' };
  }

  // OPERACIONES DE COMPARTIR TABLERO:

  // Compartir tablero con usuario
  shareBoardWithUser = async (boardId, userId) => {
    try {
      // Verificar que el tablero existe
      const board = await this.getActiveBoardById(boardId);
      if (!board) {
        throw new Error('Tablero no encontrado');
      }

      // Verificar que el usuario existe
      const user = await sequelize.models.User.findByPk(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar que no sea el propietario
      if (board.created_by === userId) {
        throw new Error('No puedes compartir el tablero contigo mismo');
      }

      // Crear la relación (INSERT IGNORE para evitar duplicados)
      await sequelize.query(
        'INSERT IGNORE INTO user_board (user_id, board_id, shared_at) VALUES (?, ?, NOW())',
        { replacements: [userId, boardId] }
      );

      return await this.getBoardById(boardId);
    } catch (error) {
      throw error;
    }
  }

  // Quitar acceso de usuario al tablero
  unshareBoardWithUser = async (boardId, userId) => {
    await sequelize.query(
      'DELETE FROM user_board WHERE user_id = ? AND board_id = ?',
      { replacements: [userId, boardId] }
    );

    return { success: true, message: 'Acceso removido correctamente' };
  }

  // Obtener usuarios con acceso al tablero
  getBoardUsers = async (boardId) => {
    const board = await Board.findByPk(boardId, {
      include: [
        {
          model: sequelize.models.User,
          as: 'creator',
          attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar']
        },
        {
          model: sequelize.models.User,
          as: 'sharedUsers',
          attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar'],
          through: { 
            attributes: ['shared_at']
          }
        }
      ]
    });

    if (!board) {
      throw new Error('Tablero no encontrado');
    }

    return {
      owner: board.creator,
      sharedUsers: board.sharedUsers || [],
      totalUsers: 1 + (board.sharedUsers ? board.sharedUsers.length : 0)
    };
  }

  // VALIDACIONES Y PERMISOS:

  // Verificar si usuario tiene acceso al tablero
  userHasAccessToBoard = async (userId, boardId) => {
    const board = await Board.findByPk(boardId);
    if (!board) return false;

    // Es el propietario
    if (board.created_by === userId) return true;

    // Tiene acceso compartido
    const sharedAccess = await sequelize.query(
      'SELECT 1 FROM user_board WHERE user_id = ? AND board_id = ? LIMIT 1',
      { 
        replacements: [userId, boardId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return sharedAccess.length > 0;
  }

  // Verificar si usuario es propietario del tablero
  userOwnsBoard = async (userId, boardId) => {
    const board = await Board.findByPk(boardId);
    return board && board.created_by === userId;
  }

  // CONSULTAS:

  // Contar tableros de un usuario
  countBoardsByUser = async (userId) => {
    const ownBoards = await Board.count({
      where: { 
        created_by: userId,
        board_is_deleted: false 
      }
    });

    const sharedBoards = await sequelize.query(
      'SELECT COUNT(*) as count FROM user_board ub INNER JOIN board b ON ub.board_id = b.board_id WHERE ub.user_id = ? AND b.board_is_deleted = false',
      { 
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    return {
      own: ownBoards,
      shared: sharedBoards[0].count,
      total: ownBoards + sharedBoards[0].count
    };
  }

  // Buscar tableros por nombre
  searchBoardsByName = async (userId, searchTerm) => {
    const boards = await Board.scope('active').findAll({
      where: {
        [Op.or]: [
          { created_by: userId },
          { '$sharedUsers.user_id$': userId }
        ],
        board_name: { [Op.like]: `%${searchTerm}%` }
      },
      include: [
        {
          model: sequelize.models.User,
          as: 'creator',
          attributes: ['user_id', 'user_name', 'lastname', 'email', 'avatar']
        },
        {
          model: sequelize.models.User,
          as: 'sharedUsers',
          attributes: [],
          through: { attributes: [] },
          required: false
        }
      ],
      order: [['board_id', 'DESC']]
    });

    return boards;
  }

  
}

export default new BoardDal();