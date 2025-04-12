import express from 'express';
import Joi from 'joi';
import OrderController from '../controllers/orderController.js';
import { 
  authenticateToken,
  authorizeBusiness, 
  authorizeDelivery,
  authorizeBusinessOrDelivery
} from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validateRequest.js';
import { catchAsync } from '../utils/errorHandler.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Order creation - only for business users
router.post(
  '/', 
  authorizeBusiness[1], // Skip the authenticateToken since we already have it
  validateRequest(schemas.orderCreate),
  catchAsync(OrderController.createOrder)
);

// Get specific order - for both business and delivery users
router.get(
  '/:id', 
  catchAsync(OrderController.getOrder)
);

// Update order status - role-specific permissions applied in controller
router.patch(
  '/:id/status',
  validateRequest(schemas.orderStatusUpdate),
  catchAsync(OrderController.updateOrderStatus)
);

// Business-specific routes
router.get(
  '/business/orders', 
  authorizeBusiness[1],
  catchAsync(OrderController.getBusinessOrders)
);

router.post(
  '/assign-delivery',
  authorizeBusiness[1],
  validateRequest(Joi.object({
    order_id: Joi.number().required(),
    agent_id: Joi.number().required()
  })),
  catchAsync(OrderController.assignDeliveryAgent)
);

// Delivery agent-specific routes
router.get(
  '/delivery/orders',
  authorizeDelivery[1],
  catchAsync(OrderController.getDeliveryOrders)
);

export default router;