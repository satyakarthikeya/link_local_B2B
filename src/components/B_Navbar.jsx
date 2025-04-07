import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../Styles/navbar.css";
import logo from "../assests/Logo.jpg";

const B_Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login-business");
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <div className="navbar-left">
            <Link to="/business-home" className="logo">
              <img src={logo} alt="LinkLocal Logo" />
              <span>LinkLocal</span>
            </Link>
          </div>

          <div className="navbar-middle">
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Search businesses, products..." />
            </div>
          </div>

          <div className="navbar-right">
            <Link to="/search" className="nav-link">
              <i className="fas fa-search"></i>
              <span>Explore</span>
            </Link>
            <Link to="/bookmarks" className="nav-link">
              <i className="fas fa-bookmark"></i>
              <span>Bookmarks</span>
            </Link>
            <Link to="/messages" className="nav-link">
              <i className="fas fa-envelope"></i>
              <span>Messages</span>
            </Link>
            <div className="user-menu dropdown">
              <button className="nav-link dropdown-toggle">
                <i className="fas fa-user-circle"></i>
                <span>{user ? user.businessName : "My Account"}</span>
              </button>
              <div className="dropdown-menu">
                <Link to="/profile" className="dropdown-item">
                  <i className="fas fa-user"></i> My Profile
                </Link>
                <Link to="/business-home" className="dropdown-item">
                  <i className="fas fa-tachometer-alt"></i> Dashboard
                </Link>
                <Link to="/settings" className="dropdown-item">
                  <i className="fas fa-cog"></i> Settings
                </Link>
                <button onClick={handleLogout} className="dropdown-item">
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default B_Navbar;