import ReviewModel from '../models/reviewModel.js';
import OrderModel from '../models/orderModel.js';

const ReviewController = {
  // Submit a new review for an order
  async submitReview(req, res) {
    try {
      const reviewer_id = req.user.id;
      const { order_id } = req.params;
      const { rating, comment } = req.body;
      
      // Validate order exists
      const order = await OrderModel.findById(order_id);
      if (!order) {
        return res.status(404).json({ 
          success: false, 
          error: 'Order not found' 
        });
      }
      
      // Verify user was the one who placed the order
      if (order.ordering_businessman_id !== reviewer_id) {
        return res.status(403).json({ 
          success: false, 
          error: 'You can only review orders you placed' 
        });
      }
      
      // Verify order is delivered
      if (order.status !== 'Delivered' && order.delivery_status !== 'Delivered') {
        return res.status(400).json({ 
          success: false, 
          error: 'You can only review delivered orders' 
        });
      }
      
      // Check if order has already been reviewed
      const hasReviewed = await ReviewModel.hasUserReviewedOrder(reviewer_id, order_id);
      if (hasReviewed) {
        return res.status(400).json({ 
          success: false, 
          error: 'You have already reviewed this order' 
        });
      }
      
      // Create the review
      const reviewData = {
        order_id,
        reviewer_id,
        business_id: order.supplying_businessman_id,
        rating,
        comment
      };
      
      const review = await ReviewModel.createReview(reviewData);
      
      res.status(201).json({ 
        success: true, 
        message: 'Review submitted successfully', 
        review 
      });
    } catch (error) {
      console.error('Submit review error:', error.message);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to submit review', 
        message: error.message 
      });
    }
  },
  
  // Update an existing review
  async updateReview(req, res) {
    try {
      const reviewer_id = req.user.id;
      const { review_id } = req.params;
      const { rating, comment } = req.body;
      
      // Verify review exists and belongs to user
      const existingReview = await ReviewModel.getReviewById(review_id);
      if (!existingReview) {
        return res.status(404).json({ 
          success: false, 
          error: 'Review not found' 
        });
      }
      
      if (existingReview.reviewer_id !== reviewer_id) {
        return res.status(403).json({ 
          success: false, 
          error: 'You can only update your own reviews' 
        });
      }
      
      // Update the review
      const reviewData = { rating, comment };
      const review = await ReviewModel.updateReview(review_id, reviewData);
      
      res.json({ 
        success: true, 
        message: 'Review updated successfully', 
        review 
      });
    } catch (error) {
      console.error('Update review error:', error.message);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update review', 
        message: error.message 
      });
    }
  },
  
  // Get reviews for a business
  async getBusinessReviews(req, res) {
    try {
      const { business_id } = req.params;
      const { limit = 10, page = 1 } = req.query;
      
      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      const reviews = await ReviewModel.getReviewsByBusinessId(
        business_id, 
        parseInt(limit), 
        offset
      );
      
      // Get business average rating
      const ratingStats = await ReviewModel.getBusinessAverageRating(business_id);
      
      res.json({
        success: true,
        reviews,
        stats: ratingStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: ratingStats.review_count
        }
      });
    } catch (error) {
      console.error('Get business reviews error:', error.message);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get reviews', 
        message: error.message 
      });
    }
  },
  
  // Get review by order ID
  async getReviewByOrder(req, res) {
    try {
      const { order_id } = req.params;
      
      const review = await ReviewModel.getReviewByOrderId(order_id);
      
      if (!review) {
        return res.json({ 
          success: true, 
          exists: false,
          message: 'No review found for this order' 
        });
      }
      
      res.json({ 
        success: true, 
        exists: true,
        review 
      });
    } catch (error) {
      console.error('Get review by order error:', error.message);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get review', 
        message: error.message 
      });
    }
  },
  
  // Delete a review
  async deleteReview(req, res) {
    try {
      const reviewer_id = req.user.id;
      const { review_id } = req.params;
      
      // Verify review exists and belongs to user
      const existingReview = await ReviewModel.getReviewById(review_id);
      if (!existingReview) {
        return res.status(404).json({ 
          success: false, 
          error: 'Review not found' 
        });
      }
      
      if (existingReview.reviewer_id !== reviewer_id) {
        return res.status(403).json({ 
          success: false, 
          error: 'You can only delete your own reviews' 
        });
      }
      
      // Delete the review
      await ReviewModel.deleteReview(review_id);
      
      res.json({ 
        success: true, 
        message: 'Review deleted successfully' 
      });
    } catch (error) {
      console.error('Delete review error:', error.message);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete review', 
        message: error.message 
      });
    }
  }
};

export default ReviewController;