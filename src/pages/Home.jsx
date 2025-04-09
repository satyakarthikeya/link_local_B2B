import React from "react";
import "../styles/main.css"; // Fixed capitalization to match folder structure
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet"; // Add for SEO optimization
import "@fortawesome/fontawesome-free/css/all.min.css";

// Move data outside component to prevent recreation on each render
const statsData = [
  { icon: "fa-city", value: "40+", text: "Cities Served" },
  { icon: "fa-handshake", value: "2 thousand+", text: "Partner Businesses" },
  { icon: "fa-shipping-fast", value: "1.1 lakh+", text: "Orders Delivered" },
  { icon: "fa-store", value: "60+", text: "Seller Brands" },
];

const featuresData = [
  { icon: "fa-truck", title: "Fast Delivery", text: "Just click ready and our Delivery partner will be before you within minutes" },
  { icon: "fa-thumbs-up", title: "Quality Assured", text: "The quality assured by YOUR rating" },
  { icon: "fa-rupee-sign", title: "Competitive Pricing", text: "Negotiable prices with direct contact with sellers" },
  { icon: "fa-headset", title: "24/7 Support", text: "Dedicated account manager for all your procurement needs" },
];

const stepsData = [
  { step: "1", title: "Sign Up", text: "Create your business account and complete verification" },
  { step: "2", title: "Browse & Order", text: "Search for an item and get the list of Shops selling them and place your order" },
  { step: "3", title: "Receive & Enjoy", text: "Track your delivery and rate your experience" },
];

const Home = () => {
  const navigate = useNavigate();

  // Updated handler function for buttons to navigate to login page
  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <>
      <Helmet>
        <title>LinkLocal - Connect Locally, Grow Globally</title>
        <meta name="description" content="Connect with trusted local suppliers and streamline your procurement process with LinkLocal" />
      </Helmet>
      
      <Navbar />

      {/* Hero Section */}
      <section className="hero" style={{ background: "#9897ff" }}> 
        <div className="container">
          <div className="hero-content">
            <h1>Connect Locally, Grow Globally</h1>
            <p>Connect with trusted local suppliers and streamline your procurement process</p>
            <div className="hero-actions">
              <button 
                className="cta-btn primary-btn"
                onClick={handleGetStarted}
                aria-label="Get started with LinkLocal"

              >
                Get Started
              </button>
            </div>
            <div className="trusted-by">
              <p>Trusted by leading businesses</p>
              <div className="trusted-logos">
                <img src="src\assests\lulu.png" alt="Lulu Hypermarket logo" />
                <img src="src\assests\chennai silks.png" alt="Chennai Silks logo" />
                <img src="src\assests\ss.jpeg" alt="SS Hypermarket logo" />
              </div>
            </div>
          </div>
          <div className="hero-image">
            <img src="src\assests\Logo.png" alt="LinkLocal platform interface" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-title">
            <h2>LinkLocal's Impact</h2>
            <p>Connecting businesses across India</p>
          </div>
          <div className="stats-grid">
            {statsData.map((stat, index) => (
              <div className="stat-box" key={index}>
                <i className={`fas ${stat.icon}`} aria-hidden="true"></i>
                <h3>{stat.value}</h3>
                <p>{stat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="stats-title">
            <h2>Why Choose LinkLocal?</h2>
            <p>Our platform is designed to meet your unique business needs</p>
          </div>
          <div className="features-grid">
            {featuresData.map((feature, index) => (
              <div className="feature-card" key={index}>
                <div className="feature-icon">
                  <i className={`fas ${feature.icon}`} aria-hidden="true"></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="stats-title">
            <h2>How It Works</h2>
            <p>Get started in just three simple steps</p>
          </div>
          <div className="steps">
            {stepsData.map((step, index) => (
              <React.Fragment key={index}>
                <div className="step">
                  <div className="step-number">{step.step}</div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
                {index < stepsData.length - 1 && <div className="step-connector"></div>}
              </React.Fragment>
            ))}
          </div>
          <div className="cta-center">
            <button 
              className="cta-btn_1 primary-btn" 
              onClick={handleGetStarted}
              aria-label="Sign up now"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Home;