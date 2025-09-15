import express from 'express';
import taskController from './tasks.controllers.js';

const router = express.Router();

// ========================================
// RUTAS BÁSICAS CRUD
// ========================================

// 📋 GET /api/tasks/:taskId - Obtener tarea específica
router.get('/:taskId', taskController.getTask);

// ✏️ POST /api/tasks/columns/:columnId - Crear nueva tarea en una columna
router.post('/columns/:columnId', taskController.createTask);

// ✏️ PUT /api/tasks/:taskId - Actualizar tarea
router.put('/:taskId', taskController.updateTask);

// 🗑️ DELETE /api/tasks/:taskId - Eliminar tarea
router.delete('/:taskId', taskController.deleteTask);

// ========================================
// RUTAS DE DRAG & DROP
// ========================================

// 🔄 PATCH /api/tasks/:taskId/move-to-column - Mover tarea entre columnas (DRAG & DROP)
router.patch('/:taskId/move-to-column', taskController.moveTaskToColumn);

// 🔄 PATCH /api/tasks/:taskId/move-position - Reordenar tarea dentro de columna
router.patch('/:taskId/move-position', taskController.moveTaskPosition);

// ========================================
// RUTAS DE ESTADO Y ASIGNACIÓN
// ========================================

// ✅ PATCH /api/tasks/:taskId/toggle-complete - Marcar como completada/pendiente
router.patch('/:taskId/toggle-complete', taskController.toggleTaskComplete);

// 👤 PUT /api/tasks/:taskId/assign-users - Asignar usuarios a tarea (reemplaza existentes)
router.put('/:taskId/assign-users', taskController.assignUsersToTask);

// 👤 POST /api/tasks/:taskId/assign/:userId - Agregar un usuario a la tarea
router.post('/:taskId/assign/:userId', taskController.addUserToTask);

// 👤 DELETE /api/tasks/:taskId/assign/:userId - Remover un usuario de la tarea
router.delete('/:taskId/assign/:userId', taskController.removeUserFromTask);

// ========================================
// RUTAS DE CONSULTAS Y FILTROS
// ========================================

// 🔍 GET /api/tasks/users/:userId - Obtener tareas asignadas a un usuario
router.get('/users/:userId', taskController.getTasksByUser);

// 🔍 GET /api/tasks/columns/:columnId/filter?completed=true/false - Filtrar tareas por estado
router.get('/columns/:columnId/filter', taskController.getTasksByStatus);

// 🔍 GET /api/tasks/columns/:columnId/search?q=termino - Buscar tareas por título
router.get('/columns/:columnId/search', taskController.searchTasks);

export default router;