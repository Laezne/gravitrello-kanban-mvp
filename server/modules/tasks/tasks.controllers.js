import taskDal from "./tasks.dal.js";
import boardDal from "../boards/boards.dal.js";
import boardColumnDal from "../boardColumns/boardColumns.dal.js";

class TaskController {
  
  // ========================================
  // OPERACIONES BÁSICAS CRUD
  // ========================================

  // 📋 Obtener tarea por ID
  getTask = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { taskId } = req.params;

      const task = await taskDal.getTaskById(taskId);
      
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Tarea no encontrada"
        });
      }

      // Verificar acceso al tablero de la tarea
      const hasAccess = await boardDal.userHasAccessToBoard(req.session.userId, task.column.board_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para ver esta tarea"
        });
      }

      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      console.error("Error obteniendo tarea:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  };

  // ✏️ Crear nueva tarea
  createTask = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { columnId } = req.params;
      const { task_title, task_description, assignedUsers, position } = req.body;

      if (!task_title) {
        return res.status(400).json({
          success: false,
          message: "El título de la tarea es requerido"
        });
      }

      // Verificar que la columna existe y obtener su board_id
      const column = await boardColumnDal.getActiveColumnById(columnId);
      if (!column) {
        return res.status(404).json({
          success: false,
          message: "Columna no encontrada"
        });
      }

      // Verificar acceso al tablero
      const hasAccess = await boardDal.userHasAccessToBoard(req.session.userId, column.board_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para crear tareas en este tablero"
        });
      }

      const task = await taskDal.createTask({
        task_title: task_title.trim(),
        task_description: task_description?.trim() || null,
        created_by: req.session.userId,
        column_id: columnId,
        position: position,
        assignedUsers: assignedUsers || []
      });

      res.status(201).json({
        success: true,
        message: "Tarea creada exitosamente",
        data: task
      });
    } catch (error) {
      console.error("Error creando tarea:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  };

  // ✏️ Actualizar tarea
  updateTask = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { taskId } = req.params;
      const { task_title, task_description } = req.body;

      if (!task_title) {
        return res.status(400).json({
          success: false,
          message: "El título de la tarea es requerido"
        });
      }

      // Obtener la tarea para verificar permisos
      const task = await taskDal.getTaskById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Tarea no encontrada"
        });
      }

      // Verificar acceso al tablero
      const hasAccess = await boardDal.userHasAccessToBoard(req.session.userId, task.column.board_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para editar esta tarea"
        });
      }

      const updatedTask = await taskDal.updateTask(taskId, {
        task_title: task_title.trim(),
        task_description: task_description?.trim() || null
      });

      res.json({
        success: true,
        message: "Tarea actualizada exitosamente",
        data: updatedTask
      });
    } catch (error) {
      console.error("Error actualizando tarea:", error);
      if (error.message === 'Tarea no encontrada') {
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
  };

  // 🗑️ Eliminar tarea
  deleteTask = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { taskId } = req.params;

      // Obtener la tarea para verificar permisos
      const task = await taskDal.getTaskById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Tarea no encontrada"
        });
      }

      // Verificar que es el creador de la tarea o propietario del tablero
      const isCreator = task.created_by === req.session.userId;
      const isOwner = await boardDal.userOwnsBoard(req.session.userId, task.column.board_id);
      
      if (!isCreator && !isOwner) {
        return res.status(403).json({
          success: false,
          message: "Solo el creador de la tarea o el propietario del tablero pueden eliminarla"
        });
      }

      await taskDal.deleteTask(taskId);

      res.json({
        success: true,
        message: "Tarea eliminada exitosamente"
      });
    } catch (error) {
      console.error("Error eliminando tarea:", error);
      if (error.message === 'Tarea no encontrada') {
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
  };

  // ========================================
  // OPERACIONES DE DRAG & DROP
  // ========================================

  // 🔄 Mover tarea entre columnas (DRAG & DROP principal)
  moveTaskToColumn = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { taskId } = req.params;
      const { newColumnId, newPosition } = req.body;

      if (!newColumnId) {
        return res.status(400).json({
          success: false,
          message: "La nueva columna es requerida"
        });
      }

      // Verificar que la tarea existe
      const task = await taskDal.getTaskById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Tarea no encontrada"
        });
      }

      // Verificar que la columna destino existe
      const targetColumn = await boardColumnDal.getActiveColumnById(newColumnId);
      if (!targetColumn) {
        return res.status(404).json({
          success: false,
          message: "Columna destino no encontrada"
        });
      }

      // Verificar que ambas columnas pertenecen al mismo tablero
      if (task.column.board_id !== targetColumn.board_id) {
        return res.status(400).json({
          success: false,
          message: "No se puede mover la tarea a un tablero diferente"
        });
      }

      // Verificar acceso al tablero
      const hasAccess = await boardDal.userHasAccessToBoard(req.session.userId, task.column.board_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para mover tareas en este tablero"
        });
      }

      const movedTask = await taskDal.moveTaskToColumn(taskId, newColumnId, newPosition);

      res.json({
        success: true,
        message: "Tarea movida exitosamente",
        data: movedTask
      });
    } catch (error) {
      console.error("Error moviendo tarea:", error);
      if (error.message === 'Tarea no encontrada') {
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
  };

  // 🔄 Reordenar tarea dentro de la misma columna
  moveTaskPosition = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { taskId } = req.params;
      const { newPosition } = req.body;

      if (typeof newPosition !== 'number' || newPosition < 1) {
        return res.status(400).json({
          success: false,
          message: "La nueva posición debe ser un número mayor a 0"
        });
      }

      // Obtener la tarea para verificar permisos
      const task = await taskDal.getTaskById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Tarea no encontrada"
        });
      }

      // Verificar acceso al tablero
      const hasAccess = await boardDal.userHasAccessToBoard(req.session.userId, task.column.board_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para reordenar tareas en este tablero"
        });
      }

      const movedTask = await taskDal.moveTaskToPosition(taskId, newPosition);

      res.json({
        success: true,
        message: "Tarea reordenada exitosamente",
        data: movedTask
      });
    } catch (error) {
      console.error("Error reordenando tarea:", error);
      if (error.message === 'Tarea no encontrada') {
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
  };

  // ========================================
  // OPERACIONES DE ESTADO Y ASIGNACIÓN
  // ========================================

  // ✅ Marcar tarea como completada/no completada
  toggleTaskComplete = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { taskId } = req.params;

      // Obtener la tarea para verificar permisos
      const task = await taskDal.getTaskById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Tarea no encontrada"
        });
      }

      // Verificar acceso al tablero
      const hasAccess = await boardDal.userHasAccessToBoard(req.session.userId, task.column.board_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para modificar esta tarea"
        });
      }

      const updatedTask = await taskDal.toggleTaskComplete(taskId);

      res.json({
        success: true,
        message: `Tarea marcada como ${updatedTask.task_is_completed ? 'completada' : 'pendiente'}`,
        data: updatedTask
      });
    } catch (error) {
      console.error("Error cambiando estado de tarea:", error);
      if (error.message === 'Tarea no encontrada') {
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
  };

  // 👤 Asignar usuarios a tarea
  assignUsersToTask = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { taskId } = req.params;
      const { userIds } = req.body;

      if (!Array.isArray(userIds)) {
        return res.status(400).json({
          success: false,
          message: "userIds debe ser un array"
        });
      }

      // Obtener la tarea para verificar permisos
      const task = await taskDal.getTaskById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Tarea no encontrada"
        });
      }

      // Verificar acceso al tablero
      const hasAccess = await boardDal.userHasAccessToBoard(req.session.userId, task.column.board_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para asignar usuarios en este tablero"
        });
      }

      const updatedTask = await taskDal.assignUsersToTask(taskId, userIds);

      res.json({
        success: true,
        message: "Usuarios asignados exitosamente",
        data: updatedTask
      });
    } catch (error) {
      console.error("Error asignando usuarios:", error);
      if (error.message === 'Tarea no encontrada') {
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
  };

  // 👤 Agregar un usuario a la tarea
  addUserToTask = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { taskId, userId } = req.params;

      // Obtener la tarea para verificar permisos
      const task = await taskDal.getTaskById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Tarea no encontrada"
        });
      }

      // Verificar acceso al tablero
      const hasAccess = await boardDal.userHasAccessToBoard(req.session.userId, task.column.board_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para asignar usuarios en este tablero"
        });
      }

      const updatedTask = await taskDal.addUserToTask(taskId, userId);

      res.json({
        success: true,
        message: "Usuario agregado exitosamente",
        data: updatedTask
      });
    } catch (error) {
      console.error("Error agregando usuario:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  };

  // 👤 Remover un usuario de la tarea
  removeUserFromTask = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { taskId, userId } = req.params;

      // Obtener la tarea para verificar permisos
      const task = await taskDal.getTaskById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Tarea no encontrada"
        });
      }

      // Verificar acceso al tablero
      const hasAccess = await boardDal.userHasAccessToBoard(req.session.userId, task.column.board_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para modificar asignaciones en este tablero"
        });
      }

      const updatedTask = await taskDal.removeUserFromTask(taskId, userId);

      res.json({
        success: true,
        message: "Usuario removido exitosamente",
        data: updatedTask
      });
    } catch (error) {
      console.error("Error removiendo usuario:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  };

  // ========================================
  // CONSULTAS Y FILTROS
  // ========================================

  // 🔍 Obtener tareas asignadas a un usuario
  getTasksByUser = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { userId } = req.params;

      // Verificar que solo pueda ver sus propias tareas o ser admin/propietario
      if (userId != req.session.userId) {
        return res.status(403).json({
          success: false,
          message: "Solo puedes ver tus propias tareas"
        });
      }

      const tasks = await taskDal.getTasksByUser(userId);

      res.json({
        success: true,
        data: tasks
      });
    } catch (error) {
      console.error("Error obteniendo tareas del usuario:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  };

  // 🔍 Filtrar tareas por estado en una columna
  getTasksByStatus = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { columnId } = req.params;
      const { completed } = req.query;

      const isCompleted = completed === 'true';

      // Verificar acceso a la columna
      const column = await boardColumnDal.getActiveColumnById(columnId);
      if (!column) {
        return res.status(404).json({
          success: false,
          message: "Columna no encontrada"
        });
      }

      const hasAccess = await boardDal.userHasAccessToBoard(req.session.userId, column.board_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para ver esta columna"
        });
      }

      const tasks = await taskDal.getTasksByStatus(columnId, isCompleted);

      res.json({
        success: true,
        data: tasks
      });
    } catch (error) {
      console.error("Error filtrando tareas:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  };

  // 🔍 Buscar tareas por título en una columna
  searchTasks = async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: "No autenticado"
        });
      }

      const { columnId } = req.params;
      const { q } = req.query;

      if (!q || q.trim().length < 1) {
        return res.status(400).json({
          success: false,
          message: "El término de búsqueda es requerido"
        });
      }

      // Verificar acceso a la columna
      const column = await boardColumnDal.getActiveColumnById(columnId);
      if (!column) {
        return res.status(404).json({
          success: false,
          message: "Columna no encontrada"
        });
      }

      const hasAccess = await boardDal.userHasAccessToBoard(req.session.userId, column.board_id);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para buscar en esta columna"
        });
      }

      const tasks = await taskDal.searchTasksByTitle(columnId, q.trim());

      res.json({
        success: true,
        data: tasks
      });
    } catch (error) {
      console.error("Error buscando tareas:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor"
      });
    }
  };
}

export default new TaskController();