import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const RegisterDelivery = () => {
  const navigate = useNavigate();
  const { registerDelivery } = useAuth();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    vehicleType: "",
    vehicleNumber: "",
    password: "",
    confirmPassword: "",
    terms: false
  });

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (!formData.fullName || !formData.email || !formData.phone || 
        !formData.city || !formData.vehicleType || !formData.vehicleNumber ||
        !formData.password) {
      setError("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!formData.terms) {
      setError("You must agree to the Terms of Service");
      return;
    }

    try {
      setLoading(true);
      
      // Call the register function from AuthContext
      await registerDelivery({
        name: formData.fullName,
        email: formData.email,
        contact_number: formData.phone,
        area: formData.city,
        vehicle_type: formData.vehicleType,
        vehicle_number: formData.vehicleNumber,
        password: formData.password,
        status: "Available" // Default status for new delivery partner
      });

      // Redirect to delivery home page on successful registration
      navigate("/delivery-home");
    } catch (err) {
      console.error("Registration error:", err);
      setError(typeof err === "string" ? err : "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-logo">Link<span>Local</span></div>
      <h2>Join as Delivery Partner</h2>

      {error && <div className="error-message">{error}</div>}

      <form id="registerForm" onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="input-group">
          <label htmlFor="fullName">Full Name</label>
          <div className="input-container">
            <i className="fas fa-user"></i>
            <input 
              type="text" 
              id="fullName" 
              required 
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleInputChange}
              disabled={loading} 
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="input-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-container">
            <i className="fas fa-envelope"></i>
            <input 
              type="email" 
              id="email" 
              required 
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading} 
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="input-group">
          <label htmlFor="phone">Phone Number</label>
          <div className="input-container">
            <i className="fas fa-phone"></i>
            <input 
              type="tel" 
              id="phone" 
              required 
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={loading} 
            />
          </div>
        </div>

        {/* City */}
        <div className="input-group">
          <label htmlFor="city">City</label>
          <div className="input-container">
            <i className="fas fa-city"></i>
            <input 
              type="text" 
              id="city" 
              required 
              placeholder="Enter your city"
              value={formData.city}
              onChange={handleInputChange}
              disabled={loading} 
            />
          </div>
        </div>

        {/* Vehicle Type (Dropdown) */}
        <div className="input-group">
          <label htmlFor="vehicleType">Vehicle Type</label>
          <div className="input-container">
            <i className="fas fa-motorcycle"></i>
            <select 
              id="vehicleType" 
              required
              value={formData.vehicleType}
              onChange={handleInputChange}
              disabled={loading}
            >
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
            <input 
              type="text" 
              id="vehicleNumber" 
              required 
              placeholder="Enter your vehicle number"
              value={formData.vehicleNumber}
              onChange={handleInputChange}
              disabled={loading} 
            />
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
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}  
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
            <input 
              type="password" 
              id="confirmPassword" 
              required 
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={loading} 
            />
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="terms">
          <input 
            type="checkbox" 
            id="terms" 
            required
            checked={formData.terms}
            onChange={handleInputChange}
            disabled={loading} 
          />
          <label htmlFor="terms">
            I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
          </label>
        </div>

        {/* Register Button */}
        <button type="submit" className="btn" disabled={loading}>
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Processing...
            </>
          ) : (
            <>
              <i className="fas fa-user-plus"></i> Join as Delivery Partner
            </>
          )}
        </button>
      </form>

      <div className="auth-divider"><span>OR</span></div>

      {/* Login Button */}
      <button 
        className="btn secondary" 
        onClick={() => navigate("/login-delivery")}
        disabled={loading}
      >
        <i className="fas fa-sign-in-alt"></i> Login to Existing Account
      </button>

      {/* Back Button */}
      <button 
        className="btn back-btn" 
        onClick={() => navigate("/login")}
        disabled={loading}
      >
        <i className="fas fa-arrow-left"></i> Back to Options
      </button>
    </div>
  );
};

export default RegisterDelivery;
