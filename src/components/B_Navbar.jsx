import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../Styles/navbar.css";
import logo from "../assests/Logo.jpg";

const B_Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  
  const [cartCount, setCartCount] = useState(3); // For demo purposes
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New order received", message: "Order #1234 has been placed", time: "10 min ago", isRead: false },
    { id: 2, title: "Payment received", message: "Payment for order #1230 confirmed", time: "2 hours ago", isRead: false },
    { id: 3, title: "Return request", message: "Customer requested return for order #1225", time: "1 day ago", isRead: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login-business");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showUserMenu) setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    if (showNotifications) setShowNotifications(false);
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.isRead).length;
  };

  // Check if the path is active
  const isActive = (path) => {
    return location.pathname === path;
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
            
            <button className="mobile-toggle" onClick={toggleMobileMenu}>
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>

          <div className={`navbar-middle ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Search products, suppliers, services..." />
              <button className="search-btn">Search</button>
            </div>
            
            <div className="mobile-nav-links">
              <Link to="/business-home" className={`nav-link ${isActive('/business-home') ? 'active' : ''}`}>
                <i className="fas fa-home"></i>
                <span>Dashboard</span>
              </Link>
              <Link to="/business-home/inventory" className={`nav-link ${isActive('/business-home/inventory') ? 'active' : ''}`}>
                <i className="fas fa-boxes"></i>
                <span>Inventory</span>
              </Link>
              <Link to="/business-home/orders" className={`nav-link ${isActive('/business-home/orders') ? 'active' : ''}`}>
                <i className="fas fa-shopping-bag"></i>
                <span>Orders</span>
              </Link>
              <Link to="/business-home/analytics" className={`nav-link ${isActive('/business-home/analytics') ? 'active' : ''}`}>
                <i className="fas fa-chart-line"></i>
                <span>Analytics</span>
              </Link>
            </div>
          </div>

          <div className="navbar-right">
            <Link to="/business-home/my-shop" className="nav-link shop-link">
              <i className="fas fa-store"></i>
              <span>My Shop</span>
            </Link>
            
            <div className="notification-menu">
              <button 
                className={`nav-link notification-btn ${getUnreadCount() > 0 ? 'has-alerts' : ''}`} 
                onClick={toggleNotifications}
              >
                <i className="fas fa-bell"></i>
                {getUnreadCount() > 0 && <span className="notification-badge">{getUnreadCount()}</span>}
              </button>
              
              {showNotifications && (
                <div className="dropdown-menu notification-dropdown">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    {getUnreadCount() > 0 && (
                      <button className="read-all-btn" onClick={markAllAsRead}>
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="empty-notifications">No notifications yet</div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          className={`notification-item ${notification.isRead ? '' : 'unread'}`} 
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="notification-icon">
                            <i className="fas fa-circle-dot"></i>
                          </div>
                          <div className="notification-content">
                            <h4>{notification.title}</h4>
                            <p>{notification.message}</p>
                            <span className="notification-time">{notification.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="notification-footer">
                    <Link to="/notifications">View All Notifications</Link>
                  </div>
                </div>
              )}
            </div>
            
            <Link to="/business-home/cart" className="nav-link cart-link">
              <i className="fas fa-shopping-cart"></i>
              <span>Cart</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            
            <div className="user-menu">
              <button className="nav-link user-btn" onClick={toggleUserMenu}>
                <div className="user-avatar">
                  {user?.businessName?.charAt(0) || "B"}
                </div>
                <span className="user-name">{user ? user.businessName : "My Business"}</span>
                <i className="fas fa-chevron-down"></i>
              </button>
              
              {showUserMenu && (
                <div className="dropdown-menu user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-info">
                      <div className="user-avatar large">{user?.businessName?.charAt(0) || "B"}</div>
                      <div className="user-details">
                        <h4>{user ? user.businessName : "My Business"}</h4>
                        <p>{user ? user.email : "business@example.com"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/business-profile" className="dropdown-item">
                    <i className="fas fa-user"></i> Business Profile
                  </Link>
                  <Link to="/business-home/my-shop" className="dropdown-item">
                    <i className="fas fa-store"></i> My Shop
                  </Link>
                  <Link to="/business-settings" className="dropdown-item">
                    <i className="fas fa-cog"></i> Settings
                  </Link>
                  <Link to="/business-support" className="dropdown-item">
                    <i className="fas fa-headset"></i> Help & Support
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default B_Navbar;
