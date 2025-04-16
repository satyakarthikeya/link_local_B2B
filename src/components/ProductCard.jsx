import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/Cart.css';

const ProductCard = ({ product, onAddToCart, isBusinessView = false, onUpdateStock, onEdit, onDelete, onCreateDeal }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Check if a product is a deal and has a deal type, using a more robust check
  const isDealProduct = Boolean(
    product.isDeal || 
    product.is_deal || 
    product.deal_type === 'BUY_ONE_GET_ONE' || 
    product.deal_type === 'DISCOUNT' ||
    product.discount_percentage > 0
  );
  
  // Ensure deal type is properly detected, with fallbacks
  const dealType = product.deal_type || 
                   (product.discount_percentage > 0 ? 'DISCOUNT' : null);
                   
  // Ensure numeric discount value exists
  const discountValue = product.discount || 
                        product.discount_percentage || 
                        (product.originalPrice ? 20 : 0); // Default 20% if original price exists

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
        {image_url ? (
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
        ) : (
          <div 
            className="no-image"
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
              color: '#aaa'
            }}
          >
            <i className="fas fa-image fa-3x"></i>
          </div>
        )}
        
        {/* Show Deal Badge if product is a deal */}
        {isDealProduct && (
          <div className="featured-badge" style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px', 
            padding: '5px 12px', 
            borderRadius: '20px', 
            color: 'white', 
            fontWeight: 'bold', 
            zIndex: 10 
          }}>
            {dealType === 'BUY_ONE_GET_ONE' ? (
              <span style={{ 
                background: '#e67e22', 
                padding: '5px 12px', 
                borderRadius: '20px' 
              }}>BUY 1 GET 1 FREE</span>
            ) : (
              <span style={{ 
                background: '#2ecc71', 
                padding: '5px 12px', 
                borderRadius: '20px' 
              }}>
                {discountValue > 0 ? `${discountValue}% OFF` : '20% OFF'}
              </span>
            )}
          </div>
        )}
        
        {/* Show standard stock badge if not a deal */}
        {!isDealProduct && (
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
        )}

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
          gap: '10px'
        }}
      >
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: '600',
          marginBottom: '5px',
          color: '#2c3e50'
        }}>{product_name}</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
          <span style={{ fontWeight: '600', color: '#636e72' }}>{category}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {product.isDeal && product.deal_type === 'BUY_ONE_GET_ONE' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ 
                fontSize: '1.2rem', 
                fontWeight: '700', 
                color: '#e67e22' 
              }}>
                ₹{price}
              </span>
              <span style={{ 
                fontSize: '0.85rem', 
                backgroundColor: '#fff8e1', 
                color: '#e67e22', 
                padding: '2px 6px', 
                borderRadius: '4px',
                marginTop: '4px',
                border: '1px dashed #e67e22'
              }}>
                <i className="fas fa-gift" style={{ marginRight: '4px' }}></i>
                Get 2nd item FREE
              </span>
            </div>
          ) : product.isDeal && product.discount > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: '700', 
                  color: '#2ecc71' 
                }}>
                  ₹{product.discounted_price || price}
                </span>
                <span style={{ 
                  fontSize: '1rem', 
                  fontWeight: '400', 
                  textDecoration: 'line-through', 
                  color: '#95a5a6'
                }}>
                  {product.originalPrice || `₹${Math.round(price * 1.25)}`}
                </span>
              </div>
              <span style={{ 
                fontSize: '0.85rem', 
                backgroundColor: '#e3fcef', 
                color: '#2ecc71', 
                padding: '2px 6px', 
                borderRadius: '4px',
                marginTop: '4px',
                border: '1px dashed #2ecc71'
              }}>
                <i className="fas fa-tags" style={{ marginRight: '4px' }}></i>
                {product.discount}% OFF
              </span>
            </div>
          ) : product.discounted_price ? (
            <>
              <span style={{ 
                fontSize: '1.2rem', 
                fontWeight: '700', 
                color: '#2ecc71'
              }}>
                ₹{product.discounted_price}
              </span>
              <span style={{ 
                fontSize: '1rem', 
                fontWeight: '400', 
                textDecoration: 'line-through', 
                color: '#95a5a6'
              }}>
                ₹{price}
              </span>
              {product.discount_percentage && (
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: '#fff',
                  background: '#e74c3c',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  {product.discount_percentage}% OFF
                </span>
              )}
            </>
          ) : (
            <span style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2c3e50' }}>₹{price}</span>
          )}
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
              background: !product.in_stock ? '#636e72' :
                          product.isDeal && product.deal_type === 'BUY_ONE_GET_ONE' ? '#e67e22' :
                          product.isDeal && product.discount > 0 ? '#2ecc71' : '#3498db',
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
                <i className={product.isDeal && product.deal_type === 'BUY_ONE_GET_ONE' ? "fas fa-gift" : 
                              product.isDeal && product.discount > 0 ? "fas fa-tags" : "fas fa-shopping-cart"}></i>
                <span>
                  {!product.in_stock ? 'Out of Stock' : 
                   product.isDeal && product.deal_type === 'BUY_ONE_GET_ONE' ? 'Add BOGO Deal to Cart' :
                   product.isDeal && product.discount > 0 ? `Add ${product.discount || 20}% OFF Deal to Cart` :
                   'Add to Cart'}
                </span>
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
    description: PropTypes.string,
    discounted_price: PropTypes.number,
    discount_percentage: PropTypes.number,
    isDeal: PropTypes.bool,
    deal_type: PropTypes.string,
    discount: PropTypes.number
  }).isRequired,
  onAddToCart: PropTypes.func,
  isBusinessView: PropTypes.bool,
  onUpdateStock: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onCreateDeal: PropTypes.func
};

export default ProductCard;