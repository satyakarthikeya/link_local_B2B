import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/Cart.css';

const ProductCard = ({ product, onAddToCart, isBusinessView = false, onUpdateStock, onEdit, onDelete, onCreateDeal }) => {
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

  const handleCreateDeal = (e) => {
    e.stopPropagation();
    if (onCreateDeal) {
      onCreateDeal(product);
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
    area,
    description
  } = product;

  const stockStatus = quantity_available === 0 ? 'Out of Stock' : 
                     quantity_available <= reorder_point ? 'Low Stock' : 
                     'In Stock';

  const stockStatusColor = {
    'Out of Stock': '#ff4757',
    'Low Stock': '#ffa502',
    'In Stock': '#2ed573'
  };

  return (
    <div 
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-8px)' : 'none',
        border: '1px solid #eee',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        background: '#fff',
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div className="product-image" style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        <img 
          src={image_url} 
          alt={product_name} 
          style={{ 
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
        />
        
        <div 
          className="stock-badge"
          style={{ 
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600',
            backgroundColor: stockStatusColor[stockStatus],
            color: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <i className={`fas fa-${stockStatus === 'In Stock' ? 'check-circle' : stockStatus === 'Low Stock' ? 'exclamation-circle' : 'times-circle'}`}></i>
          {stockStatus}
        </div>

        {isBusinessView && (
          <div 
            className={`product-actions ${isHovered ? 'visible' : ''}`}
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              display: 'flex',
              gap: '8px',
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'all 0.3s ease'
            }}
          >
            <button
              className="action-btn edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              aria-label="Edit product"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: '#fff',
                color: '#3498db',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
            >
              <i className="fas fa-edit"></i>
            </button>
            <button
              className="action-btn deal"
              onClick={handleCreateDeal}
              aria-label="Create deal for product"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: '#fff',
                color: '#e74c3c',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
            >
              <i className="fas fa-percentage"></i>
            </button>
            <button
              className="action-btn delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product.product_id);
              }}
              aria-label="Delete product"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: '#fff',
                color: '#e74c3c',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        )}
      </div>

      <div 
        className="product-content"
        style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          flex: 1
        }}
      >
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: '600',
          color: '#2d3436',
          marginBottom: '4px'
        }}>{product_name}</h3>
        
        <div className="product-meta" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span className="category" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            background: '#f1f2f6',
            borderRadius: '4px',
            fontSize: '0.85rem',
            color: '#636e72'
          }}>
            <i className="fas fa-tag"></i> {category}
          </span>
          <span className="price" style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            color: '#2d3436'
          }}>₹{price}</span>
        </div>

        {description && (
          <p style={{
            fontSize: '0.9rem',
            color: '#636e72',
            marginTop: '4px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>{description}</p>
        )}

        {!isBusinessView && (
          <div className="seller-info" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#636e72' }}>
              <i className="fas fa-store"></i>
              <span>{business_name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#636e72' }}>
              <i className="fas fa-map-marker-alt"></i>
              <span>{area}</span>
            </div>
          </div>
        )}

        {isBusinessView ? (
          <div className="inventory-management" style={{
            marginTop: 'auto',
            borderTop: '1px solid #eee',
            paddingTop: '12px'
          }}>
            <div className="stock-control" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <label style={{ fontSize: '0.9rem', color: '#636e72' }}>Current Stock:</label>
              <div className="stock-actions" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <button
                  onClick={() => handleStockUpdate(quantity_available - 1)}
                  disabled={quantity_available <= 0}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid #dfe6e9',
                    background: '#fff',
                    color: '#636e72',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fas fa-minus"></i>
                </button>
                <input
                  type="number"
                  value={quantity_available}
                  onChange={(e) => handleStockUpdate(parseInt(e.target.value) || 0)}
                  min="0"
                  style={{
                    width: '60px',
                    padding: '6px',
                    borderRadius: '6px',
                    border: '1px solid #dfe6e9',
                    textAlign: 'center'
                  }}
                />
                <button
                  onClick={() => handleStockUpdate(quantity_available + 1)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: '1px solid #dfe6e9',
                    background: '#fff',
                    color: '#636e72',
                    cursor: 'pointer'
                  }}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>
            
            <div className="inventory-details" style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '12px',
              fontSize: '0.85rem',
              color: '#636e72'
            }}>
              <div className="moq">
                <span>Min. Order:</span> {moq} units
              </div>
              <div className="reorder-point">
                <span>Reorder at:</span> {reorder_point} units
              </div>
            </div>
          </div>
        ) : (
          <button
            className={`add-cart-btn ${isAddingToCart ? 'loading' : ''} ${addedToCart ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={!product.in_stock || isAddingToCart}
            style={{
              marginTop: 'auto',
              padding: '10px',
              borderRadius: '6px',
              border: 'none',
              background: product.in_stock ? '#3498db' : '#636e72',
              color: '#fff',
              cursor: product.in_stock ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              fontWeight: '500'
            }}
          >
            {isAddingToCart ? (
              <>
                <span className="spinner"></span>
                <span>Adding...</span>
              </>
            ) : addedToCart ? (
              <>
                <i className="fas fa-check"></i>
                <span>Added to Cart</span>
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
    in_stock: PropTypes.bool,
    description: PropTypes.string
  }).isRequired,
  onAddToCart: PropTypes.func,
  isBusinessView: PropTypes.bool,
  onUpdateStock: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onCreateDeal: PropTypes.func
};

export default ProductCard;