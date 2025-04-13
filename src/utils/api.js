import axios from 'axios';

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

  // Assign delivery agent
  assignDeliveryAgent: (assignData) => api.post('/orders/assign-delivery', assignData),
  
  // Update delivery status by delivery agent
  updateDeliveryStatus: (orderId, statusData) => api.patch(`/orders/${orderId}/delivery-status`, statusData)
};

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
  getProfile: () => api.get('/api/delivery/profile'),

  // Update delivery agent profile
  updateProfile: (profileData) => api.put('/api/delivery/profile', profileData),

  // Update availability status
  updateStatus: (status) => api.patch('/api/delivery/status', { status }),

  // Set status to offline
  setOffline: () => api.post('/api/delivery/offline'),

  // Get current orders assigned to the delivery agent
  getCurrentOrders: () => api.get('/api/delivery/orders/current'),

  // Get order history with optional filters
  getOrderHistory: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    
    return api.get(`/api/delivery/orders/history?${params}`);
  },

  // Get dashboard statistics
  getDashboardStats: () => api.get('/api/delivery/dashboard'),

  // Get available orders nearby
  getNearbyOrders: () => api.get('/api/delivery/orders/nearby'),

  // Accept an order
  acceptOrder: (orderId) => api.post(`/api/delivery/orders/${orderId}/accept`),

  // Update order status
  updateOrderStatus: (orderId, data) => api.patch(`/api/delivery/orders/${orderId}/status`, data),

  // Update delivery location
  updateLocation: (locationData) => api.patch('/api/delivery/location', locationData),

  // Get earnings information
  getEarnings: () => api.get('/api/delivery/earnings')
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

export default api;