import express from 'express';
import userController from './users.controllers.js';

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/me', userController.getProfile);

export default router;