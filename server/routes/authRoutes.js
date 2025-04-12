import express from 'express';
import AuthController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validateRequest.js';
import { catchAsync } from '../utils/errorHandler.js';

const router = express.Router();

// Authentication routes
// Business user routes
router.post(
  '/business/register', 
  validateRequest(schemas.businessRegister),
  catchAsync(AuthController.registerBusiness)
);

router.post(
  '/business/login', 
  validateRequest(schemas.login),
  catchAsync(AuthController.loginBusiness)
);

// Delivery agent routes
router.post(
  '/delivery/register', 
  validateRequest(schemas.deliveryRegister),
  catchAsync(AuthController.registerDelivery)
);

router.post(
  '/delivery/login', 
  validateRequest(schemas.login),
  catchAsync(AuthController.loginDelivery)
);

// Protected route to get current user info
router.get('/me', authenticateToken, catchAsync(AuthController.getCurrentUser));

// Update profile route
router.put('/update-profile', authenticateToken, catchAsync(AuthController.updateProfile));

export default router;