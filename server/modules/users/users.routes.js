import express from 'express';
import userController from './users.controllers.js';
import { uploadAvatar } from '../../middlewares/multerAvatar.js'; // 🔑 Importar desde middlewares

const router = express.Router();

// Registro y perfil
router.post('/register', uploadAvatar, userController.register);
router.get('/me', userController.getProfile);

// 🔑 Login con 2FA - nuevas rutas
router.post('/login', userController.loginStep1); // Valida credenciales y envía código
router.post('/login/verify', userController.loginStep2); // Verifica código 2FA
router.post('/login/resend-code', userController.resendTwoFactorCode); // Reenvía código

// 🔑 Avatar (ya no necesario - integrado en registro)
// router.post('/upload-avatar', uploadAvatar, userController.uploadAvatar);

// Logout
router.post('/logout', userController.logout);

// Recuperación de contraseña
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password/:token", userController.resetPassword);

export default router;