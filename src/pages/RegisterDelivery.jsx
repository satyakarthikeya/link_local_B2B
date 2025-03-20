import React, { useState } from "react";
import "../styles/auth.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const RegisterDelivery = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  return (
    <div className="auth-container">
      <div className="auth-logo">Link<span>Local</span></div>
      <h2>Join as Delivery Partner</h2>

      <form id="registerForm">
        {/* Full Name */}
        <div className="input-group">
          <label htmlFor="fullName">Full Name</label>
          <div className="input-container">
            <i className="fas fa-user"></i>
            <input type="text" id="fullName" required placeholder="Enter your full name" />
          </div>
        </div>

        {/* Email Address */}
        <div className="input-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-container">
            <i className="fas fa-envelope"></i>
            <input type="email" id="email" required placeholder="Enter your email address" />
          </div>
        </div>

        {/* Phone Number */}
        <div className="input-group">
          <label htmlFor="phone">Phone Number</label>
          <div className="input-container">
            <i className="fas fa-phone"></i>
            <input type="tel" id="phone" required placeholder="Enter your phone number" />
          </div>
        </div>

        {/* City */}
        <div className="input-group">
          <label htmlFor="city">City</label>
          <div className="input-container">
            <i className="fas fa-city"></i>
            <input type="text" id="city" required placeholder="Enter your city" />
          </div>
        </div>

          {/* Vehicle Type (Dropdown) */}
          <div className="input-group">
            <label htmlFor="vehicleType">Vehicle Type</label>
            <div className="input-container">
              <i className="fas fa-motorcycle"></i>
              <select id="vehicleType" required>
                <option value="">Select your vehicle type</option>
                <option value="Bike">Bike</option>
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
              </select>
            </div>
          </div>

        {/* Vehicle Number */}
        <div className="input-group">
          <label htmlFor="vehicleNumber">Vehicle Number</label>
          <div className="input-container">
            <i className="fas fa-id-card"></i>
            <input type="text" id="vehicleNumber" required placeholder="Enter your vehicle number" />
          </div>
        </div>

        {/* Password */}
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <div className="input-container">
            <i className="fas fa-lock"></i>
            <input 
              type={passwordVisible ? "text" : "password"} 
              id="password" 
              required 
              placeholder="Create a password (min. 8 characters)" 
            />
            <button type="button" className="password-toggle" onClick={togglePasswordVisibility}>
              <i className={passwordVisible ? "fas fa-eye-slash" : "fas fa-eye"}></i>
            </button>
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

        {/* Terms & Conditions */}
        <div className="terms">
          <input type="checkbox" id="terms" required />
          <label htmlFor="terms">
            I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
          </label>
        </div>

        {/* Register Button */}
        <button type="submit" className="btn">
          <i className="fas fa-user-plus"></i> Join as Delivery Partner
        </button>
      </form>

      <div className="auth-divider"><span>OR</span></div>

      {/* Login Button */}
      <button className="btn secondary" onClick={() => (window.location.href = "/login-delivery")}>
        <i className="fas fa-sign-in-alt"></i> Login to Existing Account
      </button>

      {/* Back Button */}
      <button className="btn back-btn" onClick={() => (window.location.href = "/login")}>
        <i className="fas fa-arrow-left"></i> Back to Options
      </button>
    </div>
  );
};

export default RegisterDelivery;
