import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/ReviewForm.css';

const ReviewForm = ({ order, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleStarClick = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError('Please provide a comment with your review');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // In a real implementation, this would be an API call to save the review
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating API call
      
      onSubmit({
        orderId: order.order_id,
        ratingValue: rating,
        comment,
        createdAt: new Date().toISOString()
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-form-overlay">
      <div className="review-form-container">
        <button className="close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        <div className="review-header">
          <h2>Review Your Order</h2>
          <p>Share your experience with {order.supplying_business_name}</p>
        </div>
        
        <div className="order-summary">
          <div className="review-order-id">
            <strong>Order ID:</strong> {order.order_id}
          </div>
          <div className="review-product">
            <strong>Product:</strong> {order.product_name}
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="rating-section">
            <label>Rate your experience:</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= rating ? 'active' : ''}`}
                  onClick={() => handleStarClick(star)}
                >
                  <i className="fas fa-star"></i>
                </span>
              ))}
            </div>
          </div>
          
          <div className="comment-section">
            <label htmlFor="comment">Your review:</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience with this product and supplier..."
              rows="4"
            ></textarea>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span> Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ReviewForm.propTypes = {
  order: PropTypes.shape({
    order_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    product_name: PropTypes.string.isRequired,
    supplying_business_name: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default ReviewForm;