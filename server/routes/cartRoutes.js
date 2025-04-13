import express from 'express';
import CartController from '../controllers/cartController.js';
import { catchAsync } from '../utils/errorHandler.js';
import { authorizeBusiness } from '../middleware/auth.js';
import Joi from 'joi';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

// All cart routes require business authentication
router.use(authorizeBusiness[0]);

// Get user's cart
router.get('/', catchAsync(CartController.getCart));

// Get cart items count
router.get('/count', catchAsync(CartController.getCartCount));

// Add item to cart
router.post('/add', 
  validateRequest(Joi.object({
    product_id: Joi.number().integer().required(),
    quantity: Joi.number().integer().min(1).default(1)
  })),
  catchAsync(CartController.addToCart)
);

// Update cart item quantity
router.put('/update', 
  validateRequest(Joi.object({
    product_id: Joi.number().integer().required(),
    quantity: Joi.number().integer().min(0).required()
  })),
  catchAsync(CartController.updateCartItem)
);

// Remove item from cart
router.delete('/remove/:product_id', catchAsync(CartController.removeFromCart));

// Clear cart
router.delete('/clear', catchAsync(CartController.clearCart));

export default router;