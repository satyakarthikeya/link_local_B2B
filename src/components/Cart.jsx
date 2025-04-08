import React, { useState, useEffect, useCallback } from "react";
import PropTypes from 'prop-types';
import "../styles/cart.css";

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
      <img src={image} alt={name} className="item-image" />
      <div className="item-details">
        <h3>{name}</h3>
        <p className="seller">by {seller}</p>
        <div className="quantity-controls">
          <button
            onClick={handleDecrease}
            className="qty-btn"
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <i className="fas fa-minus"></i>
          </button>
          <span className="quantity">{quantity}</span>
          <button
            onClick={handleIncrease}
            className="qty-btn"
            aria-label="Increase quantity"
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>
      <div className="item-price">
        <span className="price">₹{price * quantity}</span>
        <button
          onClick={handleRemove}
          className="remove-btn"
          aria-label="Remove item"
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
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

const CartSummary = ({ total, deliveryFee = 50, onCheckout }) => {
  const finalTotal = total + deliveryFee;
  
  return (
    <div className="cart-summary">
      <div className="summary-row">
        <span>Subtotal</span>
        <span>₹{total.toFixed(2)}</span>
      </div>
      <div className="summary-row">
        <span>Delivery Fee</span>
        <span>₹{deliveryFee.toFixed(2)}</span>
      </div>
      <div className="summary-row total">
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
    </div>
  );
};

CartSummary.propTypes = {
  total: PropTypes.number.isRequired,
  deliveryFee: PropTypes.number,
  onCheckout: PropTypes.func.isRequired
};

const EmptyCart = () => (
  <div className="empty-cart">
    <i className="fas fa-shopping-cart"></i>
    <p>Your cart is empty</p>
    <button 
      onClick={() => window.location.href = '/business-home'}
      className="continue-shopping-btn"
    >
      Continue Shopping
    </button>
  </div>
);

const Cart = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    
    loadCart();
  }, []);

  const updateCart = useCallback((newItems) => {
    try {
      setItems(newItems);
      localStorage.setItem("cart", JSON.stringify(newItems));
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  }, []);

  const removeFromCart = useCallback((itemId) => {
    const newItems = items.filter((item) => item.id !== itemId);
    updateCart(newItems);
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

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (isLoading) {
    return (
      <div className="cart-loading">
        <div className="spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Shopping Cart</h2>
        <span className="item-count">{items.length} items</span>
      </div>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
              />
            ))}
          </div>
          <CartSummary 
            total={total} 
            onCheckout={handleCheckout}
          />
        </div>
      )}
    </div>
  );
};

export default Cart;