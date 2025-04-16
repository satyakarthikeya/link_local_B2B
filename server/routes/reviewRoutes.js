import express from 'express';
import ReviewController from '../controllers/reviewController.js';
import { catchAsync } from '../utils/errorHandler.js';
import { authorizeBusiness } from '../middleware/auth.js';
import Joi from 'joi';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

// Get reviews for a business (public route)
router.get('/business/:business_id', catchAsync(ReviewController.getBusinessReviews));

// Get review for a specific order (public route)
router.get('/order/:order_id', catchAsync(ReviewController.getReviewByOrder));

// Routes that require authentication
router.use(authorizeBusiness[0]);

// Submit a review for an order
router.post('/order/:order_id', 
  validateRequest(Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().allow('', null)
  })),
  catchAsync(ReviewController.submitReview)
);

// Update a review
router.put('/:review_id', 
  validateRequest(Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().allow('', null)
  })),
  catchAsync(ReviewController.updateReview)
);

// Delete a review
router.delete('/:review_id', catchAsync(ReviewController.deleteReview));

export default router;