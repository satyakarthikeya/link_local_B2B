import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { AuthContext } from "../context/AuthContext";
import "../styles/navbar.css";
import logo from "../assests/Logo.png";

// Notification item component
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

const B_Navbar = ({ 
  selectedCity, 
  setSelectedCity, 
  searchQuery, 
  setSearchQuery, 
  cart, 
  setShowCart, 
  navigate, 
  showLocationDropdown, 
  setShowLocationDropdown 
}) => {
  const { user, logout } = useContext(AuthContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(3); // This should come from a cart context or API
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'order', message: 'New order received from Chennai Electronics', time: '2 mins ago', read: false },
    { id: 2, type: 'payment', message: 'Payment of ₹15,400 received', time: '1 hour ago', read: false },
    { id: 3, type: 'system', message: 'System maintenance scheduled for tonight', time: '3 hours ago', read: true },
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close notifications panel when clicking outside
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-menu')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleLogout = () => {
    logout();
    navigate("/login-business");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
    navigate(`/business-home/search?q=${encodeURIComponent(searchQuery)}`);
    // Close mobile menu after search on mobile
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  const handleProfileNavigation = (path) => {
    navigate(path);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

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

  return (
    <nav className={`business-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
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
                  {['Coimbatore', 'Chennai', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Kolkata', 'Pune', 'Jaipur', 'Ahmedabad'].map(city => (
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
            <form onSubmit={handleSearch} className="search-bar">
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                placeholder="Search products, suppliers, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search"
              />
              <button type="submit" className="search-btn">Search</button>
            </form>

            {/* Mobile Navigation Links */}
            <div className="mobile-links">
              <Link to="/business-home" className="mobile-link">
                <i className="fas fa-home"></i>
                <span>Home</span>
              </Link>
              <div className="mobile-link location-selector-mobile">
                <i className="fas fa-map-marker-alt"></i>
                <select 
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  {['Coimbatore', 'Chennai', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Kolkata', 'Pune', 'Jaipur', 'Ahmedabad'].map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <Link to="/business-home/my-shop" className="mobile-link">
                <i className="fas fa-store"></i>
                <span>My Shop</span>
              </Link>
              <Link to="/business-home/cart" className="mobile-link">
                <i className="fas fa-shopping-cart"></i>
                <span>Cart</span>
                {cartCount > 0 && <span className="cart-badge-mobile">{cartCount}</span>}
              </Link>
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

            <Link to="/business-home/cart" className="nav-link cart-link">
              <i className="fas fa-shopping-cart"></i>
              <span>Cart</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

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
                onClick={() => handleProfileNavigation('/business-profile')}
                aria-label="My Account"
              >
                <i className="fas fa-user-circle"></i>
                <span>My Account</span>
              </button>
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
    </nav>
  );
};

B_Navbar.propTypes = {
  selectedCity: PropTypes.string,
  setSelectedCity: PropTypes.func,
  searchQuery: PropTypes.string,
  setSearchQuery: PropTypes.func,
  cart: PropTypes.array,
  setShowCart: PropTypes.func,
  navigate: PropTypes.func,
  showLocationDropdown: PropTypes.bool,
  setShowLocationDropdown: PropTypes.func
};

export default B_Navbar;