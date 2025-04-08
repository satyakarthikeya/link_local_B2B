import React from "react";
import "../styles/delivery_home.css"; // Ensure correct path

const D_Footer = () => {
  return (
    <footer>
      <div className="container footer-grid">
        {/* About Section */}
        <div className="footer-about">
          <h3>About LinkLocal</h3>
          <p>Helping businesses and delivery agents connect seamlessly.</p>
        </div>

        {/* Contact Section */}
        <div className="footer-contact">
          <h4>Contact Us</h4>
          <p><i className="fas fa-envelope"></i> support@linklocal.com</p>
          <p><i className="fas fa-phone"></i> +123 456 7890</p>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>&copy; 2025 LinkLocal. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default D_Footer;
