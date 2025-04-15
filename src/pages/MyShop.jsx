import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import B_Navbar from '../components/B_Navbar';
import '../styles/MyShop.css';
import api from '../utils/api';
import axios from 'axios';

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

  // New state for deals tab
  const [deals, setDeals] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(true);
  const [dealFilter, setDealFilter] = useState('all');
  const [showDealForm, setShowDealForm] = useState(false);
  const [editingDealId, setEditingDealId] = useState(null);
  const [dealFormData, setDealFormData] = useState({
    deal_type: '',
    discount_percentage: '',
    discount_amount: '',
    start_date: '',
    end_date: '',
    deal_title: '',
    deal_description: '',
    is_featured: false,
    product_id: ''
  });
  const [dealFormErrors, setDealFormErrors] = useState({});

  // Add this effect to fetch delivery agents when needed
  useEffect(() => {
    if (showDeliveryAssignModal.show) {
      fetchDeliveryAgents();
    }
  }, [showDeliveryAssignModal]);

  // Add this effect to enforce white theme for input elements
  useEffect(() => {
    document.querySelectorAll('input, select, textarea').forEach(input => {
      input.style.backgroundColor = '#ffffff';
      input.style.color = '#2c3e50';
      input.style.border = '1px solid #dcdde1';
    });
  }, []);

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
    const loadData = async () => {
      await fetchProducts();
      await fetchOrders();
      await fetchDeals(); // Added to fetch deals
      calculateStats();
    };
    loadData();
  }, []);

  // Fetch deals from the API
  const fetchDeals = async () => {
    try {
      setDealsLoading(true);
      console.log('Starting to fetch deals...');
      
      if (!currentUser || !currentUser.businessman_id) {
        throw new Error('User or business ID not available');
      }
      
      console.log('Fetching deals for businessman ID:', currentUser.businessman_id);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Direct API call with proper error handling
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/deals/business/${currentUser.businessman_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Deals API response:', response);
      
      if (response && response.data) {
        // Handle different possible response structures
        let dealsData = [];
        if (response.data.deals && Array.isArray(response.data.deals)) {
          dealsData = response.data.deals;
        } else if (Array.isArray(response.data)) {
          dealsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          dealsData = response.data.data;
        }
        
        console.log('Processed deals data:', dealsData);
        setDeals(dealsData);
      } else {
        console.log('No deals data found in response');
        setDeals([]);
      }
      setDealsLoading(false);
    } catch (error) {
      console.error('Error fetching deals:', error);
      showNotification('Failed to load deals. Please try again.', 'error');
      setDeals([]);
      setDealsLoading(false);
    }
  };

  // Updated: calculate stats based on current products, orders, and deals
  const calculateStats = () => {
    try {
      const statsData = {
        totalProducts: products.length,
        lowStock: products.filter(p => p.quantity_available > 0 && p.quantity_available <= p.reorder_point).length,
        outOfStock: products.filter(p => !p.quantity_available || p.quantity_available <= 0).length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'Pending').length,
        revenue: orders
          .filter(o => o.status === 'Delivered' || o.status === 'Completed')
          .reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0),
        activeDeals: deals.filter(d => 
          d.deal_info && 
          d.deal_info.is_active && 
          (!d.deal_info.end_date || new Date(d.deal_info.end_date) > new Date())
        ).length,
        featuredDeals: deals.filter(d => d.deal_info && d.deal_info.is_featured).length
      };
      setStats(statsData);
    } catch (error) {
      console.error('Failed to calculate stats:', error);
    }
  };

  // Check if we have the correct endpoint
  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch products...');
      // Modify the endpoint to match the server's expected path
      const response = await api.get('/products/business/products');
      console.log('Products fetched successfully:', response.data);
      // Make sure we're getting the actual products array from the response
      const productsData = response.data.products || response.data || [];
      setProducts(productsData);
      // Call calculateStats after updating products
      setTimeout(() => calculateStats(), 0);
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
      setTimeout(() => calculateStats(), 0);
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
        
        // Calculate and update stats after updating products
        setTimeout(() => calculateStats(), 0);
        
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
      // Make sure to recalculate stats after changing order status
      calculateStats();
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
      showNotification('Product deleted successfully!', 'success');
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete the product.';
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

  const validateDealForm = () => {
    const errors = {};
    
    // Required fields
    if (!dealFormData.deal_title || dealFormData.deal_title.trim().length < 3) {
      errors.deal_title = 'Deal title is required (min 3 characters)';
    }
    
    if (!dealFormData.deal_type) {
      errors.deal_type = 'Please select a deal type';
    }
    
    // Validation for discount deals
    if (dealFormData.deal_type === 'DISCOUNT') {
      if (!dealFormData.discount_percentage && !dealFormData.discount_amount) {
        errors.discount = 'Either discount percentage or amount is required';
      }
      
      if (dealFormData.discount_percentage) {
        const percentage = parseFloat(dealFormData.discount_percentage);
        if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
          errors.discount_percentage = 'Discount percentage must be between 1 and 100';
        }
      }
      
      if (dealFormData.discount_amount) {
        const amount = parseFloat(dealFormData.discount_amount);
        if (isNaN(amount) || amount <= 0) {
          errors.discount_amount = 'Discount amount must be greater than 0';
        }
      }
    }
    
    // Date validations - first make sure they're valid dates
    if (dealFormData.start_date) {
      const startDateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!startDateRegex.test(dealFormData.start_date)) {
        errors.start_date = 'Invalid start date format (should be YYYY-MM-DD)';
      } else {
        const startDate = new Date(dealFormData.start_date);
        if (isNaN(startDate.getTime())) {
          errors.start_date = 'Invalid start date';
        } else {
          // Validate start date isn't in the past
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (startDate < today) {
            errors.start_date = 'Start date cannot be in the past';
          }
        }
      }
    }
    
    if (dealFormData.end_date) {
      const endDateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!endDateRegex.test(dealFormData.end_date)) {
        errors.end_date = 'Invalid end date format (should be YYYY-MM-DD)';
      } else {
        const endDate = new Date(dealFormData.end_date);
        if (isNaN(endDate.getTime())) {
          errors.end_date = 'Invalid end date';
        }
      }
    }
    
    // Compare dates if both are valid
    if (dealFormData.start_date && dealFormData.end_date && 
        !errors.start_date && !errors.end_date) {
      const startDate = new Date(dealFormData.start_date);
      const endDate = new Date(dealFormData.end_date);
      
      if (endDate <= startDate) {
        errors.end_date = 'End date must be after start date';
      }
    }
    
    // Product validation for new deals
    if (!editingDealId && !dealFormData.product_id) {
      errors.product_id = 'Please select a product for this deal';
    }
    
    return errors;
  };

  const handleCreateOrUpdateDeal = async () => {
    try {
      setIsSubmitting(true);
      
      // Override styles for input elements to maintain white theme
      document.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], select, textarea').forEach(input => {
        input.style.backgroundColor = '#ffffff';
        input.style.color = '#2c3e50';
        input.style.border = '1px solid #dcdde1';
      });
      
      // Validate discount values
      const errors = {};
      if (dealFormData.deal_type === 'DISCOUNT') {
        // Ensure at least one discount field is provided
        if (!dealFormData.discount_percentage && !dealFormData.discount_amount) {
          errors.discount = 'Either discount percentage or amount is required';
        }
        
        // Validate percentage is between 0.01 and 100
        if (dealFormData.discount_percentage) {
          const percentage = parseFloat(dealFormData.discount_percentage);
          if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
            errors.discount_percentage = 'Discount percentage must be between 0.01 and 100';
          }
        }
        
        // Validate amount is greater than 0
        if (dealFormData.discount_amount) {
          const amount = parseFloat(dealFormData.discount_amount);
          if (isNaN(amount) || amount <= 0) {
            errors.discount_amount = 'Discount amount must be greater than 0';
          }
        }
      }
      
      // Check for any validation errors
      if (Object.keys(errors).length > 0) {
        setDealFormErrors(errors);
        setIsSubmitting(false);
        return;
      }
      
      // Prepare the deal data - make sure all fields are in the correct format
      const dealData = {
        deal_type: dealFormData.deal_type,
        deal_title: dealFormData.deal_title.trim(),
        deal_description: dealFormData.deal_description ? dealFormData.deal_description.trim() : '',
        is_featured: dealFormData.is_featured || false
      };
      
      // Only include discount percentage if it has a value and is valid
      if (dealFormData.discount_percentage) {
        dealData.discount_percentage = parseFloat(dealFormData.discount_percentage);
      }
      
      // Only include discount amount if it has a value and is valid
      if (dealFormData.discount_amount) {
        dealData.discount_amount = parseFloat(dealFormData.discount_amount);
      }
      
      // Format dates to ISO format if provided
      if (dealFormData.start_date) {
        dealData.start_date = new Date(dealFormData.start_date).toISOString().split('T')[0];
      }
      
      if (dealFormData.end_date) {
        dealData.end_date = new Date(dealFormData.end_date).toISOString().split('T')[0];
      }

      console.log(`${editingDealId ? 'Updating' : 'Creating'} deal with data:`, JSON.stringify(dealData, null, 2));
      
      let response;
      if (editingDealId) {
        // For updating an existing deal
        response = await api.deals.updateDeal(editingDealId, dealData);
        console.log('Deal updated successfully:', response);
        showNotification('Deal updated successfully!', 'success');
      } else {
        // For creating a new deal - make sure we have a product ID
        if (!dealFormData.product_id) {
          throw new Error('Product ID is required to create a deal.');
        }
        
        // Debug info to track the API call
        console.log(`Creating deal for product ID: ${dealFormData.product_id}`);
        console.log('Deal data:', dealData);
        
        response = await api.deals.createDeal(dealFormData.product_id, dealData);
        console.log('New deal created successfully:', response);
        showNotification('New deal created successfully!', 'success');
      }

      await fetchDeals();
      calculateStats(); // Update stats to reflect new/updated deal
      closeDealForm();
    } catch (error) {
      console.error('Error handling deal:', error);
      
      let errorMessage = 'Failed to process the deal.';
      
      if (error.response) {
        console.error('Server response error:', error.response);
        if (error.response.data && error.response.data.errors) {
          // Extract validation error messages from the array
          const validationErrors = error.response.data.errors;
          if (Array.isArray(validationErrors) && validationErrors.length > 0) {
            errorMessage = validationErrors.map(err => err.msg || err.message).join(', ');
            
            // Set specific field errors for better UI feedback
            const fieldErrors = {};
            validationErrors.forEach(err => {
              if (err.param) {
                fieldErrors[err.param] = err.msg || err.message;
              }
            });
            
            if (Object.keys(fieldErrors).length > 0) {
              setDealFormErrors({
                ...dealFormErrors,
                ...fieldErrors,
                submit: errorMessage
              });
            } else {
              setDealFormErrors({ ...dealFormErrors, submit: errorMessage });
            }
          } else {
            errorMessage = error.response.data.message || error.response.data.error || 
                          `Failed to ${editingDealId ? 'update' : 'create'} deal. Please try again.`;
            setDealFormErrors({ ...dealFormErrors, submit: errorMessage });
          }
        } else {
          errorMessage = error.response.data?.message || 
                        error.response.data?.error || 
                        `Failed to ${editingDealId ? 'update' : 'create'} deal. Please try again.`;
          setDealFormErrors({ ...dealFormErrors, submit: errorMessage });
        }
      } else if (error.message) {
        errorMessage = error.message;
        setDealFormErrors({ ...dealFormErrors, submit: errorMessage });
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDeal = async (dealId) => {
    if (!window.confirm('Are you sure you want to delete this deal? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deals.removeDeal(dealId);
      showNotification('Deal deleted successfully!', 'success');
      await fetchDeals();
    } catch (error) {
      console.error('Error deleting deal:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete the deal.';
      showNotification(errorMessage, 'error');
    }
  };

  const closeDealForm = () => {
    setShowDealForm(false);
    setEditingDealId(null);
    setDealFormData({
      deal_type: '',
      discount_percentage: '',
      discount_amount: '',
      start_date: '',
      end_date: '',
      deal_title: '',
      deal_description: '',
      is_featured: false,
      product_id: ''
    });
    setDealFormErrors({});
  };

  const handleRemoveDeal = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this deal? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.deals.removeDeal(productId);
      await fetchDeals();
      showNotification('Deal removed successfully!', 'success');
    } catch (error) {
      console.error('Failed to remove deal:', error);
      const errorMessage = error.response?.data?.error || 'Failed to remove deal.';
      showNotification(errorMessage, 'error');
    }
  };

  const handleToggleFeatureDeal = async (productId, currentFeaturedStatus) => {
    try {
      await api.deals.toggleFeaturedStatus(productId, !currentFeaturedStatus);
      await fetchDeals();
      showNotification(`Deal ${!currentFeaturedStatus ? 'featured' : 'unfeatured'} successfully!`, 'success');
    } catch (error) {
      console.error('Failed to update deal featured status:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update deal status.';
      showNotification(errorMessage, 'error');
    }
  };

  const handleAddDealFromProduct = (product) => {
    // Pre-populate the deal form with product data
    setDealFormData({
      product_id: product.product_id,
      deal_type: '',
      discount_percentage: '',
      discount_amount: '',
      start_date: '',
      end_date: '',
      deal_title: `Deal on ${product.product_name}`,
      deal_description: `Special offer for ${product.product_name}`,
      is_featured: false
    });
    
    // Switch to deals tab
    setActiveTab('deals');
    
    // Show notification about tab change
    showNotification('Switched to Deals tab. Please complete your deal details.', 'info');
    
    // Short delay before showing the form to ensure tab transition is visible
    setTimeout(() => {
      setEditingDealId(null);
      setShowDealForm(true);
    }, 300);
  };

  const handleSwitchToProducts = (filter = 'all') => {
    setStockFilter(filter);
    setActiveTab('products');
  };

  // Helper function to format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const renderProducts = () => {
    if (loading) {
      return <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i> Loading products...</div>;
    }
    
    if (products.length === 0) {
      return (
        <div className="no-items-message">
          <i className="fas fa-box"></i>
          <p>No products found. Start by adding your first product!</p>
          <button className="add-item-btn" onClick={() => setShowProductForm(true)}>
            <i className="fas fa-plus"></i> Add New Product
          </button>
        </div>
      );
    }

    // Filter products based on stock filter
    const filteredProducts = stockFilter === 'all' 
      ? products 
      : stockFilter === 'low-stock'
        ? products.filter(p => p.quantity_available > 0 && p.quantity_available <= p.reorder_point)
        : products.filter(p => !p.quantity_available || p.quantity_available <= 0);
    
    return (
      <>
        <div className="filter-controls">
          <div className="filters">
            <button 
              className={`filter-btn ${stockFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStockFilter('all')}
            >
              All Products
            </button>
            <button 
              className={`filter-btn ${stockFilter === 'low-stock' ? 'active' : ''}`}
              onClick={() => setStockFilter('low-stock')}
            >
              Low Stock
            </button>
            <button 
              className={`filter-btn ${stockFilter === 'out-of-stock' ? 'active' : ''}`}
              onClick={() => setStockFilter('out-of-stock')}
            >
              Out of Stock
            </button>
          </div>
          
          <button className="add-item-btn" onClick={() => {
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
            setShowProductForm(true);
          }}>
            <i className="fas fa-plus"></i> Add New Product
          </button>
        </div>
        
        <div className="items-grid">
          {filteredProducts.map(product => {
            const stockStatus = getStockStatus(product.quantity_available, product.reorder_point);
            
            return (
              <div 
                className={`product-card ${stockStatus.toLowerCase().replace(' ', '-')}`} 
                key={product.product_id}
                style={{
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  background: '#fff',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div 
                  className={`stock-tag ${stockStatus.toLowerCase().replace(' ', '-')}`}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    zIndex: 1,
                    backdropFilter: 'blur(5px)',
                    backgroundColor: stockStatus === 'Out of Stock' ? 'rgba(255, 59, 48, 0.9)' :
                                   stockStatus === 'Low Stock' ? 'rgba(255, 149, 0, 0.9)' :
                                   'rgba(52, 199, 89, 0.9)',
                    color: '#fff'
                  }}
                >
                  {stockStatus}
                </div>
                
                <div 
                  className="product-image"
                  style={{
                    height: '200px',
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '12px 12px 0 0'
                  }}
                >
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.product_name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    />
                  ) : (
                    <div 
                      className="no-image"
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        color: '#aaa'
                      }}
                    >
                      <i className="fas fa-image fa-3x"></i>
                    </div>
                  )}
                </div>
                
                <div 
                  className="product-details"
                  style={{
                    padding: '16px',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: '#2c3e50'
                    }}>
                      {product.product_name}
                    </h3>
                    <p style={{
                      color: '#7f8c8d',
                      fontSize: '0.9rem',
                      marginBottom: '8px'
                    }}>
                      {product.category}
                    </p>
                    <p style={{
                      fontSize: '1.3rem',
                      fontWeight: '700',
                      color: '#2ecc71',
                      marginBottom: '12px'
                    }}>
                      ₹{product.price.toLocaleString()}
                    </p>
                  </div>
                  
                  <div 
                    className="stock-info"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      padding: '8px 0',
                      borderTop: '1px solid #eee',
                      marginBottom: '12px'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="fas fa-box" style={{ color: '#7f8c8d' }}></i>
                      <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                        In Stock: {product.quantity_available || 0}
                      </span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="fas fa-shopping-basket" style={{ color: '#7f8c8d' }}></i>
                      <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                        Min Order: {product.moq || 1}
                      </span>
                    </span>
                  </div>
                  
                  <div 
                    className="stock-controls"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px'
                    }}
                  >
                    <button 
                      className="stock-btn decrease"
                      onClick={() => handleAdjustStock(product.product_id, -1)}
                      disabled={!product.quantity_available || product.quantity_available <= 0}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#f1f2f6',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    
                    <input 
                      type="number"
                      value={product.quantity_available || 0}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value);
                        if (!isNaN(newValue) && newValue >= 0) {
                          handleUpdateStock(product.product_id, newValue);
                        }
                      }}
                      min="0"
                      style={{
                        width: '80px',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #dcdde1',
                        textAlign: 'center'
                      }}
                    />
                    
                    <button 
                      className="stock-btn increase"
                      onClick={() => handleAdjustStock(product.product_id, 1)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#f1f2f6',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
                
                <div 
                  className="product-actions"
                  style={{
                    padding: '16px',
                    borderTop: '1px solid #eee',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <button 
                    className="action-btn primary"
                    onClick={() => handleAddDealFromProduct(product)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#2ecc71',
                      color: '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      width: '100%'
                    }}
                    onMouseEnter={e => e.target.style.background = '#27ae60'}
                    onMouseLeave={e => e.target.style.background = '#2ecc71'}
                  >
                    <i className="fas fa-tag"></i> Add Deal
                  </button>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="edit-btn"
                      onClick={() => {
                        setEditingProductId(product.product_id);
                        setFormData({
                          name: product.product_name,
                          category: product.category,
                          price: product.price.toString(),
                          stock: product.quantity_available ? product.quantity_available.toString() : '0',
                          description: product.description || '',
                          image: null,
                          moq: product.moq ? product.moq.toString() : '1',
                          reorder_point: product.reorder_point ? product.reorder_point.toString() : '10'
                        });
                        if (product.image_url) {
                          setImagePreview(product.image_url);
                        }
                        setShowProductForm(true);
                      }}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#3498db',
                        color: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        flex: 1
                      }}
                      onMouseEnter={e => e.target.style.background = '#2980b9'}
                      onMouseLeave={e => e.target.style.background = '#3498db'}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteProduct(product.product_id)}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#e74c3c',
                        color: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        flex: 1
                      }}
                      onMouseEnter={e => e.target.style.background = '#c0392b'}
                      onMouseLeave={e => e.target.style.background = '#e74c3c'}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderDeals = () => {
    if (dealsLoading) {
      return (
        <div className="loading-spinner" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          color: '#3498db'
        }}>
          <i className="fas fa-spinner fa-spin fa-3x" style={{ marginBottom: '15px' }}></i>
          <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Loading deals...</p>
        </div>
      );
    }
    
    if (deals.length === 0) {
      return (
        <div className="no-items-message" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 0',
          textAlign: 'center'
        }}>
          <i className="fas fa-percentage fa-3x" style={{ color: '#7f8c8d', marginBottom: '20px' }}></i>
          <p style={{ fontSize: '1.2rem', color: '#2c3e50', marginBottom: '25px' }}>
            No deals found. Create your first deal to attract more customers!
          </p>
          <button 
            className="add-item-btn" 
            onClick={() => {
              setEditingDealId(null);
              setDealFormData({
                deal_type: '',
                discount_percentage: '',
                discount_amount: '',
                start_date: '',
                end_date: '',
                deal_title: '',
                deal_description: '',
                is_featured: false,
                product_id: ''
              });
              setDealFormErrors({});
              setShowDealForm(true);
            }}
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              background: '#3498db',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <i className="fas fa-plus"></i> Create New Deal
          </button>
        </div>
      );
    }

    const filteredDeals = dealFilter === 'all' 
      ? deals 
      : deals.filter(deal => deal.deal_type === dealFilter);
    
    return (
      <>
        <div className="filter-controls">
          <div className="filters">
            <button 
              className={`filter-btn ${dealFilter === 'all' ? 'active' : ''}`}
              onClick={() => setDealFilter('all')}
            >
              All Deals
            </button>
            <button 
              className={`filter-btn ${dealFilter === 'DISCOUNT' ? 'active' : ''}`}
              onClick={() => setDealFilter('DISCOUNT')}
            >
              <i className="fas fa-percent"></i> Discounts
            </button>
            <button 
              className={`filter-btn ${dealFilter === 'BUY_ONE_GET_ONE' ? 'active' : ''}`}
              onClick={() => setDealFilter('BUY_ONE_GET_ONE')}
            >
              <i className="fas fa-gift"></i> BOGO
            </button>
            <button 
              className={`filter-btn ${dealFilter === 'FLASH_SALE' ? 'active' : ''}`}
              onClick={() => setDealFilter('FLASH_SALE')}
            >
              <i className="fas fa-bolt"></i> Flash Sales
            </button>
          </div>
          
          <button 
            className="add-item-btn" 
            onClick={() => {
              setEditingDealId(null);
              setDealFormData({
                deal_type: '',
                discount_percentage: '',
                discount_amount: '',
                start_date: '',
                end_date: '',
                deal_title: '',
                deal_description: '',
                is_featured: false,
                product_id: ''
              });
              setDealFormErrors({});
              setShowDealForm(true);
            }}
          >
            <i className="fas fa-plus"></i> New Deal
          </button>
        </div>
        
        <div className="deals-grid">
          {filteredDeals.map(deal => (
            <div 
              className="deal-card" 
              key={deal.deal_id || deal.id}
              data-type={deal.deal_type}
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                background: '#fff',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
            >
              <div 
                className="deal-tag"
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  zIndex: 1,
                  backdropFilter: 'blur(5px)',
                  backgroundColor: deal.deal_type === 'DISCOUNT' ? 'rgba(52, 152, 219, 0.9)' :
                                 deal.deal_type === 'FLASH_SALE' ? 'rgba(155, 89, 182, 0.9)' :
                                 'rgba(243, 156, 18, 0.9)',
                  color: '#fff'
                }}
              >
                {deal.deal_type === 'DISCOUNT' && <i className="fas fa-percent"></i>}
                {deal.deal_type === 'FLASH_SALE' && <i className="fas fa-bolt"></i>}
                {deal.deal_type === 'BUY_ONE_GET_ONE' && <i className="fas fa-gift"></i>}
                {' '}{deal.deal_type.replace(/_/g, ' ')}
              </div>

              <div 
                className="deal-details"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#2c3e50'
                  }}>{deal.deal_title}</h3>
                  {deal.deal_description && <p style={{
                    color: '#7f8c8d',
                    fontSize: '0.9rem',
                    marginBottom: '8px'
                  }}>{deal.deal_description}</p>}
                </div>
                
                {deal.deal_type === 'DISCOUNT' && (
                  <div 
                    className="discount-info"
                    style={{
                      background: '#f8f9fa',
                      padding: '12px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      marginBottom: '10px'
                    }}
                  >
                    {deal.discount_percentage ? (
                      <p className="discount-value" style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#e74c3c',
                        backgroundColor: '#ffffff',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #dcdde1'
                      }}>
                        <span className="value">{deal.discount_percentage}%</span>
                        <span className="label"> OFF</span>
                      </p>
                    ) : (
                      <p className="discount-value" style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: '#e74c3c',
                        backgroundColor: '#ffffff',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #dcdde1'
                      }}>
                        <span className="value">₹{deal.discount_amount}</span>
                        <span className="label"> OFF</span>
                      </p>
                    )}
                    
                    <div className="pricing-info" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      marginTop: '10px'
                    }}>
                      <span className="original-price" style={{
                        textDecoration: 'line-through',
                        color: '#95a5a6',
                        fontSize: '1rem'
                      }}>
                        ₹{deal.original_price || deal.price}
                      </span>
                      <span className="discounted-price" style={{
                        color: '#27ae60',
                        fontSize: '1.2rem',
                        fontWeight: '700'
                      }}>
                        ₹{deal.discounted_price || 
                          (deal.discount_percentage 
                            ? (deal.price - (deal.price * deal.discount_percentage / 100)).toFixed(2)
                            : (deal.price - deal.discount_amount).toFixed(2)
                          )}
                      </span>
                    </div>
                  </div>
                )}
                
                <div 
                  className="deal-meta"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    padding: '10px 0',
                    borderTop: '1px solid #eee',
                    borderBottom: '1px solid #eee',
                    marginBottom: '10px'
                  }}
                >
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.9rem',
                    color: '#7f8c8d'
                  }}>
                    <i className="fas fa-calendar-alt"></i> 
                    {deal.start_date ? new Date(deal.start_date).toLocaleDateString() : 'No start date'} 
                    {deal.end_date ? ` - ${new Date(deal.end_date).toLocaleDateString()}` : ''}
                  </span>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.9rem',
                    color: '#7f8c8d'
                  }}>
                    <i className="fas fa-box"></i>
                    {deal.product_name || 'Product'}
                  </span>
                </div>
                
                {deal.is_featured && (
                  <div 
                    className="featured-badge"
                    style={{
                      background: '#f39c12',
                      color: '#fff',
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      marginBottom: '10px'
                    }}
                  >
                    <i className="fas fa-star"></i> Featured
                  </div>
                )}

                <div 
                  className="deal-actions"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginTop: 'auto'
                  }}
                >
                  <button 
                    className="edit-btn" 
                    onClick={() => {
                      setEditingDealId(deal.deal_id || deal.id);
                      setDealFormData({
                        deal_type: deal.deal_type,
                        discount_percentage: deal.discount_percentage || '',
                        discount_amount: deal.discount_amount || '',
                        start_date: deal.start_date ? deal.start_date.split('T')[0] : '',
                        end_date: deal.end_date ? deal.end_date.split('T')[0] : '',
                        deal_title: deal.deal_title,
                        deal_description: deal.deal_description || '',
                        is_featured: deal.is_featured || false,
                        product_id: deal.product_id
                      });
                      setShowDealForm(true);
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#3498db',
                      color: '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      width: '100%',
                      fontWeight: '600'
                    }}
                    onMouseEnter={e => e.target.style.background = '#2980b9'}
                    onMouseLeave={e => e.target.style.background = '#3498db'}
                  >
                    <i className="fas fa-edit"></i> Edit Deal
                  </button>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDeleteDeal(deal.deal_id || deal.id)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#e74c3c',
                      color: '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      width: '100%',
                      fontWeight: '600'
                    }}
                    onMouseEnter={e => e.target.style.background = '#c0392b'}
                    onMouseLeave={e => e.target.style.background = '#e74c3c'}
                  >
                    <i className="fas fa-trash-alt"></i> Remove Deal
                  </button>
                  
                  <button 
                    className="feature-btn" 
                    onClick={() => handleToggleFeatureDeal(deal.deal_id || deal.id, deal.is_featured)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      background: deal.is_featured ? '#f1c40f' : '#dfe6e9',
                      color: deal.is_featured ? '#fff' : '#576574',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      width: '100%',
                      fontWeight: '600'
                    }}
                  >
                    <i className={`fas ${deal.is_featured ? 'fa-star' : 'fa-star'}`}></i> 
                    {deal.is_featured ? 'Unfeature Deal' : 'Feature Deal'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderOrders = () => {
    if (ordersLoading) {
      return <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i> Loading orders...</div>;
    }
    
    if (orders.length === 0) {
      return (
        <div className="no-items-message">
          <i className="fas fa-shopping-cart"></i>
          <p>No orders found. Check back later for incoming orders!</p>
        </div>
      );
    }

    // Filter orders based on status filter
    const filteredOrders = orderFilter === 'all' 
      ? orders 
      : orders.filter(order => order.status.toLowerCase() === orderFilter.toLowerCase());
    
    return (
      <>
        <div className="filter-controls">
          <div className="filters">
            <button 
              className={`filter-btn ${orderFilter === 'all' ? 'active' : ''}`}
              onClick={() => setOrderFilter('all')}
            >
              All Orders
            </button>
            <button 
              className={`filter-btn ${orderFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setOrderFilter('pending')}
            >
              <span className="status-dot pending"></span> Pending
            </button>
            <button 
              className={`filter-btn ${orderFilter === 'processing' ? 'active' : ''}`}
              onClick={() => setOrderFilter('processing')}
            >
              <span className="status-dot processing"></span> Processing
            </button>
            <button 
              className={`filter-btn ${orderFilter === 'shipped' ? 'active' : ''}`}
              onClick={() => setOrderFilter('shipped')}
            >
              <span className="status-dot shipped"></span> Shipped
            </button>
            <button 
              className={`filter-btn ${orderFilter === 'delivered' ? 'active' : ''}`}
              onClick={() => setOrderFilter('delivered')}
            >
              <span className="status-dot delivered"></span> Delivered
            </button>
            <button 
              className={`filter-btn ${orderFilter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setOrderFilter('cancelled')}
            >
              <span className="status-dot cancelled"></span> Cancelled
            </button>
          </div>
        </div>
        
        <div className="orders-grid">
          {filteredOrders.map(order => (
            <div 
              className={`order-card status-${order.status.toLowerCase()}`} 
              key={order.order_id}
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                background: '#fff',
                transition: 'all 0.3s ease',
                position: 'relative',
                border: `1px solid ${
                  order.status.toLowerCase() === 'pending' ? '#f39c12' : 
                  order.status.toLowerCase() === 'processing' ? '#3498db' :
                  order.status.toLowerCase() === 'shipped' ? '#9b59b6' :
                  order.status.toLowerCase() === 'delivered' ? '#2ecc71' :
                  '#e74c3c'
                }`
              }}
            >
              <div 
                className={`order-status-header status-${order.status.toLowerCase()}`}
                style={{
                  padding: '10px 16px',
                  background: 
                    order.status.toLowerCase() === 'pending' ? '#f39c12' : 
                    order.status.toLowerCase() === 'processing' ? '#3498db' :
                    order.status.toLowerCase() === 'shipped' ? '#9b59b6' :
                    order.status.toLowerCase() === 'delivered' ? '#2ecc71' :
                    '#e74c3c',
                  color: '#fff',
                  fontWeight: '600',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <i className={
                    order.status.toLowerCase() === 'pending' ? 'fas fa-clock' : 
                    order.status.toLowerCase() === 'processing' ? 'fas fa-cog fa-spin' :
                    order.status.toLowerCase() === 'shipped' ? 'fas fa-shipping-fast' :
                    order.status.toLowerCase() === 'delivered' ? 'fas fa-check-circle' :
                    'fas fa-times-circle'
                  }></i> {order.status}
                </div>
                <div style={{ fontSize: '0.9em', opacity: 0.9 }}>
                  Order #{String(order.order_id).slice(0,8)}
                </div>
              </div>
              
              <div 
                className="order-info"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div className="order-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="order-date" style={{ fontSize: '0.9em', color: '#7f8c8d' }}>
                    <i className="fas fa-calendar-alt"></i> 
                    {new Date(order.order_date).toLocaleDateString()}
                  </span>
                  <span style={{ fontSize: '0.9em', color: '#7f8c8d' }}>•</span>
                  <span className="order-time" style={{ fontSize: '0.9em', color: '#7f8c8d' }}>
                    <i className="fas fa-clock"></i> 
                    {new Date(order.order_date).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="customer-info">
                  <div className="customer-details" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    marginBottom: '10px'
                  }}>
                    <div className="avatar" style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#3498db',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: '600'
                    }}>
                      {order.customer_name ? order.customer_name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', marginBottom: '2px' }}>
                        {order.customer_name || 'Customer'}
                      </p>
                      <p style={{ fontSize: '0.9em', display: 'flex', alignItems: 'center', gap: '4px', color: '#7f8c8d' }}>
                        <i className="fas fa-phone"></i> {order.contact_number || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="order-items-overview" style={{ marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Order Summary</h4>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    gap: '6px', 
                    marginBottom: '10px'
                  }}>
                    {order.items && order.items.map((item, i) => (
                      <div key={i} style={{
                        padding: '6px 10px',
                        background: '#f1f2f6',
                        borderRadius: '4px',
                        fontSize: '0.9em',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.quantity}× {item.product_name}
                      </div>
                    ))}
                    {(!order.items || order.items.length === 0) && (
                      <div style={{ color: '#7f8c8d', fontSize: '0.9em' }}>
                        No items information available
                      </div>
                    )}
                  </div>
                  <div className="order-financial" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderTop: '1px dashed #ddd',
                    borderBottom: '1px dashed #ddd',
                  }}>
                    <div>
                      <span style={{ fontWeight: '600' }}>Total Amount:</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: '700', color: '#2ecc71', fontSize: '1.1em' }}>
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="delivery-info" style={{ marginBottom: '12px', fontSize: '0.9em' }}>
                  {order.shipping_address && (
                    <p style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px', color: '#7f8c8d' }}>
                      <i className="fas fa-map-marker-alt" style={{ marginTop: '4px' }}></i>
                      <span>{order.shipping_address}</span>
                    </p>
                  )}
                  {order.delivery_agent && (
                    <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7f8c8d' }}>
                      <i className="fas fa-truck"></i>
                      <span>Delivery by: {order.delivery_agent}</span>
                    </p>
                  )}
                </div>
              </div>
              
              <div className="order-actions" style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  className="view-btn" 
                  onClick={() => handleViewOrderDetails(order)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#f1f2f6',
                    color: '#2c3e50',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    width: '100%',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={e => e.target.style.background = '#dfe6e9'}
                  onMouseLeave={e => e.target.style.background = '#f1f2f6'}
                >
                  <i className="fas fa-eye"></i> View Details
                </button>
                
                <div className="status-actions" style={{ display: 'flex', gap: '8px' }}>
                  {order.status === 'Pending' && (
                    <>
                      <button 
                        className="action-btn accept" 
                        onClick={() => handleOrderStatusChange(order.order_id, 'Processing')}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#2ecc71',
                          color: '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          flex: 1,
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={e => e.target.style.background = '#27ae60'}
                        onMouseLeave={e => e.target.style.background = '#2ecc71'}
                      >
                        <i className="fas fa-check"></i> Accept
                      </button>
                      <button 
                        className="action-btn reject" 
                        onClick={() => handleOrderStatusChange(order.order_id, 'Cancelled')}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#e74c3c',
                          color: '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          flex: 1,
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={e => e.target.style.background = '#c0392b'}
                        onMouseLeave={e => e.target.style.background = '#e74c3c'}
                      >
                        <i className="fas fa-times"></i> Reject
                      </button>
                    </>
                  )}
                  
                  {order.status === 'Processing' && (
                    <button 
                      className="action-btn ship" 
                      onClick={() => setShowDeliveryAssignModal({ show: true, orderId: order.order_id })}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#9b59b6',
                        color: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        width: '100%',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={e => e.target.style.background = '#8e44ad'}
                      onMouseLeave={e => e.target.style.background = '#9b59b6'}
                    >
                      <i className="fas fa-shipping-fast"></i> Assign Delivery
                    </button>
                  )}
                  
                  {order.status === 'Shipped' && (
                    <button 
                      className="action-btn complete" 
                      onClick={() => handleOrderStatusChange(order.order_id, 'Delivered')}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#2ecc71',
                        color: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        width: '100%',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={e => e.target.style.background = '#27ae60'}
                      onMouseLeave={e => e.target.style.background = '#2ecc71'}
                    >
                      <i className="fas fa-flag-checkered"></i> Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Delivery Assignment Modal */}
        {showDeliveryAssignModal.show && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Assign Delivery Agent</h3>
              
              {isLoadingAgents ? (
                <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i> Loading agents...</div>
              ) : (
                <>
                  <select 
                    value={selectedDeliveryAgent} 
                    onChange={(e) => setSelectedDeliveryAgent(e.target.value)}
                    className="agent-select"
                  >
                    <option value="">Select a delivery agent</option>
                    {deliveryAgents.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} ({agent.vehicle_type}) - {agent.contact_number}
                      </option>
                    ))}
                  </select>
                  
                  <div className="modal-actions">
                    <button 
                      className="action-btn primary" 
                      onClick={() => {
                        if (selectedDeliveryAgent) {
                          handleAssignDelivery(showDeliveryAssignModal.orderId, selectedDeliveryAgent);
                          handleOrderStatusChange(showDeliveryAssignModal.orderId, 'Shipped');
                          setShowDeliveryAssignModal({ show: false, orderId: null });
                          setSelectedDeliveryAgent('');
                        } else {
                          showNotification('Please select a delivery agent', 'error');
                        }
                      }}
                      disabled={!selectedDeliveryAgent}
                    >
                      <i className="fas fa-check"></i> Assign & Ship
                    </button>
                    <button 
                      className="action-btn secondary" 
                      onClick={() => {
                        setShowDeliveryAssignModal({ show: false, orderId: null });
                        setSelectedDeliveryAgent('');
                      }}
                    >
                      <i className="fas fa-times"></i> Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Order Detail Modal */}
        {showOrderDetailModal.show && showOrderDetailModal.order && (
          <div className="modal-overlay">
            <div className="modal-content order-detail-modal">
              <h3>Order Details</h3>
              <div className="order-id-header">
                <span>Order #: {showOrderDetailModal.order.order_id}</span>
                <span 
                  className={`status-badge ${showOrderDetailModal.order.status.toLowerCase()}`}
                >
                  {showOrderDetailModal.order.status}
                </span>
              </div>
              
              <div className="order-detail-section">
                <h4>Customer Information</h4>
                <div className="customer-details">
                  <p><strong>Name:</strong> {showOrderDetailModal.order.customer_name || 'N/A'}</p>
                  <p><strong>Phone:</strong> {showOrderDetailModal.order.contact_number || 'N/A'}</p>
                  <p><strong>Email:</strong> {showOrderDetailModal.order.email || 'N/A'}</p>
                </div>
              </div>
              
              <div className="order-detail-section">
                <h4>Shipping Information</h4>
                <div className="shipping-details">
                  <p><strong>Address:</strong> {showOrderDetailModal.order.shipping_address || 'N/A'}</p>
                  <p><strong>City:</strong> {showOrderDetailModal.order.city || 'N/A'}</p>
                  <p><strong>Delivery Agent:</strong> {showOrderDetailModal.order.delivery_agent || 'Not assigned yet'}</p>
                </div>
              </div>
              
              <div className="order-detail-section">
                <h4>Order Items</h4>
                <div className="order-items-list">
                  {showOrderDetailModal.order.items && showOrderDetailModal.order.items.length > 0 ? (
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {showOrderDetailModal.order.items.map((item, index) => (
                          <tr key={`order-item-${item.product_id || index}`}>
                            <td>{item.product_name}</td>
                            <td>{item.quantity}</td>
                            <td>{formatCurrency(item.price)}</td>
                            <td>{formatCurrency(item.quantity * item.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3" className="text-right"><strong>Subtotal</strong></td>
                          <td>{formatCurrency(showOrderDetailModal.order.subtotal || showOrderDetailModal.order.totalAmount)}</td>
                        </tr>
                        {showOrderDetailModal.order.taxes && (
                          <tr>
                            <td colSpan="3" className="text-right">Taxes</td>
                            <td>{formatCurrency(showOrderDetailModal.order.taxes)}</td>
                          </tr>
                        )}
                        {showOrderDetailModal.order.shipping_fee && (
                          <tr>
                            <td colSpan="3" className="text-right">Shipping</td>
                            <td>{formatCurrency(showOrderDetailModal.order.shipping_fee)}</td>
                          </tr>
                        )}
                        <tr className="total-row">
                          <td colSpan="3" className="text-right"><strong>Total</strong></td>
                          <td>{formatCurrency(showOrderDetailModal.order.totalAmount)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  ) : (
                    <p>No items found for this order.</p>
                  )}
                </div>
              </div>
              
              <div className="order-detail-section">
                <h4>Payment Information</h4>
                <div className="payment-details">
                  <p><strong>Payment Method:</strong> {showOrderDetailModal.order.payment_method || 'N/A'}</p>
                  <p><strong>Payment Status:</strong> {showOrderDetailModal.order.payment_status || 'N/A'}</p>
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="action-btn secondary" 
                  onClick={() => setShowOrderDetailModal({ show: false, order: null })}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderProductForm = () => {
    if (!showProductForm) return null;
    
    return (
      <div className="modal-overlay">
        <div className="product-form">
          <button 
            className="form-close" 
            onClick={closeForm}
          >
            <i className="fas fa-times"></i>
          </button>

          <div className="form-header">
            <h3>{editingProductId ? 'Edit Product' : 'Add New Product'}</h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={formErrors.name ? 'error-input' : ''}
                  placeholder="Enter product name"
                />
                {formErrors.name && <div className="error-message">{formErrors.name}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className={formErrors.category ? 'error-input' : ''}
                >
                  <option value="">Select a category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Food">Food</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Other">Other</option>
                </select>
                {formErrors.category && <div className="error-message">{formErrors.category}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price (₹)</label>
                <input
                  type="number"
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className={formErrors.price ? 'error-input' : ''}
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                />
                {formErrors.price && <div className="error-message">{formErrors.price}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="stock">Stock Quantity</label>
                <input
                  type="number"
                  id="stock"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className={formErrors.stock ? 'error-input' : ''}
                  placeholder="Enter stock quantity"
                  min="0"
                />
                {formErrors.stock && <div className="error-message">{formErrors.stock}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="moq">Minimum Order Quantity</label>
                <input
                  type="number"
                  id="moq"
                  value={formData.moq}
                  onChange={(e) => setFormData({...formData, moq: e.target.value})}
                  className={formErrors.moq ? 'error-input' : ''}
                  placeholder="Enter minimum order quantity"
                  min="1"
                />
                {formErrors.moq && <div className="error-message">{formErrors.moq}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="reorder_point">Reorder Point</label>
                <input
                  type="number"
                  id="reorder_point"
                  value={formData.reorder_point}
                  onChange={(e) => setFormData({...formData, reorder_point: e.target.value})}
                  className={formErrors.reorder_point ? 'error-input' : ''}
                  placeholder="Enter reorder point"
                  min="0"
                />
                {formErrors.reorder_point && <div className="error-message">{formErrors.reorder_point}</div>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className={formErrors.description ? 'error-input' : ''}
                placeholder="Enter product description"
                rows="4"
              />
              {formErrors.description && <div className="error-message">{formErrors.description}</div>}
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
                    <p>Click to upload image</p>
                    <span>or drag and drop</span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
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

            {formErrors.submit && <div className="form-error">{formErrors.submit}</div>}

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={closeForm}>
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting && <span className="spinner"></span>}
                {editingProductId ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return renderProducts();
      case 'deals':
        console.log('Rendering deals tab with', deals.length, 'deals');
        return renderDeals();
      case 'orders':
        return renderOrders();
      case 'analytics':
        return <div className="coming-soon">Analytics feature coming soon!</div>;
      default:
        return renderProducts();
    }
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
              <div className="stat-icon deals-icon">
                <i className="fas fa-percentage"></i>
              </div>
              <div className="stat-details">
                <h3>Active Deals</h3>
                <p>{stats.activeDeals || 0}</p>
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
              className={`tab-btn ${activeTab === 'deals' ? 'active' : ''}`}
              onClick={() => setActiveTab('deals')}
            >
              <i className="fas fa-percentage"></i> Deals & Offers
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

          {/* Render Tab Content */}
          {renderTabContent()}
          
          {/* Product Form Modal */}
          {renderProductForm()}

          {/* Deal Form Modal - Move this outside the renderDeals function */}
          {showDealForm && (
          <div className="modal-overlay">
            <div className="product-form deal-form" style={{ width: '90%', maxWidth: '600px' }}>
              <button 
                className="form-close" 
                onClick={closeDealForm}
                style={{
                  position: 'absolute',
                  right: '15px',
                  top: '15px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: '#555'
                }}
              >
                <i className="fas fa-times"></i>
              </button>

              <div className="form-header" style={{ marginBottom: '20px', textAlign: 'center' }}>
                <h3 style={{ color: '#2c3e50', fontSize: '1.5rem' }}>
                  {editingDealId ? 'Edit Deal' : 'Create New Deal'}
                </h3>
                <p style={{ color: '#7f8c8d', fontSize: '0.9rem', marginTop: '5px' }}>
                  {editingDealId ? 'Update your deal details' : 'Add a new deal to attract more customers'}
                </p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const errors = validateDealForm();
                if (Object.keys(errors).length > 0) {
                  setDealFormErrors(errors);
                  return;
                }
                handleCreateOrUpdateDeal();
              }}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="deal_title" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Deal Title <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="deal_title"
                      value={dealFormData.deal_title}
                      onChange={(e) => setDealFormData({...dealFormData, deal_title: e.target.value})}
                      className={dealFormErrors.deal_title ? 'error-input' : ''}
                      placeholder="Enter deal title"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: dealFormErrors.deal_title ? '1px solid #e74c3c' : '1px solid #dcdde1',
                        fontSize: '0.9rem'
                      }}
                    />
                    {dealFormErrors.deal_title && (
                      <div className="error-message" style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '5px' }}>
                        <i className="fas fa-exclamation-circle"></i> {dealFormErrors.deal_title}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="deal_type" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Deal Type <span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      id="deal_type"
                      value={dealFormData.deal_type}
                      onChange={(e) => setDealFormData({...dealFormData, deal_type: e.target.value})}
                      className={dealFormErrors.deal_type ? 'error-input' : ''}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: dealFormErrors.deal_type ? '1px solid #e74c3c' : '1px solid #dcdde1',
                        fontSize: '0.9rem',
                        backgroundColor: '#fff'
                      }}
                    >
                      <option value="">Select deal type</option>
                      <option value="DISCOUNT">Discount</option>
                      <option value="BUY_ONE_GET_ONE">Buy One Get One</option>
                      <option value="FLASH_SALE">Flash Sale</option>
                    </select>
                    {dealFormErrors.deal_type && (
                      <div className="error-message" style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '5px' }}>
                        <i className="fas fa-exclamation-circle"></i> {dealFormErrors.deal_type}
                      </div>
                    )}
                  </div>
                </div>

                {dealFormData.deal_type === 'DISCOUNT' && (
                  <div className="discount-options" style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '15px', 
                    borderRadius: '8px',
                    marginBottom: '15px'
                  }}>
                    <p style={{ fontSize: '0.9rem', marginBottom: '10px', fontWeight: '500', color: '#e67e22' }}>
                      <i className="fas fa-info-circle"></i> Choose either percentage OR amount discount
                    </p>
                    <div className="form-row">
                      <div className="form-group" style={{ 
                        opacity: dealFormData.discount_amount ? '0.5' : '1',
                        transition: 'opacity 0.3s'
                      }}>
                        <label htmlFor="discount_percentage" style={{ 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontWeight: '500',
                          color: dealFormData.discount_percentage ? '#2980b9' : '#7f8c8d'
                        }}>
                          Discount Percentage (%)
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="number"
                            id="discount_percentage"
                            value={dealFormData.discount_percentage}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDealFormData({
                                ...dealFormData, 
                                discount_percentage: val,
                                discount_amount: val ? '' : dealFormData.discount_amount
                              });
                            }}
                            className={dealFormErrors.discount_percentage ? 'error-input' : ''}
                            placeholder="e.g., 10"
                            min="0"
                            max="100"
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '6px',
                              border: dealFormData.discount_percentage 
                                ? '2px solid #3498db' 
                                : dealFormErrors.discount_percentage 
                                  ? '1px solid #e74c3c' 
                                  : '1px solid #dcdde1',
                              fontSize: '0.9rem',
                              backgroundColor: dealFormData.discount_amount ? '#f5f5f5' : '#ffffff',
                              color: '#333333',
                              cursor: dealFormData.discount_amount ? 'not-allowed' : 'text'
                            }}
                          />
                          <span style={{ 
                            position: 'absolute', 
                            right: '10px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            color: dealFormData.discount_percentage ? '#3498db' : '#7f8c8d' 
                          }}>%</span>
                        </div>
                        {dealFormErrors.discount_percentage && (
                          <div className="error-message" style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '5px' }}>
                            <i className="fas fa-exclamation-circle"></i> {dealFormErrors.discount_percentage}
                          </div>
                        )}
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        margin: '0 15px',
                        position: 'relative'
                      }}>
                        <span style={{ 
                          fontWeight: 'bold', 
                          color: '#7f8c8d',
                          background: '#f8f9fa',
                          padding: '5px 10px',
                          borderRadius: '50%',
                          border: '1px solid #dcdde1'
                        }}>OR</span>
                      </div>

                      <div className="form-group" style={{ 
                        opacity: dealFormData.discount_percentage ? '0.5' : '1',
                        transition: 'opacity 0.3s'
                      }}>
                        <label htmlFor="discount_amount" style={{ 
                          display: 'block', 
                          marginBottom: '8px', 
                          fontWeight: '500',
                          color: dealFormData.discount_amount ? '#27ae60' : '#7f8c8d'
                        }}>
                          Discount Amount
                        </label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ 
                            position: 'absolute', 
                            left: '10px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            color: dealFormData.discount_amount ? '#27ae60' : '#7f8c8d' 
                          }}>₹</span>
                          <input
                            type="number"
                            id="discount_amount"
                            value={dealFormData.discount_amount}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDealFormData({
                                ...dealFormData, 
                                discount_amount: val,
                                discount_percentage: val ? '' : dealFormData.discount_percentage
                              });
                            }}
                            className={dealFormErrors.discount_amount ? 'error-input' : ''}
                            placeholder="e.g., 100"
                            min="0"
                            style={{
                              width: '100%',
                              padding: '10px 12px 10px 25px',
                              borderRadius: '6px',
                              border: dealFormData.discount_amount 
                                ? '2px solid #2ecc71' 
                                : dealFormErrors.discount_amount 
                                  ? '1px solid #e74c3c' 
                                  : '1px solid #dcdde1',
                              fontSize: '0.9rem',
                              backgroundColor: dealFormData.discount_percentage ? '#f5f5f5' : '#ffffff',
                              color: '#333333',
                              cursor: dealFormData.discount_percentage ? 'not-allowed' : 'text'
                            }}
                          />
                        </div>
                        {dealFormErrors.discount_amount && (
                          <div className="error-message" style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '5px' }}>
                            <i className="fas fa-exclamation-circle"></i> {dealFormErrors.discount_amount}
                          </div>
                        )}
                      </div>
                    </div>
                    {dealFormErrors.discount && (
                      <div className="error-message" style={{ 
                        color: '#e74c3c', 
                        fontSize: '0.8rem', 
                        marginTop: '5px',
                        textAlign: 'center',
                        padding: '8px',
                        backgroundColor: '#ffeaea',
                        borderRadius: '4px'
                      }}>
                        <i className="fas fa-exclamation-triangle"></i> {dealFormErrors.discount}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="start_date" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="start_date"
                      value={dealFormData.start_date}
                      onChange={(e) => setDealFormData({...dealFormData, start_date: e.target.value})}
                      className={dealFormErrors.start_date ? 'error-input' : ''}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: dealFormErrors.start_date ? '1px solid #e74c3c' : '1px solid #dcdde1',
                        fontSize: '0.9rem'
                      }}
                    />
                    {dealFormErrors.start_date && (
                      <div className="error-message" style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '5px' }}>
                        <i className="fas fa-exclamation-circle"></i> {dealFormErrors.start_date}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="end_date" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      End Date
                    </label>
                    <input
                      type="date"
                      id="end_date"
                      value={dealFormData.end_date}
                      onChange={(e) => setDealFormData({...dealFormData, end_date: e.target.value})}
                      className={dealFormErrors.end_date ? 'error-input' : ''}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: dealFormErrors.end_date ? '1px solid #e74c3c' : '1px solid #dcdde1',
                        fontSize: '0.9rem'
                      }}
                    />
                    {dealFormErrors.end_date && (
                      <div className="error-message" style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '5px' }}>
                        <i className="fas fa-exclamation-circle"></i> {dealFormErrors.end_date}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="deal_description" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Description
                  </label>
                  <textarea
                    id="deal_description"
                    value={dealFormData.deal_description}
                    onChange={(e) => setDealFormData({...dealFormData, deal_description: e.target.value})}
                    placeholder="Describe your deal to customers"
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #dcdde1',
                      fontSize: '0.9rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {!editingDealId && (
                  <div className="form-group">
                    <label htmlFor="product_id" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Select Product <span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      id="product_id"
                      value={dealFormData.product_id}
                      onChange={(e) => setDealFormData({...dealFormData, product_id: e.target.value})}
                      className={dealFormErrors.product_id ? 'error-input' : ''}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: dealFormErrors.product_id ? '1px solid #e74c3c' : '1px solid #dcdde1',
                        fontSize: '0.9rem',
                        backgroundColor: '#fff'
                      }}
                    >
                      <option value="">Select a product</option>
                      {products.map(product => (
                        <option key={product.product_id} value={product.product_id}>
                          {product.product_name} - ₹{product.price}
                        </option>
                      ))}
                    </select>
                    {dealFormErrors.product_id && (
                      <div className="error-message" style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '5px' }}>
                        <i className="fas fa-exclamation-circle"></i> {dealFormErrors.product_id}
                      </div>
                    )}
                  </div>
                )}

                <div className="form-group checkbox-group" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '15px',
                  padding: '10px',
                  backgroundColor: dealFormData.is_featured ? '#fff8e1' : '#f8f9fa',
                  borderRadius: '6px',
                  border: dealFormData.is_featured ? '1px solid #ffd54f' : '1px solid #eee'
                }}>
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={dealFormData.is_featured}
                    onChange={(e) => setDealFormData({...dealFormData, is_featured: e.target.checked})}
                    style={{ width: '18px', height: '18px', accentColor: '#f39c12' }}
                  />
                  <label htmlFor="is_featured" style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {dealFormData.is_featured && <i className="fas fa-star" style={{ color: '#f39c12' }}></i>}
                    Feature this deal (show on homepage)
                  </label>
                </div>

                {dealFormErrors.submit && (
                  <div className="form-error" style={{
                    color: '#fff',
                    background: '#e74c3c',
                    padding: '10px 15px',
                    borderRadius: '6px',
                    marginTop: '15px',
                    fontSize: '0.9rem'
                  }}>
                    <i className="fas fa-exclamation-triangle"></i> {dealFormErrors.submit}
                  </div>
                )}

                <div className="form-actions" style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end',
                  marginTop: '25px',
                  gap: '10px'
                }}>
                  <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={closeDealForm}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '6px',
                      border: '1px solid #dcdde1',
                      background: '#f5f6fa',
                      color: '#2d3436',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => e.target.style.background = '#dfe6e9'}
                    onMouseLeave={e => e.target.style.background = '#f5f6fa'}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn" 
                    style={{
                      padding: '10px 30px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#2ecc71',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => e.target.style.background = '#27ae60'}
                    onMouseLeave={e => e.target.style.background = '#2ecc71'}
                  >
                    <i className={`fas ${editingDealId ? 'fa-save' : 'fa-plus-circle'}`}></i>
                    {editingDealId ? 'Update Deal' : 'Create Deal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

          {/* Notification */}
          {notification.show && (
            <div className={`notification ${notification.type}`}>
              <i className={`fas ${
                notification.type === 'success' ? 'fa-check-circle' :
                notification.type === 'error' ? 'fa-exclamation-circle' :
                'fa-info-circle'
              }`}></i>
              <p>{notification.message}</p>
              <button 
                className="close-notification"
                onClick={() => setNotification({ show: false, message: '', type: '' })}
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
