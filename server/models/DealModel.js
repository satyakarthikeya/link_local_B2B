// filepath: c:\Users\pasar\Desktop\link-local\server\models\DealModel.js
import db from '../config/db.js';

/**
 * Deal Model that works with the dedicated Deals table
 */
export const DealModel = {
  /**
   * Create a new deal for a product
   */
  async createDeal(productId, dealData) {
    const { 
      deal_type,
      discount_percentage,
      discount_amount,
      start_date,
      end_date,
      deal_title,
      deal_description,
      is_featured = false
    } = dealData;

    // Validate the product exists and get businessman_id
    const productCheck = await db.query(
      'SELECT * FROM Product WHERE product_id = $1',
      [productId]
    );

    if (productCheck.rows.length === 0) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    const businessman_id = productCheck.rows[0].businessman_id;

    // Insert new deal into the Deals table
    const result = await db.query(
      `INSERT INTO Deals (
        product_id,
        businessman_id,
        deal_type,
        deal_title,
        deal_description,
        discount_percentage,
        discount_amount,
        start_date,
        end_date,
        is_active,
        is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        productId,
        businessman_id,
        deal_type,
        deal_title,
        deal_description,
        discount_percentage,
        discount_amount,
        start_date,
        end_date,
        true, // is_active
        is_featured
      ]
    );

    return result.rows[0];
  },

  /**
   * Get deal information for a product
   */
  async getDealByProductId(productId) {
    const result = await db.query(
      `SELECT d.*, p.product_name, p.price, p.quantity_available
       FROM Deals d
       JOIN Product p ON d.product_id = p.product_id
       WHERE d.product_id = $1
       ORDER BY d.created_at DESC
       LIMIT 1`,
      [productId]
    );
    return result.rows[0] || null;
  },

  /**
   * Update a deal for a product
   */
  async updateDeal(dealId, dealData) {
    // Check if deal exists
    const dealCheck = await db.query(
      'SELECT * FROM Deals WHERE deal_id = $1',
      [dealId]
    );

    if (dealCheck.rows.length === 0) {
      throw new Error(`Deal with ID ${dealId} not found`);
    }

    // Build the update query dynamically based on provided fields
    const fields = [];
    const values = [];
    const params = [];
    let paramCount = 1;

    // Add each field from dealData if it exists
    for (const [key, value] of Object.entries(dealData)) {
      if (value !== undefined && key !== 'product_id' && key !== 'businessman_id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    // Add deal_id as the last parameter
    params.push(dealId);

    // If no fields to update, return the existing deal
    if (fields.length === 0) {
      return dealCheck.rows[0];
    }

    const query = `
      UPDATE Deals
      SET ${fields.join(', ')}
      WHERE deal_id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, [...values, ...params]);
    return result.rows[0];
  },

  /**
   * Remove a deal from a product
   */
  async removeDeal(dealId) {
    const result = await db.query(
      `DELETE FROM Deals
       WHERE deal_id = $1
       RETURNING *`,
      [dealId]
    );

    return result.rows[0];
  },

  /**
   * Get all products with active deals
   */
  async getActiveDeals(filters = {}) {
    const {
      businessman_id,
      exclude_businessman_id, // New parameter to exclude current user's deals
      category,
      deal_type,
      is_featured,
      limit = 10,
      page = 1,
      city // Location filter
    } = filters;

    let query = `
      SELECT d.*, p.product_name, p.price, p.quantity_available, p.category, p.description,
        b.business_name, b.area, b.street, b.city,
        CASE WHEN p.quantity_available > 0 THEN true ELSE false END as in_stock,
        p.price as original_price,
        CASE 
          WHEN d.discount_percentage IS NOT NULL THEN ROUND(p.price - (p.price * d.discount_percentage / 100), 2)
          WHEN d.discount_amount IS NOT NULL THEN GREATEST(0, p.price - d.discount_amount)
          ELSE p.price
        END as discounted_price
      FROM Deals d
      JOIN Product p ON d.product_id = p.product_id
      JOIN BusinessProfile b ON p.businessman_id = b.businessman_id
      WHERE d.is_active = true
        AND (d.end_date IS NULL OR d.end_date > NOW())
    `;

    const queryParams = [];
    let paramCount = 1;

    if (businessman_id) {
      query += ` AND d.businessman_id = $${paramCount}`;
      queryParams.push(businessman_id);
      paramCount++;
    }

    // Exclude deals from a specific businessman (current user)
    if (exclude_businessman_id) {
      query += ` AND d.businessman_id <> $${paramCount}`;
      queryParams.push(exclude_businessman_id);
      paramCount++;
    }

    // Filter by city if provided
    if (city) {
      query += ` AND b.city = $${paramCount}`;
      queryParams.push(city);
      paramCount++;
    }

    if (category) {
      query += ` AND p.category = $${paramCount}`;
      queryParams.push(category);
      paramCount++;
    }

    if (deal_type) {
      query += ` AND d.deal_type = $${paramCount}`;
      queryParams.push(deal_type);
      paramCount++;
    }

    if (is_featured !== undefined) {
      query += ` AND d.is_featured = $${paramCount}`;
      queryParams.push(is_featured);
      paramCount++;
    }

    // Add sorting and pagination
    query += ` ORDER BY d.is_featured DESC, d.created_at DESC`;
    
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await db.query(query, queryParams);
    return result.rows;
  },

  /**
   * Get all deals for a specific business
   */
  async getDealsByBusinessId(businessman_id) {
    const result = await db.query(
      `SELECT d.*, p.product_name, p.price, p.quantity_available, p.category, p.description, 
        CASE 
          WHEN p.quantity_available = 0 THEN 'Out of Stock'
          WHEN p.quantity_available <= p.reorder_point THEN 'Low Stock'
          ELSE 'In Stock'
        END as stock_status,
        p.price as original_price,
        CASE 
          WHEN d.discount_percentage IS NOT NULL THEN ROUND(p.price - (p.price * d.discount_percentage / 100), 2)
          WHEN d.discount_amount IS NOT NULL THEN GREATEST(0, p.price - d.discount_amount)
          ELSE p.price
        END as discounted_price
       FROM Deals d
       JOIN Product p ON d.product_id = p.product_id
       WHERE d.businessman_id = $1
       ORDER BY d.is_featured DESC, d.created_at DESC`,
      [businessman_id]
    );
    return result.rows;
  },

  /**
   * Get featured deals
   */
  async getFeaturedDeals(limit = 4) {
    const result = await db.query(
      `SELECT d.*, p.product_name, p.price, p.quantity_available, p.category, p.description,
         b.business_name, b.area, b.street, b.city,
         CASE WHEN p.quantity_available > 0 THEN true ELSE false END as in_stock,
         CASE 
           WHEN d.deal_type = 'DISCOUNT' AND d.discount_percentage IS NOT NULL 
             THEN ROUND(p.price - (p.price * d.discount_percentage / 100), 2)
           WHEN d.deal_type = 'DISCOUNT' AND d.discount_amount IS NOT NULL 
             THEN GREATEST(0, p.price - d.discount_amount)
           ELSE p.price
         END as discounted_price,
         p.price as original_price
       FROM Deals d
       JOIN Product p ON d.product_id = p.product_id
       JOIN BusinessProfile b ON p.businessman_id = b.businessman_id
       WHERE d.is_active = true
         AND d.is_featured = true
         AND (d.end_date IS NULL OR d.end_date > NOW())
       ORDER BY d.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  /**
   * Check if a product has any active deals
   */
  async productHasActiveDeal(product_id) {
    const result = await db.query(
      `SELECT COUNT(*) as deal_count
       FROM Deals
       WHERE product_id = $1
       AND is_active = true
       AND (end_date IS NULL OR end_date > NOW())`,
      [product_id]
    );
    
    return parseInt(result.rows[0].deal_count) > 0;
  },

  /**
   * Get all deals with pagination and filtering
   */
  async getAllDeals(filters = {}) {
    const {
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      sort_order = 'desc',
      deal_type,
      exclude_businessman_id // Add this parameter to filter out current user's deals
    } = filters;

    let query = `
      SELECT d.*, p.product_name, p.price, p.quantity_available, p.category, p.description,
        b.business_name, b.area, b.street, b.city,
        CASE WHEN p.quantity_available > 0 THEN true ELSE false END as in_stock,
        CASE 
          WHEN d.deal_type = 'DISCOUNT' AND d.discount_percentage IS NOT NULL 
            THEN ROUND(p.price - (p.price * d.discount_percentage / 100), 2)
          WHEN d.deal_type = 'DISCOUNT' AND d.discount_amount IS NOT NULL 
            THEN GREATEST(0, p.price - d.discount_amount)
          ELSE p.price
        END as discounted_price,
        p.price as original_price
      FROM Deals d
      JOIN Product p ON d.product_id = p.product_id
      JOIN BusinessProfile b ON p.businessman_id = b.businessman_id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramCount = 1;

    if (deal_type) {
      query += ` AND d.deal_type = $${paramCount}`;
      queryParams.push(deal_type);
      paramCount++;
    }

    // Add condition to exclude deals from current user
    if (exclude_businessman_id) {
      query += ` AND d.businessman_id <> $${paramCount}`;
      queryParams.push(exclude_businessman_id);
      paramCount++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${query}) AS count`;
    const totalResult = await db.query(countQuery, queryParams);
    const total = parseInt(totalResult.rows[0].count);

    // Add sorting
    query += ` ORDER BY d.${sort_by} ${sort_order}`;
    
    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await db.query(query, queryParams);

    return {
      deals: result.rows,
      total
    };
  }
};

/**
 * Get all deals by business ID
 * @param {string} businessId - Business ID
 * @returns {Promise<Array>} Array of deals
 */
export async function getDealsByBusinessId(businessId) {
  try {
    // TEMPORARY IMPLEMENTATION: Return empty array until database connection is fixed
    console.log(`Mock implementation: Fetching deals for business ID ${businessId}`);
    
    // This is a temporary mock implementation to avoid errors
    // You'll need to replace this with actual database queries once you fix the DB connection
    const mockDeals = [
      {
        id: 1,
        deal_type: 'DISCOUNT',
        deal_title: 'Summer Sale',
        discount_percentage: 20,
        start_date: '2023-06-01',
        end_date: '2023-08-31',
        is_featured: true,
        product_id: 101,
        product_name: 'Summer T-Shirt',
        product_description: 'Comfortable cotton t-shirt',
        product_price: 1200,
        product_images: ['tshirt1.jpg', 'tshirt2.jpg']
      },
      {
        id: 2,
        deal_type: 'BUY_ONE_GET_ONE',
        deal_title: 'BOGO Special',
        start_date: '2023-07-01',
        end_date: '2023-07-15',
        is_featured: false,
        product_id: 102,
        product_name: 'Denim Jeans',
        product_description: 'Classic blue jeans',
        product_price: 2500,
        product_images: ['jeans1.jpg']
      }
    ];
    
    return mockDeals;
    
    /* ACTUAL IMPLEMENTATION TO REPLACE THE MOCK:
    // Replace this with your actual database query once you fix the DB connection
    // Example:
    const query = `
      SELECT d.*, p.name AS product_name, p.description AS product_description, 
             p.price AS product_price, p.images AS product_images 
      FROM deals d
      JOIN products p ON d.product_id = p.id
      WHERE p.business_id = ?
    `;
    
    // Use your project's database access pattern
    // const deals = await db.query(query, [businessId]);
    // OR
    // const [deals] = await pool.execute(query, [businessId]);
    */
    
  } catch (error) {
    console.error('Database error in getDealsByBusinessId:', error);
    throw new Error('Failed to fetch deals for business');
  }
}

/**
 * Get all deals with pagination and filtering
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Deals and total count
 */
export async function getAllDeals(filters) {
  try {
    // TEMPORARY IMPLEMENTATION: Return mock data until database connection is fixed
    console.log('Mock implementation: Getting all deals with filters:', filters);
    
    // Mock implementation
    const mockDeals = [
      {
        id: 1,
        deal_type: 'DISCOUNT',
        deal_title: 'Summer Sale',
        discount_percentage: 20,
        start_date: '2023-06-01',
        end_date: '2023-08-31',
        is_featured: true,
        product_id: 101,
        product_name: 'Summer T-Shirt',
        product_description: 'Comfortable cotton t-shirt',
        product_price: 1200,
        product_images: ['tshirt1.jpg', 'tshirt2.jpg']
      }
    ];
    
    return {
      deals: mockDeals,
      total: 1
    };
    
    /* ACTUAL IMPLEMENTATION TO REPLACE THE MOCK:
    // The actual implementation when database is fixed
    */
  } catch (error) {
    console.error('Database error in getAllDeals:', error);
    throw new Error('Failed to fetch all deals');
  }
}

// Add other required methods to match the existing DealModel interface