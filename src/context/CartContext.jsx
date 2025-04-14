import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import Cart from '../components/Cart';
import api from '../utils/api';
import { useAuth } from './AuthContext';

// Creating the context
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [lastAddedItem, setLastAddedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();

  // Fetch cart from backend when user is logged in
  useEffect(() => {
    const fetchCart = async () => {
      // Only fetch cart if user is logged in and is a business
      if (!currentUser || !localStorage.getItem('authToken')) {
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await api.cart.getCart();
        if (response.data && response.data.items) {
          const formattedItems = response.data.items.map(item => ({
            id: item.product_id,
            name: item.product_name,
            seller: item.business_name || 'Local Vendor',
            price: item.price,
            quantity: item.quantity,
            image: item.image_url || './src/assests/guddu.jpeg',
            product_id: item.product_id
          }));
          setCartItems(formattedItems);
          setCartCount(formattedItems.reduce((sum, item) => sum + item.quantity, 0));
          
          // Also update localStorage for offline access
          localStorage.setItem('cart', JSON.stringify(formattedItems));
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        // Fall back to local storage if API call fails
        loadCartFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };

    const loadCartFromLocalStorage = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(parsedCart);
          setCartCount(parsedCart.reduce((sum, item) => sum + item.quantity, 0));
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    };

    fetchCart();
  }, [currentUser]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const addToCart = useCallback(async (item) => {
    // First, update local state for immediate UI feedback
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

    // Then, sync with backend if user is logged in
    if (currentUser && localStorage.getItem('authToken')) {
      try {
        const productId = item.product_id || item.id;
        await api.cart.addToCart(productId, 1);
      } catch (error) {
        console.error('Error adding item to cart in database:', error);
        // Here you could add error handling or retry logic
      }
    }
  }, [currentUser]);

  // Update removeFromCart function to use API
  const removeFromCart = useCallback(async (itemId) => {
    const itemToRemove = cartItems.find(item => item.id === itemId);
    
    // Update local state first for immediate UI feedback
    setCartItems(prev => {
      const newCart = prev.filter(item => item.id !== itemId);
      localStorage.setItem('cart', JSON.stringify(newCart));
      setCartCount(newCart.reduce((sum, item) => sum + item.quantity, 0));
      return newCart;
    });

    // Then, sync with backend if user is logged in
    if (currentUser && localStorage.getItem('authToken')) {
      try {
        const productId = itemToRemove?.product_id || itemId;
        await api.cart.removeFromCart(productId);
      } catch (error) {
        console.error('Error removing item from cart in database:', error);
      }
    }
    
    return itemToRemove; // Return the removed item for notifications
  }, [cartItems, currentUser]);

  // Update updateQuantity function to use API
  const updateQuantity = useCallback(async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Get the item to find its product_id
    const item = cartItems.find(item => item.id === itemId);
    const productId = item?.product_id || itemId;
    
    // Update local state first for immediate UI feedback
    setCartItems(prev => {
      const newCart = prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      
      localStorage.setItem('cart', JSON.stringify(newCart));
      setCartCount(newCart.reduce((sum, item) => sum + item.quantity, 0));
      return newCart;
    });

    // Then, sync with backend if user is logged in
    if (currentUser && localStorage.getItem('authToken')) {
      try {
        await api.cart.updateCartItem(productId, newQuantity);
      } catch (error) {
        console.error('Error updating cart item quantity in database:', error);
      }
    }
  }, [cartItems, currentUser]);

  // Add a clearCart function
  const clearCart = useCallback(async () => {
    setCartItems([]);
    setCartCount(0);
    localStorage.removeItem('cart');

    if (currentUser && localStorage.getItem('authToken')) {
      try {
        await api.cart.clearCart();
      } catch (error) {
        console.error('Error clearing cart in database:', error);
      }
    }
  }, [currentUser]);

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
    clearCart,
    lastAddedItem,
    isLoading
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