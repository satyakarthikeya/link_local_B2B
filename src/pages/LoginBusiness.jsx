import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const LoginBusiness = () => {
  const navigate = useNavigate();
  const { loginBusiness } = useAuth();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);
      // Call the login function from AuthContext
      await loginBusiness({
        email: formData.email,
        password: formData.password
      });
      
      // Redirect to business home page after successful login
      navigate('/business-home');
    } catch (err) {
      console.error("Login error:", err);
      setError(typeof err === 'string' ? err : 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-logo">Link<span>Local</span></div>
      <h2>Business Login</h2>

      {error && <div className="error-message">{error}</div>}

      <form id="loginForm" onSubmit={handleSubmit}>
        {/* Email Input */}
        <div className="input-group">
          <label htmlFor="email">Email</label>
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

        {/* Password Input */}
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
              onChange={handleInputChange}
              disabled={loading}
            />
            <button 
              type="button" 
              className="password-toggle" 
              onClick={togglePasswordVisibility}
            >
              <i className={passwordVisible ? "fas fa-eye-slash" : "fas fa-eye"}></i>
            </button>
          </div>
        </div>

        <a href="#" className="forgot-password">Forgot password?</a>

        {/* Login Button */}
        <button type="submit" className="btn" disabled={loading}>
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Logging in...
            </>
          ) : (
            <>
              <i className="fas fa-sign-in-alt"></i> Login
            </>
          )}
        </button>
      </form>

      <div className="auth-divider"><span>OR</span></div>

      {/* Create New Account Button */}
      <button 
        className="btn secondary" 
        onClick={() => navigate("/register-business")}
        disabled={loading}
      >
        <i className="fas fa-user-plus"></i> Create New Account
      </button>

      {/* Back Button */}
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

export default LoginBusiness;
