import React, { useState } from 'react';
import '../Styles/business_home.css';

const ProductCard = ({ product, viewProductDetails, addToCart, toggleWishlist, isInWishlist }) => {
  const [quantity, setQuantity] = useState(1);
  const [showReviews, setShowReviews] = useState(false);

  // Handle quantity change
  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  // Extract MOQ number for validation
  const extractMOQNumber = (moqString) => {
    const match = moqString.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  };

  // Check if quantity is valid compared to MOQ
  const minQuantity = extractMOQNumber(product.moq);
  const isQuantityValid = quantity >= minQuantity;

  return (
    <div className="product-card">
      {!product.inStock && <div className="out-of-stock">Out of Stock</div>}
      
      {/* Product Image with wishlist icon */}
      <div className="product-img">
        <img src={product.image} alt={product.name} loading="lazy" />
        <button 
          className={`wishlist-btn ${isInWishlist ? 'active' : ''}`} 
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <i className={`${isInWishlist ? 'fas' : 'far'} fa-heart`}></i>
        </button>
      </div>

      {/* Product Content */}
      <div className="product-content">
        <h3>{product.name}</h3>
        <p className="seller">by {product.seller}</p>
        
        <div className="location-tag">
          <i className="fas fa-map-marker-alt"></i> {product.area}, {product.location}
        </div>
        
        <div className="additional-info">
          <span className="rating">
            <i className="fas fa-star"></i> {product.rating}
            <span className="reviews-count">({product.reviews?.length || 0})</span>
          </span>
          <span className="delivery-time">
            <i className="fas fa-truck"></i> {product.deliveryTime}
          </span>
        </div>
        
        <div className="product-details">
          <div className="price">{product.price}</div>
          <div className="moq">MOQ: {product.moq}</div>
        </div>
        
        {/* Reviews preview */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="reviews-preview" style={{ display: showReviews ? 'block' : 'none' }}>
            {product.reviews.slice(0, 2).map((review, index) => (
              <div className="review-item" key={index}>
                <div className="review-header">
                  <span className="reviewer">{review.user}</span>
                  <span className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <i 
                        key={i} 
                        className={i < Math.floor(review.rating) ? "fas fa-star" : 
                                   (i === Math.floor(review.rating) && review.rating % 1 !== 0) ? "fas fa-star-half-alt" : 
                                   "far fa-star"}
                      ></i>
                    ))}
                  </span>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
            {product.reviews.length > 2 && (
              <button 
                className="view-all-reviews"
                onClick={(e) => {
                  e.stopPropagation();
                  // In a real app, this would navigate to a reviews page
                  alert(`Viewing all ${product.reviews.length} reviews for ${product.name}`);
                }}
              >
                View all {product.reviews.length} reviews
              </button>
            )}
          </div>
        )}
        
        {/* Product Actions */}
        <div className="action-buttons">
          <button 
            className="view-details-btn" 
            onClick={() => viewProductDetails(product)}
            aria-label="View product details"
          >
            <i className="fas fa-eye"></i>
          </button>
          
          <button 
            className="reviews-toggle-btn" 
            onClick={(e) => {
              e.stopPropagation();
              setShowReviews(!showReviews);
            }}
            aria-label={showReviews ? "Hide reviews" : "Show reviews"}
          >
            <i className={`fas fa-${showReviews ? 'chevron-up' : 'chevron-down'}`}></i>
          </button>
          
          {product.inStock ? (
            <>
              <div className="quantity">
                <input 
                  type="number" 
                  min="1" 
                  value={quantity} 
                  onChange={handleQuantityChange} 
                  aria-label="Quantity"
                />
              </div>
              
              <button 
                className="add-to-cart" 
                disabled={!isQuantityValid}
                onClick={() => {
                  if (isQuantityValid) {
                    addToCart(product, quantity);
                  } else {
                    alert(`Minimum order quantity is ${minQuantity}`);
                  }
                }}
              >
                {isQuantityValid ? 'Add to Cart' : `Min ${minQuantity} required`}
              </button>
            </>
          ) : (
            <button className="notify-btn" onClick={() => alert(`You will be notified when ${product.name} is back in stock.`)}>
              <i className="fas fa-bell"></i> Notify When Available
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;