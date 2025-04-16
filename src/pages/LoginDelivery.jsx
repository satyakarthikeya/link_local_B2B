import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import api from "../utils/api";

const LoginDelivery = () => {
  const navigate = useNavigate();
  const { loginDelivery, currentUser } = useAuth();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser && currentUser.type === 'delivery') {
      navigate('/delivery-home');
    }
  }, [currentUser, navigate]);

  // Check for saved credentials
  useEffect(() => {
    const savedEmail = localStorage.getItem('delivery_email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validate form
      if (!formData.email || !formData.password) {
        throw new Error("Please enter both email and password");
      }

      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('delivery_email', formData.email);
      } else {
        localStorage.removeItem('delivery_email');
      }

      // Login
      const response = await loginDelivery({
        email: formData.email,
        password: formData.password
      });

      // Set initial availability status as online when logging in
      if (response && response.agent_id) {
        try {
          await api.delivery.updateAvailabilityStatus(response.agent_id, true);
        } catch (statusErr) {
          console.error("Failed to set online status:", statusErr);
          // Continue with login even if status update fails
        }
      }

      navigate("/delivery-home");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-logo">Link<span>Local</span></div>
      <h2>Delivery Partner Login</h2>
      
      {error && <div className="error-message" role="alert"><i className="fas fa-exclamation-circle"></i> {error}</div>}

      <form id="loginForm" onSubmit={handleSubmit} noValidate>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <div className="input-container">
            <i className="fas fa-envelope"></i>
            <input
              type="email"
              id="email"
              required
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
              autoFocus
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
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
              disabled={loading}
            >
              <i className={`fas ${passwordVisible ? "fa-eye-slash" : "fa-eye"}`}></i>
            </button>
          </div>
        </div>

        <div className="remember-forgot-row">
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="rememberMe" 
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              disabled={loading}
            />
            <label htmlFor="rememberMe">Remember me</label>
          </div>
          <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
        </div>

        <button type="submit" className="btn primary" disabled={loading}>
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

      <button 
        className="btn secondary" 
        onClick={() => navigate("/register-delivery")}
        disabled={loading}
      >
        <i className="fas fa-user-plus"></i> Create New Account
      </button>

      <button 
        className="btn back-btn" 
        onClick={() => navigate("/login")}
        disabled={loading}
      >
        <i className="fas fa-arrow-left"></i> Back to Options
      </button>

      <div className="auth-footer">
        Need help? <Link to="/support">Contact Support</Link>
      </div>
    </div>
  );
};

export default LoginDelivery;
