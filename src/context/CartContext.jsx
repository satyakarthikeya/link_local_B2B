import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const addToCart = useCallback((item) => {
    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(i => i.id === item.id);
      let newCart;

      if (existingItemIndex >= 0) {
        newCart = [...prev];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + 1
        };
      } else {
        newCart = [...prev, { ...item, quantity: 1 }];
      }

      localStorage.setItem('cart', JSON.stringify(newCart));
      setCartCount(newCart.reduce((sum, item) => sum + item.quantity, 0));
      setLastAddedItem(item);

      return newCart;
    });
  }, []);

  // Add removeFromCart function
  const removeFromCart = useCallback((itemId) => {
    setCartItems(prev => {
      const newCart = prev.filter(item => item.id !== itemId);
      localStorage.setItem('cart', JSON.stringify(newCart));
      setCartCount(newCart.reduce((sum, item) => sum + item.quantity, 0));
      return newCart;
    });
  }, []);

  // Add updateQuantity function
  const updateQuantity = useCallback((itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prev => {
      const newCart = prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      
      localStorage.setItem('cart', JSON.stringify(newCart));
      setCartCount(newCart.reduce((sum, item) => sum + item.quantity, 0));
      return newCart;
    });
  }, []);

  const value = {
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    cartItems,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    lastAddedItem
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <Cart 
        isOpen={isCartOpen} 
        onClose={closeCart} 
        items={cartItems}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        asOverlay={true} 
      />
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartProvider;