import express from 'express';
import OrderController from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All order routes are protected - requires authentication
router.use(authenticateToken);

// Order management
router.post('/', OrderController.createOrder);
router.get('/:id', OrderController.getOrder);
router.patch('/:id/status', OrderController.updateOrderStatus);

// Business-specific routes
router.get('/business/orders', OrderController.getBusinessOrders);
router.post('/assign-delivery', OrderController.assignDeliveryAgent);

// Delivery agent-specific routes
router.get('/delivery/orders', OrderController.getDeliveryOrders);

export default router;