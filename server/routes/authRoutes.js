import express from 'express';
import AuthController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Authentication routes
// Business user routes
router.post('/business/register', AuthController.registerBusiness);
router.post('/business/login', AuthController.loginBusiness);

// Delivery agent routes
router.post('/delivery/register', AuthController.registerDelivery);
router.post('/delivery/login', AuthController.loginDelivery);

// Protected route to get current user info
router.get('/me', authenticateToken, AuthController.getCurrentUser);

export default router;