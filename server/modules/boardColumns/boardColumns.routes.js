import express from 'express';
import boardColumnController from './boardColumns.controllers.js';

const router = express.Router();

// ========================================
// RUTA ÚNICA PARA DASHBOARD
// ========================================

// 📋 GET /api/boards/:boardId/layout - Obtener tablero completo (columnas con tareas)
router.get('/:boardId/layout', boardColumnController.getBoardLayout);

export default router;