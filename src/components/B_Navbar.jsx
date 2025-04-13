import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { useAuth } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import ReviewForm from './ReviewForm';
import "../styles/navbar.css";
import logo from "../assests/Logo.png";

const NotificationItem = ({ notification, onRead }) => {
  const { id, type, message, time, read } = notification;
  
  const getIcon = () => {
    switch(type) {
      case 'order': return <i className="fas fa-shopping-bag"></i>;
      case 'payment': return <i className="fas fa-rupee-sign"></i>;
      case 'system': return <i className="fas fa-cog"></i>;
      default: return <i className="fas fa-bell"></i>;
    }
  };
  
  return (
    <div 
      className={`notification-item ${read ? 'read' : 'unread'}`}
      onClick={() => onRead(id)}
    >
      <div className={`notification-icon ${type}`}>
        {getIcon()}
      </div>
      <div className="notification-content">
        <p>{message}</p>
        <span className="notification-time">{time}</span>
      </div>
    </div>
  );
};

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    read: PropTypes.bool.isRequired
  }).isRequired,
  onRead: PropTypes.func.isRequired
};

const B_Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, getProfileName, logout } = useAuth();
  const { cartCount, toggleCart } = React.useContext(CartContext);
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedCity, setSelectedCity] = useState('coimbatore');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'order', message: 'New order received from Chennai Electronics', time: '2 mins ago', read: false },
    { id: 2, type: 'payment', message: 'Payment of ₹15,400 received', time: '1 hour ago', read: false },
    { id: 3, type: 'system', message: 'System maintenance scheduled for tonight', time: '3 hours ago', read: true },
  ]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Get business owner name
  const getBusinessOwnerName = () => {
    if (currentUser && currentUser.owner_name) {
      return currentUser.owner_name;
    }
    return 'Business Owner';
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-menu')) {
        setShowNotifications(false);
      }
      if (showLocationDropdown && !event.target.closest('.location-selector')) {
        setShowLocationDropdown(false);
      }
      if (showUserDropdown && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showLocationDropdown, showUserDropdown]);

  const handleLogout = () => {
    logout();
    navigate("/login-business");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleProfileNavigation = useCallback((path) => {
    navigate(path);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  }, [navigate, isMobileMenuOpen]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(
      notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(
      notifications.map(notif => ({ ...notif, read: true }))
    );
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const handleShowReview = (order) => {
    setSelectedOrder(order);
    setShowReviewForm(true);
  };

  const handleCloseReview = () => {
    setShowReviewForm(false);
    setSelectedOrder(null);
  };

  const handleSubmitReview = (reviewData) => {
    console.log('Review submitted:', reviewData);
    handleCloseReview();
  };

  const businessName = currentUser?.business_name || 'Business User';
  const businessInitial = businessName.charAt(0).toUpperCase();

  return (
    <nav className={`business-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container wide-container">
        <div className="navbar-content">
          <div className="navbar-left">
            <Link to="/business-home" className="logo">
              <img src={logo} alt="LinkLocal Logo" />
              <span>LinkLocal</span>
              <div className="badge business-badge">Business</div>
            </Link>
            
            <div className="location-selector">
              <div 
                className="selected-location"
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              >
                <i className="fas fa-map-marker-alt"></i>
                <span>{selectedCity}</span>
                <i className={`fas fa-chevron-${showLocationDropdown ? 'up' : 'down'}`}></i>
              </div>
              
              {showLocationDropdown && (
                <div className="location-dropdown">
                  {['coimbatore', 'chennai', 'bangalore', 'mumbai', 'delhi', 'hyderabad'].map(city => (
                    <div 
                      key={city} 
                      className={`location-option ${selectedCity === city ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCity(city);
                        setShowLocationDropdown(false);
                      }}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={`navbar-middle ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
            <form className="search-box" onSubmit={handleSearchSubmit}>
              <div className="search-icon-wrapper">
                <i className="fas fa-search search-icon"></i>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, suppliers..."
                aria-label="Search"
                className="search-input"
              />
              <button type="submit" className="search-btn">Search</button>
            </form>

            <div className="mobile-links">
              <Link to="/business-home" className="mobile-link">
                <i className="fas fa-home"></i>
                <span>Home</span>
              </Link>
              <Link to="/business-home/my-shop" className="mobile-link">
                <i className="fas fa-store"></i>
                <span>My Shop</span>
              </Link>
              <Link to="/order-history" className="mobile-link">
                <i className="fas fa-clipboard-list"></i>
                <span>Orders</span>
              </Link>
              <button className="mobile-link" onClick={toggleCart}>
                <i className="fas fa-shopping-cart"></i>
                <span>Cart</span>
                {cartCount > 0 && <span className="cart-badge-mobile">{cartCount}</span>}
              </button>
              <button 
                onClick={() => handleProfileNavigation('/business-profile')} 
                className="mobile-link"
              >
                <i className="fas fa-user"></i>
                <span>Profile</span>
              </button>
              <button onClick={handleLogout} className="mobile-link logout">
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>

          <div className="navbar-right">
            <Link to="/business-home/my-shop" className="nav-link shop-link">
              <i className="fas fa-store"></i>
              <span>My Shop</span>
            </Link>

            <Link to="/order-history" className="nav-link orders-link">
              <i className="fas fa-clipboard-list"></i>
              <span>Orders</span>
            </Link>

            <button onClick={toggleCart} className="nav-link cart-link">
              <i className="fas fa-shopping-cart"></i>
              <span>Cart</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            <div className="notification-menu">
              <button 
                className="nav-link notification-btn" 
                onClick={toggleNotifications}
                aria-label="Notifications"
              >
                <i className="fas fa-bell"></i>
                {getUnreadCount() > 0 && (
                  <span className="notification-badge">{getUnreadCount()}</span>
                )}
              </button>
              
              {showNotifications && (
                <div className="dropdown-menu notification-dropdown">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    <button 
                      className="mark-all-read"
                      onClick={markAllNotificationsAsRead}
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="notification-list">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <NotificationItem 
                          key={notification.id} 
                          notification={notification}
                          onRead={markNotificationAsRead}
                        />
                      ))
                    ) : (
                      <div className="no-notifications">No notifications yet</div>
                    )}
                  </div>
                  <div className="notification-footer">
                    <button 
                      className="view-all-btn"
                      onClick={() => {
                        navigate('/business-home/notifications');
                        setShowNotifications(false);
                      }}
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="user-menu">
              <button 
                className="user-btn" 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                aria-label="My Account"
              >
                <div className="user-avatar">
                  {businessInitial}
                </div>
                <span className="user-name">{getBusinessOwnerName()}</span>
              </button>
              {showUserDropdown && (
                <div className="dropdown-menu user-dropdown-content" ref={userDropdownRef}>
                  <Link to="/business-profile">
                    <i className="fas fa-user"></i> Profile
                  </Link>
                  <Link to="/business-home/my-shop">
                    <i className="fas fa-store"></i> My Shop
                  </Link>
                  <Link to="/order-history">
                    <i className="fas fa-history"></i> Order History
                  </Link>
                  <button onClick={handleLogout} className="dropdown-logout">
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </div>
              )}
            </div>

            <button 
              className={`mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`} 
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>
      {showReviewForm && selectedOrder && (
        <ReviewForm 
          order={selectedOrder}
          onClose={handleCloseReview}
          onSubmit={handleSubmitReview}
        />
      )}
    </nav>
  );
};

export default B_Navbar;
