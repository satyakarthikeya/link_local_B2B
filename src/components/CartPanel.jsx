import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/Cart.css';

const CartPanel = ({ isOpen, onClose }) => {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal,
    getCartItemsCount
  } = useCart();
  
  const panelRef = useRef(null);
  
  // Close cart when escape key is pressed
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);
  
  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target) && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);
  
  return (
    <div 
      ref={panelRef}
      className={`cart-panel ${isOpen ? 'active' : ''} ${!isOpen && panelRef.current ? 'closing' : ''}`}
      aria-hidden={!isOpen}
    >
      {/* Cart Header */}
      <div className="cart-panel-header">
        <h2><i className="fas fa-shopping-cart"></i> Your Cart</h2>
        <button 
          className="cart-panel-close" 
          onClick={onClose}
          aria-label="Close cart"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      {/* Cart Body */}
      <div className="cart-panel-body">
        {cart.length === 0 ? (
          <div className="cart-empty">
            <i className="fas fa-shopping-basket"></i>
            <p>Your cart is empty</p>
            <button className="continue-shopping" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="cart-item">
              <img 
                className="cart-item-img" 
                src={item.imageUrl || '/assets/product-placeholder.png'} 
                alt={item.name} 
              />
              
              <div className="cart-item-details">
                <h3 className="cart-item-name">{item.name}</h3>
                <p className="cart-item-seller">{item.seller || 'Local Vendor'}</p>
                
                <div className="cart-qty-controls">
                  <button 
                    className="cart-qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <span className="cart-qty">{item.quantity}</span>
                  <button 
                    className="cart-qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              
              <div className="cart-item-price">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
              
              <button 
                className="cart-item-remove"
                onClick={() => removeFromCart(item.id)}
                aria-label={`Remove ${item.name} from cart`}
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          ))
        )}
      </div>
      
      {/* Cart Footer */}
      {cart.length > 0 && (
        <div className="cart-panel-footer">
          <div className="cart-subtotal">
            <span>Subtotal ({getCartItemsCount()} items)</span>
            <span>${getCartTotal().toFixed(2)}</span>
          </div>
          
          <div className="cart-total">
            <span>Total</span>
            <span>${getCartTotal().toFixed(2)}</span>
          </div>
          
          <button className="checkout-btn">
            <i className="fas fa-lock"></i> Proceed to Checkout
          </button>
          
          <div className="view-full-cart">
            <Link to="/cart" onClick={onClose}>
              View Full Cart <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPanel;
