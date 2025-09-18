// Archivo de rutas para el módulo de columnas
import express from 'express';
import boardColumnController from './boardColumns.controllers.js';

const router = express.Router();

// RUTA ÚNICA PARA EL DASHBOARD
router.get('/:boardId/layout', boardColumnController.getBoardLayout); // Obtener tablero completo (con columnas con tareas)

export default router;