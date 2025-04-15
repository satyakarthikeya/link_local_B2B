import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import B_Navbar from '../components/B_Navbar';
import ReviewForm from '../components/ReviewForm';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/OrderHistory.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
// Import mock data for fallback
import { mockOrderHistory } from '../utils/ordersMockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewedOrders, setReviewedOrders] = useState({});

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        // Build query parameters for filtering and sorting
        let queryParams = new URLSearchParams();
        if (filter !== 'all') {
          queryParams.append('status', filter);
        }
        queryParams.append('sort', sortBy);
        
        // Force 'ordering' role to get only orders where you are the customer
        queryParams.append('role', 'ordering');

        // Log the request for debugging
        console.log(`Fetching orders from: ${API_URL}/orders/history?${queryParams}`);
        console.log(`Using auth token: ${localStorage.getItem('authToken')}`);

        const response = await axios.get(`${API_URL}/orders/history?${queryParams}`, {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Order history response:', response.data);

        // Check if response data is valid
        if (Array.isArray(response.data)) {
          setOrders(response.data);
          setError(null);

          // Initialize reviewedOrders state from API data
          const reviewedOrdersMap = {};
          response.data.forEach(order => {
            if (order.rating) {
              reviewedOrdersMap[order.order_id] = {
                rating: order.rating,
                comment: order.comment,
                date: order.review_date
              };
            }
          });
          setReviewedOrders(reviewedOrdersMap);
        } else {
          console.error('Invalid orders data format:', response.data);
          setError('Received invalid data format from server');
          setOrders([]);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        // More detailed error logging
        if (err.response) {
          console.error('Error response:', err.response.status, err.response.data);
        }
        
        // FALLBACK TO MOCK DATA
        console.log('Falling back to mock data');
        
        // Filter mock data based on current filter state
        let filteredMockData = [...mockOrderHistory];
        
        if (filter !== 'all') {
          filteredMockData = filteredMockData.filter(
            order => order.status.toLowerCase() === filter.toLowerCase()
          );
        }
        
        // Sort mock data
        if (sortBy === 'oldest') {
          filteredMockData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else if (sortBy === 'highToLow') {
          filteredMockData.sort((a, b) => b.total_amount - a.total_amount);
        } else if (sortBy === 'lowToHigh') {
          filteredMockData.sort((a, b) => a.total_amount - b.total_amount);
        } else {
          // Default to newest first
          filteredMockData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
        
        // Set the mock data as our orders
        setOrders(filteredMockData);
        
        // Initialize reviewedOrders state from mock data
        const reviewedOrdersMap = {};
        filteredMockData.forEach(order => {
          // Check if the order has valid rating information (must be a number greater than 0)
          if (order.rating && typeof order.rating === 'number' && order.rating > 0) {
            reviewedOrdersMap[order.order_id] = {
              rating: order.rating,
              comment: order.comment || "Good product and service",
              date: order.review_date || new Date().toISOString()
            };
          }
        });
        
        // Set reviewed orders
        setReviewedOrders(reviewedOrdersMap);
        console.log('Using mock reviews:', reviewedOrdersMap);
        
        setError(null); // Clear error when using mock data
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if user is authenticated
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      fetchOrders();
    } else {
      setError('Please log in to view your order history');
      setIsLoading(false);
    }
  }, [filter, sortBy]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleOrderDetails = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  const filteredOrders = orders.filter((order) => {
    // Filter by search query (product name or order ID)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.order_id.toString().includes(query) ||
        order.product_name.toLowerCase().includes(query) ||
        order.supplying_business_name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'requested':
        return 'status-requested';
      case 'confirmed':
        return 'status-confirmed';
      case 'dispatched':
        return 'status-dispatched';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const getDeliveryStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'delivery-pending';
      case 'assigned':
        return 'delivery-assigned';
      case 'pickedup':
        return 'delivery-pickedup';
      case 'intransit':
        return 'delivery-transit';
      case 'delivered':
        return 'delivery-completed';
      default:
        return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'requested':
        return 'fa-clock';
      case 'confirmed':
        return 'fa-check-circle';
      case 'dispatched':
        return 'fa-truck';
      case 'delivered':
        return 'fa-check-double';
      case 'cancelled':
        return 'fa-times-circle';
      default:
        return 'fa-question-circle';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await axios.patch(`${API_URL}/orders/${orderId}/cancel`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        });
        
        // Update the order status locally
        const updatedOrders = orders.map(order => 
          order.order_id === orderId ? { ...order, status: 'Cancelled' } : order
        );
        setOrders(updatedOrders);
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert('Failed to cancel order. ' + (error.response?.data?.error || 'Please try again.'));
      }
    }
  };

  const handleReorder = async (orderId) => {
    try {
      const response = await axios.post(`${API_URL}/orders/${orderId}/reorder`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      
      // Add the new order to the list
      setOrders(prev => [response.data.order, ...prev]);
      alert('Reorder placed successfully!');
    } catch (error) {
      console.error('Error reordering:', error);
      alert('Failed to reorder. ' + (error.response?.data?.error || 'Please try again.'));
    }
  };

  const handleReviewOrder = (orderId) => {
    const orderToReview = orders.find(order => order.order_id === orderId);
    if (orderToReview) {
      setReviewOrder(orderToReview);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      await axios.post(`${API_URL}/orders/${reviewData.orderId}/review`, {
        rating: reviewData.ratingValue,
        comment: reviewData.comment
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      
      // Update local state
      setReviewedOrders(prev => ({
        ...prev,
        [reviewData.orderId]: {
          rating: reviewData.ratingValue,
          comment: reviewData.comment,
          date: new Date().toISOString()
        }
      }));
      
      // Close the review form
      setReviewOrder(null);
      
      alert('Review submitted successfully! Thank you for your feedback.');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  return (
    <>
      <B_Navbar />

      <div className="order-history-container">
        <div className="container">
          <div className="order-history-header">
            <h1>Order History</h1>
            <p>Track and manage your orders</p>
          </div>

          <div className="order-history-controls">
            <div className="control-group">
              <label htmlFor="filter">Filter By Status:</label>
              <select id="filter" value={filter} onChange={handleFilterChange}>
                <option value="all">All Orders</option>
                <option value="requested">Requested</option>
                <option value="confirmed">Confirmed</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="control-group">
              <label htmlFor="sort">Sort By:</label>
              <select id="sort" value={sortBy} onChange={handleSortChange}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highToLow">Price: High to Low</option>
                <option value="lowToHigh">Price: Low to High</option>
              </select>
            </div>

            <div className="search-container">
              <input
                type="text"
                placeholder="Search by Order ID, Product, or Supplier..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button className="search-btn">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="orders-loading">
              <div className="spinner"></div>
              <p>Loading your orders...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              <p>{error}</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="no-orders">
              <i className="fas fa-shopping-bag"></i>
              <h3>No orders found</h3>
              <p>Try adjusting your filters or search query</p>
              <Link to="/business-home" className="browse-products-btn">Browse Products</Link>
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map((order) => (
                <div className="order-card" key={order.order_id}>
                  <div className="order-header">
                    <div className="order-id">
                      <strong>Order ID:</strong> {order.order_id}
                    </div>
                    <div className="order-date">
                      <i className="far fa-calendar-alt"></i> {formatDate(order.created_at)}
                    </div>
                    <div className={`order-status ${getStatusClass(order.status)}`}>
                      <i className={`fas ${getStatusIcon(order.status)}`}></i> {order.status}
                    </div>
                  </div>

                  <div className="order-summary">
                    <div className="order-supplier">
                      <div className="supplier-info">
                        <h3>Supplier</h3>
                        <p>{order.supplying_business_name}</p>
                        <p className="supplier-location">
                          <i className="fas fa-map-marker-alt"></i> {order.supplying_area}, {order.supplying_city}
                        </p>
                      </div>
                      <div className="contact-supplier">
                        {/* Only show if contact info available */}
                        {order.supplying_phone && (
                          <a href={`tel:${order.supplying_phone}`}>
                            <i className="fas fa-phone"></i> Call Supplier
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="order-details">
                      <div className="product-details">
                        <h3>Product</h3>
                        <p className="product-name">{order.product_name}</p>
                        <p className="product-quantity">Quantity: {order.quantity_requested}</p>
                        <p className="product-price">Price per unit: {formatCurrency(order.unit_price || order.price)}</p>
                      </div>
                      <div className="order-amount">
                        <h3>Total Amount</h3>
                        <div className="amount">{formatCurrency(order.total_amount)}</div>
                        <p className={`delivery-status ${getDeliveryStatusClass(order.delivery_status)}`}>
                          <i className={`fas ${
                            order.delivery_status === 'Pending' ? 'fa-clock' : 
                            order.delivery_status === 'Assigned' ? 'fa-user-check' : 
                            order.delivery_status === 'PickedUp' ? 'fa-box' : 
                            order.delivery_status === 'InTransit' ? 'fa-truck' : 'fa-flag-checkered'
                          }`}></i> {order.delivery_status}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button 
                      className="toggle-details-btn"
                      onClick={() => toggleOrderDetails(order.order_id)}
                    >
                      {expandedOrderId === order.order_id ? (
                        <><i className="fas fa-chevron-up"></i> Hide Details</>
                      ) : (
                        <><i className="fas fa-chevron-down"></i> View Details</>
                      )}
                    </button>

                    <div className="action-buttons">
                      {order.status === 'Delivered' && !reviewedOrders[order.order_id] && (
                        <button 
                          className="review-btn"
                          onClick={() => handleReviewOrder(order.order_id)}
                        >
                          <i className="fas fa-star"></i> Review
                        </button>
                      )}

                      {reviewedOrders[order.order_id] && (
                        <div className="review-complete">
                          <i className="fas fa-check-circle"></i> Reviewed
                          <div className="rating-display">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <i 
                                key={i}
                                className={`fas fa-star ${i < reviewedOrders[order.order_id].rating ? 'active' : ''}`}
                              ></i>
                            ))}
                          </div>
                        </div>
                      )}

                      {order.status === 'Delivered' && (
                        <button 
                          className="reorder-btn"
                          onClick={() => handleReorder(order.order_id)}
                        >
                          <i className="fas fa-redo"></i> Reorder
                        </button>
                      )}

                      {(order.status === 'Requested' || order.status === 'Confirmed') && (
                        <button 
                          className="cancel-btn"
                          onClick={() => handleCancelOrder(order.order_id)}
                        >
                          <i className="fas fa-times"></i> Cancel
                        </button>
                      )}

                      <button 
                        className="track-btn"
                        disabled={order.status === 'Delivered' || order.status === 'Cancelled'}
                      >
                        <i className="fas fa-map-marker-alt"></i> Track
                      </button>
                    </div>
                  </div>

                  {expandedOrderId === order.order_id && (
                    <div className="order-expanded-details">
                      <div className="expanded-section">
                        <h3><i className="fas fa-shipping-fast"></i> Shipping Information</h3>
                        
                        <div className="detail-group">
                          <div className="detail-item">
                            <div className="detail-label">Delivery Address</div>
                            <div className="detail-value">
                              {order.ordering_street}, {order.ordering_area}, {order.ordering_city}
                            </div>
                          </div>
                          
                          <div className="detail-item">
                            <div className="detail-label">Delivery Status</div>
                            <div className={`detail-value ${getDeliveryStatusClass(order.delivery_status)}`}>
                              <i className={`fas ${
                                order.delivery_status === 'Pending' ? 'fa-clock' : 
                                order.delivery_status === 'Assigned' ? 'fa-user-check' : 
                                order.delivery_status === 'PickedUp' ? 'fa-box' : 
                                order.delivery_status === 'InTransit' ? 'fa-truck' : 'fa-flag-checkered'
                              }`}></i> {order.delivery_status}
                            </div>
                          </div>
                          
                          <div className="detail-item">
                            <div className="detail-label">Expected Delivery</div>
                            <div className="detail-value">
                              {order.expected_delivery_date ? 
                                formatDate(order.expected_delivery_date) : 
                                'To be determined'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {order.agent_name && (
                        <div className="expanded-section">
                          <h3><i className="fas fa-user-friends"></i> Delivery Agent</h3>
                          
                          <div className="detail-group">
                            <div className="detail-item">
                              <div className="detail-label">Agent Name</div>
                              <div className="detail-value">{order.agent_name}</div>
                            </div>
                            
                            <div className="detail-item">
                              <div className="detail-label">Contact</div>
                              <div className="detail-value">
                                {order.agent_contact && 
                                  <a href={`tel:${order.agent_contact}`}>
                                    {order.agent_contact}
                                  </a>
                                }
                              </div>
                            </div>
                            
                            <div className="detail-item">
                              <div className="detail-label">Vehicle Type</div>
                              <div className="detail-value">{order.vehicle_type || 'Not specified'}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="timeline">
                        <h3><i className="fas fa-history"></i> Order Timeline</h3>
                        
                        <div className="timeline-items">
                          <div className={`timeline-item completed`}>
                            <div className="timeline-icon">
                              <i className="fas fa-shopping-cart"></i>
                            </div>
                            <div className="timeline-content">
                              <div className="timeline-title">Order Placed</div>
                              <div className="timeline-date">{formatDate(order.created_at)}</div>
                            </div>
                          </div>
                          
                          <div className={`timeline-item ${order.status === 'Confirmed' || order.status === 'Dispatched' || order.status === 'Delivered' ? 'completed' : ''}`}>
                            <div className="timeline-icon">
                              <i className="fas fa-check-circle"></i>
                            </div>
                            <div className="timeline-content">
                              <div className="timeline-title">Order Confirmed</div>
                              <div className="timeline-date">
                                {order.status === 'Confirmed' || order.status === 'Dispatched' || order.status === 'Delivered' 
                                  ? formatDate(order.updated_at) 
                                  : 'Pending'}
                              </div>
                            </div>
                          </div>
                          
                          <div className={`timeline-item ${order.status === 'Dispatched' || order.status === 'Delivered' ? 'completed' : ''}`}>
                            <div className="timeline-icon">
                              <i className="fas fa-truck"></i>
                            </div>
                            <div className="timeline-content">
                              <div className="timeline-title">Order Dispatched</div>
                              <div className="timeline-date">
                                {order.status === 'Dispatched' || order.status === 'Delivered'
                                  ? formatDate(order.updated_at)
                                  : 'Pending'}
                              </div>
                            </div>
                          </div>
                          
                          <div className={`timeline-item ${order.status === 'Delivered' ? 'completed' : ''}`}>
                            <div className="timeline-icon">
                              <i className="fas fa-flag-checkered"></i>
                            </div>
                            <div className="timeline-content">
                              <div className="timeline-title">Order Delivered</div>
                              <div className="timeline-date">
                                {order.status === 'Delivered' ? formatDate(order.updated_at) : 'Pending'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ReviewForm modal */}
      {reviewOrder && (
        <ReviewForm 
          order={reviewOrder}
          onClose={() => setReviewOrder(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </>
  );
};

export default OrderHistory;