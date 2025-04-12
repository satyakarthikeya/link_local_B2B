import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/Cart.css';

const ProductCard = ({ product, onAddToCart, isBusinessView = false, onUpdateStock, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.in_stock || isAddingToCart) return;

    try {
      setIsAddingToCart(true);
      await onAddToCart(product);
      setAddedToCart(true);
      
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleStockUpdate = async (newQuantity) => {
    if (newQuantity < 0) return;
    try {
      await onUpdateStock(product.product_id, newQuantity);
    } catch (error) {
      console.error("Failed to update stock:", error);
    }
  };

  const {
    product_name,
    price,
    quantity_available,
    image_url,
    category,
    moq = 1,
    reorder_point = 10,
    business_name,
    area
  } = product;

  const stockStatus = quantity_available === 0 ? 'Out of Stock' : 
                     quantity_available <= reorder_point ? 'Low Stock' : 
                     'In Stock';

  const stockStatusColor = {
    'Out of Stock': 'red',
    'Low Stock': 'orange',
    'In Stock': 'green'
  };

  return (
    <div 
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-image">
        <img src={image_url} alt={product_name} />
        
        {/* Stock Status Badge */}
        <div 
          className="stock-badge"
          style={{ backgroundColor: stockStatusColor[stockStatus] }}
        >
          {stockStatus}
        </div>

        {/* Business View Controls */}
        {isBusinessView && (
          <div className={`product-actions ${isHovered ? 'visible' : ''}`}>
            <button
              className="action-btn edit"
              onClick={() => onEdit(product)}
              aria-label="Edit product"
            >
              <i className="fas fa-edit"></i>
            </button>
            <button
              className="action-btn delete"
              onClick={() => onDelete(product.product_id)}
              aria-label="Delete product"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        )}
      </div>

      <div className="product-content">
        <h3>{product_name}</h3>
        
        <div className="product-meta">
          <span className="category">
            <i className="fas fa-tag"></i> {category}
          </span>
          <span className="price">₹{price}</span>
        </div>

        {!isBusinessView && (
          <div className="seller-info">
            <i className="fas fa-store"></i>
            <span>{business_name}</span>
            <div className="location">
              <i className="fas fa-map-marker-alt"></i>
              <span>{area}</span>
            </div>
          </div>
        )}

        {/* Inventory Management Section - Only for Business View */}
        {isBusinessView ? (
          <div className="inventory-management">
            <div className="stock-control">
              <label>Current Stock:</label>
              <div className="stock-actions">
                <button
                  onClick={() => handleStockUpdate(quantity_available - 1)}
                  disabled={quantity_available <= 0}
                >
                  <i className="fas fa-minus"></i>
                </button>
                <input
                  type="number"
                  value={quantity_available}
                  onChange={(e) => handleStockUpdate(parseInt(e.target.value) || 0)}
                  min="0"
                />
                <button
                  onClick={() => handleStockUpdate(quantity_available + 1)}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>
            
            <div className="inventory-details">
              <div className="moq">
                <span>Min. Order:</span> {moq} units
              </div>
              <div className="reorder-point">
                <span>Reorder at:</span> {reorder_point} units
              </div>
            </div>
          </div>
        ) : (
          /* Add to Cart Button - Only for Customer View */
          <button
            className={`add-cart-btn ${isAddingToCart ? 'loading' : ''} ${addedToCart ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={!product.in_stock || isAddingToCart}
          >
            {isAddingToCart ? (
              <>
                <span className="spinner"></span>
                <span>Adding...</span>
              </>
            ) : addedToCart ? (
              <>
                <i className="fas fa-check"></i>
                <span>Added</span>
              </>
            ) : (
              <>
                <i className="fas fa-shopping-cart"></i>
                <span>{product.in_stock ? 'Add to Cart' : 'Out of Stock'}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    product_id: PropTypes.number.isRequired,
    product_name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    quantity_available: PropTypes.number.isRequired,
    image_url: PropTypes.string,
    category: PropTypes.string.isRequired,
    moq: PropTypes.number,
    reorder_point: PropTypes.number,
    business_name: PropTypes.string,
    area: PropTypes.string,
    in_stock: PropTypes.bool
  }).isRequired,
  onAddToCart: PropTypes.func,
  isBusinessView: PropTypes.bool,
  onUpdateStock: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
};

export default ProductCard;