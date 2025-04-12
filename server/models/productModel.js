import db from '../config/db.js';

// Product model with CRUD operations
const ProductModel = {
  // Create a new product
  async create(productData) {
    const { product_name, price, quantity_available, businessman_id, description, image_url } = productData;
    
    const result = await db.query(
      `INSERT INTO Product (product_name, price, quantity_available, businessman_id, description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [product_name, price, quantity_available, businessman_id, description, image_url]
    );
    
    return result.rows[0];
  },

  // Find product by ID
  async findById(id) {
    const result = await db.query(
      `SELECT p.*, b.business_name, b.area, b.street
       FROM Product p
       JOIN Businessman b ON p.businessman_id = b.businessman_id
       WHERE p.product_id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Update product
  async update(id, updateData) {
    const { product_name, price, quantity_available, description, image_url } = updateData;
    
    const result = await db.query(
      `UPDATE Product
       SET product_name = COALESCE($1, product_name),
           price = COALESCE($2, price),
           quantity_available = COALESCE($3, quantity_available),
           description = COALESCE($4, description),
           image_url = COALESCE($5, image_url)
       WHERE product_id = $6
       RETURNING *`,
      [product_name, price, quantity_available, description, image_url, id]
    );
    
    return result.rows[0];
  },

  // Delete product
  async delete(id) {
    await db.query(
      'DELETE FROM Product WHERE product_id = $1',
      [id]
    );
    return true;
  },

  // Update product quantity
  async updateQuantity(id, quantity) {
    const result = await db.query(
      'UPDATE Product SET quantity_available = $1 WHERE product_id = $2 RETURNING *',
      [quantity, id]
    );
    return result.rows[0];
  },

  // Get all products with optional filters
  async getAll(filters = {}) {
    const { category, businessman_id, min_price, max_price } = filters;
    
    let query = `
      SELECT p.*, b.business_name, b.area, b.category
      FROM Product p
      JOIN Businessman b ON p.businessman_id = b.businessman_id
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
    
    query += ' ORDER BY p.product_id DESC';
    
    const result = await db.query(query, params);
    return result.rows;
  },

  // Search products by name or description
  async search(searchQuery) {
    const result = await db.query(
      `SELECT p.*, b.business_name, b.area, b.category
       FROM Product p
       JOIN Businessman b ON p.businessman_id = b.businessman_id
       WHERE p.product_name ILIKE $1 OR p.description ILIKE $1
       ORDER BY p.product_id DESC`,
      [`%${searchQuery}%`]
    );
    return result.rows;
  }
};

export default ProductModel;