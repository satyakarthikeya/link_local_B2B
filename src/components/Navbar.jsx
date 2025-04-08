import React from "react";
import { Link } from "react-router-dom";
import "../styles/main.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Logo = () => (
  <div className="logo">
    <Link to="/">
      <span className="logo-text">
        Link<span className="highlight">Local</span>
      </span>
    </Link>
  </div>
);

const NavLinks = () => (
  <nav className="main-nav">
    {/* Add navigation links here */}
  </nav>
);

const MobileToggle = () => (
  <button className="mobile-toggle">
    <span></span>
    <span></span>
    <span></span>
  </button>
);

const Navbar = () => {
  return (
    <header>
      <div className="navbar">
        <Logo />
        <NavLinks />
        <div className="nav-buttons">
          <button
            className="login-btn"
            onClick={() => (window.location.href = "/login")}
          >
            Login / Sign Up
          </button>
        </div>
        <MobileToggle />
      </div>
    </header>
  );
};

export default Navbar;