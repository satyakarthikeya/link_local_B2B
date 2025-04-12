// API client utility for making requests to the backend

// Base URL for all API requests
const API_URL = 'http://localhost:5000/api';

// Helper function to handle errors from fetch calls
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // If server returns an error, throw it to be caught by the caller
    const error = (data && data.error) || response.statusText;
    return Promise.reject(error);
  }
  
  return data;
};

// API utility functions
const api = {
  // Auth endpoints
  auth: {
    // Business authentication
    businessLogin: async (credentials) => {
      const response = await fetch(`${API_URL}/auth/business/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return handleResponse(response);
    },
    
    businessRegister: async (userData) => {
      const response = await fetch(`${API_URL}/auth/business/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return handleResponse(response);
    },
    
    // Delivery agent authentication
    deliveryLogin: async (credentials) => {
      const response = await fetch(`${API_URL}/auth/delivery/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return handleResponse(response);
    },
    
    deliveryRegister: async (userData) => {
      const response = await fetch(`${API_URL}/auth/delivery/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return handleResponse(response);
    },
    
    // Get current user info
    getCurrentUser: async (token) => {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return handleResponse(response);
    },
    
    // Update user profile
    updateProfile: async (userData, token) => {
      const response = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      return handleResponse(response);
    }
  },
  
  // Product endpoints
  products: {
    // Get all products with optional filtering
    getAll: async (filters = {}) => {
      // Convert filters object to query string
      const queryString = Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      
      const url = queryString ? `${API_URL}/products?${queryString}` : `${API_URL}/products`;
      const response = await fetch(url);
      return handleResponse(response);
    },
    
    // Search products
    search: async (query) => {
      const response = await fetch(`${API_URL}/products/search?query=${encodeURIComponent(query)}`);
      return handleResponse(response);
    },
    
    // Get single product by ID
    getById: async (productId) => {
      const response = await fetch(`${API_URL}/products/${productId}`);
      return handleResponse(response);
    },
    
    // Create new product (requires authentication)
    create: async (productData, token) => {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      return handleResponse(response);
    },
    
    // Update product (requires authentication)
    update: async (productId, productData, token) => {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      return handleResponse(response);
    },
    
    // Delete product (requires authentication)
    delete: async (productId, token) => {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return handleResponse(response);
    },
    
    // Get business products (requires authentication)
    getBusinessProducts: async (token) => {
      const response = await fetch(`${API_URL}/products/business/myproducts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return handleResponse(response);
    }
  },
  
  // Order endpoints
  orders: {
    // Create a new order (requires authentication)
    create: async (orderData, token) => {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });
      return handleResponse(response);
    },
    
    // Get order by ID (requires authentication)
    getById: async (orderId, token) => {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return handleResponse(response);
    },
    
    // Update order status (requires authentication)
    updateStatus: async (orderId, statusData, token) => {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(statusData)
      });
      return handleResponse(response);
    },
    
    // Get business orders (requires authentication)
    getBusinessOrders: async (token, role) => {
      const url = role 
        ? `${API_URL}/orders/business/orders?role=${role}`
        : `${API_URL}/orders/business/orders`;
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return handleResponse(response);
    },
    
    // Get delivery orders (requires authentication)
    getDeliveryOrders: async (token) => {
      const response = await fetch(`${API_URL}/orders/delivery/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return handleResponse(response);
    },
    
    // Assign delivery agent (requires authentication)
    assignDeliveryAgent: async (assignData, token) => {
      const response = await fetch(`${API_URL}/orders/assign-delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(assignData)
      });
      return handleResponse(response);
    }
  }
};

export default api;