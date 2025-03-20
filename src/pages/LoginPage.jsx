import React from "react";
import "../styles/auth.css"; // Import styles
import '@fortawesome/fontawesome-free/css/all.min.css';


const LoginPage = () => {
  return (
    <div className="auth-container">
      <div className="auth-logo">Link<span>Local</span></div>
      <h2>Choose Your Account Type</h2>

      <div className="account-options">
        <div className="account-option business">
          <div className="account-icon">
            <i className="fas fa-briefcase"></i>
          </div>
          <h3>Business Account</h3>
          <p>For retailers, restaurants, and other businesses</p>
          <button className="btn" onClick={() => (window.location.href = "/login-business")}>
            <i className="fas fa-sign-in-alt"></i> Login
          </button>
          <button className="btn secondary" onClick={() => (window.location.href = "/register-business")}>
            <i className="fas fa-user-plus"></i> Sign Up
          </button>
        </div>

        <div className="auth-divider"><span>OR</span></div>

        <div className="account-option delivery">
          <div className="account-icon">
            <i className="fas fa-truck"></i>
          </div>
          <h3>Delivery Partner</h3>
          <p>Join our network of delivery professionals</p>
          <button className="btn" onClick={() => (window.location.href = "/login-delivery")}>
            <i className="fas fa-sign-in-alt"></i> Login
          </button>
          <button className="btn secondary" onClick={() => (window.location.href = "/register-delivery")}>
            <i className="fas fa-user-plus"></i> Sign Up
          </button>
        </div>
      </div>

      <button className="btn back-btn" onClick={() => (window.location.href = "/")}>
        <i className="fas fa-arrow-left"></i> Back to Home
      </button>

      <div className="auth-footer">
        Need help? <a href="#">Contact Support</a>
      </div>
    </div>
  );
};

export default LoginPage;
