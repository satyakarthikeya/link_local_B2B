import db from '../config/db.js';

const CartModel = {
  // Get cart items for a business user
  async getByBusinessmanId(businessman_id) {
    try {
      // First, ensure the user has a cart
      await this.ensureCartExists(businessman_id);
      
      const result = await db.query(
        `SELECT c.cart_id, ci.cart_item_id, ci.product_id, ci.quantity,
          p.product_name, p.price, p.image_url, p.category, p.quantity_available,
          bp.business_name, bp.area
         FROM Cart c
         JOIN CartItems ci ON c.cart_id = ci.cart_id
         JOIN Product p ON ci.product_id = p.product_id
         JOIN BusinessProfile bp ON p.businessman_id = bp.businessman_id
         WHERE c.businessman_id = $1
         ORDER BY ci.created_at DESC`,
        [businessman_id]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting cart:', error);
      throw new Error('Failed to get cart items');
    }
  },
  
  // Ensure the user has a cart
  async ensureCartExists(businessman_id) {
    try {
      // Check if cart exists
      const existingCart = await db.query(
        'SELECT cart_id FROM Cart WHERE businessman_id = $1',
        [businessman_id]
      );
      
      // If cart doesn't exist, create it
      if (existingCart.rows.length === 0) {
        const cartResult = await db.query(
          'INSERT INTO Cart (businessman_id) VALUES ($1) RETURNING cart_id',
          [businessman_id]
        );
        return cartResult.rows[0].cart_id;
      }
      
      return existingCart.rows[0].cart_id;
    } catch (error) {
      console.error('Error ensuring cart exists:', error);
      throw new Error('Failed to ensure cart exists');
    }
  },
  
  // Add item to cart
  async addItem(businessman_id, product_id, quantity = 1) {
    try {
      const client = await db.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Ensure cart exists
        const cartIdResult = await client.query(
          'SELECT cart_id FROM Cart WHERE businessman_id = $1',
          [businessman_id]
        );
        
        let cart_id;
        if (cartIdResult.rows.length === 0) {
          // Create new cart
          const newCartResult = await client.query(
            'INSERT INTO Cart (businessman_id) VALUES ($1) RETURNING cart_id',
            [businessman_id]
          );
          cart_id = newCartResult.rows[0].cart_id;
        } else {
          cart_id = cartIdResult.rows[0].cart_id;
        }
        
        // Check if item already exists in cart
        const existingItemResult = await client.query(
          'SELECT cart_item_id, quantity FROM CartItems WHERE cart_id = $1 AND product_id = $2',
          [cart_id, product_id]
        );
        
        if (existingItemResult.rows.length > 0) {
          // Update existing item
          const newQuantity = existingItemResult.rows[0].quantity + quantity;
          await client.query(
            'UPDATE CartItems SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE cart_item_id = $2',
            [newQuantity, existingItemResult.rows[0].cart_item_id]
          );
        } else {
          // Add new item
          await client.query(
            'INSERT INTO CartItems (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
            [cart_id, product_id, quantity]
          );
        }
        
        // Update cart's updated_at timestamp
        await client.query(
          'UPDATE Cart SET updated_at = CURRENT_TIMESTAMP WHERE cart_id = $1',
          [cart_id]
        );
        
        await client.query('COMMIT');
        
        // Get updated cart
        return await this.getByBusinessmanId(businessman_id);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw new Error('Failed to add item to cart');
    }
  },
  
  // Update item quantity
  async updateItemQuantity(businessman_id, product_id, quantity) {
    try {
      const client = await db.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Get cart ID
        const cartResult = await client.query(
          'SELECT cart_id FROM Cart WHERE businessman_id = $1',
          [businessman_id]
        );
        
        if (cartResult.rows.length === 0) {
          throw new Error('Cart not found');
        }
        
        const cart_id = cartResult.rows[0].cart_id;
        
        // Update item quantity
        const updateResult = await client.query(
          `UPDATE CartItems 
           SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE cart_id = $2 AND product_id = $3
           RETURNING *`,
          [quantity, cart_id, product_id]
        );
        
        if (updateResult.rows.length === 0) {
          throw new Error('Item not found in cart');
        }
        
        // Update cart's updated_at timestamp
        await client.query(
          'UPDATE Cart SET updated_at = CURRENT_TIMESTAMP WHERE cart_id = $1',
          [cart_id]
        );
        
        await client.query('COMMIT');
        
        // Get updated cart
        return await this.getByBusinessmanId(businessman_id);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw new Error('Failed to update cart item');
    }
  },
  
  // Remove item from cart
  async removeItem(businessman_id, product_id) {
    try {
      const client = await db.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Get cart ID
        const cartResult = await client.query(
          'SELECT cart_id FROM Cart WHERE businessman_id = $1',
          [businessman_id]
        );
        
        if (cartResult.rows.length === 0) {
          throw new Error('Cart not found');
        }
        
        const cart_id = cartResult.rows[0].cart_id;
        
        // Remove item from cart
        const deleteResult = await client.query(
          'DELETE FROM CartItems WHERE cart_id = $1 AND product_id = $2 RETURNING *',
          [cart_id, product_id]
        );
        
        if (deleteResult.rows.length === 0) {
          throw new Error('Item not found in cart');
        }
        
        // Update cart's updated_at timestamp
        await client.query(
          'UPDATE Cart SET updated_at = CURRENT_TIMESTAMP WHERE cart_id = $1',
          [cart_id]
        );
        
        await client.query('COMMIT');
        
        // Get updated cart
        return await this.getByBusinessmanId(businessman_id);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw new Error('Failed to remove item from cart');
    }
  },
  
  // Clear cart
  async clearCart(businessman_id) {
    try {
      const client = await db.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Get cart ID
        const cartResult = await client.query(
          'SELECT cart_id FROM Cart WHERE businessman_id = $1',
          [businessman_id]
        );
        
        if (cartResult.rows.length === 0) {
          throw new Error('Cart not found');
        }
        
        const cart_id = cartResult.rows[0].cart_id;
        
        // Remove all items from cart
        await client.query(
          'DELETE FROM CartItems WHERE cart_id = $1',
          [cart_id]
        );
        
        // Update cart's updated_at timestamp
        await client.query(
          'UPDATE Cart SET updated_at = CURRENT_TIMESTAMP WHERE cart_id = $1',
          [cart_id]
        );
        
        await client.query('COMMIT');
        
        // Return empty cart
        return [];
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw new Error('Failed to clear cart');
    }
  },
  
  // Get cart items count
  async getItemsCount(businessman_id) {
    try {
      // Ensure cart exists
      await this.ensureCartExists(businessman_id);
      
      // Get cart ID
      const cartResult = await db.query(
        'SELECT cart_id FROM Cart WHERE businessman_id = $1',
        [businessman_id]
      );
      
      if (cartResult.rows.length === 0) {
        return 0;
      }
      
      const cart_id = cartResult.rows[0].cart_id;
      
      // Get total quantity of items in cart
      const countResult = await db.query(
        'SELECT SUM(quantity) as total FROM CartItems WHERE cart_id = $1',
        [cart_id]
      );
      
      return parseInt(countResult.rows[0].total) || 0;
    } catch (error) {
      console.error('Error getting cart count:', error);
      throw new Error('Failed to get cart count');
    }
  }
};

export default CartModel;