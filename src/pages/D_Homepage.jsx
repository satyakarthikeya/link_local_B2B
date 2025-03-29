import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/delivery_home.css";
import D_Navbar from "../components/D_Navbar";
import D_Footer from "../components/D_Footer";
import "@fortawesome/fontawesome-free/css/all.min.css";

const D_Homepage = () => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      <D_Navbar />

      {/* Delivery Agent Dashboard */}
      <section className="delivery-dashboard">
        <div className="container">
          <h1>Welcome, Delivery Partner!</h1>
          <p>Manage your deliveries efficiently.</p>

          {/* Order List */}
          <div className="order-list">
            <h2>Current Orders</h2>
            <div className="order-card">
              <div className="order-details">
                <h3>Order #12345</h3>
                <p>Pickup: ABC Warehouse</p>
                <p>Drop-off: XYZ Store</p>
              </div>
              <div className="order-actions">
                <button className="btn accept-btn">Accept</button>
                <button className="btn details-btn">Details</button>
                <button className="btn track-btn">Track</button>
                <button className="btn delivered-btn">Delivered</button>
              </div>
            </div>

            {/* More Orders Can Be Dynamically Rendered Here */}
          </div>

          {/* Stats Section */}
          <div className="stats-section">
            <h2>Your Performance</h2>
            <div className="stats-grid">
              <div className="stat-box">
                <i className="fas fa-truck"></i>
                <h3>20</h3>
                <p>Deliveries Completed</p>
              </div>
              <div className="stat-box">
                <i className="fas fa-clock"></i>
                <h3>5</h3>
                <p>Pending Deliveries</p>
              </div>
              <div className="stat-box">
                <i className="fas fa-star"></i>
                <h3>4.8</h3>
                <p>Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Popup */}
      <div className={`profile-popup ${showProfile ? "active" : ""}`}>
        <ul>
          <li onClick={() => navigate("/profile")}>View Profile</li>
          <li onClick={() => navigate("/settings")}>Settings</li>
          <li onClick={() => navigate("/logout")}>Logout</li>
        </ul>
      </div>

      <D_Footer />
    </>
  );
};

export default D_Homepage;
