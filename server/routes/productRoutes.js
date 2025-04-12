import express from 'express';
import ProductController from '../controllers/productController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', ProductController.getAllProducts);
router.get('/search', ProductController.searchProducts);
router.get('/:id', ProductController.getProduct);

// Protected routes - requires authentication
router.use(authenticateToken);

// Business user product management
router.post('/', ProductController.createProduct);
router.put('/:id', ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);
router.patch('/:id/quantity', ProductController.updateProductQuantity);
router.get('/business/myproducts', ProductController.getBusinessProducts);

export default router;