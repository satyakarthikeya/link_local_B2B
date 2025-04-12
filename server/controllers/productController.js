import ProductModel from '../models/productModel.js';

// Product controller for product-related operations
const ProductController = {
  // Create a new product
  async createProduct(req, res) {
    try {
      const { product_name, price, quantity_available, description, image_url } = req.body;
      const businessman_id = req.user.id;
      
      // Validate required fields
      if (!product_name || !price || !quantity_available) {
        return res.status(400).json({ error: 'Required fields missing' });
      }
      
      const product = await ProductModel.create({
        product_name,
        price,
        quantity_available,
        businessman_id,
        description,
        image_url
      });
      
      res.status(201).json({
        message: 'Product created successfully',
        product
      });
    } catch (error) {
      console.error('Create product error:', error.message);
      res.status(500).json({ error: 'Server error creating product' });
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
  
  // Get all products with optional filtering
  async getAllProducts(req, res) {
    try {
      const { category, businessman_id, min_price, max_price } = req.query;
      
      const products = await ProductModel.getAll({
        category,
        businessman_id,
        min_price: min_price ? parseFloat(min_price) : null,
        max_price: max_price ? parseFloat(max_price) : null
      });
      
      res.json(products);
    } catch (error) {
      console.error('Get products error:', error.message);
      res.status(500).json({ error: 'Server error fetching products' });
    }
  },
  
  // Search products
  async searchProducts(req, res) {
    try {
      const { query } = req.query;
      
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const products = await ProductModel.search(query);
      
      res.json(products);
    } catch (error) {
      console.error('Search products error:', error.message);
      res.status(500).json({ error: 'Server error searching products' });
    }
  },
  
  // Get products for a specific business
  async getBusinessProducts(req, res) {
    try {
      const businessman_id = req.user.id;
      
      const products = await ProductModel.getAll({ businessman_id });
      
      res.json(products);
    } catch (error) {
      console.error('Get business products error:', error.message);
      res.status(500).json({ error: 'Server error fetching business products' });
    }
  },
  
  // Update product quantity
  async updateProductQuantity(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const businessman_id = req.user.id;
      
      if (quantity === undefined) {
        return res.status(400).json({ error: 'Quantity is required' });
      }
      
      // Check if product exists and belongs to the user
      const existingProduct = await ProductModel.findById(id);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      if (existingProduct.businessman_id !== businessman_id) {
        return res.status(403).json({ error: 'Not authorized to update this product' });
      }
      
      const product = await ProductModel.updateQuantity(id, quantity);
      
      res.json({
        message: 'Product quantity updated successfully',
        product
      });
    } catch (error) {
      console.error('Update quantity error:', error.message);
      res.status(500).json({ error: 'Server error updating quantity' });
    }
  }
};

export default ProductController;