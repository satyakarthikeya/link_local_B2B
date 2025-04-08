import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/main.css"; // Import your CSS
import '@fortawesome/fontawesome-free/css/all.min.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, setLocation] = useState("Coimbatore, TN");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleLocationDropdown = () => {
    setShowLocationDropdown(!showLocationDropdown);
  };

  const handleLocationSelect = (newLocation) => {
    setLocation(newLocation);
    setShowLocationDropdown(false);
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="navbar">
          <div className="logo">
            <Link to="/">
              <span className="logo-text">
                Link<span className="highlight">Local</span>
              </span>
            </Link>
          </div>
          
          <div className="location-selector" onClick={toggleLocationDropdown}>
            <i className="fas fa-map-marker-alt location-icon"></i>
            <span className="location-text">{location}</span>
            <i className="fas fa-chevron-down arrow-icon"></i>
            
            {showLocationDropdown && (
              <div className="location-dropdown">
                <div className="location-search">
                  <i className="fas fa-search"></i>
                  <input type="text" placeholder="Search for your location" />
                </div>
                <div className="popular-locations">
                  <h4>Popular Locations</h4>
                  <ul>
                    <li onClick={() => handleLocationSelect("Coimbatore, TN")}>
                      <i className="fas fa-map-marker-alt"></i> Coimbatore, TN
                    </li>
                    <li onClick={() => handleLocationSelect("Chennai, TN")}>
                      <i className="fas fa-map-marker-alt"></i> Chennai, TN
                    </li>
                    <li onClick={() => handleLocationSelect("Bangalore, KA")}>
                      <i className="fas fa-map-marker-alt"></i> Bangalore, KA
                    </li>
                    <li onClick={() => handleLocationSelect("Madurai, TN")}>
                      <i className="fas fa-map-marker-alt"></i> Madurai, TN
                    </li>
                  </ul>
                </div>
                <div className="current-location">
                  <button>
                    <i className="fas fa-location-arrow"></i> Use current location
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <nav className={`main-nav ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
            <ul>
              <li>
                <Link to="/about">
                  <i className="fas fa-info-circle"></i> About Us
                </Link>
              </li>
              <li>
                <Link to="/services">
                  <i className="fas fa-concierge-bell"></i> Services
                </Link>
              </li>
              <li>
                <Link to="/contact">
                  <i className="fas fa-envelope"></i> Contact
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="nav-buttons">
            <div className="search-container">
              <input type="text" className="search-input" placeholder="Search for products or services..." />
              <button className="search-btn">
                <i className="fas fa-search"></i>
              </button>
            </div>
            
            <div className="auth-buttons">
              <Link to="/register-business" className="business-btn">
                <i className="fas fa-store"></i> For Business
              </Link>
              <Link to="/register-delivery" className="delivery-btn">
                <i className="fas fa-truck"></i> Be a Partner
              </Link>
              <button className="login-btn" onClick={handleLogin}>
                <i className="fas fa-user"></i> Login / Sign Up
              </button>
            </div>
          </div>
          
          <button className={`mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`} onClick={toggleMobileMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
