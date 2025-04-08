import React from 'react';
import PropTypes from 'prop-types';
import '../styles/business_home.css';

const ProductCard = ({ product, onAddToCart, onViewDetails }) => {
  const {
    image,
    name,
    inStock,
    rating,
    reviews = [],
    area,
    location,
    deliveryTime,
    moq,
    price,
    originalPrice
  } = product;

  return (
    <div className="product-card">
      <div className="product-img-wrapper">
        <img src={image} alt={name} className="product-img" />
        {inStock ? (
          <span className="stock-badge in-stock">In Stock</span>
        ) : (
          <span className="stock-badge out-of-stock">Out of Stock</span>
        )}
        <div className="product-overlay">
          <button 
            className="quick-view-btn" 
            onClick={() => onViewDetails(product)}
            aria-label="Quick view"
          >
            <i className="fas fa-eye"></i>
          </button>
        </div>
      </div>
      
      <div className="product-content">
        <div className="product-header">
          <h3 className="product-title">{name}</h3>
          <div className="product-rating">
            <i className="fas fa-star"></i>
            <span>{rating}</span>
            <small>({reviews.length || 0})</small>
          </div>
        </div>

        <div className="product-location">
          <i className="fas fa-map-marker-alt"></i>
          <span>{area}, {location}</span>
        </div>

        <div className="product-details">
          <div className="delivery-info">
            <i className="fas fa-clock"></i>
            <span>{deliveryTime}</span>
          </div>
          <div className="moq-info">
            <i className="fas fa-box"></i>
            <span>MOQ: {moq}</span>
          </div>
        </div>

        <div className="product-price">
          <span className="price-amount">₹{price}</span>
          {originalPrice && (
            <span className="original-price">₹{originalPrice}</span>
          )}
        </div>

        <div className="product-actions">
          <button 
            className="add-cart-btn" 
            onClick={() => onAddToCart(product)}
            disabled={!inStock}
            aria-label="Add to cart"
          >
            <i className="fas fa-shopping-cart"></i>
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    inStock: PropTypes.bool.isRequired,
    rating: PropTypes.number.isRequired,
    reviews: PropTypes.array,
    area: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    deliveryTime: PropTypes.string.isRequired,
    moq: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    price: PropTypes.number.isRequired,
    originalPrice: PropTypes.number
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
  onViewDetails: PropTypes.func.isRequired
};

export default ProductCard;