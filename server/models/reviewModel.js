import db from '../config/db.js';

const ReviewModel = {
  // Create a new review
  async createReview(reviewData) {
    const { 
      order_id, 
      reviewer_id, 
      business_id, 
      rating, 
      comment 
    } = reviewData;
    
    // Check if order has already been reviewed
    const existingReview = await this.getReviewByOrderId(order_id);
    if (existingReview) {
      throw new Error('Order has already been reviewed');
    }
    
    const result = await db.query(
      `INSERT INTO Reviews (order_id, reviewer_id, business_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [order_id, reviewer_id, business_id, rating, comment]
    );
    
    return result.rows[0];
  },
  
  // Update an existing review
  async updateReview(review_id, reviewData) {
    const { rating, comment } = reviewData;
    
    const result = await db.query(
      `UPDATE Reviews 
       SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
       WHERE review_id = $3
       RETURNING *`,
      [rating, comment, review_id]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Review not found');
    }
    
    return result.rows[0];
  },
  
  // Get review by ID
  async getReviewById(review_id) {
    const result = await db.query(
      `SELECT r.*, 
        o.ordering_businessman_id, o.supplying_businessman_id,
        bp1.business_name as reviewer_business_name,
        bp2.business_name as reviewed_business_name
       FROM Reviews r
       JOIN Orders o ON r.order_id = o.order_id
       JOIN BusinessProfile bp1 ON r.reviewer_id = bp1.businessman_id
       JOIN BusinessProfile bp2 ON r.business_id = bp2.businessman_id
       WHERE r.review_id = $1`,
      [review_id]
    );
    
    return result.rows[0];
  },
  
  // Get review by order ID
  async getReviewByOrderId(order_id) {
    const result = await db.query(
      `SELECT r.*, 
        o.ordering_businessman_id, o.supplying_businessman_id,
        bp1.business_name as reviewer_business_name,
        bp2.business_name as reviewed_business_name
       FROM Reviews r
       JOIN Orders o ON r.order_id = o.order_id
       JOIN BusinessProfile bp1 ON r.reviewer_id = bp1.businessman_id
       JOIN BusinessProfile bp2 ON r.business_id = bp2.businessman_id
       WHERE r.order_id = $1`,
      [order_id]
    );
    
    return result.rows[0];
  },
  
  // Get reviews by business ID
  async getReviewsByBusinessId(business_id, limit = 10, offset = 0) {
    const result = await db.query(
      `SELECT r.*, 
        o.ordering_businessman_id, o.supplying_businessman_id, o.total_amount,
        bp1.business_name as reviewer_business_name,
        bp1.area as reviewer_area,
        p.product_name
       FROM Reviews r
       JOIN Orders o ON r.order_id = o.order_id
       JOIN BusinessProfile bp1 ON r.reviewer_id = bp1.businessman_id
       JOIN OrderProducts op ON o.order_id = op.order_id
       JOIN Product p ON op.product_id = p.product_id
       WHERE r.business_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [business_id, limit, offset]
    );
    
    return result.rows;
  },
  
  // Get average rating for a business
  async getBusinessAverageRating(business_id) {
    const result = await db.query(
      `SELECT AVG(rating) as average_rating, COUNT(*) as review_count
       FROM Reviews
       WHERE business_id = $1`,
      [business_id]
    );
    
    return {
      average_rating: parseFloat(result.rows[0].average_rating) || 0,
      review_count: parseInt(result.rows[0].review_count) || 0
    };
  },
  
  // Check if user has reviewed an order
  async hasUserReviewedOrder(reviewer_id, order_id) {
    const result = await db.query(
      `SELECT COUNT(*) as review_count
       FROM Reviews
       WHERE reviewer_id = $1 AND order_id = $2`,
      [reviewer_id, order_id]
    );
    
    return parseInt(result.rows[0].review_count) > 0;
  },
  
  // Delete a review
  async deleteReview(review_id) {
    const result = await db.query(
      `DELETE FROM Reviews
       WHERE review_id = $1
       RETURNING *`,
      [review_id]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Review not found');
    }
    
    return result.rows[0];
  }
};

export default ReviewModel;