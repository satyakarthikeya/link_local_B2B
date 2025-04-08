import React from "react";
import { Link } from "react-router-dom";
import "../styles/main.css"; // Import your CSS
import '@fortawesome/fontawesome-free/css/all.min.css';


const Navbar = () => {
  return (
    <header>
      <div className="navbar">
        <div className="logo">
          <Link to="/">
            <span className="logo-text">
              Link<span className="highlight">Local</span>
            </span>
          </Link>
        </div>
        <nav className="main-nav">
          {/* Navigation links can be added here if needed */}
        </nav>
        <div className="nav-buttons">
          <button className="login-btn" onClick={() => (window.location.href = "/login")}>
            Login / Sign Up
          </button>
        </div>
        <button className="mobile-toggle">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;