import React, { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import '../Styles/business_home.css';

// Lazy loading components 
const ProductCard = lazy(() => import('../components/ProductCard'));

const B_Homepage = () => {
  const navigate = useNavigate();

  // State management
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('Coimbatore');
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart')) || []);
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('wishlist')) || []);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState(() => JSON.parse(localStorage.getItem('recentlyViewed')) || []);
  const [isSearchFocused, setIsSearchFocused] = useState(false); // Added missing state
  const [sortBy, setSortBy] = useState('popular'); // Added missing state for sorting

  const cities = useMemo(() => ['Coimbatore', 'Chennai', 'Bangalore', 'Mumbai', 'Delhi'], []);

  // Categories array
  const categories = useMemo(() => [
    { id: 'all', name: 'All Categories', icon: 'fa-th-large' },
    { id: 'stationery', name: 'Stationery', icon: 'fa-pencil-alt' },
    { id: 'electronics', name: 'Electronics', icon: 'fa-laptop' },
    { id: 'textiles', name: 'Textiles', icon: 'fa-tshirt' },
    { id: 'food', name: 'Food & Beverages', icon: 'fa-utensils' },
    { id: 'furniture', name: 'Furniture', icon: 'fa-chair' },
    { id: 'tools', name: 'Tools & Hardware', icon: 'fa-tools' },
    { id: 'packaging', name: 'Packaging', icon: 'fa-box-open' }
  ], []);

  // Hot deals array
  const hotDeals = useMemo(() => [
    {
      id: 101,
      name: "Bulk Office Supplies Pack",
      price: "₹1,999",
      originalPrice: "₹2,999",
      discount: "33%",
      moq: "3 packs",
      image: "../assests/A4 sheets.jpeg",
    },
    {
      id: 102,
      name: "Premium Cotton Bundle",
      price: "₹1,299",
      originalPrice: "₹1,899",
      discount: "32%",
      moq: "20 meters",
      image: "../assests/cotton.jpeg",
    },
    {
      id: 103,
      name: "Electronics Starter Kit",
      price: "₹899",
      originalPrice: "₹1,299",
      discount: "31%",
      moq: "5 units",
      image: "../assests/jumper wires.jpeg",
    },
    {
      id: 104,
      name: "Organic Food Pack",
      price: "₹1,599",
      originalPrice: "₹1,999",
      discount: "20%",
      moq: "10 units",
      image: "../assests/honey.jpeg",
    }
  ], []);

  // Save cart and wishlist to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Handle outside clicks and scroll events
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLocationDropdown && !event.target.closest('.location-selector')) {
        setShowLocationDropdown(false);
      }
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showLocationDropdown]);

  const toggleLocationDropdown = () => {
    setShowLocationDropdown((prev) => !prev);
  };

  const handleLocationSelect = (city) => {
    setSelectedCity(city);
    setShowLocationDropdown(false);
  };

  const addToCart = useCallback((product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.id === product.id);
      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      }
      return [...prevCart, { ...product, quantity }];
    });

    setShowCartNotification(true);
    setTimeout(() => setShowCartNotification(false), 2000);
  }, []);

  const toggleWishlist = useCallback((product) => {
    setWishlist((prevWishlist) => {
      const isInWishlist = prevWishlist.some((item) => item.id === product.id);
      if (isInWishlist) {
        return prevWishlist.filter((item) => item.id !== product.id);
      }
      return [...prevWishlist, product];
    });
  }, []);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some((item) => item.id === productId);
  }, [wishlist]);

  const viewProductDetails = useCallback((product) => {
    setRecentlyViewed((prevViewed) => {
      const updatedRecent = [product, ...prevViewed.filter((item) => item.id !== product.id)].slice(0, 4);
      localStorage.setItem('recentlyViewed', JSON.stringify(updatedRecent));
      return updatedRecent;
    });
    alert(`Viewing ${product.name} details`);
  }, []);

  const products = useMemo(() => [
    {
      id: 1,
      name: "A4 Sheets (500 sheets)",
      price: "₹250",
      numericPrice: 250,
      category: "stationery",
      seller: "Sunrise Stationers",
      moq: "5 packs",
      location: "Coimbatore",
      area: "RS Puram",
      rating: 4.5,
      deliveryTime: "1-2 days",
      image: "../assests/A4 sheets.jpeg",
      inStock: true,
      popularity: 95,
      reviews: [
        { user: "BusinessUser1", rating: 5, comment: "Great quality sheets at bulk price" },
        { user: "OfficeManager", rating: 4, comment: "Good value for money" }
      ]
    },
    {
      id: 2,
      name: "Cotton Fabric (per meter)",
      price: "₹150",
      numericPrice: 150,
      category: "textiles",
      seller: "Chennai Silks",
      moq: "10 meters",
      location: "Coimbatore",
      area: "Town Hall",
      rating: 4.2,
      deliveryTime: "2-3 days",
      image: "../assests/cotton.jpeg",
      inStock: true,
      popularity: 87,
      reviews: [
        { user: "TextileBuyer", rating: 4, comment: "Smooth texture and good quality" },
        { user: "FashionBiz", rating: 4.5, comment: "Consistent quality batch after batch" }
      ]
    },
    {
      id: 3,
      name: "Jumper Wires Set",
      price: "₹199",
      numericPrice: 199,
      category: "electronics",
      seller: "Sunrise Electronics",
      moq: "20 sets",
      location: "Coimbatore", 
      area: "Gandhipuram",
      rating: 4.0,
      deliveryTime: "1 day",
      image: "../assests/jumper wires.jpeg",
      inStock: true,
      popularity: 76,
      reviews: [
        { user: "ElectronicsTech", rating: 4, comment: "Good quality wires" }
      ]
    },
    {
      id: 4,
      name: "Honey (1kg)",
      price: "₹450",
      numericPrice: 450,
      category: "food",
      seller: "Lulu Market",
      moq: "5 units",
      location: "Coimbatore",
      area: "Peelamedu",
      rating: 4.7,
      deliveryTime: "Same day",
      image: "../assests/honey.jpeg",
      inStock: true,
      popularity: 92,
      reviews: [
        { user: "FoodVendor", rating: 5, comment: "Pure and authentic flavor" },
        { user: "CafeOwner", rating: 4.5, comment: "Customers love products made with this honey" },
        { user: "BakeryBiz", rating: 4.5, comment: "High quality, consistent taste" }
      ]
    },
    {
      id: 5,
      name: "Premium Headphones (Bulk)",
      price: "₹1200",
      numericPrice: 1200,
      category: "electronics",
      seller: "Sunrise Electronics",
      moq: "10 units",
      location: "Coimbatore",
      area: "Gandhipuram",
      rating: 4.6,
      deliveryTime: "2-3 days",
      image: "../assests/headphones.jpeg",
      inStock: true,
      popularity: 84,
      reviews: [
        { user: "AudioStore", rating: 5, comment: "Great sound quality for reselling" },
        { user: "TechShop", rating: 4.5, comment: "Popular among our customers" }
      ]
    },
    {
      id: 6,
      name: "Silk Thread Bundle",
      price: "₹350",
      numericPrice: 350,
      category: "textiles",
      seller: "Brookfields Textiles",
      moq: "15 bundles",
      location: "Coimbatore",
      area: "Brookfields",
      rating: 4.3,
      deliveryTime: "1-2 days",
      image: "../assests/silk thread.jpeg",
      inStock: false,
      popularity: 78,
      reviews: [
        { user: "CraftsSupplier", rating: 4, comment: "Beautiful colors and good quality" },
        { user: "HandiworkStore", rating: 4.5, comment: "Our embroidery clients love this thread" }
      ]
    }
  ], []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      return (
        (selectedCategory === 'all' || product.category === selectedCategory) &&
        product.location === selectedCity &&
        (searchQuery === '' ||
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.seller.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [products, selectedCategory, selectedCity, searchQuery]);

  return (
    <div className="business-app">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>
      
      {/* Header */}
      <header className={`business-header ${isScrolled ? 'scrolled' : ''}`}>
        {/* Location Selector Bar - Positioned at the top */}
        <div className="location-bar">
          <div className="container">
            <div className="location-wrapper">
              <div className="location-selector" onClick={toggleLocationDropdown}>
                <i className="fas fa-map-marker-alt location-icon"></i>
                <span className="location-text">Delivering to: {selectedCity}</span>
                <i className={`fas fa-chevron-down arrow-icon ${showLocationDropdown ? 'rotated' : ''}`}></i>
                
                {showLocationDropdown && (
                  <div className="location-dropdown">
                    <div className="location-search">
                      <i className="fas fa-search"></i>
                      <input type="text" placeholder="Search for your location" />
                    </div>
                    
                    <div className="popular-locations">
                      <h4>Select City</h4>
                      <ul>
                        {cities.map(city => (
                          <li key={city} onClick={() => handleLocationSelect(city)}>
                            <i className="fas fa-map-marker-alt"></i> {city}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="current-location">
                      <button>
                        <i className="fas fa-location-arrow"></i> Use current location
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="welcome-text">Welcome to LinkLocal Business</div>
            </div>
          </div>
        </div>

        <div className="navbar">
          <div className="logo">
            <a href="#" onClick={() => navigate('/business-home')}>
              <h1 className="logo-text">Link<span className="highlight">Local</span></h1>
            </a>
          </div>

          {/* Search Bar */}
          <div className={`search-container ${isSearchFocused ? 'focused' : ''}`}>
            <div className="search-box">
              <i className="fas fa-search search-icon"></i>
              <input 
                type="text" 
                placeholder="Search products, categories, sellers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <button className="search-button">Search</button>
            </div>
          </div>

          <div className="nav-buttons">
            <div className="cart-wrapper">
              <button className="nav-btn cart" onClick={() => navigate('/cart')}>
                <i className="fas fa-shopping-cart"></i>
                <span className="cart-count">{cart.length}</span>
              </button>
            </div>
            <button className="nav-btn primary" onClick={() => navigate('/business-home/my-shop')}>
              <i className="fas fa-store"></i> My Shop
            </button>
            <div className="account-dropdown">
              <button className="profile-btn" onClick={() => navigate('/business-home/profile')}>
                <i className="fas fa-user-circle"></i>
                <span>My Account</span>
                <i className="fas fa-chevron-down"></i>
              </button>
              <div className="dropdown-content">
                <a href="#" onClick={() => navigate('/business-home/profile')}><i className="fas fa-user"></i> Profile</a>
                <a href="#" onClick={() => navigate('/business-home/my-shop')}><i className="fas fa-store"></i> My Shop</a>
                <a href="#"><i className="fas fa-cog"></i> Settings</a>
                <div className="dropdown-divider"></div>
                <a href="#" onClick={() => navigate('/')}><i className="fas fa-sign-out-alt"></i> Logout</a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <Outlet />

      {!window.location.pathname.includes('my-shop') && !window.location.pathname.includes('profile') && (
        <main className="business-main full-width" id="main-content">
          {/* Cart Notification */}
          {showCartNotification && (
            <div className="cart-notification">
              <i className="fas fa-check-circle"></i> Item added to cart!
            </div>
          )}
          
          <section className="hero-section">
            <div className="container">
              <div className="hero-content">
                <h1>Welcome to LinkLocal Business</h1>
                <p>Your one-stop B2B marketplace for wholesale products</p>
                <div className="hero-stats">
                  <div className="stat-item">
                    <span className="stat-number">1000+</span>
                    <span className="stat-label">Products</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">500+</span>
                    <span className="stat-label">Sellers</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">50+</span>
                    <span className="stat-label">Categories</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Categories Section with Icons */}
          <section className="categories-section">
            <div className="container">
              <h2>Browse Categories</h2>
              <div className="categories-grid">
                {categories.map(category => (
                  <div 
                    key={category.id}
                    className={`category-tile ${selectedCategory === category.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <i className={`fas ${category.icon}`}></i>
                    <span>{category.name}</span>
                    <span className="product-count">50+ Products</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Deals Section */}
          <section className="featured-deals">
            <div className="container">
              <div className="section-header">
                <h2>Featured Deals</h2>
                <button className="view-all">View All <i className="fas fa-arrow-right"></i></button>
              </div>
              <div className="deals-grid">
                {hotDeals.map(deal => (
                  <div key={deal.id} className="deal-card">
                    <div className="deal-tag">HOT DEAL</div>
                    <img src={deal.image} alt={deal.name} />
                    <div className="deal-content">
                      <h3>{deal.name}</h3>
                      <div className="deal-price">
                        <span className="current">{deal.price}</span>
                        <span className="original">{deal.originalPrice}</span>
                        <span className="discount">{deal.discount} OFF</span>
                      </div>
                      <div className="deal-footer">
                        <span className="moq">MOQ: {deal.moq}</span>
                        <button onClick={() => addToCart(deal)}>Add to Cart</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Main Products Section */}
          <section className="products-section">
            <div className="container">
              <div className="filters-toolbar">
                <div className="active-filters">
                  {selectedCategory !== 'all' && (
                    <span className="filter-tag">
                      {categories.find(c => c.id === selectedCategory)?.name}
                      <button onClick={() => setSelectedCategory('all')}>×</button>
                    </span>
                  )}
                  {/* Add more active filter tags */}
                </div>
                <div className="sort-options">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="popular">Most Popular</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>

              <div className="products-grid">
                {filteredProducts.map(product => (
                  <Suspense key={product.id} fallback={<div className="product-skeleton"></div>}>
                    <ProductCard 
                      product={product}
                      onAddToCart={addToCart}
                      onViewDetails={viewProductDetails}
                      isWishlisted={isInWishlist(product.id)}
                      onToggleWishlist={() => toggleWishlist(product)}
                    />
                  </Suspense>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="no-results">
                  <i className="fas fa-search"></i>
                  <h3>No products found</h3>
                  <p>Try adjusting your filters or search terms</p>
                  <button onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}>Clear Filters</button>
                </div>
              )}
            </div>
          </section>


          {/*  Removed the old ordering section, hot deals, trending products, recently viewed, and advanced filters sections. */}
          {/* The new sections above replace these. */}

        </main>
      )}

      {/* Footer */}
      <footer className="business-footer">
        <div className="container">
          {/* Top Footer Section */}
          <div className="footer-top">
            <div className="footer-brand">
              <h1 className="logo-text">Link<span className="highlight">Local</span></h1>
              <p className="tagline">Empowering local businesses, strengthening communities</p>
            </div>
            <div className="newsletter">
              <h4>Subscribe to our newsletter</h4>
              <div className="newsletter-form">
                <input type="email" placeholder="Enter your email" aria-label="Email for newsletter" />
                <button className="subscribe-btn">Subscribe</button>
              </div>
            </div>
          </div>
          
          {/* Footer Main Content */}
          <div className="footer-main">
            <div className="footer-col about-col">
              <h4>About LinkLocal</h4>
              <p>We connect local wholesalers with businesses to facilitate seamless B2B commerce in your community.</p>
              <div className="social-icons">
                <a onClick={() => window.open('https://facebook.com','_blank')} aria-label="Facebook" style={{cursor:"pointer"}}>
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a onClick={() => window.open('https://twitter.com','_blank')} aria-label="Twitter" style={{cursor:"pointer"}}>
                  <i className="fab fa-twitter"></i>
                </a>
                <a onClick={() => window.open('https://instagram.com','_blank')} aria-label="Instagram" style={{cursor:"pointer"}}>
                  <i className="fab fa-instagram"></i>
                </a>
                <a onClick={() => window.open('https://linkedin.com','_blank')} aria-label="LinkedIn" style={{cursor:"pointer"}}>
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
            
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li>
                  <a onClick={() => navigate('/business-home')} style={{cursor:"pointer"}}>
                    <i className="fas fa-angle-right"></i> Home
                  </a>
                </li>
                <li>
                  <a onClick={() => navigate('/about-us')} style={{cursor:"pointer"}}>
                    <i className="fas fa-angle-right"></i> About Us
                  </a>
                </li>
                <li>
                  <a onClick={() => navigate('/how-it-works')} style={{cursor:"pointer"}}>
                    <i className="fas fa-angle-right"></i> How It Works
                  </a>
                </li>
                <li>
                  <a onClick={() => navigate('/services')} style={{cursor:"pointer"}}>
                    <i className="fas fa-angle-right"></i> Services
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="footer-col">
              <h4>Business</h4>
              <ul className="footer-links">
                <li><a href="#"><i className="fas fa-angle-right"></i> Become a Seller</a></li>
                <li><a href="#"><i className="fas fa-angle-right"></i> Seller Dashboard</a></li>
                <li><a href="#"><i className="fas fa-angle-right"></i> Pricing Plans</a></li>
                <li><a href="#"><i className="fas fa-angle-right"></i> Seller FAQ</a></li>
              </ul>
            </div>
            
            <div className="footer-col contact-col">
              <h4>Contact Us</h4>
              <div className="contact-info">
                <p><i className="fas fa-map-marker-alt"></i> 123 Business Hub, Tech Park, Coimbatore</p>
                <p><i className="fas fa-envelope"></i> support@linklocal.com</p>
                <p><i className="fas fa-phone"></i> +91 9876543210</p>
                <p><i className="fas fa-clock"></i> Mon-Sat: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
          
          {/* Footer Bottom */}
          <div className="footer-bottom">
            <div className="copyright">
              <p>&copy; {new Date().getFullYear()} LinkLocal. All rights reserved.</p>
            </div>
            <div className="footer-bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default B_Homepage;