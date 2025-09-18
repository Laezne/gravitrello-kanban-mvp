import boardDal from "./boards.dal.js";
import sequelize from "../../config/db.js";

class BoardController {
  
  // OPERACIONES BÁSICAS CRUD:

  // Obtener todos los tableros del usuario
  getBoards = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const boards = await boardDal.getBoardsByUser(req.session.userId);
      
      res.json({
        success: true,
        data: boards
      });
    } catch (error) {
      console.error("Error obteniendo tableros:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  }

  // Obtener tablero por ID
  getBoard = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { boardId } = req.params;

      // Verificar acceso
      const hasAccess = await boardDal.userHasAccessToBoard(req.session.userId, boardId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para ver este tablero"
        });
      }

      const board = await boardDal.getBoardWithDetails(boardId);
      
      if (!board) {
        return res.status(404).json({
          success: false,
          message: "Tablero no encontrado"
        });
      }

      res.json({
        success: true,
        data: board
      });
    } catch (error) {
      console.error("Error obteniendo tablero:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  }

  // Crear nuevo tablero
  createBoard = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { board_name } = req.body;

      if (!board_name) {
        return res.status(400).json({
          success: false,
          message: "El nombre del tablero es requerido"
        });
      }

      const board = await boardDal.createBoard({
        board_name: board_name.trim(),
        created_by: req.session.userId
      });

      res.status(201).json({
        success: true,
        message: "Tablero creado exitosamente",
        data: board
      });
    } catch (error) {
      console.error("Error creando tablero:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  }

  // Actualizar tablero
  updateBoard = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { boardId } = req.params;
      const { board_name } = req.body;

      // Verificar que es el propietario
      const isOwner = await boardDal.userOwnsBoard(req.session.userId, boardId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: "Solo el propietario puede editar el tablero"
        });
      }

      if (!board_name) {
        return res.status(400).json({
          success: false,
          message: "El nombre del tablero es requerido"
        });
      }

      const board = await boardDal.updateBoard(boardId, {
        board_name: board_name.trim()
      });

      res.json({
        success: true,
        message: "Tablero actualizado exitosamente",
        data: board
      });
    } catch (error) {
      console.error("Error actualizando tablero:", error);
      if (error.message === 'Tablero no encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  }

  // Eliminar tablero
  deleteBoard = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { boardId } = req.params;

      // Verificar que es el propietario
      const isOwner = await boardDal.userOwnsBoard(req.session.userId, boardId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: "Solo el propietario puede eliminar el tablero"
        });
      }

      await boardDal.deleteBoard(boardId);

      res.json({
        success: true,
        message: "Tablero eliminado exitosamente"
      });
    } catch (error) {
      console.error("Error eliminando tablero:", error);
      if (error.message === 'Tablero no encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  }

  // OPERACIONES DE COMPARTIR:

  // Compartir tablero con usuario
  shareBoard = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { boardId } = req.params;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email del usuario es requerido"
        });
      }

      // Verificar que es el propietario
      const isOwner = await boardDal.userOwnsBoard(req.session.userId, boardId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: "Solo el propietario puede compartir el tablero"
        });
      }

      // Buscar usuario por email
      const user = await sequelize.models.User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado"
        });
      }

      const board = await boardDal.shareBoardWithUser(boardId, user.user_id);

      res.json({
        success: true,
        message: `Tablero compartido con ${user.user_name}`,
        data: board
      });
    } catch (error) {
      console.error("Error compartiendo tablero:", error);
      if (error.message.includes('no encontrado') || error.message.includes('contigo mismo')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  }

  // Quitar acceso de usuario
  unshareBoard = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { boardId, userId } = req.params;

      // Verificar que es el propietario
      const isOwner = await boardDal.userOwnsBoard(req.session.userId, boardId);
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: "Solo el propietario puede quitar accesos"
        });
      }

      await boardDal.unshareBoardWithUser(boardId, userId);

      res.json({
        success: true,
        message: "Acceso removido exitosamente"
      });
    } catch (error) {
      console.error("Error quitando acceso:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  }

  // Obtener usuarios del tablero
  getBoardUsers = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { boardId } = req.params;

      // Verificar acceso
      const hasAccess = await boardDal.userHasAccessToBoard(req.session.userId, boardId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para ver este tablero"
        });
      }

      const users = await boardDal.getBoardUsers(boardId);

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      if (error.message === 'Tablero no encontrado') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  }

  // CONSULTAS:

  // Buscar tableros
  searchBoards = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { q } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "El término de búsqueda debe tener al menos 2 caracteres"
        });
      }

      const boards = await boardDal.searchBoardsByName(req.session.userId, q.trim());

      res.json({
        success: true,
        data: boards
      });
    } catch (error) {
      console.error("Error buscando tableros:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  }

  
}

export default new BoardController();