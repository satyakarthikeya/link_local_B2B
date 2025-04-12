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
      // You would typically get these from your API
      // For now we'll calculate from existing data
      const statsData = {
        totalProducts: products.length,
        lowStock: products.filter(p => p.quantity_available <= p.reorder_point && p.quantity_available > 0).length,
        outOfStock: products.filter(p => p.quantity_available === 0).length,
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
      // Use the productAPI method instead of direct api.get
      const response = await api.products.getBusinessProducts();
      console.log('Products fetched successfully:', response.data);
      setProducts(response.data || []);
      
      // Update stats after fetching products
      setTimeout(() => {
        fetchStats();
      }, 300);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      console.error('Error details:', error.response?.data || 'No detailed error information');
      console.error('Error status:', error.response?.status);
      
      // Show a more specific error message
      if (error.response?.status === 401) {
        showNotification('Authentication error. Please log in again.', 'error');
      } else if (error.response?.status === 403) {
        showNotification('You do not have permission to view these products.', 'error');
      } else if (error.response?.status === 500) {
        showNotification('Server error. The development team has been notified.', 'error');
      } else {
        showNotification('Failed to load products. Please try again.', 'error');
      }

      // Fallback to empty products array
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      console.log('Starting to fetch orders...');
      // Use the orderAPI method instead of direct api.get
      const response = await api.orders.getBusinessOrders('supplier');
      console.log('Orders fetched successfully:', response.data);
      setOrders(response.data || []);
      
      // Update stats after fetching orders
      setTimeout(() => {
        fetchStats();
      }, 300);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      console.error('Error details:', error.response?.data || 'No detailed error information');
      console.error('Error status:', error.response?.status);
      
      // Show a more specific error message
      if (error.response?.status === 401) {
        showNotification('Authentication error. Please log in again.', 'error');
      } else if (error.response?.status === 403) {
        showNotification('You do not have permission to view these orders.', 'error');
      } else if (error.response?.status === 500) {
        showNotification('Server error. The development team has been notified.', 'error');
      } else {
        showNotification('Failed to load orders. Please try again.', 'error');
      }
      
      // Fallback to empty orders array
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
      // Create a product data object using field names that match the server expectations
      const productData = {
        product_name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        quantity_available: parseInt(formData.stock),
        description: formData.description ? formData.description.trim() : '',
        moq: parseInt(formData.moq),
        reorder_point: parseInt(formData.reorder_point)
      };
      
      // Add the image if one was selected
      if (formData.image) {
        productData.image = formData.image;
      }
      
      // Validate numeric values
      if (isNaN(productData.price) || productData.price < 0) throw new Error('Invalid price');
      if (isNaN(productData.quantity_available) || productData.quantity_available < 0) throw new Error('Invalid stock quantity');
      if (isNaN(productData.moq) || productData.moq < 1) throw new Error('Invalid minimum order quantity');
      if (isNaN(productData.reorder_point) || productData.reorder_point < 0) throw new Error('Invalid reorder point');

      console.log('Submitting product with data:', JSON.stringify(productData, null, 2));
      
      let response;
      if (editingProductId !== null) {
        response = await api.products.updateProduct(editingProductId, productData);
        showNotification('Product updated successfully!');
      } else {
        response = await api.products.createProduct(productData);
        showNotification('New product added successfully!');
      }
      
      await fetchProducts();
      closeForm();
    } catch (error) {
      console.error("Error submitting form:", error);
      console.error("Error details:", error.response?.data || error.message);
      
      // Display a user-friendly error message
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to save product. Please try again.';
      setFormErrors({ submit: errorMessage });
      showNotification(errorMessage, 'error');
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
      const operation = adjustment > 0 ? 'add' : 'subtract';
      await api.products.updateQuantity(productId, Math.abs(adjustment), operation);
      await fetchProducts();
      showNotification(`Stock ${adjustment > 0 ? 'increased' : 'decreased'} successfully!`);
    } catch (error) {
      console.error("Error adjusting stock:", error);
      showNotification('Failed to adjust stock.', 'error');
    }
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

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Product name is required';
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
            <div className="stat-card">
              <div className="stat-icon products-icon">
                <i className="fas fa-box"></i>
              </div>
              <div className="stat-details">
                <h3>Total Products</h3>
                <p>{stats.totalProducts}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="stat-details">
                <h3>Low Stock Items</h3>
                <p>{stats.lowStock}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon danger-icon">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="stat-details">
                <h3>Out of Stock</h3>
                <p>{stats.outOfStock}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orders-icon">
                <i className="fas fa-shopping-cart"></i>
              </div>
              <div className="stat-details">
                <h3>Total Orders</h3>
                <p>{stats.totalOrders}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon pending-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-details">
                <h3>Pending Orders</h3>
                <p>{stats.pendingOrders}</p>
              </div>
            </div>
            <div className="stat-card">
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
                  {filteredProducts.map(product => (
                    <div key={product.product_id} className={`product-card ${product.quantity_available === 0 ? 'out-of-stock' : product.quantity_available <= product.reorder_point ? 'low-stock' : ''}`}>
                      <div className="product-image">
                        <img 
                          src={getProductImageUrl(product.product_id)} 
                          alt={product.product_name} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = './src/assests/guddu.jpeg'; // Default image on error
                          }}
                        />
                        {product.quantity_available === 0 ? (
                          <div className="stock-label out-of-stock">
                            <i className="fas fa-times-circle"></i>
                            Out of Stock
                          </div>
                        ) : product.quantity_available <= product.reorder_point ? (
                          <div className="stock-label low-stock">
                            <i className="fas fa-exclamation-triangle"></i>
                            Low Stock
                          </div>
                        ) : null}
                      </div>
                      
                      <div className="product-info">
                        <div className="product-header">
                          <h3 className="product-title">{product.product_name}</h3>
                          <span className="product-category">{product.category}</span>
                        </div>
                        
                        <div className="product-price">
                          <span className="price-amount">{formatCurrency(product.price)}</span>
                        </div>
                        
                        <div className="stock-management">
                          <div className="stock-label">Current Stock:</div>
                          <div className="stock-controls">
                            <button 
                              className="stock-btn decrease"
                              onClick={() => handleAdjustStock(product.product_id, -1)}
                              disabled={product.quantity_available <= 0}
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
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                        </div>

                        <div className="inventory-details">
                          <div className="inventory-item">
                            <span className="inventory-label">MOQ:</span> 
                            <span className="inventory-value">{product.moq}</span>
                          </div>
                          <div className="inventory-item">
                            <span className="inventory-label">Reorder at:</span> 
                            <span className="inventory-value">{product.reorder_point}</span>
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
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this product?')) {
                                try {
                                  await api.delete(`/products/${product.product_id}`);
                                  await fetchProducts();
                                  showNotification('Product deleted successfully!');
                                } catch (error) {
                                  console.error('Failed to delete product:', error);
                                  showNotification('Failed to delete product.', 'error');
                                }
                              }
                            }}
                            className="action-btn delete"
                            title="Delete product"
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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
                    <div key={order.id} className={`order-card order-${order.status.toLowerCase()}`}>
                      <div className="order-header">
                        <div className="order-id">{order.id}</div>
                        <div className={`order-status status-${order.status.toLowerCase()}`}>
                          {order.status}
                        </div>
                      </div>
                      
                      <div className="order-details">
                        <div className="order-customer">
                          <span className="order-label">Customer:</span>
                          <span className="order-value">{order.customer?.name || 'N/A'}</span>
                        </div>
                        <div className="order-date">
                          <span className="order-label">Order Date:</span>
                          <span className="order-value">{formatDate(order.orderDate)}</span>
                        </div>
                        <div className="order-total">
                          <span className="order-label">Total:</span>
                          <span className="order-value price">{formatCurrency(order.totalAmount)}</span>
                        </div>
                      </div>
                      
                      <div className="order-items">
                        <h4>Items ({order.items?.length || 0})</h4>
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="order-item">
                            <span className="item-name">{item.name}</span>
                            <span className="item-quantity">x{item.quantity}</span>
                            <span className="item-price">{formatCurrency(item.price)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="order-actions">
                        {order.status === 'Pending' && (
                          <>
                            <button 
                              className="order-btn accept"
                              onClick={() => handleOrderStatusChange(order.id, 'Processing')}
                            >
                              <i className="fas fa-check"></i> Accept
                            </button>
                            <button 
                              className="order-btn reject"
                              onClick={() => handleOrderStatusChange(order.id, 'Cancelled')}
                            >
                              <i className="fas fa-times"></i> Reject
                            </button>
                          </>
                        )}
                        
                        {order.status === 'Processing' && (
                          <button 
                            className="order-btn complete"
                            onClick={() => handleOrderStatusChange(order.id, 'Completed')}
                          >
                            <i className="fas fa-check-circle"></i> Mark as Complete
                          </button>
                        )}
                        
                        <button 
                          className="order-btn details"
                          onClick={() => navigate(`/order-details/${order.id}`)}
                        >
                          <i className="fas fa-eye"></i> View Details
                        </button>
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
