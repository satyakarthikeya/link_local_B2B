import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useCart } from '../context/CartContext';
import '../styles/business_home.css';

const ProductCard = ({ product, onViewDetails }) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  
  const calculateDiscount = () => {
    if (product.originalPrice) {
      const discount = ((product.originalPrice - product.price) / product.originalPrice) * 100;
      return Math.round(discount);
    }
    return null;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.inStock || isAddingToCart) return;
    
    try {
      setIsAddingToCart(true);
      
      // Use the context's addToCart function
      addToCart(product);
      
      // Show success feedback
      setAddedToCart(true);
      
      // Reset the success state after a delay
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleViewDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onViewDetails(product);
  };

  const discount = calculateDiscount();
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
    <div 
      className="product-card fade-in" 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-img-wrapper">
        {discount && (
          <span className="discount-badge">-{discount}%</span>
        )}
        <img src={image} alt={name} className="product-img" />
        {inStock ? (
          <span className="stock-badge in-stock">
            <i className="fas fa-check-circle"></i> In Stock
          </span>
        ) : (
          <span className="stock-badge out-of-stock">
            <i className="fas fa-times-circle"></i> Out of Stock
          </span>
        )}
        <div className={`product-overlay ${isHovered ? 'visible' : ''}`}>
          <button 
            className="quick-view-btn" 
            onClick={handleViewDetails}
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
            <i className="fas fa-truck"></i>
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
            className={`add-cart-btn ${isAddingToCart ? 'loading' : ''} ${addedToCart ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={!inStock || isAddingToCart}
            aria-label="Add to cart"
          >
            {isAddingToCart ? (
              <>
                <span className="cart-spinner"></span>
                <span>Adding...</span>
              </>
            ) : addedToCart ? (
              <>
                <i className="fas fa-check"></i>
                <span>Added!</span>
              </>
            ) : (
              <>
                <i className="fas fa-shopping-cart"></i>
                <span>Add to Cart</span>
              </>
            )}
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
  onViewDetails: PropTypes.func.isRequired
};

export default ProductCard;