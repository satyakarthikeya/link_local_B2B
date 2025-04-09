import React, { createContext, useState, useContext, useEffect } from 'react';
import Cart from '../components/Cart';

// Creating the context
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [lastAddedItem, setLastAddedItem] = useState(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
        setCartCount(parsedCart.reduce((sum, item) => sum + item.quantity, 0));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }, []);

  // Open cart modal
  const openCart = () => {
    setIsCartOpen(true);
  };

  // Close cart modal
  const closeCart = () => {
    setIsCartOpen(false);
  };

  // Toggle cart modal
  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };

  // Add item to cart
  const addToCart = (item) => {
    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(i => i.id === item.id);
      let newCart;
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        newCart = [...prev];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + 1
        };
      } else {
        // New item
        newCart = [...prev, { ...item, quantity: 1 }];
      }
      
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(newCart));
      
      // Update cart count
      setCartCount(newCart.reduce((sum, item) => sum + item.quantity, 0));
      
      // Set last added item for notifications
      setLastAddedItem(item);
      
      // Show notification
      showAddedNotification();
      
      return newCart;
    });
  };

  // Show notification when item is added
  const showAddedNotification = () => {
    // Animation logic can be implemented here
    // We'll use the cart-notification-badge class
  };

  return (
    <CartContext.Provider
      value={{
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        cartItems,
        cartCount,
        addToCart,
        lastAddedItem
      }}
    >
      {children}
      <Cart isOpen={isCartOpen} onClose={closeCart} />
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartProvider;