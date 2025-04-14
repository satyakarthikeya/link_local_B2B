import express from 'express';
import { ProductController } from '../controllers/productController.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware.js';
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
router.get('/', optionalAuthMiddleware, productController.getAllProducts);
router.get('/search', optionalAuthMiddleware, productController.searchProducts);
router.get('/:id', productController.getProductById);
router.get('/business/:businessId', productController.getBusinessProducts);
router.post('/', authMiddleware, upload.single('image'), productController.createProduct);
router.put('/:id', authMiddleware, upload.single('image'), productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);

export default router;