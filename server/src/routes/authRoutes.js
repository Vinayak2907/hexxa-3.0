// Auth Routes - Authentication related API endpoints
// Handles user registration, login, token refresh, and logout

import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', authController.register);

// POST /api/auth/login - Login user
router.post('/login', authController.login);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', authController.refreshToken);

// POST /api/auth/logout - Logout user
router.post('/logout', authController.logout);

export default router;