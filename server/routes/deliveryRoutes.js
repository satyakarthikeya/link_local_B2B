import express from 'express';
import Joi from 'joi';
import DeliveryController from '../controllers/deliveryController.js';
import { authenticateToken, authorizeDelivery } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { catchAsync } from '../utils/errorHandler.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Profile management
router.get(
  '/profile',
  authorizeDelivery[1], // Skip the authenticateToken since we already have it
  catchAsync(DeliveryController.getProfile)
);

router.put(
  '/profile',
  authorizeDelivery[1],
  catchAsync(DeliveryController.updateProfile)
);

// Availability status management
router.patch(
  '/status',
  authorizeDelivery[1],
  validateRequest(Joi.object({
    status: Joi.boolean().required()
  })),
  catchAsync(DeliveryController.updateAvailabilityStatus)
);

router.post(
  '/offline',
  authorizeDelivery[1],
  catchAsync(DeliveryController.setOfflineStatus)
);

router.patch(
  '/availability/:id',
  authorizeDelivery[1],
  validateRequest(Joi.object({
    status: Joi.boolean().required()
  })),
  catchAsync(DeliveryController.updateAvailabilityStatus)
);

// Order management
router.get(
  '/orders/current',
  authorizeDelivery[1],
  catchAsync(DeliveryController.getCurrentOrders)
);

router.get(
  '/orders/history',
  authorizeDelivery[1],
  catchAsync(DeliveryController.getOrderHistory)
);

router.get(
  '/orders/nearby',
  authorizeDelivery[1],
  catchAsync(DeliveryController.getNearbyOrders)
);

router.post(
  '/orders/:order_id/accept',
  authorizeDelivery[1],
  catchAsync(DeliveryController.acceptOrder)
);

router.patch(
  '/orders/:order_id/status',
  authorizeDelivery[1],
  validateRequest(Joi.object({
    status: Joi.string().valid('Assigned', 'PickedUp', 'InTransit', 'Delivered').required(),
    notes: Joi.string().allow('', null)
  })),
  catchAsync(DeliveryController.updateOrderStatus)
);

// Earnings and statistics
router.get(
  '/earnings',
  authorizeDelivery[1],
  catchAsync(DeliveryController.getEarnings)
);

router.get(
  '/earnings/history',
  authorizeDelivery[1],
  catchAsync(DeliveryController.getEarningsHistory)
);

router.get(
  '/stats/performance',
  authorizeDelivery[1],
  catchAsync(DeliveryController.getPerformanceStats)
);

router.get(
  '/dashboard',
  authorizeDelivery[1],
  catchAsync(DeliveryController.getDashboardStats)
);

router.get(
  '/documents',
  authorizeDelivery[1],
  catchAsync(DeliveryController.getDocuments)
);

// Location updates
router.patch(
  '/location',
  authorizeDelivery[1],
  validateRequest(Joi.object({
    latitude: Joi.number(),
    longitude: Joi.number(),
    address: Joi.string().required()
  })),
  catchAsync(DeliveryController.updateLocation)
);

export default router;