import express from 'express';
import { ProductController } from '../controllers/productController.js';
import { authenticateToken as authMiddleware, authenticateToken as optionalAuthMiddleware } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();
const productController = new ProductController();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `product-${uniqueSuffix}.${ext}`);
  }
});
const upload = multer({ storage });

// Products routes
router.get('/', optionalAuthMiddleware, productController.getAllProducts.bind(productController));
router.get('/search', optionalAuthMiddleware, productController.searchProducts.bind(productController));
router.get('/:id', productController.getProduct.bind(productController));
router.get('/business/:businessId', productController.getBusinessProducts.bind(productController));
router.post('/', authMiddleware, upload.single('image'), productController.createProduct.bind(productController));
router.put('/:id', authMiddleware, upload.single('image'), productController.updateProduct.bind(productController));
router.delete('/:id', authMiddleware, productController.deleteProduct.bind(productController));

export default router;