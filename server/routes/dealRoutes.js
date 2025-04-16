// filepath: c:\Users\pasar\Desktop\link-local\server\routes\dealRoutes.js
import express from 'express';
import { body } from 'express-validator';
import * as dealController from '../controllers/dealController.js';
import { authorizeBusiness } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware for deal creation/update
const validateDeal = [
  body('deal_type')
    .notEmpty().withMessage('Deal type is required')
    .isIn(['DISCOUNT', 'BUY_ONE_GET_ONE', 'BUNDLE', 'CLEARANCE', 'FLASH_SALE'])
    .withMessage('Invalid deal type'),
  body('deal_title')
    .notEmpty().withMessage('Deal title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Deal title must be between 3 and 100 characters'),
  body('deal_description')
    .optional()
    .isLength({ max: 500 }).withMessage('Deal description must be less than 500 characters'),
  body('discount_percentage')
    .optional()
    .isFloat({ min: 0.01, max: 100 }).withMessage('Discount percentage must be between 0.01 and 100'),
  body('discount_amount')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Discount amount must be greater than 0'),
  body('start_date')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),
  body('end_date')
    .optional()
    .isISO8601().withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (req.body.start_date && value && new Date(value) <= new Date(req.body.start_date)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('is_featured')
    .optional()
    .isBoolean().withMessage('Featured status must be a boolean')
];

// Discount validation for discount type deals
const validateDiscount = (req, res, next) => {
  if (req.body.deal_type === 'DISCOUNT') {
    if (!req.body.discount_percentage && !req.body.discount_amount) {
      return res.status(400).json({
        success: false,
        message: 'Discount deals must include either a discount percentage or amount'
      });
    }
  }
  next();
};

// Create a new deal for a product
router.post('/product/:productId', 
  authorizeBusiness, 
  validateDeal,
  validateDiscount,
  dealController.createDeal
);

// Update an existing deal
router.put('/product/:dealId', 
  authorizeBusiness, 
  validateDeal,
  validateDiscount,
  dealController.updateDeal
);

// Remove a deal
router.delete('/:dealId', 
  authorizeBusiness, 
  dealController.removeDeal
);

// Get deal information for a product
router.get('/product/:productId', 
  dealController.getDealByProductId
);

// Check if a product has an active deal
router.get('/product/:productId/check', 
  dealController.checkProductDeal
);

// Get all active deals with optional filters
router.get('/active', 
  dealController.getActiveDeals
);

// NEW ROUTE: Get all deals (regardless of status)
router.get('/all', 
  dealController.getAllDeals
);

// Get deals by business ID
router.get('/business/:businessId', 
  authorizeBusiness, 
  dealController.getDealsByBusinessId
);

// Get featured deals
router.get('/featured', 
  dealController.getFeaturedDeals
);

export default router;