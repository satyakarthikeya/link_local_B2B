import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/delivery_home.css"; // Correct path to delivery_home.css
import D_Navbar from "../components/D_Navbar";
import D_Footer from "../components/D_Footer";
import { useAuth } from "../context/AuthContext";
import "@fortawesome/fontawesome-free/css/all.min.css";

const D_Homepage = () => {
  const navigate = useNavigate();
  const { currentUser, getProfileName } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [currentLocation, setCurrentLocation] = useState("Coimbatore, Tamil Nadu");
  const [activeTab, setActiveTab] = useState("all");
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [earnings, setEarnings] = useState({
    today: "₹850",
    weekly: "₹5,200",
    monthly: "₹22,400"
  });
  
  // Sample orders data
  const [orders, setOrders] = useState([
    {
      id: "OD12345",
      pickup: "Sunrise Stationers, RS Puram",
      dropoff: "Chennai Silks, Gandhipuram",
      status: "pending",
      distance: "3.5 km",
      amount: "₹120",
      time: "15 min",
      items: "Bulk A4 sheets (5 packs)",
      timestamp: "11:30 AM",
      customerName: "Rahul Sharma",
      customerPhone: "+91 98765 43210",
      notes: "Please handle with care. Call before delivery."
    },
    {
      id: "OD12346",
      pickup: "Lulu Market, Avinashi Road",
      dropoff: "SS Hypermarket, Peelamedu",
      status: "transit",
      distance: "5.2 km",
      amount: "₹180",
      time: "25 min",
      items: "Fresh Vegetables, Rice Bags",
      timestamp: "12:45 PM",
      customerName: "Priya Patel",
      customerPhone: "+91 87654 32109",
      notes: "Keep vegetables separate from other items."
    },
    {
      id: "OD12347",
      pickup: "Sunrise Electronics, RS Puram",
      dropoff: "Amrita University",
      status: "delivered",
      distance: "8.7 km",
      amount: "₹250",
      time: "40 min",
      items: "Jumper Wires, Headphones",
      timestamp: "09:15 AM",
      customerName: "Arjun Kumar",
      customerPhone: "+91 76543 21098",
      notes: "Deliver to Engineering Block, Room 204."
    }
  ]);

  // Toggle online/offline status
  const toggleStatus = () => setIsOnline(!isOnline);

  // Update order status
  const updateOrderStatus = (id, newStatus) => {
    setOrders(orders.map(order => 
      order.id === id ? {...order, status: newStatus} : order
    ));
  };
  
  // Filter orders based on active tab
  const getFilteredOrders = () => {
    if (activeTab === 'all') return orders;
    return orders.filter(order => order.status === activeTab);
  };
  
  // Show order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };
  
  // Navigate to earnings page
  const goToEarningsPage = () => {
    navigate('/delivery/earnings');
    // For demo, show alert
    alert("Navigating to Earnings Dashboard");
  };
  
  // Navigate to active orders page
  const goToActiveOrdersPage = () => {
    navigate('/delivery/active-orders');
    // For demo, show alert
    alert("Navigating to Active Orders Page");
  };
  
  // Navigate to completed orders page
  const goToCompletedOrdersPage = () => {
    navigate('/delivery/completed');
    // For demo, show alert
    alert("Navigating to Completed Orders Page");
  };
  
  // Change location
  const openLocationModal = () => {
    setShowLocationModal(true);
  };
  
  // Update location
  const updateLocation = (newLocation) => {
    setCurrentLocation(newLocation);
    setShowLocationModal(false);
  };
  
  // Call customer
  const callCustomer = (phone) => {
    alert(`Calling customer at ${phone}`);
  };

  return (
    <>
      <D_Navbar isOnlineGlobal={isOnline} setIsOnlineGlobal={setIsOnline} />

      <main className="delivery-dashboard">
        <div className="container">
          {/* Enhanced Welcome Section with Location Picker and Username */}
          <div className="welcome-bar">
            <div className="welcome-status">
              <h2>Welcome, {getProfileName() || 'Delivery Partner'}! 👋</h2>
              <div className="location-picker" onClick={openLocationModal}>
                <i className="fas fa-map-marker-alt"></i>
                <p>{currentLocation}</p>
                <i className="fas fa-caret-down"></i>
              </div>
            </div>
            <div className="status-toggle">
              <span>Status:</span>
              <label className="switch">
                <input type="checkbox" checked={isOnline} onChange={toggleStatus} />
                <span className="slider"></span>
              </label>
              <span className={`status-text ${isOnline ? 'status-online' : 'status-offline'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Interactive Stats Cards */}
          <div className="quick-stats">
            <div className="stat-card clickable" onClick={goToEarningsPage}>
              <i className="fas fa-wallet"></i>
              <div className="stat-details">
                <h3>Today's Earnings</h3>
                <p>{earnings.today}</p>
                <span className="view-more">View Details <i className="fas fa-chevron-right"></i></span>
              </div>
            </div>
            <div className="stat-card clickable" onClick={goToActiveOrdersPage}>
              <i className="fas fa-route"></i>
              <div className="stat-details">
                <h3>Active Orders</h3>
                <p>{orders.filter(o => o.status === "pending" || o.status === "transit").length}</p>
                <span className="view-more">Manage All <i className="fas fa-chevron-right"></i></span>
              </div>
            </div>
            <div className="stat-card clickable" onClick={goToCompletedOrdersPage}>
              <i className="fas fa-check-circle"></i>
              <div className="stat-details">
                <h3>Completed</h3>
                <p>{orders.filter(o => o.status === "delivered").length}</p>
                <span className="view-more">View History <i className="fas fa-chevron-right"></i></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            
            <button className="action-button" onClick={() => navigate('/delivery-profile')}>
              <i className="fas fa-user"></i>
              <span>Profile</span>
            </button>
            <button className="action-button" onClick={() => navigate('/map-view')}>
              <i className="fas fa-map-marked-alt"></i>
              <span>Map View</span>
            </button>
            <button className="action-button" onClick={() => navigate('/delivery/support')}>
              <i className="fas fa-headset"></i>
              <span>Support</span>
            </button>
          </div>

          {/* Streamlined Orders Section */}
          <div className="orders-section">
            <div className="orders-header">
              <h2>Current Orders</h2>
              <div className="orders-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >All</button>
                <button 
                  className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pending')}
                >New</button>
                <button 
                  className={`tab-btn ${activeTab === 'transit' ? 'active' : ''}`}
                  onClick={() => setActiveTab('transit')}
                >In Progress</button>
                <button 
                  className={`tab-btn ${activeTab === 'delivered' ? 'active' : ''}`}
                  onClick={() => setActiveTab('delivered')}
                >Delivered</button>
              </div>
            </div>

            <div className="orders-grid">
              {getFilteredOrders().map(order => (
                <div className={`order-card order-${order.status}`} key={order.id}>
                  <div className="order-header">
                    <span className={`status-badge status-${order.status}`}>
                      {order.status === "pending" ? "New Order" :
                       order.status === "transit" ? "In Progress" :
                       "Delivered"}
                    </span>
                    <span className="order-time">{order.timestamp}</span>
                  </div>
                  
                  <div className="order-content">
                    <div className="order-locations">
                      <div className="pickup-point">
                        <i className="fas fa-store"></i>
                        <p>{order.pickup}</p>
                      </div>
                      <div className="delivery-point">
                        <i className="fas fa-map-marker-alt"></i>
                        <p>{order.dropoff}</p>
                      </div>
                    </div>

                    <div className="order-info">
                      <span><i className="fas fa-box"></i> {order.items}</span>
                      <span><i className="fas fa-rupee-sign"></i> {order.amount}</span>
                      <span><i className="fas fa-route"></i> {order.distance}</span>
                    </div>

                    <div className="order-actions">
                      {order.status === "pending" && (
                        <>
                          <button 
                            className="action-btn accept-btn"
                            onClick={() => updateOrderStatus(order.id, "transit")}
                          >Accept Order</button>
                          <button 
                            className="action-btn details-btn"
                            onClick={() => viewOrderDetails(order)}
                          >View Details</button>
                        </>
                      )}
                      {order.status === "transit" && (
                        <>
                          <button 
                            className="action-btn complete-btn"
                            onClick={() => updateOrderStatus(order.id, "delivered")}
                          >Mark as Delivered</button>
                          <button 
                            className="action-btn nav-btn"
                            onClick={() => navigate('/map-view')}
                          >Navigate</button>
                          <button 
                            className="action-btn call-btn"
                            onClick={() => callCustomer(order.customerPhone)}
                          >Call</button>
                        </>
                      )}
                      {order.status === "delivered" && (
                        <>
                          <button 
                            className="action-btn receipt-btn"
                            onClick={() => viewOrderDetails(order)}
                          >View Receipt</button>
                          <button 
                            className="action-btn details-btn"
                            onClick={() => alert("Generating PDF receipt...")}
                          >Download</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {getFilteredOrders().length === 0 && (
                <div className="no-orders">
                  <i className="fas fa-inbox"></i>
                  <p>No {activeTab !== 'all' ? activeTab : ''} orders available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Order Details Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderDetail(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order #{selectedOrder.id}</h3>
              <button className="close-btn" onClick={() => setShowOrderDetail(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="order-status">
                <h4>Status: <span className={`status-text-${selectedOrder.status}`}>
                  {selectedOrder.status === "pending" ? "New Order" :
                   selectedOrder.status === "transit" ? "In Progress" : "Delivered"}
                </span></h4>
              </div>
              
              <div className="detail-section">
                <h4>Delivery Details</h4>
                <div className="detail-item">
                  <span className="detail-label">Pickup:</span>
                  <span className="detail-value">{selectedOrder.pickup}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Dropoff:</span>
                  <span className="detail-value">{selectedOrder.dropoff}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Customer:</span>
                  <span className="detail-value">{selectedOrder.customerName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value detail-phone" onClick={() => callCustomer(selectedOrder.customerPhone)}>
                    {selectedOrder.customerPhone} <i className="fas fa-phone"></i>
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Order Information</h4>
                <div className="detail-item">
                  <span className="detail-label">Items:</span>
                  <span className="detail-value">{selectedOrder.items}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value">{selectedOrder.amount}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Distance:</span>
                  <span className="detail-value">{selectedOrder.distance}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Estimated Time:</span>
                  <span className="detail-value">{selectedOrder.time}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Notes:</span>
                  <span className="detail-value">{selectedOrder.notes}</span>
                </div>
              </div>
              
              <div className="modal-actions">
                {selectedOrder.status === "pending" && (
                  <button 
                    className="modal-btn accept-modal-btn"
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, "transit");
                      setShowOrderDetail(false);
                    }}
                  >Accept Order</button>
                )}
                {selectedOrder.status === "transit" && (
                  <>
                    <button 
                      className="modal-btn complete-modal-btn"
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, "delivered");
                        setShowOrderDetail(false);
                      }}
                    >Mark as Delivered</button>
                    <button 
                      className="modal-btn nav-modal-btn"
                      onClick={() => navigate('/map-view')}
                    >Navigate</button>
                  </>
                )}
                <button 
                  className="modal-btn cancel-modal-btn"
                  onClick={() => setShowOrderDetail(false)}
                >Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <div className="modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="modal-content location-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select Your Location</h3>
              <button className="close-btn" onClick={() => setShowLocationModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="location-search">
                <i className="fas fa-search"></i>
                <input type="text" placeholder="Search location..." />
              </div>
              <div className="location-list">
                <div className="location-option" onClick={() => updateLocation("Coimbatore, Tamil Nadu")}>
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Coimbatore, Tamil Nadu</span>
                </div>
                <div className="location-option" onClick={() => updateLocation("Chennai, Tamil Nadu")}>
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Chennai, Tamil Nadu</span>
                </div>
                <div className="location-option" onClick={() => updateLocation("Bengaluru, Karnataka")}>
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Bengaluru, Karnataka</span>
                </div>
                <div className="location-option" onClick={() => updateLocation("Madurai, Tamil Nadu")}>
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Madurai, Tamil Nadu</span>
                </div>
                <div className="location-option" onClick={() => updateLocation("Salem, Tamil Nadu")}>
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Salem, Tamil Nadu</span>
                </div>
              </div>
              <button className="use-current-location" onClick={() => updateLocation("Coimbatore, Tamil Nadu")}>
                <i className="fas fa-location-arrow"></i>
                Use My Current Location
              </button>
            </div>
          </div>
        </div>
      )}

      <D_Footer />
    </>
  );
};

export default D_Homepage;
