import db from '../config/db.js';

const ProductModel = {
  // Create a new product
  async create(productData) {
    const { 
      product_name, 
      price, 
      quantity_available, 
      businessman_id, 
      description, 
      image_url,
      category,
      moq = 1, // Minimum Order Quantity
      reorder_point = 10 // Threshold for low stock alert
    } = productData;
    
    const result = await db.query(
      `INSERT INTO Product (
        product_name, price, quantity_available, businessman_id, 
        description, image_url, category, moq, reorder_point
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [product_name, price, quantity_available, businessman_id, description, 
       image_url, category, moq, reorder_point]
    );
    
    return result.rows[0];
  },

  // Find product by ID with full details
  async findById(id) {
    const result = await db.query(
      `SELECT p.*, b.business_name, b.area, b.street,
        CASE WHEN p.quantity_available > 0 THEN true ELSE false END as in_stock,
        CASE 
          WHEN p.quantity_available = 0 THEN 'Out of Stock'
          WHEN p.quantity_available <= p.reorder_point THEN 'Low Stock'
          ELSE 'In Stock'
        END as stock_status
       FROM Product p
       JOIN BusinessProfile b ON p.businessman_id = b.businessman_id
       WHERE p.product_id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Find products by business ID
  async findByBusinessId(businessman_id) {
    try {
      const result = await db.query(
        `SELECT p.*, 
          CASE 
            WHEN p.quantity_available = 0 THEN 'Out of Stock'
            WHEN p.quantity_available <= p.reorder_point THEN 'Low Stock'
            ELSE 'In Stock'
          END as stock_status
         FROM Product p
         WHERE p.businessman_id = $1
         ORDER BY p.created_at DESC`,
        [businessman_id]
      );
      return result.rows;
    } catch (error) {
      console.error('Database error in findByBusinessId:', error);
      throw new Error('Failed to fetch business products');
    }
  },

  // Update product
  async update(id, updateData) {
    const { 
      product_name, 
      price, 
      quantity_available, 
      description, 
      image_url,
      category,
      moq,
      reorder_point 
    } = updateData;
    
    const result = await db.query(
      `UPDATE Product
       SET product_name = COALESCE($1, product_name),
           price = COALESCE($2, price),
           quantity_available = COALESCE($3, quantity_available),
           description = COALESCE($4, description),
           image_url = COALESCE($5, image_url),
           category = COALESCE($6, category),
           moq = COALESCE($7, moq),
           reorder_point = COALESCE($8, reorder_point),
           updated_at = CURRENT_TIMESTAMP
       WHERE product_id = $9
       RETURNING *`,
      [product_name, price, quantity_available, description, image_url, 
       category, moq, reorder_point, id]
    );
    
    return result.rows[0];
  },

  // Delete product
  async delete(id) {
    await db.query('DELETE FROM Product WHERE product_id = $1', [id]);
    return true;
  },

  // Update product quantity
  async updateQuantity(id, quantity, operation = 'set') {
    try {
      // Validate inputs
      if (!id) throw new Error('Product ID is required');
      
      // Ensure quantity is a valid number
      const quantityNum = parseInt(quantity, 10);
      if (isNaN(quantityNum) || quantityNum < 0) {
        throw new Error(`Invalid quantity value: ${quantity}`);
      }
      
      // Log operation details for debugging
      console.log(`[ProductModel.updateQuantity] Starting operation:`, {
        productId: id,
        quantity: quantityNum,
        operation: operation
      });
      
      // Query to use based on operation type
      let query;
      let params = [quantityNum, id];
      
      if (operation === 'add') {
        console.log(`[ProductModel.updateQuantity] Adding ${quantityNum} to product ${id}`);
        query = `
          UPDATE Product 
          SET quantity_available = quantity_available + $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE product_id = $2 
          RETURNING *
        `;
      } else if (operation === 'subtract') {
        console.log(`[ProductModel.updateQuantity] Subtracting ${quantityNum} from product ${id}`);
        query = `
          UPDATE Product 
          SET quantity_available = GREATEST(0, quantity_available - $1),
              updated_at = CURRENT_TIMESTAMP
          WHERE product_id = $2 
          RETURNING *
        `;
      } else {
        console.log(`[ProductModel.updateQuantity] Setting product ${id} quantity to ${quantityNum}`);
        query = `
          UPDATE Product 
          SET quantity_available = GREATEST(0, $1),
              updated_at = CURRENT_TIMESTAMP
          WHERE product_id = $2 
          RETURNING *
        `;
      }
      
      // Execute the query
      const result = await db.query(query, params);
      
      // Handle case where no rows were updated (product not found)
      if (result.rows.length === 0) {
        throw new Error(`Product with ID ${id} not found`);
      }
      
      const updatedProduct = result.rows[0];
      console.log(`[ProductModel.updateQuantity] Product ${id} quantity updated successfully to: ${updatedProduct.quantity_available}`);
      
      return updatedProduct;
    } catch (error) {
      console.error(`[ProductModel.updateQuantity] Error: ${error.message}`);
      throw error;
    }
  },

  // Get all products with optional filters
  async getAll(filters = {}) {
    const { 
      category, 
      businessman_id, 
      min_price, 
      max_price,
      stock_status,
      search_query 
    } = filters;
    
    let query = `
      SELECT p.*, b.business_name, b.area, b.category,
        CASE WHEN p.quantity_available > 0 THEN true ELSE false END as in_stock,
        CASE 
          WHEN p.quantity_available = 0 THEN 'Out of Stock'
          WHEN p.quantity_available <= p.reorder_point THEN 'Low Stock'
          ELSE 'In Stock'
        END as stock_status
      FROM Product p
      JOIN BusinessProfile b ON p.businessman_id = b.businessman_id
      WHERE 1=1
    `;
    const params = [];
    
    if (category) {
      params.push(category);
      query += ` AND b.category = $${params.length}`;
    }
    
    if (businessman_id) {
      params.push(businessman_id);
      query += ` AND p.businessman_id = $${params.length}`;
    }
    
    if (min_price !== null && min_price !== undefined) {
      params.push(min_price);
      query += ` AND p.price >= $${params.length}`;
    }
    
    if (max_price !== null && max_price !== undefined) {
      params.push(max_price);
      query += ` AND p.price <= $${params.length}`;
    }

    if (stock_status) {
      if (stock_status === 'in_stock') {
        query += ` AND p.quantity_available > 0`;
      } else if (stock_status === 'out_of_stock') {
        query += ` AND p.quantity_available = 0`;
      } else if (stock_status === 'low_stock') {
        query += ` AND p.quantity_available <= p.reorder_point AND p.quantity_available > 0`;
      }
    }

    if (search_query) {
      params.push(`%${search_query}%`);
      query += ` AND (p.product_name ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const result = await db.query(query, params);
    return result.rows;
  },

  // Get low stock products for a business
  async getLowStock(businessman_id) {
    const result = await db.query(
      `SELECT p.*, 
        CASE 
          WHEN p.quantity_available = 0 THEN 'Out of Stock'
          WHEN p.quantity_available <= p.reorder_point THEN 'Low Stock'
          ELSE 'In Stock'
        END as stock_status
       FROM Product p
       WHERE p.businessman_id = $1 
       AND p.quantity_available <= p.reorder_point
       ORDER BY p.quantity_available ASC`,
      [businessman_id]
    );
    return result.rows;
  },

  // Check if product has sufficient quantity
  async checkQuantityAvailable(id, required_quantity) {
    const result = await db.query(
      'SELECT quantity_available >= $2 as has_stock FROM Product WHERE product_id = $1',
      [id, required_quantity]
    );
    return result.rows[0]?.has_stock || false;
  },

  // Search products by name or description
  async search(searchQuery) {
    const result = await db.query(
      `SELECT p.*, b.business_name, b.area, b.category,
        CASE WHEN p.quantity_available > 0 THEN true ELSE false END as in_stock
       FROM Product p
       JOIN BusinessProfile b ON p.businessman_id = b.businessman_id
       WHERE p.product_name ILIKE $1 OR p.description ILIKE $1
       ORDER BY 
        CASE WHEN p.quantity_available > 0 THEN 0 ELSE 1 END,
        p.created_at DESC`,
      [`%${searchQuery}%`]
    );
    return result.rows;
  }
};

export default ProductModel;