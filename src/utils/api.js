import axios from 'axios';
import { mockDeliveryData, mockApiCall } from './mockData';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Changed from 'token' to 'authToken' to match AuthContext
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding auth token to request:', config.url);
    } else {
      console.log('No auth token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        console.log('Unauthorized request. Redirecting to login...');
        // Uncomment the following to redirect to login on 401
        // window.location.href = '/login-business';
      }
      if (error.response.status === 500) {
        console.error('Server error:', error.response.data || 'Unknown server error');
      }
    }
    return Promise.reject(error);
  }
);

// Products and Inventory API
export const productAPI = {
  // Get all products with optional filters
  getProducts: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/products?${params}`);
  },

  // New method to get all products (for compatibility with existing code)
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/products?${params}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Get business's products
  getBusinessProducts: () => api.get('/products/business/myproducts'),

  // Get low stock products
  getLowStockProducts: () => api.get('/products/business/low-stock'),

  // Create new product
  createProduct: (productData) => {
    console.log('Creating product with data:', productData);
    
    // For regular JSON data (no file uploads)
    if (!productData.image) {
      return api.post('/products', productData);
    }
    
    // For multipart form data (with file uploads)
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (productData[key] !== null && productData[key] !== undefined) {
        formData.append(key, productData[key]);
      }
    });
    
    return api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Update product
  updateProduct: (id, productData) => {
    console.log('Updating product with ID:', id, 'and data:', productData);
    
    // Check if we have an image file to upload
    if (productData.image instanceof File) {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (productData[key] !== null && productData[key] !== undefined) {
          formData.append(key, productData[key]);
        }
      });
      return api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      // No image file, send as regular JSON
      return api.put(`/products/${id}`, productData);
    }
  },

  // Delete product
  deleteProduct: (id) => api.delete(`/products/${id}`),

  // Update product quantity
  updateQuantity: (id, quantity, operation = 'set') => 
    api.patch(`/products/${id}/quantity`, { quantity, operation }),

  // Search products
  searchProducts: (query) => api.get(`/products/search?query=${query}`),

  // Upload product image
  uploadProductImage: (productId, formData) => {
    return api.post(`/products/${productId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Cart API
export const cartAPI = {
  // Get user's cart
  getCart: () => api.get('/cart'),
  
  // Get cart items count
  getCartCount: () => api.get('/cart/count'),
  
  // Add item to cart
  addToCart: (product_id, quantity = 1) => 
    api.post('/cart/add', { product_id, quantity }),
  
  // Update cart item quantity
  updateCartItem: (product_id, quantity) => 
    api.put('/cart/update', { product_id, quantity }),
  
  // Remove item from cart
  removeFromCart: (product_id) => 
    api.delete(`/cart/remove/${product_id}`),
  
  // Clear cart
  clearCart: () => api.delete('/cart/clear')
};

// Orders API
export const orderAPI = {
  // Create a new order
  createOrder: (orderData) => api.post('/orders', orderData),

  // Get order by ID
  getOrderById: (orderId) => api.get(`/orders/${orderId}`),

  // Update order status
  updateOrderStatus: (orderId, statusData) => api.patch(`/orders/${orderId}/status`, statusData),

  // Get business orders
  getBusinessOrders: (role) => {
    const params = role ? `?role=${role}` : '';
    return api.get(`/orders/business/orders${params}`);
  },

  // Get delivery orders
  getDeliveryOrders: (statusFilter) => {
    const params = statusFilter ? `?status=${statusFilter}` : '';
    return api.get(`/orders/delivery/orders${params}`);
  },

  // Create order from cart - New function to process entire cart as an order
  createOrderFromCart: async (shippingInfo) => {
    try {
      // Get cart items first
      const cartResponse = await api.get('/cart');
      console.log('Cart response:', cartResponse.data); // Debugging
      
      if (!cartResponse.data || !cartResponse.data.items || cartResponse.data.items.length === 0) {
        throw new Error('Your cart is empty');
      }
      
      // Group items by supplier - ensure businessman_id exists
      const items = cartResponse.data.items;
      const supplierItems = {};
      
      items.forEach(item => {
        // Extract businessman_id (supplier) from the cart item
        // The businessman_id might be stored in different properties depending on the API response
        let supplierId = null;
        
        // Try different possible property names for the supplier ID
        if (item.businessman_id) {
          supplierId = item.businessman_id;
        } else if (item.seller_id) {
          supplierId = item.seller_id;
        } else if (item.business_id) {
          supplierId = item.business_id;
        }
        
        // If we still don't have a supplier ID, try to extract it from the business_name
        // by matching it with other items that might have the same business_name
        if (!supplierId && item.business_name) {
          // Look for other items with the same business_name that might have a supplier ID
          const itemWithSameBusinessName = items.find(
            otherItem => 
              otherItem.business_name === item.business_name && 
              (otherItem.businessman_id || otherItem.seller_id || otherItem.business_id)
          );
          
          if (itemWithSameBusinessName) {
            supplierId = itemWithSameBusinessName.businessman_id || 
                        itemWithSameBusinessName.seller_id || 
                        itemWithSameBusinessName.business_id;
          }
        }
        
        // If we still don't have a supplier ID but have a product_id, make an additional API call
        // to get the product details which should include the businessman_id
        if (!supplierId && item.product_id) {
          // We'll use the product_id as a temporary supplier ID and fix it after grouping
          console.log(`Using product_id ${item.product_id} as temporary supplier ID`);
          supplierId = `product_${item.product_id}`;
        }
        
        if (!supplierId) {
          console.error('No supplier ID found for item:', item);
          return; // Skip this item if no supplier ID
        }
        
        if (!supplierItems[supplierId]) {
          supplierItems[supplierId] = [];
        }
        
        supplierItems[supplierId].push(item);
      });
      
      // Check if we have any valid supplier groups
      if (Object.keys(supplierItems).length === 0) {
        throw new Error('No valid suppliers found in cart items');
      }
      
      console.log('Grouped by supplier:', supplierItems); // Debugging
      
      // Look up missing supplier IDs using product details
      const finalSupplierItems = {};
      const productLookupPromises = [];
      
      // Process each supplier group
      for (const [supplierId, itemGroup] of Object.entries(supplierItems)) {
        // Check if this is a temporary product ID that needs resolution
        if (supplierId.startsWith('product_')) {
          const productId = supplierId.replace('product_', '');
          // Make an API call to get the product details
          const fetchProductPromise = api.get(`/products/${productId}`)
            .then(response => {
              const productData = response.data;
              // Get the actual businessman_id from the product data
              const actualSupplierId = productData.businessman_id;
              
              if (actualSupplierId) {
                // Create or add to the supplier group with the actual ID
                if (!finalSupplierItems[actualSupplierId]) {
                  finalSupplierItems[actualSupplierId] = [];
                }
                // Add all items from this group to the actual supplier group
                finalSupplierItems[actualSupplierId].push(...itemGroup);
              } else {
                console.error('Product API call did not return businessman_id for product:', productId);
                // If we still can't get the supplier ID, use the first item's product_id as fallback
                const fallbackId = itemGroup[0].product_id;
                if (!finalSupplierItems[fallbackId]) {
                  finalSupplierItems[fallbackId] = [];
                }
                finalSupplierItems[fallbackId].push(...itemGroup);
              }
            })
            .catch(error => {
              console.error(`Failed to fetch product details for ID ${productId}:`, error);
              // Use the product ID as the supplier ID as fallback
              if (!finalSupplierItems[productId]) {
                finalSupplierItems[productId] = [];
              }
              finalSupplierItems[productId].push(...itemGroup);
            });
          
          productLookupPromises.push(fetchProductPromise);
        } else {
          // This is a valid supplier ID, use it directly
          if (!finalSupplierItems[supplierId]) {
            finalSupplierItems[supplierId] = [];
          }
          finalSupplierItems[supplierId].push(...itemGroup);
        }
      }
      
      // Wait for all product lookups to complete
      if (productLookupPromises.length > 0) {
        await Promise.all(productLookupPromises);
      }
      
      // Check if we have any valid supplier groups after lookups
      if (Object.keys(finalSupplierItems).length === 0) {
        throw new Error('Failed to identify valid suppliers for cart items');
      }
      
      console.log('Final supplier grouping:', finalSupplierItems); // Debugging
      
      // Create an order for each supplier using the bulk endpoint
      const orderPromises = Object.keys(finalSupplierItems).map(supplierId => {
        const supplierGroup = finalSupplierItems[supplierId];
        
        // Format the order data according to what the server expects
        const orderData = {
          supplying_businessman_id: parseInt(supplierId) || supplierId,
          items: supplierGroup.map(item => ({
            product_id: item.product_id || item.id,
            quantity_requested: item.quantity
          })),
          shipping_info: shippingInfo || {},
          notes: (shippingInfo && shippingInfo.notes) || ''
        };
        
        console.log('Sending order data:', orderData); // Debugging
        return api.post('/orders/bulk', orderData);
      });
      
      // Wait for all orders to be created
      const results = await Promise.all(orderPromises);
      
      // Clear cart after successful orders
      await api.delete('/cart/clear');
      
      return {
        message: 'Orders created successfully',
        orders: results.map(r => r.data.order)
      };
    } catch (error) {
      console.error('Error creating order from cart:', error);
      throw error;
    }
  },

  // Assign delivery agent
  assignDeliveryAgent: (assignData) => api.post('/orders/assign-delivery', assignData),
  
  // Update delivery status by delivery agent
  updateDeliveryStatus: (orderId, statusData) => api.patch(`/orders/${orderId}/delivery-status`, statusData),

  // Cancel order
  cancelOrder: (orderId, reason) => api.patch(`/orders/${orderId}/cancel`, { reason }),

  // Reorder a previous order
  reorderPreviousOrder: (orderId) => api.post(`/orders/${orderId}/reorder`),

  // Submit review for an order
  submitOrderReview: (orderId, reviewData) => api.post(`/orders/${orderId}/review`, reviewData),

  // Get order history
  getOrderHistory: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/orders/history?${params}`);
  },
}

// Delivery Agent API
export const deliveryAPI = {
  // Get profile information
  getProfile: () => api.get('/delivery/profile'),
  
  // Update profile information
  updateProfile: (agentId, profileData) => api.put(`/delivery/profile/${agentId}`, profileData),
  
  // Update availability status (online/offline)
  updateAvailabilityStatus: (agentId, isAvailable) => 
    api.patch(`/delivery/availability/${agentId}`, { status: isAvailable }),
  
  // Get current orders assigned to the delivery agent
  getCurrentOrders: () => api.get('/delivery/orders/current'),
  
  // Get order history
  getOrderHistory: (filter = {}) => {
    const params = new URLSearchParams(filter);
    return api.get(`/delivery/orders/history?${params}`);
  },
  
  // Get earnings information
  getEarnings: (period) => {
    const params = period ? `?period=${period}` : '';
    return api.get(`/delivery/earnings${params}`);
  },
  
  // Get earnings history - Added for profile page
  getEarningsHistory: () => api.get('/delivery/earnings/history'),
  
  // Get documents - Added for profile page
  getDocuments: () => api.get('/delivery/documents'),
  
  // Get performance stats - Added for profile page
  getPerformanceStats: () => api.get('/delivery/stats/performance'),
  
  // Get dashboard stats - Added for home page
  getDashboardStats: () => api.get('/delivery/dashboard'),
  
  // Update current location
  updateLocation: (locationData) => 
    api.post('/delivery/location', locationData),
  
  // Get stats and analytics
  getStats: () => api.get('/delivery/stats')
};

// API for delivery agent operations
export const delivery = {
  // Get delivery agent profile
  getProfile: () => api.get('/delivery/profile'),

  // Update delivery agent profile
  updateProfile: (profileData) => api.put('/delivery/profile', profileData),

  // Update availability status
  updateStatus: (status) => api.patch('/delivery/status', { status }),

  // Set status to offline
  setOffline: () => api.post('/delivery/offline'),

  // Get current orders assigned to the delivery agent
  getCurrentOrders: async () => {
    try {
      const response = await api.get('/delivery/orders/current');
      return response;
    } catch (error) {
      console.log("Using mock data for current orders due to API error:", error.message);
      return mockApiCall(mockDeliveryData.currentOrders);
    }
  },

  // Get order history with optional filters
  getOrderHistory: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    
    return api.get(`/delivery/orders/history?${params}`);
  },

  // Get nearby available orders
  getNearbyOrders: async () => {
    try {
      const response = await api.get('/delivery/orders/nearby');
      return response;
    } catch (error) {
      console.log("Using mock data for nearby orders due to API error:", error.message);
      return mockApiCall(mockDeliveryData.nearbyOrders);
    }
  },
  
  // Accept an order
  acceptOrder: async (orderId) => {
    try {
      const response = await api.post(`/delivery/orders/${orderId}/accept`);
      return response;
    } catch (error) {
      console.log("Using mock data for accept order due to API error:", error.message);
      // Simulate successful order acceptance
      return mockApiCall({ success: true, message: "Order accepted successfully" });
    }
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/delivery/dashboard');
      return response;
    } catch (error) {
      console.log("Using mock data for dashboard stats due to API error:", error.message);
      return mockApiCall(mockDeliveryData.dashboardStats);
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, data) => {
    try {
      const response = await api.patch(`/delivery/orders/${orderId}/status`, data);
      return response;
    } catch (error) {
      console.log("Using mock data for update order status due to API error:", error.message);
      return mockApiCall({ success: true, message: `Order status updated to ${data.status}` });
    }
  },

  // Update delivery location
  updateLocation: (locationData) => api.patch('/delivery/location', locationData),

  // Get earnings information
  getEarnings: () => api.get('/delivery/earnings')
};

// Auth API
export const authAPI = {
  // Business authentication
  businessLogin: (credentials) => api.post('/auth/business/login', credentials),

  businessRegister: (userData) => api.post('/auth/business/register', userData),

  // Delivery agent authentication
  deliveryLogin: (credentials) => api.post('/auth/delivery/login', credentials),

  deliveryRegister: (userData) => api.post('/auth/delivery/register', userData),

  // Get current user info
  getCurrentUser: () => api.get('/auth/me'),

  // Update user profile
  updateProfile: (userData) => api.put('/auth/update-profile', userData)
};

export const auth = {
  // Delivery agent authentication
  deliveryLogin: (credentials) => api.post('/auth/delivery/login', credentials),
  deliveryRegister: (userData) => api.post('/auth/delivery/register', userData),

  // Get current user info
  getCurrentUser: () => api.get('/auth/me'),

  // Update user profile
  updateProfile: (userData) => api.put('/auth/update-profile', userData)
};

// Deals API
export const dealAPI = {
  // Get all deals (updated to use correct endpoint)
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/deals/all?${params}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching deals:', error);
      return [];
    }
  },

  // Create a new deal for a product
  createDeal: (productId, dealData) => api.post(`/deals/product/${productId}`, dealData),

  // Update a deal for a product
  updateDeal: (productId, dealData) => api.put(`/deals/product/${productId}`, dealData),

  // Remove a deal from a product
  removeDeal: (productId) => api.delete(`/deals/product/${productId}`),

  // Get deal information for a product
  getDealByProductId: (productId) => api.get(`/deals/product/${productId}`),

  // Get all active deals with optional filters
  getActiveDeals: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/deals/active?${params}`);
  },

  // Get deals by business ID
  getDealsByBusinessId: (businessId) => api.get(`/deals/business/${businessId}`),

  // Get featured deals
  getFeaturedDeals: (limit = 4) => api.get(`/deals/featured?limit=${limit}`),

  // Toggle featured status of a deal
  toggleFeaturedStatus: (productId, isFeatured) => 
    api.put(`/deals/product/${productId}`, { is_featured: isFeatured })
};

// Image Upload API
export const uploadImage = async (formData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}` // Include token if required
      }
    });
    return response;
  } catch (error) {
    console.error('Failed to upload image:', error);
    throw error;
  }
};

// Assign APIs to the api object
api.auth = authAPI;
api.products = productAPI;
api.orders = orderAPI;
api.uploadImage = uploadImage;
api.delivery = deliveryAPI;
api.deals = dealAPI; // Add deals API to the main api object
api.cart = cartAPI; // Add cart API to the main api object

export default api;