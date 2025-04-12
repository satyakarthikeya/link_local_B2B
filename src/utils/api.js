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
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (productData[key] !== null && productData[key] !== undefined) {
        formData.append(key, productData[key]);
      }
    });
    return api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
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
  getDeliveryOrders: () => api.get('/orders/delivery/orders'),

  // Assign delivery agent
  assignDeliveryAgent: (assignData) => api.post('/orders/assign-delivery', assignData)
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

export default api;