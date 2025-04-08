import React, { useState } from "react";
import "../styles/auth.css"; // Only import the auth styles
import '@fortawesome/fontawesome-free/css/all.min.css';

const LoginBusiness = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  return (
    <div className="auth-container">
      <div className="auth-logo">Link<span>Local</span></div>
      <h2>Business Login</h2>

      <form id="loginForm">
        {/* Username / Email Input */}
        <div className="input-group">
          <label htmlFor="username">Username or Email</label>
          <div className="input-container">
            <i className="fas fa-user"></i>
            <input type="text" id="username" required placeholder="Enter your username or email" />
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
        <button type="submit" className="btn">
          <i className="fas fa-sign-in-alt"></i> Login
        </button>
      </form>

      <div className="auth-divider"><span>OR</span></div>

      {/* Create New Account Button */}
      <button className="btn secondary" onClick={() => (window.location.href = "/register-business")}>
        <i className="fas fa-user-plus"></i> Create New Account
      </button>

      {/* Back Button */}
      <button className="btn back-btn" onClick={() => (window.location.href = "/login")}>
        <i className="fas fa-arrow-left"></i> Back to Options
      </button>

      <div className="auth-footer">
        Need help? <a href="#">Contact Support</a>
      </div>
    </div>
  );
};

export default LoginBusiness;
