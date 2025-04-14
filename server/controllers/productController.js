import ProductModel from '../models/productModel.js';
import { logger } from '../utils/logger.js';

// Product controller for product-related operations
const ProductController = {
  // Create a new product
  async createProduct(req, res) {
    try {
      // Log the incoming request body for debugging
      console.log('Received product data:', req.body);
      
      const { 
        product_name, 
        price, 
        quantity_available, 
        description, 
        image_url,
        category,
        moq,
        reorder_point 
      } = req.body;
      const businessman_id = req.user.id;
      
      // Validate required fields
      if (!product_name || !price || !category) {
        return res.status(400).json({ error: 'Required fields missing' });
      }
      
      // Convert string values to appropriate types
      const productData = {
        product_name,
        price: parseFloat(price),
        quantity_available: quantity_available ? parseInt(quantity_available) : 0,
        businessman_id,
        description: description || '',
        image_url: image_url || null,
        category,
        moq: moq ? parseInt(moq) : 1,
        reorder_point: reorder_point ? parseInt(reorder_point) : 10
      };
      
      // Log the processed product data
      console.log('Processing product data:', productData);
      
      const product = await ProductModel.create(productData);
      
      res.status(201).json({
        message: 'Product created successfully',
        product
      });
    } catch (error) {
      // Enhanced error logging
      console.error('Create product error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        error: 'Server error creating product',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Get product by ID
  async getProduct(req, res) {
    try {
      const { id } = req.params;
      
      const product = await ProductModel.findById(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      console.error('Get product error:', error.message);
      res.status(500).json({ error: 'Server error fetching product' });
    }
  },

  // Update product
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const businessman_id = req.user.id;
      const updateData = req.body;
      
      // Check if product exists and belongs to the user
      const existingProduct = await ProductModel.findById(id);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      if (existingProduct.businessman_id !== businessman_id) {
        return res.status(403).json({ error: 'Not authorized to update this product' });
      }
      
      const product = await ProductModel.update(id, updateData);
      
      res.json({
        message: 'Product updated successfully',
        product
      });
    } catch (error) {
      console.error('Update product error:', error.message);
      res.status(500).json({ error: 'Server error updating product' });
    }
  },

  // Delete product
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const businessman_id = req.user.id;
      
      // Check if product exists and belongs to the user
      const existingProduct = await ProductModel.findById(id);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      if (existingProduct.businessman_id !== businessman_id) {
        return res.status(403).json({ error: 'Not authorized to delete this product' });
      }
      
      await ProductModel.delete(id);
      
      res.json({
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Delete product error:', error.message);
      res.status(500).json({ error: 'Server error deleting product' });
    }
  },

  // Get all products with filtering
  async getAllProducts(req, res) {
    try {
      const { 
        category = 'all', 
        businessman_id, 
        min_price, 
        max_price,
        stock_status,
        search_query,
        page = 1,
        limit = 12,
        city
      } = req.query;
      
      // Add current user ID to exclude their products
      let currentUserBusinessId = null;
      if (req.user && (req.user.id || req.user.businessman_id)) {
        currentUserBusinessId = req.user.businessman_id || req.user.id;
      }
      
      // Add pagination and enhanced filtering
      const filters = {
        category: category !== 'all' ? category : null,
        businessman_id,
        min_price: min_price ? parseFloat(min_price) : null,
        max_price: max_price ? parseFloat(max_price) : null,
        stock_status,
        search_query,
        page: parseInt(page),
        limit: parseInt(limit),
        city: city || null,
        // New filter parameters
        exclude_businessman_id: currentUserBusinessId, // Filter out current user's products
        exclude_deals: true  // Filter out products that are already part of deals
      };

      // Log the filters being applied for debugging
      console.log('Applying product filters:', filters);

      const products = await ProductModel.getAll(filters);
      
      if (!products || !products.length) {
        return res.json({
          products: [],
          message: 'No products found',
          pagination: {
            currentPage: filters.page,
            totalPages: 0,
            totalProducts: 0
          }
        });
      }

      // Transform product data for frontend
      const transformedProducts = products.map(product => ({
        id: product.product_id,
        name: product.product_name,
        price: product.price,
        category: product.category,
        seller: product.business_name,
        seller_id: product.businessman_id, // Add this to identify the seller
        business_id: product.businessman_id, // Add for consistent naming with frontend
        moq: product.moq || 1,
        location: product.area,
        area: product.street,
        inStock: product.quantity_available > 0,
        quantity_available: product.quantity_available,
        image_url: product.image_url,
        description: product.description
      }));

      res.json({
        products: transformedProducts,
        pagination: {
          currentPage: filters.page,
          totalPages: Math.ceil(products.length / filters.limit),
          totalProducts: products.length
        }
      });
    } catch (error) {
      console.error('Get products error:', error.message);
      res.status(500).json({ 
        error: 'Server error fetching products',
        message: error.message 
      });
    }
  },

  // Get business's low stock products
  async getLowStockProducts(req, res) {
    try {
      const businessman_id = req.user.id;
      const products = await ProductModel.getLowStock(businessman_id);
      
      res.json(products);
    } catch (error) {
      console.error('Get low stock products error:', error.message);
      res.status(500).json({ error: 'Server error fetching low stock products' });
    }
  },

  // Update product quantity
  async updateProductQuantity(req, res) {
    try {
      const { id } = req.params;
      const { quantity, operation } = req.body;
      const businessman_id = req.user.id;
      
      // Debug logging
      console.log(`Updating product ${id} quantity with:`, { 
        quantity: quantity, 
        operation: operation,
        type: typeof quantity
      });
      
      if (quantity === undefined) {
        return res.status(400).json({ error: 'Quantity is required' });
      }
      
      // Validate quantity is a number
      const quantityNum = parseInt(quantity, 10);
      if (isNaN(quantityNum)) {
        return res.status(400).json({ error: 'Quantity must be a valid number' });
      }
      
      // Validate operation
      const validOperations = ['set', 'add', 'subtract'];
      if (operation && !validOperations.includes(operation)) {
        return res.status(400).json({ error: `Invalid operation. Must be one of: ${validOperations.join(', ')}` });
      }
      
      // Check if product exists and belongs to the user
      const existingProduct = await ProductModel.findById(id);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      if (existingProduct.businessman_id !== businessman_id) {
        return res.status(403).json({ error: 'Not authorized to update this product' });
      }
      
      // Debug existing product quantity
      console.log(`Current product quantity: ${existingProduct.quantity_available}`);
      
      const product = await ProductModel.updateQuantity(id, quantityNum, operation || 'set');
      
      // Debug updated product quantity
      console.log(`Updated product quantity: ${product.quantity_available}`);
      
      res.json({
        message: 'Product quantity updated successfully',
        product
      });
    } catch (error) {
      console.error('Update quantity error:', error.message);
      res.status(500).json({ error: 'Server error updating quantity' });
    }
  },

  // Search products
  async searchProducts(req, res) {
    try {
      const { 
        search_query, 
        category,
        min_price, 
        max_price,
        stock_status,
        page = 1,
        limit = 12,
        city
      } = req.query;
      
      // Add current user ID to exclude their products
      let currentUserBusinessId = null;
      if (req.user && (req.user.id || req.user.businessman_id)) {
        currentUserBusinessId = req.user.businessman_id || req.user.id;
      }
      
      // Add pagination and enhanced filtering
      const filters = {
        search_query: search_query || null,
        category: category !== 'all' ? category : null,
        min_price: min_price ? parseFloat(min_price) : null,
        max_price: max_price ? parseFloat(max_price) : null,
        stock_status,
        page: parseInt(page),
        limit: parseInt(limit),
        city: city || null,
        // New filter parameters
        exclude_businessman_id: currentUserBusinessId, // Filter out current user's products
        exclude_deals: true  // Filter out products that are already part of deals
      };

      // Log the filters being applied for debugging
      console.log('Applying search filters:', filters);

      // Use the search method if there's a search query, otherwise use getAll
      const products = search_query 
        ? await ProductModel.search(search_query, filters)
        : await ProductModel.getAll(filters);
      
      const total = products.length > 0 ? products[0].total_count : 0;
      
      if (!products || !products.length) {
        return res.json({
          products: [],
          message: 'No products found',
          pagination: {
            currentPage: parseInt(page),
            totalPages: 0,
            totalProducts: 0
          }
        });
      }

      // Transform product data for frontend
      const transformedProducts = products.map(product => ({
        id: product.product_id,
        name: product.product_name,
        price: product.price,
        category: product.category,
        seller: product.business_name,
        seller_id: product.businessman_id, // Add this to identify the seller
        business_id: product.businessman_id, // Add for consistent naming with frontend
        moq: product.moq || 1,
        location: product.area,
        area: product.street,
        city: product.city,
        inStock: product.quantity_available > 0,
        quantity_available: product.quantity_available,
        image_url: product.image_url,
        description: product.description
      }));

      res.json({
        products: transformedProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalProducts: parseInt(total)
        }
      });
    } catch (error) {
      console.error('Search products error:', error);
      res.status(500).json({ 
        error: 'Server error searching products',
        message: error.message || 'Failed to search products' 
      });
    }
  },

  // Get business's products
  async getBusinessProducts(req, res) {
    try {
      const businessman_id = req.user.id;
      
      if (!businessman_id) {
        logger.error('Missing businessman_id in request', { user: req.user });
        return res.status(400).json({ 
          error: 'Invalid request',
          message: 'Business ID is required'
        });
      }

      const products = await ProductModel.findByBusinessId(businessman_id);
      
      res.json(products || []);
    } catch (error) {
      logger.error('Get business products error:', error);
      res.status(500).json({ 
        error: 'Server error fetching business products',
        message: 'Failed to retrieve your products. Please try again.'
      });
    }
  }
};

export default ProductController;