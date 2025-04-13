import CartModel from '../models/cartModel.js';
import ProductModel from '../models/productModel.js';

const CartController = {
  // Get cart for current user
  async getCart(req, res) {
    try {
      const businessman_id = req.user.id;
      const cartItems = await CartModel.getByBusinessmanId(businessman_id);
      
      // Calculate totals
      const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      res.json({
        items: cartItems,
        count: cartItems.length,
        subtotal
      });
    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({ error: 'Failed to retrieve cart' });
    }
  },
  
  // Add item to cart
  async addToCart(req, res) {
    try {
      const businessman_id = req.user.id;
      const { product_id, quantity } = req.body;
      
      // Validate required fields
      if (!product_id) {
        return res.status(400).json({ error: 'Product ID is required' });
      }
      
      const qty = parseInt(quantity) || 1;
      
      // Check if product exists
      const product = await ProductModel.findById(product_id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // Check if product is in stock
      if (product.quantity_available <= 0) {
        return res.status(400).json({ error: 'Product is out of stock' });
      }
      
      // Add to cart
      const updatedCart = await CartModel.addItem(businessman_id, product_id, qty);
      
      // Calculate totals
      const subtotal = updatedCart.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      res.json({
        message: 'Item added to cart',
        items: updatedCart,
        count: updatedCart.length,
        subtotal
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({ error: 'Failed to add item to cart' });
    }
  },
  
  // Update item quantity
  async updateCartItem(req, res) {
    try {
      const businessman_id = req.user.id;
      const { product_id } = req.params;
      const { quantity } = req.body;
      
      // Validate required fields
      if (!product_id || !quantity) {
        return res.status(400).json({ error: 'Product ID and quantity are required' });
      }
      
      const qty = parseInt(quantity);
      if (isNaN(qty) || qty < 1) {
        return res.status(400).json({ error: 'Quantity must be a positive number' });
      }
      
      // Check if product exists
      const product = await ProductModel.findById(product_id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // Check if requested quantity is available
      if (qty > product.quantity_available) {
        return res.status(400).json({ 
          error: 'Requested quantity exceeds available stock', 
          maxAvailable: product.quantity_available 
        });
      }
      
      // Update cart
      const updatedCart = await CartModel.updateItemQuantity(businessman_id, product_id, qty);
      
      // Calculate totals
      const subtotal = updatedCart.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      res.json({
        message: 'Cart updated',
        items: updatedCart,
        count: updatedCart.length,
        subtotal
      });
    } catch (error) {
      console.error('Update cart error:', error);
      res.status(500).json({ error: 'Failed to update cart' });
    }
  },
  
  // Remove item from cart
  async removeFromCart(req, res) {
    try {
      const businessman_id = req.user.id;
      const { product_id } = req.params;
      
      // Validate required fields
      if (!product_id) {
        return res.status(400).json({ error: 'Product ID is required' });
      }
      
      // Remove from cart
      const updatedCart = await CartModel.removeItem(businessman_id, product_id);
      
      // Calculate totals
      const subtotal = updatedCart.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      res.json({
        message: 'Item removed from cart',
        items: updatedCart,
        count: updatedCart.length,
        subtotal
      });
    } catch (error) {
      console.error('Remove from cart error:', error);
      res.status(500).json({ error: 'Failed to remove item from cart' });
    }
  },
  
  // Clear cart
  async clearCart(req, res) {
    try {
      const businessman_id = req.user.id;
      
      await CartModel.clearCart(businessman_id);
      
      res.json({
        message: 'Cart cleared',
        items: [],
        count: 0,
        subtotal: 0
      });
    } catch (error) {
      console.error('Clear cart error:', error);
      res.status(500).json({ error: 'Failed to clear cart' });
    }
  },
  
  // Get cart count
  async getCartCount(req, res) {
    try {
      const businessman_id = req.user.id;
      
      const count = await CartModel.getItemsCount(businessman_id);
      
      res.json({ count });
    } catch (error) {
      console.error('Get cart count error:', error);
      res.status(500).json({ error: 'Failed to get cart count' });
    }
  }
};

export default CartController;