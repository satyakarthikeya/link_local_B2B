import React, { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from 'prop-types';
import "../styles/Cart.css";

const CartItem = ({ item, updateQuantity, removeFromCart }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { id, image, name, seller, quantity, price } = item;
  
  const handleQuantityUpdate = (newQty) => {
    setIsUpdating(true);
    updateQuantity(id, newQty);
    setTimeout(() => setIsUpdating(false), 300);
  };

  const handleRemove = useCallback(() => {
    setIsRemoving(true);
    setTimeout(() => removeFromCart(id), 300);
  }, [id, removeFromCart]);

  return (
    <div className={`cart-item ${isRemoving ? 'removing' : ''} ${isUpdating ? 'updating' : ''}`}>
      <img src={image} alt={name} className="cart-item-img" />
      <div className="cart-item-details">
        <h3 className="cart-item-name">{name}</h3>
        <p className="cart-item-seller">by {seller}</p>
        <div className="cart-qty-controls">
          <button
            onClick={() => handleQuantityUpdate(quantity - 1)}
            className="cart-qty-btn"
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <i className="fas fa-minus"></i>
          </button>
          <span className="cart-qty">{quantity}</span>
          <button
            onClick={() => handleQuantityUpdate(quantity + 1)}
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

const Cart = ({ isOpen, onClose }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, item: null });
  const [isClosing, setIsClosing] = useState(false);
  const panelRef = useRef(null);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target) && isOpen) {
        handleClose();
      }
    };

    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const loadCart = async () => {
        try {
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            setItems(JSON.parse(savedCart));
          }
        } catch (error) {
          console.error("Error loading cart:", error);
        } finally {
          setIsLoading(false);
        }
      };
      loadCart();
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
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
    
    if (itemToRemove) {
      setNotification({
        show: true,
        item: itemToRemove
      });
      
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
    console.log("Proceeding to checkout...");
    window.location.href = '/business-home/checkout';
  }, []);

  const handleContinueShopping = useCallback(() => {
    handleClose();
    setTimeout(() => {
      window.location.href = '/business-home';
    }, 300);
  }, [handleClose]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      <div className={`cart-modal-overlay ${isOpen ? 'active' : ''}`} onClick={handleClose} />
      
      <div 
        ref={panelRef}
        className={`cart-panel ${isOpen ? 'active' : ''} ${isClosing ? 'closing' : ''}`}
      >
        <div className="cart-panel-header">
          <h2>
            <i className="fas fa-shopping-cart"></i>
            Your Cart {items.length > 0 && <span className="items-count">({items.length})</span>}
          </h2>
          <button 
            onClick={handleClose}
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

CartSummary.propTypes = {
  total: PropTypes.number.isRequired,
  deliveryFee: PropTypes.number,
  onCheckout: PropTypes.func.isRequired
};

EmptyCart.propTypes = {
  onContinueShopping: PropTypes.func.isRequired
};

Cart.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default Cart;