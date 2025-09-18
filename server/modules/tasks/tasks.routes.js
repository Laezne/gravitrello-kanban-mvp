// Archivo de rutas para el módulo de tareas
import express from 'express';
import taskController from './tasks.controllers.js';

const router = express.Router();

// RUTAS BÁSICAS CRUD:
router.get('/:taskId', taskController.getTask); // Obtener tarea específica
router.post('/columns/:columnId', taskController.createTask); // Crear nueva tarea en una columna
router.put('/:taskId', taskController.updateTask); // Actualizar tarea
router.delete('/:taskId', taskController.deleteTask); // Eliminar tarea

// RUTAS DE DRAG & DROP:
router.patch('/:taskId/move-to-column', taskController.moveTaskToColumn); // Mover tarea entre columnas 
router.patch('/:taskId/move-position', taskController.moveTaskPosition); // Reordenar tarea dentro de columna

// RUTAS DE ESTADO Y ASIGNACIÓN:
router.patch('/:taskId/toggle-complete', taskController.toggleTaskComplete); // Marcar como completada/pendiente
router.put('/:taskId/assign-users', taskController.assignUsersToTask); // Asignar usuarios a tarea (reemplaza existentes)
router.post('/:taskId/assign/:userId', taskController.addUserToTask); // Agregar un usuario a la tarea
router.delete('/:taskId/assign/:userId', taskController.removeUserFromTask); // Quitar un usuario de la tarea

// RUTAS DE CONSULTAS Y FILTROS
router.get('/users/:userId', taskController.getTasksByUser); // Obtener tareas asignadas a un usuario
// /api/tasks/columns/:columnId/filter?completed=true/false - Filtrar tareas por estado
router.get('/columns/:columnId/filter', taskController.getTasksByStatus);
//api/tasks/columns/:columnId/search?q=termino - Buscar tareas por título
router.get('/columns/:columnId/search', taskController.searchTasks);

export default router;