import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const RegisterDelivery = () => {
  const navigate = useNavigate();
  const { registerDelivery } = useAuth();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    vehicleType: "",
    vehicleNumber: "",
    licenseNo: "",
    password: "",
    confirmPassword: "",
    terms: false
  });

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value
    });
    
    // Clear field-specific error when user starts typing
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
      case 'vehicleNumber':
        return /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/.test(value) ? "" : "Please enter a valid vehicle number (e.g., KA01AB1234)";
      case 'licenseNo':
        return /^[A-Z0-9]{8,16}$/.test(value) ? "" : "Please enter a valid license number";
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
    
    // Validate all fields
    const errors = {};
    let hasError = false;
    
    Object.entries(formData).forEach(([field, value]) => {
      if (field !== 'terms') {
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
      
      // Call the register function from AuthContext with field names matching the schema
      await registerDelivery({
        name: formData.name,
        email: formData.email,
        contact_number: formData.phone,
        license_no: formData.licenseNo,
        vehicle_type: formData.vehicleType,
        vehicle_number: formData.vehicleNumber,
        area: formData.city, // Map city to area to match the schema
        password: formData.password
      });

      // Redirect to delivery home page on successful registration
      navigate("/delivery-home");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-logo">Link<span>Local</span></div>
      <h2>Become a Delivery Partner</h2>

      {error && <div className="error-message" role="alert"><i className="fas fa-exclamation-circle"></i> {error}</div>}

      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className={`input-group ${fieldErrors.name ? 'error' : ''}`}>
          <label htmlFor="name">Full Name</label>
          <div className="input-container">
            <i className="fas fa-user"></i>
            <input 
              type="text" 
              id="name" 
              required 
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
            />
          </div>
          {fieldErrors.name && <div className="field-error" id="name-error">{fieldErrors.name}</div>}
        </div>

        {/* Email Address */}
        <div className={`input-group ${fieldErrors.email ? 'error' : ''}`}>
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
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
          </div>
          {fieldErrors.email && <div className="field-error" id="email-error">{fieldErrors.email}</div>}
        </div>

        {/* Phone Number */}
        <div className={`input-group ${fieldErrors.phone ? 'error' : ''}`}>
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
              aria-invalid={!!fieldErrors.phone}
              aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
            />
          </div>
          {fieldErrors.phone && <div className="field-error" id="phone-error">{fieldErrors.phone}</div>}
        </div>

        {/* City */}
        <div className={`input-group ${fieldErrors.city ? 'error' : ''}`}>
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
              aria-invalid={!!fieldErrors.city}
              aria-describedby={fieldErrors.city ? "city-error" : undefined}
            />
          </div>
          {fieldErrors.city && <div className="field-error" id="city-error">{fieldErrors.city}</div>}
        </div>

        {/* Vehicle Type */}
        <div className={`input-group ${fieldErrors.vehicleType ? 'error' : ''}`}>
          <label htmlFor="vehicleType">Vehicle Type</label>
          <div className="input-container">
            <i className="fas fa-motorcycle"></i>
            <select 
              id="vehicleType" 
              required
              value={formData.vehicleType}
              onChange={handleInputChange}
              disabled={loading}
              aria-invalid={!!fieldErrors.vehicleType}
              aria-describedby={fieldErrors.vehicleType ? "vehicleType-error" : undefined}
            >
              <option value="">Select vehicle type</option>
              <option value="Two Wheeler">Two Wheeler</option>
              <option value="Three Wheeler">Three Wheeler</option>
              <option value="Four Wheeler">Four Wheeler</option>
              <option value="Mini Truck">Mini Truck</option>
            </select>
          </div>
          {fieldErrors.vehicleType && <div className="field-error" id="vehicleType-error">{fieldErrors.vehicleType}</div>}
        </div>

        {/* Vehicle Number */}
        <div className={`input-group ${fieldErrors.vehicleNumber ? 'error' : ''}`}>
          <label htmlFor="vehicleNumber">Vehicle Number</label>
          <div className="input-container">
            <i className="fas fa-id-card"></i>
            <input 
              type="text" 
              id="vehicleNumber" 
              required 
              placeholder="Enter your vehicle number (e.g., TN01AB1234)"
              value={formData.vehicleNumber}
              onChange={handleInputChange}
              disabled={loading}
              aria-invalid={!!fieldErrors.vehicleNumber}
              aria-describedby={fieldErrors.vehicleNumber ? "vehicleNumber-error" : undefined}
            />
          </div>
          {fieldErrors.vehicleNumber && <div className="field-error" id="vehicleNumber-error">{fieldErrors.vehicleNumber}</div>}
        </div>

        {/* License Number */}
        <div className={`input-group ${fieldErrors.licenseNo ? 'error' : ''}`}>
          <label htmlFor="licenseNo">Driving License Number</label>
          <div className="input-container">
            <i className="fas fa-id-badge"></i>
            <input 
              type="text" 
              id="licenseNo" 
              required 
              placeholder="Enter your driving license number"
              value={formData.licenseNo}
              onChange={handleInputChange}
              disabled={loading}
              aria-invalid={!!fieldErrors.licenseNo}
              aria-describedby={fieldErrors.licenseNo ? "licenseNo-error" : undefined}
            />
          </div>
          {fieldErrors.licenseNo && <div className="field-error" id="licenseNo-error">{fieldErrors.licenseNo}</div>}
        </div>

        {/* Password */}
        <div className={`input-group ${fieldErrors.password ? 'error' : ''}`}>
          <label htmlFor="password">Password</label>
          <div className="input-container password-container">
            <i className="fas fa-lock"></i>
            <input 
              type={passwordVisible ? "text" : "password"} 
              id="password" 
              required 
              placeholder="Create a password (min. 8 characters)"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
            />
            <button 
              type="button" 
              className="password-toggle-btn" 
              onClick={togglePasswordVisibility}
              aria-label={passwordVisible ? "Hide password" : "Show password"}
            >
              <i className={`fas ${passwordVisible ? "fa-eye-slash" : "fa-eye"}`}></i>
            </button>
          </div>
          {fieldErrors.password && <div className="field-error" id="password-error">{fieldErrors.password}</div>}
        </div>

        {/* Confirm Password */}
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

        {/* Terms & Conditions */}
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

        {/* Register Button */}
        <button type="submit" className="btn primary" disabled={loading}>
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

      <button 
        className="btn secondary"
        onClick={() => navigate("/login-delivery")}
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

export default RegisterDelivery;
