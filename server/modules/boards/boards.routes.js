// Archivo de rutas para el módulo de tableros
import express from 'express';
import boardController from './boards.controllers.js';

const router = express.Router();

router.get('/', boardController.getBoards); // Obtener todos los tableros del usuario
router.get('/:boardId', boardController.getBoard); // Obtener tablero específico 
router.post('/', boardController.createBoard); // Crear nuevo tablero
router.put('/:boardId', boardController.updateBoard); // Actualizar tablero
router.delete('/:boardId', boardController.deleteBoard); // Eliminar tablero


// RUTAS DE COMPARTIR:
router.post('/:boardId/share', boardController.shareBoard); // Compartir tablero con usuario
router.delete('/:boardId/share/:userId', boardController.unshareBoard); // Quitar acceso de usuario
router.get('/:boardId/users', boardController.getBoardUsers); // Obtener usuarios del tablero

// RUTAS DE CONSULTAS:
router.get('/search', boardController.searchBoards); // Buscar tableros

export default router;