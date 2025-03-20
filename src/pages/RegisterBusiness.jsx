import React, { useState } from "react";
import "../styles/auth.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const RegisterBusiness = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-container">
      <div className="auth-logo">Link<span>Local</span></div>
      <h2>Create Business Account</h2>

      <form id="registerForm">
        {/* Business Name */}
        <div className="input-group">
          <label htmlFor="businessName">Business Name</label>
          <div className="input-container">
            <i className="fas fa-building"></i>
            <input type="text" id="businessName" required placeholder="Enter your business name" />
          </div>
        </div>

        {/* Email Address */}
        <div className="input-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-container">
            <i className="fas fa-envelope"></i>
            <input type="email" id="email" required placeholder="Enter your business email" />
          </div>
        </div>

        {/* Phone Number */}
        <div className="input-group">
          <label htmlFor="phone">Phone Number</label>
          <div className="input-container">
            <i className="fas fa-phone"></i>
            <input type="tel" id="phone" required placeholder="Enter your business phone" />
          </div>
        </div>

        {/* Location */}
        <div className="input-group">
          <label htmlFor="location">Location</label>
          <div className="input-container">
            <i className="fas fa-map-marker-alt"></i>
            <input type="text" id="location" required placeholder="Enter your business location" />
          </div>
        </div>

        {/* Business Type */}
        <div className="input-group">
          <label htmlFor="businessType">Business Type</label>
          <div className="input-container">
            <i className="fas fa-briefcase"></i>
            <input type="text" id="businessType" required placeholder="Enter your business type" />
          </div>
        </div>

        {/* Password */}
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <div className="input-container password-container">
            <i className="fas fa-lock"></i>
            <input 
              type={showPassword ? "text" : "password"} 
              id="password" 
              required 
              placeholder="Create a password (min. 8 characters)" 
            />
            <i 
              className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} password-toggle`} 
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>
        </div>



        {/* Confirm Password */}
        <div className="input-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="input-container">
            <i className="fas fa-lock"></i>
            <input type="password" id="confirmPassword" required placeholder="Confirm your password" />
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="terms-container">
          <input type="checkbox" id="terms" required />
          <label htmlFor="terms">
            I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
          </label>
        </div>

        {/* Create Account Button */}
        <button type="submit" className="btn primary">
          <i className="fas fa-user-plus"></i> Create Account
        </button>
      </form>

      <div className="auth-divider"><span>OR</span></div>

      {/* Login to Existing Account */}
      <button className="btn secondary" onClick={() => (window.location.href = "/login-business")}>
        <i className="fas fa-sign-in-alt"></i> Login to Existing Account
      </button>

      {/* Back to Options */}
      <button className="btn back-btn" onClick={() => (window.location.href = "/login")}>
        <i className="fas fa-arrow-left"></i> Back to Options
      </button>

      {/* Footer */}
      <div className="auth-footer">
        Need help? <a href="#">Contact Support</a>
      </div>
    </div>
  );
};

export default RegisterBusiness;
