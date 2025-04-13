import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import B_Navbar from '../components/B_Navbar';
import ReviewForm from '../components/ReviewForm'; // Import the ReviewForm component
import '../styles/OrderHistory.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null); // New state for the order being reviewed
  const [reviewedOrders, setReviewedOrders] = useState({}); // Track orders that have been reviewed

  // Mock data based on SQL schema provided
  useEffect(() => {
    // In a real implementation, this would be an API call to fetch orders
    setTimeout(() => {
      const mockOrders = [
        {
          id: 'ORD-001',
          supplierInfo: {
            id: 2,
            name: 'Pydi Electronics',
            location: 'Tech Park',
            contactNo: '9391999643'
          },
          productInfo: {
            id: 2, 
            name: 'Laptop',
            price: 50000.00,
            quantity: 1
          },
          status: 'Requested',
          orderDate: '2025-03-10',
          deliveryStatus: 'Accepted',
          totalAmount: 50000.00,
          deliveryAddress: 'street 1, market area, coimbatore',
          deliveryAgent: {
            name: 'Myla',
            contactNumber: '9876543210',
            vehicleType: 'Bike'
          },
          expectedDelivery: '2025-03-15',
          paymentMethod: 'Bank Transfer',
          paymentStatus: 'Pending'
        },
        {
          id: 'ORD-002',
          supplierInfo: {
            id: 1,
            name: 'Rohith SuperMarket',
            location: 'Market Area',
            contactNo: '9507444555'
          },
          productInfo: {
            id: 1, 
            name: 'Rice',
            price: 50.00,
            quantity: 10
          },
          status: 'Confirmed',
          orderDate: '2025-03-10',
          deliveryStatus: 'In Transit',
          totalAmount: 500.00,
          deliveryAddress: 'street 3, industrial hub, coimbatore',
          deliveryAgent: {
            name: 'khadar',
            contactNumber: '8765432109',
            vehicleType: 'Truck'
          },
          expectedDelivery: '2025-03-13',
          paymentMethod: 'UPI',
          paymentStatus: 'Completed'
        },
        {
          id: 'ORD-003',
          supplierInfo: {
            id: 3,
            name: 'BK Wholesale',
            location: 'Industrial Hub',
            contactNo: '7815923423'
          },
          productInfo: {
            id: 3, 
            name: 'Wheat',
            price: 40.00,
            quantity: 15
          },
          status: 'Delivered',
          orderDate: '2025-03-01',
          deliveryStatus: 'Delivered',
          totalAmount: 600.00,
          deliveryAddress: 'street 4, food street, coimbatore',
          deliveryAgent: {
            name: 'Dona',
            contactNumber: '7395684921',
            vehicleType: 'Lorry'
          },
          expectedDelivery: '2025-03-05',
          paymentMethod: 'Cash on Delivery',
          paymentStatus: 'Completed'
        },
        {
          id: 'ORD-004',
          supplierInfo: {
            id: 4,
            name: 'Kenny Restaurant',
            location: 'Food Street',
            contactNo: '9703995921'
          },
          productInfo: {
            id: 4, 
            name: 'Burger',
            price: 100.00,
            quantity: 20
          },
          status: 'Dispatched',
          orderDate: '2025-03-08',
          deliveryStatus: 'In Transit',
          totalAmount: 2000.00,
          deliveryAddress: 'street 2, tech park, coimbatore',
          deliveryAgent: {
            name: 'Myla',
            contactNumber: '9876543210',
            vehicleType: 'Bike'
          },
          expectedDelivery: '2025-03-12',
          paymentMethod: 'Credit Card',
          paymentStatus: 'Completed'
        },
      ];

      setOrders(mockOrders);
      setIsLoading(false);
    }, 1000);
  }, []);

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
    // Filter by status
    if (filter !== 'all' && order.status.toLowerCase() !== filter) {
      return false;
    }

    // Filter by search query (product name or order ID)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(query) ||
        order.productInfo.name.toLowerCase().includes(query) ||
        order.supplierInfo.name.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.orderDate) - new Date(a.orderDate);
      case 'oldest':
        return new Date(a.orderDate) - new Date(b.orderDate);
      case 'highToLow':
        return b.totalAmount - a.totalAmount;
      case 'lowToHigh':
        return a.totalAmount - b.totalAmount;
      default:
        return 0;
    }
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
      default:
        return '';
    }
  };

  const getDeliveryStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'delivery-accepted';
      case 'in transit':
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
      default:
        return 'fa-question-circle';
    }
  };

  const formatDate = (dateString) => {
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

  const handleCancelOrder = (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      // In a real application, this would make an API call to cancel the order
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: 'Cancelled' } : order
      );
      setOrders(updatedOrders);
    }
  };

  const handleReorder = (orderId) => {
    // In a real application, this would create a new order with the same details
    alert(`Reordering from order ${orderId}`);
  };

  const handleReviewOrder = (orderId) => {
    // Find the order to review
    const orderToReview = orders.find(order => order.id === orderId);
    if (orderToReview) {
      setReviewOrder(orderToReview);
    }
  };

  const handleReviewSubmit = (reviewData) => {
    // In a real app, this would send the review data to the server
    console.log('Review submitted:', reviewData);
    
    // Mark the order as reviewed
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
    
    // Show a success message (you could add a toast notification here)
    alert('Review submitted successfully! Thank you for your feedback.');
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
          ) : sortedOrders.length === 0 ? (
            <div className="no-orders">
              <i className="fas fa-shopping-bag"></i>
              <h3>No orders found</h3>
              <p>Try adjusting your filters or search query</p>
              <Link to="/business-home" className="browse-products-btn">Browse Products</Link>
            </div>
          ) : (
            <div className="orders-list">
              {sortedOrders.map((order) => (
                <div className="order-card" key={order.id}>
                  <div className="order-header">
                    <div className="order-id">
                      <strong>Order ID:</strong> {order.id}
                    </div>
                    <div className="order-date">
                      <i className="far fa-calendar-alt"></i> {formatDate(order.orderDate)}
                    </div>
                    <div className={`order-status ${getStatusClass(order.status)}`}>
                      <i className={`fas ${getStatusIcon(order.status)}`}></i> {order.status}
                    </div>
                  </div>

                  <div className="order-summary">
                    <div className="order-supplier">
                      <div className="supplier-info">
                        <h3>Supplier</h3>
                        <p>{order.supplierInfo.name}</p>
                        <p className="supplier-location">
                          <i className="fas fa-map-marker-alt"></i> {order.supplierInfo.location}
                        </p>
                      </div>
                      <div className="contact-supplier">
                        <a href={`tel:${order.supplierInfo.contactNo}`}>
                          <i className="fas fa-phone"></i> Call Supplier
                        </a>
                      </div>
                    </div>

                    <div className="order-details">
                      <div className="product-details">
                        <h3>Product</h3>
                        <p className="product-name">{order.productInfo.name}</p>
                        <p className="product-quantity">Quantity: {order.productInfo.quantity}</p>
                        <p className="product-price">Price per unit: {formatCurrency(order.productInfo.price)}</p>
                      </div>
                      <div className="order-amount">
                        <h3>Total Amount</h3>
                        <div className="amount">{formatCurrency(order.totalAmount)}</div>
                        <p className="payment-method">
                          <i className="fas fa-money-check-alt"></i> {order.paymentMethod}
                        </p>
                        <p className={`payment-status ${order.paymentStatus === 'Completed' ? 'status-completed' : 'status-pending'}`}>
                          <i className={`fas ${order.paymentStatus === 'Completed' ? 'fa-check-circle' : 'fa-clock'}`}></i> {order.paymentStatus}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button 
                      className="toggle-details-btn"
                      onClick={() => toggleOrderDetails(order.id)}
                    >
                      {expandedOrderId === order.id ? (
                        <><i className="fas fa-chevron-up"></i> Hide Details</>
                      ) : (
                        <><i className="fas fa-chevron-down"></i> View Details</>
                      )}
                    </button>

                    <div className="action-buttons">
                      {order.status === 'Delivered' && !reviewedOrders[order.id] && (
                        <button 
                          className="review-btn"
                          onClick={() => handleReviewOrder(order.id)}
                        >
                          <i className="fas fa-star"></i> Review
                        </button>
                      )}

                      {order.status === 'Delivered' && reviewedOrders[order.id] && (
                        <div className="review-complete">
                          <i className="fas fa-check-circle"></i> Reviewed
                          <div className="rating-display">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <i 
                                key={i}
                                className={`fas fa-star ${i < reviewedOrders[order.id].rating ? 'active' : ''}`}
                              ></i>
                            ))}
                          </div>
                        </div>
                      )}

                      {order.status === 'Delivered' && (
                        <button 
                          className="reorder-btn"
                          onClick={() => handleReorder(order.id)}
                        >
                          <i className="fas fa-redo"></i> Reorder
                        </button>
                      )}

                      {(order.status === 'Requested' || order.status === 'Confirmed') && (
                        <button 
                          className="cancel-btn"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          <i className="fas fa-times"></i> Cancel
                        </button>
                      )}

                      <button 
                        className="track-btn"
                        disabled={order.status === 'Delivered'}
                      >
                        <i className="fas fa-map-marker-alt"></i> Track
                      </button>
                    </div>
                  </div>

                  {expandedOrderId === order.id && (
                    <div className="order-expanded-details">
                      <div className="expanded-section">
                        <h3><i className="fas fa-shipping-fast"></i> Shipping Information</h3>
                        
                        <div className="detail-group">
                          <div className="detail-item">
                            <div className="detail-label">Delivery Address</div>
                            <div className="detail-value">{order.deliveryAddress}</div>
                          </div>
                          
                          <div className="detail-item">
                            <div className="detail-label">Delivery Status</div>
                            <div className={`detail-value ${getDeliveryStatusClass(order.deliveryStatus)}`}>
                              <i className={`fas ${
                                order.deliveryStatus === 'Accepted' ? 'fa-check-circle' : 
                                order.deliveryStatus === 'In Transit' ? 'fa-truck' : 'fa-flag-checkered'
                              }`}></i> {order.deliveryStatus}
                            </div>
                          </div>
                          
                          <div className="detail-item">
                            <div className="detail-label">Expected Delivery</div>
                            <div className="detail-value">{formatDate(order.expectedDelivery)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="expanded-section">
                        <h3><i className="fas fa-user-friends"></i> Delivery Agent</h3>
                        
                        <div className="detail-group">
                          <div className="detail-item">
                            <div className="detail-label">Agent Name</div>
                            <div className="detail-value">{order.deliveryAgent.name}</div>
                          </div>
                          
                          <div className="detail-item">
                            <div className="detail-label">Contact</div>
                            <div className="detail-value">
                              <a href={`tel:${order.deliveryAgent.contactNumber}`}>
                                {order.deliveryAgent.contactNumber}
                              </a>
                            </div>
                          </div>
                          
                          <div className="detail-item">
                            <div className="detail-label">Vehicle Type</div>
                            <div className="detail-value">{order.deliveryAgent.vehicleType}</div>
                          </div>
                        </div>
                      </div>

                      <div className="timeline">
                        <h3><i className="fas fa-history"></i> Order Timeline</h3>
                        
                        <div className="timeline-items">
                          <div className={`timeline-item ${order.orderDate ? 'completed' : ''}`}>
                            <div className="timeline-icon">
                              <i className="fas fa-shopping-cart"></i>
                            </div>
                            <div className="timeline-content">
                              <div className="timeline-title">Order Placed</div>
                              <div className="timeline-date">{formatDate(order.orderDate)}</div>
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
                                  ? `${formatDate(order.orderDate)}` 
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
                                  ? `${formatDate(order.orderDate)}`
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
                                {order.status === 'Delivered' ? `${formatDate(order.orderDate)}` : 'Pending'}
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