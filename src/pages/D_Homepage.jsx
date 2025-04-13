import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/delivery_home.css";
import D_Navbar from "../components/D_Navbar";
import D_Footer from "../components/D_Footer";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import "@fortawesome/fontawesome-free/css/all.min.css";

const D_Homepage = () => {
  const navigate = useNavigate();
  const { currentUser, getProfileName } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("Coimbatore, Tamil Nadu");
  const [activeTab, setActiveTab] = useState("all");
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [earnings, setEarnings] = useState({
    today: "₹0",
    weekly: "₹0",
    monthly: "₹0"
  });
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (currentUser && currentUser.agent_id) {
          const profileResponse = await api.delivery.getProfile();
          setIsOnline(profileResponse.data.availability_status === "Available");
        }
        
        await fetchOrders();
        await fetchEarnings();
        getUserLocation();
        
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Failed to load data. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [currentUser]);

  const fetchOrders = async () => {
    try {
      const response = await api.delivery.getCurrentOrders();
      const formattedOrders = response.data.map(order => ({
        id: order.order_id,
        pickup: order.supplying_business_name || order.pickup_business.business_name,
        dropoff: order.ordering_business_name || order.delivery_business.business_name,
        status: mapDeliveryStatus(order.delivery_status),
        distance: order.distance || calculateDistance(order),
        amount: `₹${order.total_amount}`,
        time: order.estimated_time || calculateTime(order),
        items: order.product_name || "Items",
        timestamp: formatTimestamp(order.assigned_at || order.created_at),
        customerName: order.ordering_business_name || order.delivery_business.business_name,
        customerPhone: order.contact_number || "+91 98765 43210",
        notes: order.notes || "Handle with care"
      }));
      
      setOrders(formattedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const formatTimestamp = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return "N/A";
    }
  };

  const mapDeliveryStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'assigned':
        return 'pending';
      case 'picked_up':
      case 'in_transit':
        return 'transit';
      case 'delivered':
        return 'delivered';
      default:
        return 'pending';
    }
  };

  const calculateDistance = (order) => {
    return `${(Math.random() * 10).toFixed(1)} km`;
  };

  const calculateTime = (order) => {
    const distance = parseFloat(calculateDistance(order));
    const minutes = Math.ceil(distance * 5);
    return `${minutes} min`;
  };

  const fetchEarnings = async () => {
    try {
      const response = await api.delivery.getEarnings();
      setEarnings({
        today: `₹${response.data.today || 0}`,
        weekly: `₹${response.data.weekly || 0}`,
        monthly: `₹${response.data.monthly || 0}`
      });
    } catch (err) {
      console.error("Error fetching earnings:", err);
    }
  };

  const toggleStatus = async () => {
    if (isStatusUpdating) return;
    
    setIsStatusUpdating(true);
    try {
      const newStatus = !isOnline;
      
      if (currentUser && currentUser.agent_id) {
        await api.delivery.updateAvailabilityStatus(currentUser.agent_id, newStatus);
      }
      
      setIsOnline(newStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update your availability status. Please try again.");
    } finally {
      setIsStatusUpdating(false);
    }
  };
  
  const updateOrderStatus = async (id, newStatus) => {
    try {
      const backendStatus = {
        transit: 'PickedUp',
        delivered: 'Delivered'
      }[newStatus];
      
      if (!backendStatus) {
        throw new Error('Invalid status');
      }
      
      await api.orders.updateDeliveryStatus(id, { delivery_status: backendStatus });
      
      setOrders(orders.map(order => 
        order.id === id ? {...order, status: newStatus} : order
      ));
      
      if (newStatus === 'delivered') {
        await fetchEarnings();
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update order status. Please try again.");
    }
  };
  
  const getFilteredOrders = useCallback(() => {
    if (activeTab === 'all') return orders;
    return orders.filter(order => order.status === activeTab);
  }, [activeTab, orders]);
  
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };
  
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {},
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const goToEarningsPage = () => {
    navigate('/delivery-profile?tab=earnings');
  };
  
  const goToActiveOrdersPage = () => {
    setActiveTab('pending');
  };
  
  const goToCompletedOrdersPage = () => {
    setActiveTab('delivered');
  };
  
  const openLocationModal = () => {
    setShowLocationModal(true);
  };
  
  const updateLocation = async (newLocation) => {
    setCurrentLocation(newLocation);
    setShowLocationModal(false);
    
    try {
      const locationData = {
        address: newLocation,
        latitude: 0,
        longitude: 0
      };
      await api.delivery.updateLocation(locationData);
    } catch (err) {
      console.error("Error updating location:", err);
    }
  };
  
  const callCustomer = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  if (isLoading) {
    return (
      <>
        <D_Navbar isOnlineGlobal={isOnline} setIsOnlineGlobal={setIsOnline} />
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin fa-3x"></i>
          <p>Loading your dashboard...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <D_Navbar isOnlineGlobal={isOnline} setIsOnlineGlobal={setIsOnline} />
        <div className="error-container">
          <i className="fas fa-exclamation-triangle fa-3x"></i>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            <i className="fas fa-redo"></i> Try Again
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <D_Navbar isOnlineGlobal={isOnline} setIsOnlineGlobal={setIsOnline} />

      <main className="delivery-dashboard">
        <div className="container">
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
                <input 
                  type="checkbox" 
                  checked={isOnline} 
                  onChange={toggleStatus}
                  disabled={isStatusUpdating} 
                />
                <span className="slider"></span>
              </label>
              <span className={`status-text ${isOnline ? 'status-online' : 'status-offline'}`}>
                {isStatusUpdating ? 'Updating...' : isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

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
              {getFilteredOrders().length > 0 ? (
                getFilteredOrders().map(order => (
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
                              onClick={() => viewOrderDetails(order)}
                            >Details</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-orders">
                  <i className="fas fa-inbox"></i>
                  <p>No {activeTab !== 'all' ? activeTab : ''} orders available</p>
                  {!isOnline && (
                    <div className="offline-message">
                      <i className="fas fa-exclamation-circle"></i>
                      <p>You are currently offline. Go online to receive new orders.</p>
                      <button className="go-online-btn" onClick={toggleStatus}>
                        <i className="fas fa-power-off"></i> Go Online
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

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
                  <span className="detail-value">{selectedOrder.notes || "No special instructions"}</span>
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
              <button 
                className="use-current-location" 
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        updateLocation("Current Location (Detected)");
                      },
                      (error) => {
                        console.error("Error getting location:", error);
                        alert("Could not get your current location. Please select manually.");
                      }
                    );
                  } else {
                    alert("Geolocation is not supported by your browser");
                  }
                }}
              >
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
