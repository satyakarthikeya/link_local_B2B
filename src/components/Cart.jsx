import React, { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from 'prop-types';
import "../styles/Cart.css";

// Enhanced CartItem component with animation effects
const CartItem = ({ item, updateQuantity, removeFromCart }) => {
  const { id, image, name, seller, quantity, price } = item;
  
  const handleDecrease = useCallback(() => {
    updateQuantity(id, quantity - 1);
  }, [id, quantity, updateQuantity]);
  
  const handleIncrease = useCallback(() => {
    updateQuantity(id, quantity + 1);
  }, [id, quantity, updateQuantity]);
  
  const handleRemove = useCallback(() => {
    removeFromCart(id);
  }, [id, removeFromCart]);
  
  return (
    <div className="cart-item">
      <img src={image} alt={name} className="cart-item-img" />
      <div className="cart-item-details">
        <h3 className="cart-item-name">{name}</h3>
        <p className="cart-item-seller">by {seller}</p>
        <div className="cart-qty-controls">
          <button
            onClick={handleDecrease}
            className="cart-qty-btn"
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <i className="fas fa-minus"></i>
          </button>
          <span className="cart-qty">{quantity}</span>
          <button
            onClick={handleIncrease}
            className="cart-qty-btn"
            aria-label="Increase quantity"
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>
      <span className="cart-item-price">₹{price * quantity}</span>
      <button
        onClick={handleRemove}
        className="cart-item-remove"
        aria-label="Remove item"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

CartItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    image: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    seller: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired
  }).isRequired,
  updateQuantity: PropTypes.func.isRequired,
  removeFromCart: PropTypes.func.isRequired
};

// Cart panel summary component
const CartSummary = ({ total, deliveryFee = 50, onCheckout }) => {
  const finalTotal = total + deliveryFee;
  
  return (
    <div className="cart-panel-footer">
      <div className="cart-subtotal">
        <span>Subtotal</span>
        <span>₹{total.toFixed(2)}</span>
      </div>
      <div className="cart-subtotal">
        <span>Delivery Fee</span>
        <span>₹{deliveryFee.toFixed(2)}</span>
      </div>
      <div className="cart-total">
        <span>Total</span>
        <span>₹{finalTotal.toFixed(2)}</span>
      </div>
      <button 
        className="checkout-btn" 
        onClick={onCheckout}
        disabled={total === 0}
      >
        Proceed to Checkout <i className="fas fa-arrow-right"></i>
      </button>
      <div className="view-full-cart">
        <a href="/cart">
          <span>View full cart</span>
          <i className="fas fa-external-link-alt"></i>
        </a>
      </div>
    </div>
  );
};

CartSummary.propTypes = {
  total: PropTypes.number.isRequired,
  deliveryFee: PropTypes.number,
  onCheckout: PropTypes.func.isRequired
};

// Empty cart state component
const EmptyCart = ({ onContinueShopping }) => (
  <div className="cart-empty">
    <i className="fas fa-shopping-cart"></i>
    <p>Your cart is empty</p>
    <button 
      onClick={onContinueShopping}
      className="continue-shopping"
    >
      Continue Shopping
    </button>
  </div>
);

EmptyCart.propTypes = {
  onContinueShopping: PropTypes.func.isRequired
};

// Main Cart component with modal functionality
const Cart = ({ isOpen, onClose }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, item: null });
  const panelRef = useRef(null);

  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    // Load cart items from local storage
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error("Error loading cart data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOpen) {
      loadCart();
    }
  }, [isOpen]);

  const updateCart = useCallback((newItems) => {
    try {
      setItems(newItems);
      localStorage.setItem("cart", JSON.stringify(newItems));
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  }, []);

  const removeFromCart = useCallback((itemId) => {
    const itemToRemove = items.find(item => item.id === itemId);
    const newItems = items.filter((item) => item.id !== itemId);
    
    updateCart(newItems);
    
    // Show notification
    if (itemToRemove) {
      setNotification({
        show: true,
        item: itemToRemove
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, item: null });
      }, 3000);
    }
  }, [items, updateCart]);

  const updateQuantity = useCallback((itemId, newQuantity) => {
    if (newQuantity < 1) return;

    const newItems = items.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    updateCart(newItems);
  }, [items, updateCart]);

  const handleCheckout = useCallback(() => {
    // Navigate to checkout or implement checkout logic
    console.log("Proceeding to checkout...");
    window.location.href = '/business-home/checkout';
  }, []);

  const handleContinueShopping = useCallback(() => {
    onClose();
    window.location.href = '/business-home';
  }, [onClose]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Cart modal overlay */}
      <div className={`cart-modal-overlay ${isOpen ? 'active' : ''}`}></div>
      
      {/* Cart slide-in panel */}
      <div 
        ref={panelRef}
        className={`cart-panel ${isOpen ? 'active' : ''}`}
      >
        <div className="cart-panel-header">
          <h2>
            <i className="fas fa-shopping-cart"></i>
            Your Cart {items.length > 0 && `(${items.length})`}
          </h2>
          <button 
            onClick={onClose}
            className="cart-panel-close"
            aria-label="Close cart"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {isLoading ? (
          <div className="cart-panel-body">
            <div className="cart-loading">
              <div className="spinner"></div>
              <p>Loading your cart...</p>
            </div>
          </div>
        ) : (
          <div className="cart-panel-body">
            {items.length === 0 ? (
              <EmptyCart onContinueShopping={handleContinueShopping} />
            ) : (
              items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  updateQuantity={updateQuantity}
                  removeFromCart={removeFromCart}
                />
              ))
            )}
          </div>
        )}
        
        {!isLoading && items.length > 0 && (
          <CartSummary 
            total={total} 
            onCheckout={handleCheckout}
          />
        )}
      </div>
      
      {/* Item removed notification */}
      {notification.show && notification.item && (
        <div className="cart-notification-badge show">
          <i className="fas fa-check-circle"></i>
          <div className="cart-notification-text">
            <strong>Item removed</strong>
            <p>{notification.item.name} was removed from your cart</p>
          </div>
          <button 
            className="cart-notification-view"
            onClick={() => setNotification({ show: false, item: null })}
          >
            OK
          </button>
        </div>
      )}
    </>
  );
};

Cart.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default Cart;