import express from 'express';
import Joi from 'joi';
import ProductController from '../controllers/productController.js';
import { authenticateToken, authorizeBusiness } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validateRequest.js';
import { catchAsync } from '../utils/errorHandler.js';

const router = express.Router();

// Public routes
router.get('/', catchAsync(ProductController.getAllProducts));
router.get('/search', catchAsync(ProductController.searchProducts));
router.get('/:id', catchAsync(ProductController.getProduct));

// Protected routes - requires authentication
router.use(authenticateToken);

// Business routes
router.use('/business', authorizeBusiness);
router.get('/business/myproducts', catchAsync(ProductController.getBusinessProducts));
router.get('/business/low-stock', catchAsync(ProductController.getLowStockProducts));

// Product management
router.post(
  '/', 
  authorizeBusiness,
  validateRequest(schemas.productCreate),
  catchAsync(ProductController.createProduct)
);
router.put(
  '/:id', 
  authorizeBusiness,
  validateRequest(schemas.productUpdate),
  catchAsync(ProductController.updateProduct)
);
router.delete(
  '/:id', 
  authorizeBusiness,
  catchAsync(ProductController.deleteProduct)
);

// Inventory management
router.patch(
  '/:id/quantity', 
  authorizeBusiness,
  validateRequest(Joi.object({
    quantity: Joi.number().required().min(0)
  })),
  catchAsync(ProductController.updateProductQuantity)
);

export default router;