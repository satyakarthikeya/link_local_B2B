import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const RegisterBusiness = () => {
  const navigate = useNavigate();
  const { registerBusiness } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    area: "",
    street: "",
    category: "",
    password: "",
    confirmPassword: "",
    terms: false
  });

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
    if (!formData.businessName || !formData.email || !formData.phone || 
        !formData.area || !formData.category || !formData.password) {
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
      await registerBusiness({
        name: formData.businessName, 
        business_name: formData.businessName,
        email: formData.email,
        contact_number: formData.phone,
        area: formData.area,
        street: formData.street,
        category: formData.category,
        password: formData.password
      });

      // Redirect to business home page on successful registration
      navigate("/business-home");
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
      <h2>Create Business Account</h2>

      {error && <div className="error-message">{error}</div>}

      <form id="registerForm" onSubmit={handleSubmit}>
        {/* Business Name */}
        <div className="input-group">
          <label htmlFor="businessName">Business Name</label>
          <div className="input-container">
            <i className="fas fa-building"></i>
            <input 
              type="text" 
              id="businessName" 
              required 
              placeholder="Enter your business name"
              value={formData.businessName}
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
              placeholder="Enter your business email"
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
              placeholder="Enter your business phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={loading}  
            />
          </div>
        </div>

        {/* Area */}
        <div className="input-group">
          <label htmlFor="area">Area</label>
          <div className="input-container">
            <i className="fas fa-map-marker-alt"></i>
            <input 
              type="text" 
              id="area" 
              required 
              placeholder="Enter your business area" 
              value={formData.area}
              onChange={handleInputChange}
              disabled={loading} 
            />
          </div>
        </div>

        {/* Street */}
        <div className="input-group">
          <label htmlFor="street">Street</label>
          <div className="input-container">
            <i className="fas fa-road"></i>
            <input 
              type="text" 
              id="street" 
              required 
              placeholder="Enter your business street address"
              value={formData.street}
              onChange={handleInputChange}
              disabled={loading}  
            />
          </div>
        </div>

        {/* Business Category */}
        <div className="input-group">
          <label htmlFor="category">Business Category</label>
          <div className="input-container">
            <i className="fas fa-briefcase"></i>
            <select 
              id="category" 
              required
              value={formData.category}
              onChange={handleInputChange}
              disabled={loading} 
            >
              <option value="">Select a category</option>
              <option value="SuperMarket">SuperMarket</option>
              <option value="Electronics">Electronics</option>
              <option value="Wholesale">Wholesale</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Textiles">Textiles</option>
              <option value="Stationery">Stationery</option>
              <option value="Hardware">Hardware</option>
            </select>
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
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}  
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

        {/* Terms and Conditions */}
        <div className="terms-container">
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

        {/* Create Account Button */}
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Creating Account...
            </>
          ) : (
            <>
              <i className="fas fa-user-plus"></i> Create Account
            </>
          )}
        </button>
      </form>

      <div className="auth-divider"><span>OR</span></div>

      {/* Login to Existing Account */}
      <button 
        className="btn secondary" 
        onClick={() => navigate("/login-business")}
        disabled={loading}
      >
        <i className="fas fa-sign-in-alt"></i> Login to Existing Account
      </button>

      {/* Back to Options */}
      <button 
        className="btn back-btn" 
        onClick={() => navigate("/login")}
        disabled={loading}
      >
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
