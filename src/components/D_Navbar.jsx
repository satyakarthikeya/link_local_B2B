import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import "../styles/delivery_home.css"; 
import "@fortawesome/fontawesome-free/css/all.min.css";
import logo from "../assests/Logo.png";

const D_Navbar = ({ isOnlineGlobal, setIsOnlineGlobal }) => {
  const navigate = useNavigate();
  const { currentUser, getProfileName, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Get delivery agent name and initial for profile display
  const deliveryName = currentUser?.name || 'Delivery Partner';
  const deliveryInitial = deliveryName.charAt(0).toUpperCase();

  // Use the global status if provided, otherwise use local state
  const [isOnline, setIsOnline] = useState(true);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync local state with global state
  useEffect(() => {
    if (isOnlineGlobal !== undefined) {
      setIsOnline(isOnlineGlobal);
    }
  }, [isOnlineGlobal]);

  // Fetch initial status from backend when component mounts or user changes
  useEffect(() => {
    const fetchAvailabilityStatus = async () => {
      if (currentUser?.agent_id) {
        try {
          const profileResponse = await api.delivery.getProfile();
          const serverStatus = profileResponse.data.availability_status === "Available";
          setIsOnline(serverStatus);
          if (setIsOnlineGlobal) {
            setIsOnlineGlobal(serverStatus);
          }
        } catch (error) {
          console.error("Failed to fetch availability status:", error);
          // Continue with default status if fetch fails
        }
      }
    };

    fetchAvailabilityStatus();
  }, [currentUser, setIsOnlineGlobal]);

  // Handle status toggle
  const toggleStatus = async () => {
    if (isUpdatingStatus) return;
    
    setIsUpdatingStatus(true);
    try {
      const newStatus = !isOnline;
      
      if (currentUser && currentUser.agent_id) {
        await api.delivery.updateAvailabilityStatus(currentUser.agent_id, newStatus);
      }
      
      setIsOnline(newStatus);
      // Update global state if callback is provided
      if (setIsOnlineGlobal) {
        setIsOnlineGlobal(newStatus);
      }
    } catch (error) {
      console.error("Failed to update availability status:", error);
      alert("Failed to update your status. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Set delivery agent offline before logout
      if (currentUser?.agent_id && isOnline) {
        try {
          await api.delivery.updateAvailabilityStatus(currentUser.agent_id, false);
        } catch (statusErr) {
          console.error("Error setting offline status during logout:", statusErr);
          // Continue with logout even if status update fails
        }
      }
      
      await logout();
      setIsLoggingOut(false);
      navigate('/login-delivery', { replace: true });
    } catch (error) {
      console.error("Failed to log out:", error);
      alert("Failed to log out. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <header className={`delivery-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="navbar">
          {/* Logo */}
          <div className="navbar-left">
            <Link to="/delivery-home" className="logo">
              <img src={logo} alt="LinkLocal Logo" />
              <span>LinkLocal</span>
              <div className="badge delivery-badge">Delivery</div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`mobile-toggle ${menuOpen ? 'active' : ''}`} 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Main Navigation */}
          <nav className={`main-nav ${menuOpen ? 'mobile-active' : ''}`}>
            <ul>
              <li>
                <Link to="/delivery-home">
                  <i className="fas fa-home"></i>
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/map-view">
                  <i className="fas fa-map-marked-alt"></i>
                  <span>Map View</span>
                </Link>
              </li>
              <li>
                <Link to="/delivery-profile">
                  <i className="fas fa-user"></i>
                  <span>My Profile</span>
                </Link>
              </li>
            </ul>

            {/* Mobile-only menu items */}
            <div className="mobile-links">
              <Link to="/delivery-home" className="mobile-link">
                <i className="fas fa-home"></i>
                <span>Home</span>
              </Link>
              <Link to="/map-view" className="mobile-link">
                <i className="fas fa-map-marked-alt"></i>
                <span>Map View</span>
              </Link>
              <Link to="/delivery-profile" className="mobile-link">
                <i className="fas fa-user"></i>
                <span>Profile</span>
              </Link>
              <button onClick={handleLogout} className="mobile-link logout">
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
            </div>
          </nav>

          {/* Right Side Controls */}
          <div className="navbar-right">
            {/* Online/Offline Toggle Button */}
            <button 
              className={`status-button ${isOnline ? 'online' : 'offline'} ${isUpdatingStatus ? 'updating' : ''}`} 
              onClick={toggleStatus}
              disabled={isUpdatingStatus}
              title={isOnline ? "You are online - Click to go offline" : "You are offline - Click to go online"}
            >
              <i className={`fas ${isUpdatingStatus ? 'fa-spinner fa-spin' : 'fa-circle'}`}></i>
              <span>{isUpdatingStatus ? 'Updating...' : isOnline ? "Online" : "Offline"}</span>
            </button>
            
            {/* Profile Button with Dropdown */}
            <div className="user-menu" ref={dropdownRef}>
              <button 
                className="user-btn" 
                onClick={() => setProfileDropdown(!profileDropdown)}
                aria-expanded={profileDropdown}
                aria-label="Profile menu"
              >
                <div className="user-avatar">
                  {deliveryInitial}
                </div>
                <span className="user-name">{getProfileName()}</span>
              </button>
              
              {/* Profile Dropdown Menu */}
              {profileDropdown && (
                <div className="dropdown-menu user-dropdown-content">
                  <Link to="/delivery-profile">
                    <i className="fas fa-user"></i> Profile
                  </Link>
                  <Link to="/map-view">
                    <i className="fas fa-map-marked-alt"></i> Map View
                  </Link>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-status-toggle">
                    <span>Status: </span>
                    <button 
                      className={`dropdown-status-btn ${isOnline ? 'online' : 'offline'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus();
                      }}
                      disabled={isUpdatingStatus}
                    >
                      <i className={`fas ${isUpdatingStatus ? 'fa-spinner fa-spin' : 'fa-circle'}`}></i>
                      <span>{isOnline ? 'Online' : 'Offline'}</span>
                    </button>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button 
                    onClick={handleLogout} 
                    className="dropdown-logout" 
                    disabled={isLoggingOut}
                  >
                    <i className={`fas ${isLoggingOut ? 'fa-spinner fa-spin' : 'fa-sign-out-alt'}`}></i>
                    <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default D_Navbar;
