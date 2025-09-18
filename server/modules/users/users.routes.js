// Archivo de rutas para el módulo de usuarios
import express from 'express';
import userController from './users.controllers.js';
import { uploadAvatar } from '../../middlewares/multerAvatar.js'; // Middleware para subida de avatares

const router = express.Router();

// Rutas de registro y perfil
router.post('/register', uploadAvatar, userController.register); // Registro con avatar opcional (FormData)
router.get('/me', userController.getProfile); // Obtener datos del usuario autenticado

// Sistema de autenticación de dos factores (2FA)
// Flujo dividido en pasos para mayor seguridad
router.post('/login', userController.loginStep1); // Paso 1: Valida email/contraseña y envía código por email
router.post('/login/verify', userController.loginStep2); // Paso 2: Verifica código de 6 dígitos y completa login
router.post('/login/resend-code', userController.resendTwoFactorCode); // Reenvía código si expiró o no llegó

// Cierre de sesión
router.post('/logout', userController.logout); // Destruye sesión del servidor

// Sistema de recuperación de contraseña por email
router.post("/forgot-password", userController.forgotPassword); // Envía token de recuperación por email
router.post("/reset-password/:token", userController.resetPassword); // Valida token y actualiza contraseña

export default router;