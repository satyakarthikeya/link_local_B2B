import React from "react";
import "../styles/main.css"; // Import styles
import '@fortawesome/fontawesome-free/css/all.min.css';

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <h1 className="logo-text">
              Link<span className="highlight">Local</span>
            </h1>
            <p>
              Connecting local businesses with customers in the community. Discover, shop, and support local all in one place.
            </p>
            <div className="social-icons">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Services</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">FAQs</a></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4>Contact Us</h4>
            <p><i className="fas fa-map-marker-alt"></i> Amrita, Coimbatore</p>
            <p><i className="fas fa-phone"></i> +91 65435432</p>
            <p><i className="fas fa-envelope"></i> support@linklocal.com</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 LinkLocal. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
