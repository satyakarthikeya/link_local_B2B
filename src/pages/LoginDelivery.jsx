import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const LoginDelivery = () => {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in with:", formData);

    // TODO: Send login data to backend and validate user
    // If login is successful, redirect to Delivery Home
    navigate("/delivery-home");
  };

  return (
    <div className="auth-container">
      <div className="auth-logo">Link<span>Local</span></div>
      <h2>Delivery Partner Login</h2>

      <form id="loginForm" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="username">Username or Email</label>
          <div className="input-container">
            <i className="fas fa-user"></i>
            <input
              type="text"
              id="username"
              required
              placeholder="Enter your username or email"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <div className="input-container">
            <i className="fas fa-lock"></i>
            <input
              type={passwordVisible ? "text" : "password"}
              id="password"
              required
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
            >
              <i className={`fas ${passwordVisible ? "fa-eye-slash" : "fa-eye"}`}></i>
            </button>
          </div>
        </div>

        <a href="#" className="forgot-password">Forgot password?</a>

        <button type="submit" className="btn">
          <i className="fas fa-sign-in-alt"></i> Login
        </button>
      </form>

      <div className="auth-divider"><span>OR</span></div>

      <button className="btn secondary" onClick={() => navigate("/register-delivery")}>
        <i className="fas fa-user-plus"></i> Create New Account
      </button>

      <button className="btn back-btn" onClick={() => navigate("/login")}>
        <i className="fas fa-arrow-left"></i> Back to Options
      </button>

      <div className="auth-footer">
        Need help? <a href="#">Contact Support</a>
      </div>
    </div>
  );
};

export default LoginDelivery;
