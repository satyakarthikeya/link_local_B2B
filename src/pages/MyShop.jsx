import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import B_Navbar from '../components/B_Navbar';
import '../styles/MyShop.css';
import api from '../utils/api';

const MyShop = () => {
  const navigate = useNavigate();
  const { currentUser, token, logout, isBusinessUser } = useAuth();
  
  // Redirect if not logged in or not a business user
  useEffect(() => {
    if (!token) {
      navigate('/login-business');
      return;
    }
    
    if (!isBusinessUser) {
      navigate('/');
      return;
    }
  }, [token, isBusinessUser, navigate]);

  const [activeTab, setActiveTab] = useState('products');
  const [showProductForm, setShowProductForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    image: null,
    moq: '1',
    reorder_point: '10'
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockFilter, setStockFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0
  });
  const [showDeliveryAssignModal, setShowDeliveryAssignModal] = useState({ show: false, orderId: null });
  const [deliveryAgents, setDeliveryAgents] = useState([]);
  const [selectedDeliveryAgent, setSelectedDeliveryAgent] = useState('');
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState({ show: false, order: null });

  // Add this effect to fetch delivery agents when needed
  useEffect(() => {
    if (showDeliveryAssignModal.show) {
      fetchDeliveryAgents();
    }
  }, [showDeliveryAssignModal]);

  // Fetch delivery agents
  const fetchDeliveryAgents = async () => {
    setIsLoadingAgents(true);
    try {
      // This would typically come from an API
      // For demo purposes using mock data
      setTimeout(() => {
        setDeliveryAgents([
          { id: 1, name: 'Myla', vehicle_type: 'Bike', contact_number: '9876543210' },
          { id: 2, name: 'Khadar', vehicle_type: 'Truck', contact_number: '8765432109' },
          { id: 3, name: 'Dona', vehicle_type: 'Lorry', contact_number: '7395684921' },
        ]);
        setIsLoadingAgents(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch delivery agents:', error);
      showNotification('Failed to load delivery agents', 'error');
      setIsLoadingAgents(false);
    }
  };
  
  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchStats();
  }, []);

  // Auto-hide notifications after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchStats = async () => {
    try {
      const statsData = {
        totalProducts: products.length,
        lowStock: products.filter(p => p.quantity_available <= p.reorder_point && p.quantity_available > 0).length,
        outOfStock: products.filter(p => !p.quantity_available || p.quantity_available <= 0).length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'Pending').length,
        revenue: orders.filter(o => o.status === 'Delivered' || o.status === 'Completed')
          .reduce((sum, order) => sum + order.totalAmount, 0)
      };
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch products...');
      const response = await api.products.getBusinessProducts();
      console.log('Products fetched successfully:', response.data);
      setProducts(response.data || []);
      setTimeout(() => fetchStats(), 300);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      if (error.response) {
        console.error('Error details:', error.response.data || 'No detailed error information');
        console.error('Error status:', error.response.status);
        if (error.response.status === 401) {
          showNotification('Authentication error. Please log in again.', 'error');
        } else if (error.response.status === 403) {
          showNotification('You do not have permission to view these products.', 'error');
        } else if (error.response.status === 500) {
          showNotification('Server error. The development team has been notified.', 'error');
        } else {
          showNotification('Failed to load products. Please try again.', 'error');
        }
      } else if (error.message.includes('CORS')) {
        showNotification('CORS error: Please check your server configuration.', 'error');
      } else {
        showNotification('Failed to load products. Please try again.', 'error');
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      console.log('Starting to fetch orders...');
      const response = await api.orders.getBusinessOrders('supplier');
      console.log('Orders fetched successfully:', response.data);
      setOrders(response.data || []);
      setTimeout(() => fetchStats(), 300);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      if (error.response) {
        console.error('Error details:', error.response.data || 'No detailed error information');
        console.error('Error status:', error.response.status);
        if (error.response.status === 401) {
          showNotification('Authentication error. Please log in again.', 'error');
        } else if (error.response.status === 403) {
          showNotification('You do not have permission to view these orders.', 'error');
        } else if (error.response.status === 500) {
          showNotification('Server error. The development team has been notified.', 'error');
        } else {
          showNotification('Failed to load orders. Please try again.', 'error');
        }
      } else if (error.message.includes('CORS')) {
        showNotification('CORS error: Please check your server configuration.', 'error');
      } else {
        showNotification('Failed to load orders. Please try again.', 'error');
      }
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({
      show: true,
      message,
      type
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        product_name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        quantity_available: parseInt(formData.stock),
        description: formData.description ? formData.description.trim() : '',
        moq: parseInt(formData.moq),
        reorder_point: parseInt(formData.reorder_point),
      };

      if (formData.image instanceof File) {
        productData.image = formData.image;
      }

      console.log(`${editingProductId ? 'Updating' : 'Creating'} product with data:`, JSON.stringify(productData, null, 2));

      let response;
      if (editingProductId !== null) {
        response = await api.products.updateProduct(editingProductId, productData);
        console.log('Product updated successfully:', response);
        showNotification('Product updated successfully!');
      } else {
        response = await api.products.createProduct(productData);
        console.log('Product created successfully:', response);
        showNotification('New product added successfully!');
      }

      await fetchProducts();
      closeForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response) {
        console.error('Server error details:', error.response.data || 'No detailed error information');
        console.error('Server error status:', error.response.status);
        
        const errorMessage =
          error.response.data?.error ||
          error.response.data?.message ||
          `Failed to ${editingProductId ? 'update' : 'save'} product. ${error.response.status === 500 ? 'Server error occurred.' : 'Please try again.'}`;
        
        setFormErrors({ submit: errorMessage });
        showNotification(errorMessage, 'error');
      } else {
        console.error('Unexpected error:', error.message);
        setFormErrors({ submit: `An unexpected error occurred: ${error.message}. Please try again.` });
        showNotification('An unexpected error occurred. Please try again.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeForm = () => {
    setShowProductForm(false);
    setEditingProductId(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      description: '',
      image: null,
      moq: '1',
      reorder_point: '10'
    });
    setImagePreview(null);
    setFormErrors({});
  };

  const handleUpdateStock = async (productId, newQuantity) => {
    try {
      await api.products.updateQuantity(productId, newQuantity, 'set');
      await fetchProducts();
      showNotification('Stock updated successfully!');
    } catch (error) {
      console.error("Error updating stock:", error);
      showNotification('Failed to update stock.', 'error');
    }
  };

  const handleAdjustStock = async (productId, adjustment) => {
    try {
      const currentProduct = products.find(p => p.product_id === productId);
      if (!currentProduct) {
        throw new Error('Product not found');
      }

      const newQuantity = currentProduct.quantity_available + adjustment;
      
      if (newQuantity < 0) {
        showNotification('Cannot reduce stock below 0', 'error');
        return;
      }

      await api.products.updateQuantity(productId, newQuantity, 'set');
      
      // Update local state immediately
      setProducts(prevProducts => {
        const updatedProducts = prevProducts.map(product => {
          if (product.product_id === productId) {
            return {
              ...product,
              quantity_available: newQuantity,
              stock_status: getStockStatus(newQuantity, product.reorder_point)
            };
          }
          return product;
        });
        
        // Update all stats immediately
        setTimeout(() => {
          const newStats = {
            ...stats,
            totalProducts: updatedProducts.length,
            lowStock: updatedProducts.filter(p => p.quantity_available <= p.reorder_point && p.quantity_available > 0).length,
            outOfStock: updatedProducts.filter(p => !p.quantity_available || p.quantity_available <= 0).length
          };
          setStats(newStats);
        }, 0);
        
        return updatedProducts;
      });

      showNotification(`Stock ${adjustment > 0 ? 'increased' : 'decreased'} successfully!`);
    } catch (error) {
      console.error("Error adjusting stock:", error);
      showNotification('Failed to adjust stock.', 'error');
    }
  };

  // Helper function to determine stock status
  const getStockStatus = (quantity, reorderPoint) => {
    if (!quantity || quantity <= 0) return 'Out of Stock';
    if (quantity <= reorderPoint) return 'Low Stock';
    return 'In Stock';
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await api.orders.updateOrderStatus(orderId, { status: newStatus });
      await fetchOrders();
      showNotification(`Order status updated to ${newStatus}!`);
    } catch (error) {
      console.error("Error updating order status:", error);
      showNotification('Failed to update order status.', 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.products.deleteProduct(productId);
      await fetchProducts();
      showNotification('Product deleted successfully!', 'success');
    } catch (error) {
      console.error('Failed to delete product:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete product.';
      showNotification(errorMessage, 'error');
    }
  };

  const handleAssignDelivery = async (orderId, agentId) => {
    try {
      const assignData = {
        order_id: orderId,
        agent_id: agentId
      };
      
      await api.orders.assignDeliveryAgent(assignData);
      await fetchOrders();
      showNotification('Delivery agent assigned successfully!', 'success');
    } catch (error) {
      console.error('Failed to assign delivery agent:', error);
      const errorMessage = error.response?.data?.error || 'Failed to assign delivery agent.';
      showNotification(errorMessage, 'error');
    }
  };

  const handleViewOrderDetails = (order) => {
    setShowOrderDetailModal({ show: true, order });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name || formData.name.trim().length < 3) {
      errors.name = 'Product name is required (min 3 characters)';
    }
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.price || formData.price <= 0) errors.price = 'Valid price is required';
    if (!formData.stock || formData.stock < 0) errors.stock = 'Valid stock quantity is required';
    if (!formData.moq || formData.moq < 1) errors.moq = 'Minimum order quantity must be at least 1';
    if (!formData.reorder_point || formData.reorder_point < 0) errors.reorder_point = 'Valid reorder point is required';
    return errors;
  };

  // Filter products based on stock status
  const filteredProducts = products.filter(product => {
    if (stockFilter === 'low') {
      return product.quantity_available <= product.reorder_point && product.quantity_available > 0;
    } else if (stockFilter === 'out') {
      return product.quantity_available === 0;
    }
    return true;
  });

  // Filter orders based on status
  const filteredOrders = orders.filter(order => {
    if (orderFilter === 'pending') {
      return order.status === 'Pending';
    } else if (orderFilter === 'processing') {
      return order.status === 'Processing';
    } else if (orderFilter === 'completed') {
      return order.status === 'Delivered' || order.status === 'Completed';
    } else if (orderFilter === 'cancelled') {
      return order.status === 'Cancelled';
    }
    return true; // 'all'
  });

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  // Get product image URL
  const getProductImageUrl = (productId) => {
    return `${import.meta.env.VITE_API_BASE_URL || ''}/uploads/products/${productId}.jpg`;
  };

  return (
    <>
      <B_Navbar />
      <main className="my-shop-section">
        <div className="container">
          {/* Page Header */}
          <div className="section-header">
            <h2>My Shop Dashboard</h2>
            <p>Manage your products, inventory and orders from one place</p>
          </div>

          {/* Dashboard Stats */}
          <div className="dashboard-stats">
            <div className="stat-card" 
              style={{ 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                borderRadius: '8px', 
                transition: 'transform 0.2s', 
                backgroundColor: '#fff' 
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div className="stat-icon products-icon">
                <i className="fas fa-box"></i>
              </div>
              <div className="stat-details">
                <h3>Total Products</h3>
                <p>{stats.totalProducts}</p>
              </div>
            </div>
            <div className="stat-card" 
              style={{ 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                borderRadius: '8px', 
                transition: 'transform 0.2s', 
                backgroundColor: '#fff' 
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div className="stat-icon warning-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="stat-details">
                <h3>Low Stock Items</h3>
                <p>{stats.lowStock}</p>
              </div>
            </div>
            <div className="stat-card" 
              style={{ 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                borderRadius: '8px', 
                transition: 'transform 0.2s', 
                backgroundColor: '#fff' 
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div className="stat-icon danger-icon">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="stat-details">
                <h3>Out of Stock</h3>
                <p>{stats.outOfStock}</p>
              </div>
            </div>
            <div className="stat-card" 
              style={{ 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                borderRadius: '8px', 
                transition: 'transform 0.2s', 
                backgroundColor: '#fff' 
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div className="stat-icon orders-icon">
                <i className="fas fa-shopping-cart"></i>
              </div>
              <div className="stat-details">
                <h3>Total Orders</h3>
                <p>{stats.totalOrders}</p>
              </div>
            </div>
            <div className="stat-card" 
              style={{ 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                borderRadius: '8px', 
                transition: 'transform 0.2s', 
                backgroundColor: '#fff' 
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div className="stat-icon pending-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-details">
                <h3>Pending Orders</h3>
                <p>{stats.pendingOrders}</p>
              </div>
            </div>
            <div className="stat-card" 
              style={{ 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                borderRadius: '8px', 
                transition: 'transform 0.2s', 
                backgroundColor: '#fff' 
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div className="stat-icon revenue-icon">
                <i className="fas fa-rupee-sign"></i>
              </div>
              <div className="stat-details">
                <h3>Total Revenue</h3>
                <p>{formatCurrency(stats.revenue)}</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <i className="fas fa-box"></i> Products & Inventory
            </button>
            <button 
              className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <i className="fas fa-shopping-cart"></i> Orders
            </button>
            <button 
              className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <i className="fas fa-chart-line"></i> Analytics
            </button>
          </div>

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="products-section">
              <div className="products-header">
                <div className="filters">
                  <select 
                    value={stockFilter} 
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="stock-filter"
                  >
                    <option value="all">All Products</option>
                    <option value="low">Low Stock</option>
                    <option value="out">Out of Stock</option>
                  </select>
                </div>
                <button 
                  className="add-product-btn"
                  onClick={() => setShowProductForm(true)}
                >
                  <i className="fas fa-plus"></i> Add New Product
                </button>
              </div>

              {loading ? (
                <div className="loading-spinner">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-box-open"></i>
                  <h3>No products found</h3>
                  <p>{stockFilter === 'all' ? 'Add your first product to get started' : 'No products match your filter criteria'}</p>
                  {stockFilter === 'all' && (
                    <button className="add-product-btn" onClick={() => setShowProductForm(true)}>
                      <i className="fas fa-plus"></i> Add New Product
                    </button>
                  )}
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map(product => {
                    // Calculate availability percentage
                    const maxStock = Math.max(product.quantity_available || 0, product.reorder_point * 3);
                    const availabilityPercentage = Math.min(((product.quantity_available || 0) / maxStock) * 100, 100);
                    
                    // Determine availability level
                    let availabilityLevel = "high";
                    let availabilityText = "In Stock";
                    let availabilityIcon = "fa-check-circle";
                    
                    if (!product.quantity_available || product.quantity_available <= 0) {
                      availabilityLevel = "low";
                      availabilityText = "Out of Stock";
                      availabilityIcon = "fa-times-circle";
                    } else if (product.quantity_available <= product.reorder_point) {
                      availabilityLevel = "medium";
                      availabilityText = "Low Stock";
                      availabilityIcon = "fa-exclamation-triangle";
                    }
                    
                    return (
                      <div key={product.product_id} className={`product-card ${product.quantity_available === 0 ? 'out-of-stock' : product.quantity_available <= product.reorder_point ? 'low-stock' : ''}`}
                        style={{ 
                          border: '1px solid #eee',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-8px)';
                          e.currentTarget.style.boxShadow = '0 12px 25px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.06)';
                        }}
                      >
                        <div className="product-image">
                          <img 
                            src={getProductImageUrl(product.product_id)} 
                            alt={product.product_name} 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = './src/assests/guddu.jpeg'; // Default image on error
                            }}
                          />
                        </div>
                        
                        <div className="product-info" style={{ padding: '20px' }}>
                          <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '15px'
                          }}>
                            <span className="product-category">{product.category}</span>
                            <span className={`availability-text ${availabilityLevel}`} style={{ 
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              backgroundColor: 
                                availabilityLevel === 'high' ? 'rgba(40, 199, 111, 0.1)' :
                                availabilityLevel === 'medium' ? 'rgba(255, 159, 67, 0.1)' :
                                'rgba(255, 90, 96, 0.1)'
                            }}>
                              <i className={`fas ${availabilityIcon}`}></i>
                              {availabilityText}
                            </span>
                          </div>
                          
                          <h3 className="product-title" style={{ fontSize: '1.25rem', marginBottom: '10px' }}>
                            {product.product_name}
                          </h3>
                          
                          <div className="product-price" style={{ marginBottom: '15px' }}>
                            <span className="price-amount">{formatCurrency(product.price)}</span>
                          </div>
                          
                          {/* New Availability Indicator */}
                          <div className="availability-indicator">
                            <div className="availability-bar">
                              <div 
                                className={`availability-bar-fill ${availabilityLevel}`} 
                                style={{ width: `${availabilityPercentage}%` }}
                              ></div>
                            </div>
                            <div style={{ 
                              fontWeight: '600',
                              fontSize: '0.95rem',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              width: '35px',
                              height: '35px',
                              borderRadius: '50%',
                              backgroundColor: 
                                availabilityLevel === 'high' ? 'rgba(40, 199, 111, 0.1)' :
                                availabilityLevel === 'medium' ? 'rgba(255, 159, 67, 0.1)' :
                                'rgba(255, 90, 96, 0.1)',
                              color: 
                                availabilityLevel === 'high' ? '#28C76F' :
                                availabilityLevel === 'medium' ? '#FF9F43' :
                                '#FF5A60'
                            }}>
                              {product.quantity_available}
                            </div>
                          </div>
                          
                          <div className="stock-management" style={{ marginTop: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                              <span className="stock-label" style={{ fontSize: '0.9rem' }}>Update Stock</span>
                              <small style={{ 
                                color: 'var(--gray-color)',
                                fontSize: '0.8rem',
                                fontStyle: 'italic' 
                              }}>
                                Reorder at: <b>{product.reorder_point}</b>
                              </small>
                            </div>
                            <div className="stock-controls">
                              <button 
                                className="stock-btn decrease"
                                onClick={() => handleAdjustStock(product.product_id, -1)}
                                disabled={product.quantity_available <= 0}
                                style={{
                                  backgroundColor: 'white',
                                  color: product.quantity_available <= 0 ? '#ccc' : '#FF5A60',
                                  border: `1px solid ${product.quantity_available <= 0 ? '#eee' : '#FF5A60'}`,
                                }}
                              >
                                <i className="fas fa-minus"></i>
                              </button>
                              <input
                                type="number"
                                value={product.quantity_available}
                                onChange={(e) => handleUpdateStock(
                                  product.product_id,
                                  parseInt(e.target.value) || 0
                                )}
                                min="0"
                                className="stock-input"
                              />
                              <button
                                className="stock-btn increase"
                                onClick={() => handleAdjustStock(product.product_id, 1)}
                                style={{
                                  backgroundColor: 'white',
                                  color: '#28C76F',
                                  border: '1px solid #28C76F',
                                }}
                              >
                                <i className="fas fa-plus"></i>
                              </button>
                            </div>
                          </div>

                          <div className="inventory-details" style={{
                            padding: '12px',
                            backgroundColor: 'rgba(248, 249, 250, 0.5)',
                            borderRadius: '8px',
                            marginTop: '15px',
                            marginBottom: '15px'
                          }}>
                            <div className="inventory-item">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                <i className="fas fa-box" style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}></i>
                                <span className="inventory-label">MOQ</span>
                                <span className="inventory-value" style={{ 
                                  backgroundColor: 'var(--primary-light)',
                                  color: 'var(--primary-color)',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '0.85rem',
                                  fontWeight: '600'
                                }}>{product.moq}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <i className="fas fa-history" style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}></i>
                                <span className="inventory-label">Last updated</span>
                                <span className="inventory-value" style={{ 
                                  fontSize: '0.85rem',
                                  color: 'var(--gray-color)',
                                  fontStyle: 'italic'
                                }}>Today</span>
                              </div>
                            </div>
                          </div>

                          <div className="product-actions">
                            <button
                              onClick={() => {
                                setFormData({
                                  name: product.product_name,
                                  category: product.category,
                                  price: product.price.toString(),
                                  stock: product.quantity_available.toString(),
                                  description: product.description || '',
                                  moq: product.moq.toString(),
                                  reorder_point: product.reorder_point.toString()
                                });
                                setEditingProductId(product.product_id);
                                setShowProductForm(true);
                              }}
                              className="action-btn edit"
                              title="Edit product"
                            >
                              <i className="fas fa-edit"></i> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.product_id)}
                              className="action-btn delete"
                              title="Delete product"
                            >
                              <i className="fas fa-trash"></i> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="orders-section">
              <div className="orders-header">
                <div className="filters">
                  <select 
                    value={orderFilter} 
                    onChange={(e) => setOrderFilter(e.target.value)}
                    className="order-filter"
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {ordersLoading ? (
                <div className="loading-spinner">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-shopping-cart"></i>
                  <h3>No orders found</h3>
                  <p>{orderFilter === 'all' ? 'You don\'t have any orders yet' : 'No orders match your filter criteria'}</p>
                </div>
              ) : (
                <div className="orders-grid">
                  {filteredOrders.map(order => (
                    <div key={order.id} className={`order-card order-${order.status.toLowerCase()}`}
                      style={{
                        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        backgroundColor: '#fff',
                        border: '1px solid #f0f0f0',
                        borderLeft: `4px solid ${
                          order.status === 'Pending' ? '#FF9F43' :
                          order.status === 'Processing' ? '#4A6FFF' :
                          order.status === 'Delivered' || order.status === 'Completed' ? '#28C76F' :
                          '#FF5A60'
                        }`
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
                      }}
                    >
                      <div className="order-header">
                        <div className="order-id" style={{ fontWeight: '700', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i className="fas fa-shopping-cart" style={{ color: '#4A6FFF' }}></i>
                          Order #{order.id}
                        </div>
                        <div className={`order-status status-${order.status.toLowerCase()}`}
                          style={{
                            padding: '6px 15px',
                            borderRadius: '20px',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            backgroundColor: 
                              order.status === 'Pending' ? 'rgba(255, 159, 67, 0.15)' :
                              order.status === 'Processing' ? 'rgba(74, 111, 255, 0.15)' :
                              order.status === 'Delivered' || order.status === 'Completed' ? 'rgba(40, 199, 111, 0.15)' :
                              'rgba(255, 90, 96, 0.15)',
                            color:
                              order.status === 'Pending' ? '#FF9F43' :
                              order.status === 'Processing' ? '#4A6FFF' :
                              order.status === 'Delivered' || order.status === 'Completed' ? '#28C76F' :
                              '#FF5A60'
                          }}
                        >
                          <i className={`fas ${
                            order.status === 'Pending' ? 'fa-clock' :
                            order.status === 'Processing' ? 'fa-spinner fa-spin' :
                            order.status === 'Delivered' || order.status === 'Completed' ? 'fa-check-circle' :
                            'fa-times-circle'
                          }`}></i>
                          {order.status}
                        </div>
                      </div>
                      
                      <div className="order-details" style={{ 
                        marginTop: '15px', 
                        padding: '15px',
                        backgroundColor: 'rgba(248, 249, 250, 0.5)',
                        borderRadius: '8px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '15px'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <span style={{ color: '#7A7C85', fontSize: '0.85rem' }}>Customer</span>
                          <span style={{ fontWeight: '600', color: '#2A2E43', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fas fa-user" style={{ color: '#4A6FFF', fontSize: '0.85rem' }}></i>
                            {order.customer?.name || 'N/A'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <span style={{ color: '#7A7C85', fontSize: '0.85rem' }}>Order Date</span>
                          <span style={{ fontWeight: '600', color: '#2A2E43', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fas fa-calendar" style={{ color: '#4A6FFF', fontSize: '0.85rem' }}></i>
                            {formatDate(order.orderDate)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', gridColumn: '1 / -1' }}>
                          <span style={{ color: '#7A7C85', fontSize: '0.85rem' }}>Total Amount</span>
                          <span style={{ 
                            fontWeight: '700', 
                            color: '#4A6FFF', 
                            fontSize: '1.25rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px'
                          }}>
                            <i className="fas fa-rupee-sign" style={{ fontSize: '1rem' }}></i>
                            {formatCurrency(order.totalAmount).replace('₹', '')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="order-items" style={{ 
                        marginTop: '15px',
                        maxHeight: '140px',
                        overflowY: 'auto',
                        padding: '15px 5px',
                        borderRadius: '8px'
                      }}>
                        <h4 style={{ 
                          margin: '0 0 10px 0', 
                          fontSize: '0.95rem', 
                          color: '#2A2E43',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <i className="fas fa-box-open" style={{ color: '#4A6FFF' }}></i>
                          Order Items ({order.items?.length || 0})
                        </h4>
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="order-item" style={{ 
                            padding: '10px', 
                            borderBottom: idx < order.items.length - 1 ? '1px solid #eee' : 'none',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: idx % 2 === 0 ? 'rgba(248, 249, 250, 0.5)' : 'transparent',
                            borderRadius: '6px'
                          }}>
                            <span className="item-name" style={{ fontWeight: '500', flex: '1' }}>{item.name}</span>
                            <span className="item-quantity" style={{ 
                              backgroundColor: 'rgba(74, 111, 255, 0.1)', 
                              color: '#4A6FFF',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              marginRight: '10px'
                            }}>x{item.quantity}</span>
                            <span className="item-price" style={{ fontWeight: '600', color: '#4A6FFF' }}>{formatCurrency(item.price)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="order-actions" style={{ 
                        display: 'flex', 
                        gap: '8px',
                        marginTop: '20px',
                        flexWrap: 'wrap'
                      }}>
                        {order.status === 'Pending' && (
                          <>
                            <button 
                              className="order-btn accept"
                              style={{
                                flex: '1',
                                minWidth: '120px',
                                padding: '10px 15px',
                                backgroundColor: '#28C76F',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s ease'
                              }}
                              onClick={() => handleOrderStatusChange(order.id, 'Processing')}
                              onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(40, 199, 111, 0.3)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <i className="fas fa-check"></i> Accept
                            </button>
                            <button 
                              className="order-btn reject"
                              style={{
                                flex: '1',
                                minWidth: '120px',
                                padding: '10px 15px',
                                backgroundColor: '#FF5A60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s ease'
                              }}
                              onClick={() => handleOrderStatusChange(order.id, 'Cancelled')}
                              onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(255, 90, 96, 0.3)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <i className="fas fa-times"></i> Reject
                            </button>
                          </>
                        )}
                        
                        {order.status === 'Processing' && (
                          <>
                            <button 
                              className="order-btn complete"
                              style={{
                                flex: '1',
                                minWidth: '120px',
                                padding: '10px 15px',
                                backgroundColor: '#28C76F',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s ease'
                              }}
                              onClick={() => handleOrderStatusChange(order.id, 'Completed')}
                              onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(40, 199, 111, 0.3)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <i className="fas fa-check-circle"></i> Mark as Complete
                            </button>
                            {!order.agent_id && (
                              <button 
                                className="order-btn assign"
                                style={{
                                  flex: '1',
                                  minWidth: '120px',
                                  padding: '10px 15px',
                                  backgroundColor: '#4A6FFF',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '10px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px',
                                  transition: 'all 0.2s ease'
                                }}
                                onClick={() => setShowDeliveryAssignModal({ show: true, orderId: order.id })}
                                onMouseEnter={e => {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(74, 111, 255, 0.3)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              >
                                <i className="fas fa-truck"></i> Assign Delivery
                              </button>
                            )}
                          </>
                        )}
                        
                        <button 
                          className="order-btn details"
                          style={{
                            flex: order.status !== 'Pending' && order.status !== 'Processing' ? '1' : 'initial',
                            minWidth: '120px',
                            padding: '10px 15px',
                            backgroundColor: 'rgba(248, 249, 250, 0.9)',
                            color: '#2A2E43',
                            border: '1px solid #eee',
                            borderRadius: '10px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => handleViewOrderDetails(order)}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.backgroundColor = '#edf2ff';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.backgroundColor = 'rgba(248, 249, 250, 0.9)';
                          }}
                        >
                          <i className="fas fa-eye"></i> View Details
                        </button>
                      </div>
                      
                      {/* Order timeline indicator */}
                      <div style={{ 
                        marginTop: '15px', 
                        paddingTop: '15px',
                        borderTop: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'center'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          width: '80%',
                          position: 'relative'
                        }}>
                          <div style={{ 
                            width: '100%', 
                            height: '3px', 
                            backgroundColor: '#eee',
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 1
                          }}></div>
                          
                          {/* Progress bar */}
                          <div style={{ 
                            width: 
                              order.status === 'Pending' ? '0%' :
                              order.status === 'Processing' ? '50%' :
                              order.status === 'Delivered' || order.status === 'Completed' ? '100%' :
                              order.status === 'Cancelled' ? '0%' : '0%',
                            height: '3px', 
                            backgroundColor: 
                              order.status === 'Cancelled' ? '#FF5A60' : '#28C76F',
                            position: 'absolute',
                            top: '50%',
                            left: 0,
                            transform: 'translateY(-50%)',
                            zIndex: 2,
                            transition: 'width 0.5s ease'
                          }}></div>
                          
                          {/* Order Timeline Steps */}
                          <div style={{ 
                            width: '20px', 
                            height: '20px', 
                            borderRadius: '50%', 
                            backgroundColor: 
                              order.status === 'Pending' || 
                              order.status === 'Processing' || 
                              order.status === 'Delivered' || 
                              order.status === 'Completed' ? '#28C76F' : 
                              '#FF5A60',
                            zIndex: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <i className="fas fa-check" style={{ fontSize: '0.7rem', color: 'white' }}></i>
                          </div>
                          
                          <div style={{ 
                            flexGrow: 1, 
                            display: 'flex', 
                            justifyContent: 'center' 
                          }}>
                            <div style={{ 
                              width: '20px', 
                              height: '20px', 
                              borderRadius: '50%', 
                              backgroundColor: 
                                order.status === 'Processing' || 
                                order.status === 'Delivered' || 
                                order.status === 'Completed' ? '#28C76F' : 
                                order.status === 'Cancelled' ? '#FF5A60' : 
                                '#eee',
                              zIndex: 3,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {(order.status === 'Processing' || order.status === 'Delivered' || order.status === 'Completed') && 
                                <i className="fas fa-truck" style={{ fontSize: '0.7rem', color: 'white' }}></i>
                              }
                              {order.status === 'Cancelled' && 
                                <i className="fas fa-times" style={{ fontSize: '0.7rem', color: 'white' }}></i>
                              }
                            </div>
                          </div>
                          
                          <div style={{ 
                            width: '20px', 
                            height: '20px', 
                            borderRadius: '50%', 
                            backgroundColor: 
                              order.status === 'Delivered' || 
                              order.status === 'Completed' ? '#28C76F' : 
                              order.status === 'Cancelled' ? '#FF5A60' : 
                              '#eee',
                            zIndex: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {(order.status === 'Delivered' || order.status === 'Completed') && 
                              <i className="fas fa-flag-checkered" style={{ fontSize: '0.7rem', color: 'white' }}></i>
                            }
                          </div>
                        </div>
                      </div>
                      
                      {/* Order timestamp */}
                      <div style={{ 
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginTop: '10px',
                        fontSize: '0.8rem',
                        color: '#7A7C85',
                        fontStyle: 'italic'
                      }}>
                        <span>
                          <i className="fas fa-history" style={{ marginRight: '5px' }}></i>
                          Last updated: {formatDate(order.updatedAt || order.orderDate)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="analytics-section">
              <div className="analytics-cards">
                <div className="analytics-card">
                  <h3>Revenue Overview</h3>
                  <div className="analytics-content">
                    <p>This feature will be available soon.</p>
                    <p>Track your sales performance, popular products, and business growth.</p>
                  </div>
                </div>
                
                <div className="analytics-card">
                  <h3>Product Performance</h3>
                  <div className="analytics-content">
                    <p>This feature will be available soon.</p>
                    <p>See which products are performing best and identify growth opportunities.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Form Modal */}
          {showProductForm && (
            <div className="modal-overlay" onClick={() => closeForm()}>
              <div className="product-form" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="form-close"
                  onClick={closeForm}
                  aria-label="Close form"
                >
                  <i className="fas fa-times"></i>
                </button>
                
                <div className="form-header">
                  <h3>{editingProductId ? 'Edit Product' : 'Add New Product'}</h3>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="product-name">Product Name</label>
                    <input
                      id="product-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={formErrors.name ? 'error-input' : ''}
                      placeholder="Enter product name"
                      required
                    />
                    {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="product-category">Category</label>
                      <select
                        id="product-category"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className={formErrors.category ? 'error-input' : ''}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Fresh Produce">Fresh Produce</option>
                        <option value="Dairy & Eggs">Dairy & Eggs</option>
                        <option value="Pantry Items">Pantry Items</option>
                        <option value="Wholesale">Wholesale</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Stationery">Stationery</option>
                        <option value="Textiles">Textiles</option>
                        <option value="Supermarket">Supermarket</option>
                        <option value="Restaurant">Restaurant</option>
                      </select>
                      {formErrors.category && <div className="error-message">{formErrors.category}</div>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="product-price">Price (₹)</label>
                      <input
                        id="product-price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className={formErrors.price ? 'error-input' : ''}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        required
                      />
                      {formErrors.price && <div className="error-message">{formErrors.price}</div>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="product-stock">Initial Stock</label>
                      <input
                        id="product-stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        className={formErrors.stock ? 'error-input' : ''}
                        min="0"
                        placeholder="0"
                        required
                      />
                      {formErrors.stock && <div className="error-message">{formErrors.stock}</div>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="product-moq">Minimum Order Quantity</label>
                      <input
                        id="product-moq"
                        type="number"
                        value={formData.moq}
                        onChange={(e) => setFormData({...formData, moq: e.target.value})}
                        className={formErrors.moq ? 'error-input' : ''}
                        min="1"
                        placeholder="1"
                        required
                      />
                      {formErrors.moq && <div className="error-message">{formErrors.moq}</div>}
                    </div>

                    <div className="form-group">
                      <label htmlFor="product-reorder">Reorder Point</label>
                      <input
                        id="product-reorder"
                        type="number"
                        value={formData.reorder_point}
                        onChange={(e) => setFormData({...formData, reorder_point: e.target.value})}
                        className={formErrors.reorder_point ? 'error-input' : ''}
                        min="0"
                        placeholder="10"
                        required
                      />
                      {formErrors.reorder_point && <div className="error-message">{formErrors.reorder_point}</div>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="product-description">Description</label>
                    <textarea
                      id="product-description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows="3"
                      placeholder="Describe your product (optional)"
                    />
                  </div>

                  <div className="form-group">
                    <label>Product Image</label>
                    <div 
                      className="image-upload-area"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="image-preview" />
                      ) : (
                        <div className="upload-placeholder">
                          <i className="fas fa-cloud-upload-alt"></i>
                          <p>Click to upload an image</p>
                          <span>or drag and drop</span>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData({...formData, image: file});
                            setImagePreview(URL.createObjectURL(file));
                          }
                        }}
                        accept="image/*"
                        style={{ display: 'none' }}
                      />
                    </div>
                  </div>

                  {formErrors.submit && (
                    <div className="form-error">{formErrors.submit}</div>
                  )}

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={closeForm}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <span className="spinner"></span>}
                      {isSubmitting ? 'Saving...' : (editingProductId ? 'Update Product' : 'Add Product')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delivery Agent Assignment Modal */}
          {showDeliveryAssignModal.show && (
            <div className="modal-overlay" onClick={() => setShowDeliveryAssignModal({ show: false, orderId: null })}>
              <div className="delivery-assign-modal" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="form-close"
                  onClick={() => setShowDeliveryAssignModal({ show: false, orderId: null })}
                  aria-label="Close form"
                >
                  <i className="fas fa-times"></i>
                </button>
                
                <div className="form-header">
                  <h3>Assign Delivery Agent</h3>
                </div>
                
                {isLoadingAgents ? (
                  <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading delivery agents...</p>
                  </div>
                ) : deliveryAgents.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-user"></i>
                    <h3>No delivery agents available</h3>
                    <p>Please add delivery agents to assign orders.</p>
                  </div>
                ) : (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!selectedDeliveryAgent) {
                      showNotification('Please select a delivery agent', 'error');
                      return;
                    }
                    handleAssignDelivery(showDeliveryAssignModal.orderId, parseInt(selectedDeliveryAgent));
                    setShowDeliveryAssignModal({ show: false, orderId: null });
                    setSelectedDeliveryAgent('');
                  }}>
                    <div className="form-group">
                      <label htmlFor="delivery-agent">Select Delivery Agent</label>
                      <select
                        id="delivery-agent"
                        value={selectedDeliveryAgent}
                        onChange={(e) => setSelectedDeliveryAgent(e.target.value)}
                        required
                      >
                        <option value="">Select Agent</option>
                        {deliveryAgents.map(agent => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name} ({agent.vehicle_type}) - {agent.contact_number}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="cancel-btn"
                        onClick={() => setShowDeliveryAssignModal({ show: false, orderId: null })}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="submit-btn"
                      >
                        Assign Agent
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Notification */}
          {notification.show && (
            <div className={`notification ${notification.type}`}>
              <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              <p>{notification.message}</p>
              <button 
                className="close-notification"
                onClick={() => setNotification({ ...notification, show: false })}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default MyShop;
