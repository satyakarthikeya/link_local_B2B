import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/delivery_home.css"; // Ensure correct path
import "@fortawesome/fontawesome-free/css/all.min.css";

const D_Navbar = ({ isOnlineGlobal, setIsOnlineGlobal }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Use the global status if provided, otherwise use local state
  const [isOnline, setIsOnline] = useState(true);

  // Sync local state with global state
  useEffect(() => {
    if (setIsOnlineGlobal && isOnlineGlobal !== undefined) {
      setIsOnline(isOnlineGlobal);
    }
  }, [isOnlineGlobal]);

  // Handle status toggle
  const toggleStatus = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    // Update global state if callback is provided
    if (setIsOnlineGlobal) {
      setIsOnlineGlobal(newStatus);
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
    <header className="delivery-header">
      <div className="container">
        <div className="navbar">
          {/* Logo - Simplified */}
          <Link to="/delivery-home" className="logo">
            <span className="logo-text">Link<span className="highlight">Local</span></span>
          </Link>

          {/* Mobile Menu Button - Simplified */}
          <button 
            className="mobile-toggle" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>

          {/* Main Navigation - Simplified */}
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
                  <span>Map</span>
                </Link>
              </li>
              
            </ul>
          </nav>

          {/* Right Side Controls - Simplified */}
          <div className="nav-controls">
            {/* Simple Online/Offline Toggle Button */}
            <button 
              className={`status-button ${isOnline ? 'online' : 'offline'}`} 
              onClick={toggleStatus}
              title={isOnline ? "You are online - Click to go offline" : "You are offline - Click to go online"}
            >
              <i className="fas fa-circle"></i>
              <span>{isOnline ? "Online" : "Offline"}</span>
            </button>
            
            {/* Profile Button with Dropdown */}
            <div className="profile-menu" ref={dropdownRef}>
              <button 
                className="profile-button" 
                onClick={() => setProfileDropdown(!profileDropdown)}
                aria-expanded={profileDropdown}
                aria-label="Profile menu"
              >
                <i className="fas fa-user-circle"></i>
              </button>
              
              {/* Profile Dropdown Menu */}
              {profileDropdown && (
                <div className="profile-dropdown">
                  <div className="profile-header">
                    <div className="profile-info">
                      <h4>Kenny</h4>
                      <p>Delivery Partner</p>
                    </div>
                  </div>
                  <div className="profile-links">
                    <div className="user-dropdown" ref={dropdownRef}>
                      <Link to="/delivery-profile" className="dropdown-item">
                        <i className="fas fa-user"></i> My Profile
                      </Link>
                      <Link to="/map-view" className="dropdown-item">
                        <i className="fas fa-map"></i> Map View
                      </Link>
                      <button 
                        onClick={handleLogout} 
                        className="dropdown-item" 
                        disabled={isLoggingOut}
                      >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                      </button>
                    </div>
                  </div>
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
