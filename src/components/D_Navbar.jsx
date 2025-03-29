import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/delivery_home.css"; // Use the same styles

const D_Header = () => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header>
      <nav className="navbar">
        {/* Logo */}
        <div className="logo">
          <Link to="/delivery-home" className="logo-text">
            Link<span className="highlight">Local</span> 🚚
          </Link>
        </div>

        {/* Navigation Links */}
        <ul className="main-nav">
          <li>
            <Link to="/delivery-home">
              <i className="fas fa-home"></i> Home
            </Link>
          </li>
          <li>
            <Link to="/orders">
              <i className="fas fa-box"></i> My Orders
            </Link>
          </li>
          <li>
            <Link to="/earnings">
              <i className="fas fa-dollar-sign"></i> Earnings
            </Link>
          </li>

          {/* Profile Dropdown */}
          <li className="profile-item" onClick={() => setShowProfile(!showProfile)}>
            <i className="fas fa-user-circle"></i>
            {showProfile && (
              <div className="profile-popup">
                <ul>
                  <li onClick={() => navigate("/profile")}>View Profile</li>
                  <li onClick={() => navigate("/settings")}>Settings</li>
                  <li onClick={() => navigate("/logout")}>Logout</li>
                </ul>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default D_Header;
