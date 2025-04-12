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
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
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
    if (fieldErrors[id]) {
      setFieldErrors({
        ...fieldErrors,
        [id]: ""
      });
    }
  };

  const validateField = (field, value) => {
    switch (field) {
      case 'email':
        return /^\S+@\S+\.\S+$/.test(value) ? "" : "Please enter a valid email address";
      case 'phone':
        return /^[6-9]\d{9}$/.test(value) ? "" : "Please enter a valid 10-digit phone number";
      case 'password':
        return value.length >= 8 ? "" : "Password must be at least 8 characters long";
      case 'confirmPassword':
        return value === formData.password ? "" : "Passwords do not match";
      default:
        return value.trim() ? "" : "This field is required";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const errors = {};
    let hasError = false;
    
    Object.entries(formData).forEach(([field, value]) => {
      if (field !== 'terms' && field !== 'street') {
        const errorMsg = validateField(field, value);
        if (errorMsg) {
          errors[field] = errorMsg;
          hasError = true;
        }
      }
    });
    
    if (!formData.terms) {
      errors.terms = "You must agree to the Terms of Service";
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(errors);
      setError("Please fix the errors highlighted below");
      return;
    }

    try {
      setLoading(true);
      
      await registerBusiness({
        business_name: formData.businessName,
        name: formData.ownerName || formData.businessName, // Changed from owner_name to name
        email: formData.email,
        phone_no: formData.phone,
        area: formData.area,
        street: formData.street,
        category: formData.category,
        gst_number: "",
        password: formData.password
      });

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

      {error && <div className="error-message" role="alert"><i className="fas fa-exclamation-circle"></i> {error}</div>}

      <form id="registerForm" onSubmit={handleSubmit} noValidate>
        <div className={`input-group ${fieldErrors.businessName ? 'error' : ''}`}>
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
              aria-invalid={!!fieldErrors.businessName}
              aria-describedby={fieldErrors.businessName ? "businessName-error" : undefined}
            />
          </div>
          {fieldErrors.businessName && <div className="field-error" id="businessName-error">{fieldErrors.businessName}</div>}
        </div>

        <div className={`input-group ${fieldErrors.ownerName ? 'error' : ''}`}>
          <label htmlFor="ownerName">Owner Name</label>
          <div className="input-container">
            <i className="fas fa-user"></i>
            <input 
              type="text" 
              id="ownerName" 
              required 
              placeholder="Enter owner's full name"
              value={formData.ownerName}
              onChange={handleInputChange}
              disabled={loading}
              aria-invalid={!!fieldErrors.ownerName}
              aria-describedby={fieldErrors.ownerName ? "ownerName-error" : undefined}
            />
          </div>
          {fieldErrors.ownerName && <div className="field-error" id="ownerName-error">{fieldErrors.ownerName}</div>}
        </div>

        <div className={`input-group ${fieldErrors.email ? 'error' : ''}`}>
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
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
          </div>
          {fieldErrors.email && <div className="field-error" id="email-error">{fieldErrors.email}</div>}
        </div>

        <div className={`input-group ${fieldErrors.phone ? 'error' : ''}`}>
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
              aria-invalid={!!fieldErrors.phone}
              aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
            />
          </div>
          {fieldErrors.phone && <div className="field-error" id="phone-error">{fieldErrors.phone}</div>}
        </div>

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

        <div className={`input-group ${fieldErrors.password ? 'error' : ''}`}>
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
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
            />
            <i 
              className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} password-toggle`} 
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>
          {fieldErrors.password && <div className="field-error" id="password-error">{fieldErrors.password}</div>}
        </div>

        <div className={`input-group ${fieldErrors.confirmPassword ? 'error' : ''}`}>
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
              aria-invalid={!!fieldErrors.confirmPassword}
              aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
            />
          </div>
          {fieldErrors.confirmPassword && <div className="field-error" id="confirmPassword-error">{fieldErrors.confirmPassword}</div>}
        </div>

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
          {fieldErrors.terms && <div className="field-error">{fieldErrors.terms}</div>}
        </div>

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

      <button 
        className="btn secondary" 
        onClick={() => navigate("/login-business")}
        disabled={loading}
      >
        <i className="fas fa-sign-in-alt"></i> Login to Existing Account
      </button>

      <button 
        className="btn back-btn" 
        onClick={() => navigate("/login")}
        disabled={loading}
      >
        <i className="fas fa-arrow-left"></i> Back to Options
      </button>

      <div className="auth-footer">
        Need help? <a href="#">Contact Support</a>
      </div>
    </div>
  );
};

export default RegisterBusiness;
