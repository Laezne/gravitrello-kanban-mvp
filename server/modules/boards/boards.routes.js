import express from 'express';
import boardController from './boards.controllers.js';

const router = express.Router();

// 📋 GET /api/boards - Obtener todos los tableros del usuario
router.get('/', boardController.getBoards);

// 📋 GET /api/boards/:boardId - Obtener tablero específico con detalles
router.get('/:boardId', boardController.getBoard);

// ✏️ POST /api/boards - Crear nuevo tablero
router.post('/', boardController.createBoard);

// ✏️ PUT /api/boards/:boardId - Actualizar tablero
router.put('/:boardId', boardController.updateBoard);

// 🗑️ DELETE /api/boards/:boardId - Eliminar tablero
router.delete('/:boardId', boardController.deleteBoard);

// ========================================
// RUTAS DE COMPARTIR
// ========================================

// 👥 POST /api/boards/:boardId/share - Compartir tablero con usuario
router.post('/:boardId/share', boardController.shareBoard);

// 👥 DELETE /api/boards/:boardId/share/:userId - Quitar acceso de usuario
router.delete('/:boardId/share/:userId', boardController.unshareBoard);

// 👥 GET /api/boards/:boardId/users - Obtener usuarios del tablero
router.get('/:boardId/users', boardController.getBoardUsers);

// ========================================
// RUTAS DE CONSULTAS
// ========================================

// 🔍 GET /api/boards/search?q=termino - Buscar tableros
router.get('/search', boardController.searchBoards);

// 📊 GET /api/boards/:boardId/stats - Obtener estadísticas del tablero
router.get('/:boardId/stats', boardController.getBoardStats);

export default router;