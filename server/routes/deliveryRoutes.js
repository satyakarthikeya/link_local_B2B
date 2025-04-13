import express from 'express';
import Joi from 'joi';
import DeliveryController from '../controllers/deliveryController.js';
import { 
  authenticateToken,
  authorizeDelivery
} from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validateRequest.js';
import { catchAsync } from '../utils/errorHandler.js';

const router = express.Router();

// All routes require delivery agent authentication
router.use(authenticateToken);
router.use(authorizeDelivery[1]); // Skip the authenticateToken since we already have it

// Get delivery agent profile
router.get(
  '/profile',
  catchAsync(DeliveryController.getProfile)
);

// Update delivery agent profile
router.put(
  '/profile/:id',
  validateRequest(schemas.deliveryProfileUpdate),
  catchAsync(DeliveryController.updateProfile)
);

// Update availability status
router.patch(
  '/availability/:id',
  validateRequest(Joi.object({
    status: Joi.boolean().required()
  })),
  catchAsync(DeliveryController.updateAvailabilityStatus)
);

// Special endpoint for handling offline status via navigator.sendBeacon
router.post(
  '/availability/:id/offline',
  catchAsync(DeliveryController.setOfflineStatus)
);

// Get current orders
router.get(
  '/orders/current',
  catchAsync(DeliveryController.getCurrentOrders)
);

// Get order history
router.get(
  '/orders/history',
  catchAsync(DeliveryController.getOrderHistory)
);

// Get earnings data
router.get(
  '/earnings',
  catchAsync(DeliveryController.getEarnings)
);

// Update location
router.post(
  '/location',
  validateRequest(Joi.object({
    address: Joi.string().required(),
    latitude: Joi.number(),
    longitude: Joi.number()
  })),
  catchAsync(DeliveryController.updateLocation)
);

// Get delivery agent stats
router.get(
  '/stats',
  catchAsync(DeliveryController.getStats)
);

export default router;