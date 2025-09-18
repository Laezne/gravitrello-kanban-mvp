import boardColumnDal from "./boardColumns.dal.js";
import boardDal from "../boards/boards.dal.js";

class BoardColumnController {
  
  // Obtener tablero completo (columnas con sus tareas)
  getBoardLayout = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { boardId } = req.params;

      // Verificar acceso al tablero
      const hasAccess = await boardDal.userHasAccessToBoard(req.session.userId, boardId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para ver este tablero"
        });
      }

      const columns = await boardColumnDal.getColumnsWithTasks(boardId);
      
      res.json({
        success: true,
        data: columns
      });
    } catch (error) {
      console.error("Error obteniendo layout del tablero:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  };
}

export default new BoardColumnController();