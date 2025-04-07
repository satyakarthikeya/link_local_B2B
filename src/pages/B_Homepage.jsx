import React, { useState, useEffect } from 'react';
import '../Styles/business_home.css'; // You'll need to create this CSS file with the styles from the original HTML

// Main App Component
function App() {
  return (
    <div className="App">
      <Header />
      <Hero />
      <FeaturedSection />
      <DealsSection />
      <Footer />
    </div>
  );
}

// Header Component
function Header() {
  const [isNavActive, setIsNavActive] = useState(false);

  const toggleNav = () => {
    setIsNavActive(!isNavActive);
  };

  return (
    <header>
      <div className="navbar">
        <div className="logo">
          <a href="#">
            <h1 className="logo-text">Link<span className="highlight">Local</span></h1>
          </a>
        </div>
        
        <div className="search-container">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            id="search-input" 
            placeholder="Search businesses, products, deals..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const searchTerm = e.target.value.trim();
                if (searchTerm) {
                  alert(`Searching for: ${searchTerm}`);
                }
              }
            }}
          />
        </div>
        
        <div className="nav-buttons">
          <a href="myshop.html" className="login-btn">
            <i className="fas fa-store"></i> My Shop
          </a>
          <div className="account-dropdown">
            <button className="search-btn">
              <i className="fas fa-user"></i>
            </button>
            <div className="dropdown-menu">
              <a href="#">My Profile</a>
              <a href="#">Logout</a>
            </div>
          </div>
          <button 
            className={`mobile-toggle ${isNavActive ? 'active' : ''}`}
            onClick={toggleNav}
          >
            <span style={{
              transform: isNavActive ? 'rotate(45deg) translate(5px, 5px)' : 'none'
            }}></span>
            <span style={{
              opacity: isNavActive ? '0' : '1'
            }}></span>
            <span style={{
              transform: isNavActive ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
            }}></span>
          </button>
        </div>
        
        <nav className={`main-nav ${isNavActive ? 'active' : ''}`}>
          <ul>
            <li><a href="#"><i className="fas fa-home"></i>Home</a></li>
            <li><a href="#"><i className="fas fa-store"></i>Shops</a></li>
            <li><a href="#"><i className="fas fa-tags"></i>Deals</a></li>
            <li><a href="#"><i className="fas fa-map-marker-alt"></i>Near Me</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

// Hero Component
function Hero() {
  const handleButtonClick = (text) => {
    alert(`Navigating to: ${text}`);
  };

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h1>Connect With Local Businesses</h1>
          <p>Discover shops, exclusive deals, and support your community all in one place.</p>
          <div className="hero-actions">
            <a href="#Featured">
              <button 
                className="cta-btn primary-btn"
                onClick={() => handleButtonClick('Explore Shops')}
              >
                Explore Shops
              </button>
            </a>
            <a href="#deals">
              <button 
                className="cta-btn secondary-btn"
                onClick={() => handleButtonClick('View Deals')}
              >
                View Deals
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// FeaturedSection Component
function FeaturedSection() {
  const [featuredShops, setFeaturedShops] = useState([
    {
      id: 1,
      name: "LULU Hypermart",
      image: "../Assests/lulu market image.jpeg",
      description: "One stop for your every need",
      rating: 4.8,
      reviewCount: 125,
      category: "Supermarket"
    },
    {
      id: 2,
      name: "JK-Copier",
      image: "../Assests/Jk copier.jpeg",
      description: "A4 Sheets",
      rating: 4.6,
      reviewCount: 89,
      category: "Wholesale"
    },
    {
      id: 3,
      name: "Sunrise Electronics",
      image: "../Assests/sunrise elec.jpeg",
      description: "All electronic items available",
      rating: 4.9,
      reviewCount: 156,
      category: "Electronics"
    },
    {
      id: 4,
      name: "Cotton Shop 3",
      image: "../Assests/cotton.jpeg",
      description: "Selling cotton",
      rating: 4.7,
      reviewCount: 98,
      category: "Wholesale"
    }
  ]);

  const handleShopClick = (shopName) => {
    alert(`Viewing ${shopName} details`);
  };

  return (
    <section id="Featured" className="featured-section">
      <div className="container">
        <div className="section-header">
          <h2>Featured Shops</h2>
          <p>Discover top-rated local businesses in your community</p>
        </div>
        
        <div className="card-grid" id="featured-shops">
          {featuredShops.map(shop => (
            <div 
              className="shop-card" 
              key={shop.id}
              onClick={() => handleShopClick(shop.name)}
            >
              <div className="card-img">
                <img src={shop.image} alt={shop.name} />
              </div>
              <div className="card-content">
                <div className="shop-rating">
                  <i className="fas fa-star"></i>
                  <span>{shop.rating} ({shop.reviewCount})</span>
                </div>
                <h3>{shop.name}</h3>
                <p>{shop.description}</p>
                <span className="shop-category">{shop.category}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="view-all">
          <button 
            className="view-all-btn"
            onClick={() => alert("Navigating to: View All Shops")}
          >
            View All Shops
          </button>
        </div>
      </div>
    </section>
  );
}

// DealsSection Component
function DealsSection() {
  const [featuredDeals, setFeaturedDeals] = useState([
    {
      id: 1,
      name: "Raw Cotton",
      image: "../Assests/cotton.jpeg",
      discount: "25% OFF",
      validUntil: "March 15, 2025"
    },
    {
      id: 2,
      name: "Jumper Wires",
      image: "../Assests/jumper wires.jpeg",
      discount: "Buy 1 Get 1",
      validUntil: "March 17, 2025"
    },
    {
      id: 3,
      name: "Rice bags",
      image: "../Assests/rice bags.jpeg",
      discount: "30% OFF",
      validUntil: "March 12, 2025"
    },
    {
      id: 4,
      name: "A4 Sheets",
      image: "../Assests/A4 sheets.jpeg",
      discount: "20% OFF",
      validUntil: "March 15, 2025"
    }
  ]);

  const handleDealClick = (dealName) => {
    alert(`Viewing ${dealName} deal details`);
  };

  return (
    <section id="deals" className="deals-section">
      <div className="container">
        <div className="section-header">
          <h2>Hot Deals</h2>
          <p>Limited time offers from your favorite local shops</p>
        </div>
        
        <div className="card-grid" id="featured-deals">
          {featuredDeals.map(deal => (
            <div 
              className="deal-card" 
              key={deal.id}
              onClick={() => handleDealClick(deal.name)}
            >
              <div className="card-img">
                <img src={deal.image} alt={`${deal.name} deal`} />
              </div>
              <div className="card-content">
                <div className="deal-badge">{deal.discount}</div>
                <h3>{deal.name}</h3>
                <p className="deal-period">
                  <i className="fas fa-clock"></i>
                  Ends {deal.validUntil}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="view-all">
          <button 
            className="view-all-btn"
            onClick={() => alert("Navigating to: View All Deals")}
          >
            View All Deals
          </button>
        </div>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <h1 className="logo-text">Link<span className="highlight">Local</span></h1>
            <p>Connecting local businesses with customers in the community. Discover, shop, and support local all in one place.</p>
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
          
          <div className="footer-links">
            <h4>For Businesses</h4>
            <ul>
              <li><a href="#">Join as a Business</a></li>
              <li><a href="#">Business Dashboard</a></li>
              <li><a href="#">Advertise With Us</a></li>
              <li><a href="#">Success Stories</a></li>
              <li><a href="#">Resources</a></li>
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
}

export default App;