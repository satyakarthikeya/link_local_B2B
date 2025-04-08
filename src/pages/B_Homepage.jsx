import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import '../Styles/business_home.css';

// Lazy loading components
const ProductCard = lazy(() => import('../components/ProductCard'));

const B_Homepage = () => {
  // State management for the component
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('Coimbatore');
  const [cart, setCart] = useState([]);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [minDeliveryTime, setMinDeliveryTime] = useState('any');
  const [minRating, setMinRating] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const cities = ['Coimbatore', 'Chennai', 'Bangalore', 'Mumbai', 'Delhi'];

  // Close location dropdown when clicking outside
  useEffect(() => {
    // Load cart from localStorage if available
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Load wishlist from localStorage if available
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }

    function handleClickOutside(event) {
      if (showLocationDropdown && !event.target.closest('.location-selector')) {
        setShowLocationDropdown(false);
      }
      if (showFilters && !event.target.closest('.filter-panel') && !event.target.closest('.filter-toggle-btn')) {
        setShowFilters(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    
    // Detect scroll for header animation
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Simulate loading products
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showLocationDropdown, showFilters]);

  // useEffect to save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // useEffect to save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleLocationDropdown = () => {
    setShowLocationDropdown(!showLocationDropdown);
  };

  const handleLocationSelect = (city) => {
    setSelectedCity(city);
    setShowLocationDropdown(false);
  };

  // Function to toggle item in wishlist with animation
  const toggleWishlist = useCallback((product) => {
    const isInWishlist = wishlist.some(item => item.id === product.id);
    
    if (isInWishlist) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
      
      // Show brief animation or notification
      const notification = document.createElement('div');
      notification.className = 'wishlist-notification';
      notification.innerHTML = `<i class="fas fa-heart"></i> Added to wishlist`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('show');
        setTimeout(() => {
          notification.classList.remove('show');
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }, 1500);
      }, 10);
    }
  }, [wishlist]);

  // Function to check if product is in wishlist
  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => item.id === productId);
  }, [wishlist]);

  // Function to view product details and track recently viewed
  const viewProductDetails = useCallback((product) => {
    // Add to recently viewed if not already there
    if (!recentlyViewed.find(item => item.id === product.id)) {
      const updatedRecent = [product, ...recentlyViewed].slice(0, 4);
      setRecentlyViewed(updatedRecent);
      // Store in localStorage for persistence
      localStorage.setItem('recentlyViewed', JSON.stringify(updatedRecent));
    }
    // Navigate to product details (placeholder)
    // navigate(`/product/${product.id}`);
    
    // For now just show notification
    alert(`Viewing ${product.name} details`);
  }, [recentlyViewed]);

  // Load recently viewed from localStorage on initial render
  useEffect(() => {
    const savedItems = localStorage.getItem('recentlyViewed');
    if (savedItems) {
      setRecentlyViewed(JSON.parse(savedItems));
    }
  }, []);

  const hotDeals = [
    {
      id: 'deal1',
      name: "Bulk A4 Sheets Bundle",
      price: "₹1000",
      originalPrice: "₹1500",
      category: "stationery",
      seller: "Sunrise Stationers",
      discount: "33%",
      moq: "10 packs",
      image: "../assests/A4 sheets.jpeg",
      rating: 4.7,
      deliveryTime: "1 day"
    },
    {
      id: 'deal2',
      name: "Premium Cotton Fabric",
      price: "₹120",
      originalPrice: "₹200",
      category: "textiles",
      seller: "Chennai Silks",
      discount: "40%",
      moq: "20 meters",
      image: "../assests/cotton.jpeg",
      rating: 4.5,
      deliveryTime: "2-3 days"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Products', icon: 'fa-th-large' },
    { id: 'electronics', name: 'Electronics', icon: 'fa-microchip' },
    { id: 'stationery', name: 'Stationery', icon: 'fa-pencil-alt' },
    { id: 'textiles', name: 'Textiles', icon: 'fa-tshirt' },
    { id: 'food', name: 'Food & Beverages', icon: 'fa-utensils' }
  ];

  const products = [
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
  ];

  // Add product to cart with proper quantity and notification
  const addToCart = useCallback((product, quantity = 1) => {
    const newItem = {...product, quantity: quantity};
    
    // Check if product already in cart
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity instead of adding new item
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
      setCart([...cart, newItem]);
    }
    
    // Show notification
    setShowCartNotification(true);
    setTimeout(() => setShowCartNotification(false), 2000);
  }, [cart]);

  // Filter and sort products
  const getFilteredProducts = useCallback(() => {
    return products
      .filter(product => 
        // Category filter
        (selectedCategory === 'all' || product.category === selectedCategory) && 
        // Location filter
        product.location === selectedCity &&
        // Search query
        (searchQuery === '' || 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
        // Price range filter
        (product.numericPrice >= priceRange[0] && product.numericPrice <= priceRange[1]) &&
        // Rating filter
        (product.rating >= minRating) &&
        // Availability filter
        (availabilityFilter === 'all' || 
         (availabilityFilter === 'inStock' && product.inStock) ||
         (availabilityFilter === 'outOfStock' && !product.inStock))
      )
      .sort((a, b) => {
        // Sorting logic
        switch (sortBy) {
          case 'priceLow':
            return a.numericPrice - b.numericPrice;
          case 'priceHigh':
            return b.numericPrice - a.numericPrice;
          case 'rating':
            return b.rating - a.rating;
          case 'deliveryTime':
            // Simple string comparison for now - in real app would convert to hours/minutes
            return a.deliveryTime.localeCompare(b.deliveryTime);
          case 'popular':
          default:
            return b.popularity - a.popularity;
        }
      });
  }, [selectedCategory, selectedCity, searchQuery, priceRange, minRating, availabilityFilter, sortBy]);

  const filteredProducts = getFilteredProducts();

  // Get trending products - in a real app this would come from backend analytics
  const trendingProducts = [...products]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 3);

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

      {/* Main Content */}
      {!window.location.pathname.includes('my-shop') && !window.location.pathname.includes('profile') && (
        <main className="business-main full-width" id="main-content">
          {/* Cart Notification */}
          {showCartNotification && (
            <div className="cart-notification">
              <i className="fas fa-check-circle"></i> Item added to cart!
            </div>
          )}
          
          <section className="ordering-section">
            <div className="container">
              {/* Header Section */}
              <div className="section-header">
                <h2 className="fade-in">B2B Marketplace</h2>
                <p className="fade-in delayed-1">Order wholesale products from verified local businesses</p>
              </div>

              {/* Hot Deals Section */}
              <div className="hot-deals-section fade-in delayed-2">
                <h2>🔥 Hot Deals</h2>
                <div className="hot-deals-grid">
                  {hotDeals.map(deal => (
                    <div className="deal-card" key={deal.id}>
                      <div className="deal-img">
                        <img src={deal.image} alt={deal.name} loading="lazy" />
                        <span className="discount-badge">{deal.discount} OFF</span>
                        <button 
                          className={`wishlist-btn ${isInWishlist(deal.id) ? 'active' : ''}`}
                          onClick={() => toggleWishlist(deal)}
                          aria-label={isInWishlist(deal.id) ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          <i className={`${isInWishlist(deal.id) ? 'fas' : 'far'} fa-heart`}></i>
                        </button>
                      </div>
                      <div className="deal-content">
                        <h3>{deal.name}</h3>
                        <p className="seller">by {deal.seller}</p>
                        <div className="price-container">
                          <span className="current-price">{deal.price}</span>
                          <span className="original-price">{deal.originalPrice}</span>
                        </div>
                        <div className="product-meta">
                          <span className="rating">
                            <i className="fas fa-star"></i> {deal.rating}
                          </span>
                          <span className="delivery">
                            <i className="fas fa-truck"></i> {deal.deliveryTime}
                          </span>
                        </div>
                        <p className="moq">MOQ: {deal.moq}</p>
                        <div className="product-actions">
                          <button className="view-product-btn" onClick={() => viewProductDetails(deal)}>
                            <i className="fas fa-eye"></i> View
                          </button>
                          <button className="add-to-cart-btn" onClick={() => addToCart(deal)}>
                            <i className="fas fa-cart-plus"></i> Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Trending Products */}
              <div className="trending-section fade-in delayed-3">
                <h2><i className="fas fa-chart-line"></i> Trending Products</h2>
                <div className="trending-products">
                  {trendingProducts.map(product => (
                    <div className="trending-product-card" key={product.id}>
                      <div className="trending-img">
                        <img src={product.image} alt={product.name} loading="lazy" />
                        <div className="trending-badge">Trending</div>
                        <button 
                          className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                          onClick={() => toggleWishlist(product)}
                          aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          <i className={`${isInWishlist(product.id) ? 'fas' : 'far'} fa-heart`}></i>
                        </button>
                      </div>
                      <div className="trending-content">
                        <h3>{product.name}</h3>
                        <p className="trending-seller">{product.seller}</p>
                        <div className="trending-meta">
                          <span className="trending-price">{product.price}</span>
                          <span className="trending-rating">
                            <i className="fas fa-star"></i> {product.rating}
                          </span>
                        </div>
                        <button className="view-trending" onClick={() => viewProductDetails(product)}>
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recently Viewed */}
              {recentlyViewed.length > 0 && (
                <div className="recently-viewed-section fade-in delayed-4">
                  <h2><i className="fas fa-history"></i> Recently Viewed</h2>
                  <div className="recently-viewed-products">
                    {recentlyViewed.map(product => (
                      <div className="recently-viewed-card" key={product.id}>
                        <div className="recently-viewed-img">
                          <img src={product.image} alt={product.name} loading="lazy" />
                        </div>
                        <div className="recently-viewed-content">
                          <h3>{product.name}</h3>
                          <p>{product.price}</p>
                          <button 
                            className="view-again-btn"
                            onClick={() => viewProductDetails(product)}
                          >
                            View Again
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced Filters Section */}
              <div className="filters-section fade-in delayed-5">
                <div className="filters-header">
                  <h3>Browse Products</h3>
                  <button 
                    className="filter-toggle-btn" 
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <i className="fas fa-sliders-h"></i> Filter & Sort
                  </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                  <div className="filter-panel">
                    <div className="filter-group">
                      <h4>Sort By</h4>
                      <div className="sort-options">
                        <button 
                          className={`sort-btn ${sortBy === 'popular' ? 'active' : ''}`}
                          onClick={() => setSortBy('popular')}
                        >
                          Most Popular
                        </button>
                        <button 
                          className={`sort-btn ${sortBy === 'priceLow' ? 'active' : ''}`}
                          onClick={() => setSortBy('priceLow')}
                        >
                          Price: Low to High
                        </button>
                        <button 
                          className={`sort-btn ${sortBy === 'priceHigh' ? 'active' : ''}`}
                          onClick={() => setSortBy('priceHigh')}
                        >
                          Price: High to Low
                        </button>
                        <button 
                          className={`sort-btn ${sortBy === 'rating' ? 'active' : ''}`}
                          onClick={() => setSortBy('rating')}
                        >
                          Highest Rated
                        </button>
                        <button 
                          className={`sort-btn ${sortBy === 'deliveryTime' ? 'active' : ''}`}
                          onClick={() => setSortBy('deliveryTime')}
                        >
                          Fastest Delivery
                        </button>
                      </div>
                    </div>
                    
                    <div className="filter-group">
                      <h4>Price Range</h4>
                      <div className="price-slider">
                        <div className="slider-labels">
                          <span>₹{priceRange[0]}</span>
                          <span>₹{priceRange[1]}</span>
                        </div>
                        <div className="double-range-slider">
                          <input 
                            type="range" 
                            min="0" 
                            max="5000" 
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                          />
                          <input 
                            type="range" 
                            min="0" 
                            max="5000" 
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="filter-group">
                      <h4>Minimum Rating</h4>
                      <div className="rating-filter">
                        {[0, 3, 3.5, 4, 4.5].map(rating => (
                          <button
                            key={rating}
                            className={`rating-btn ${minRating === rating ? 'active' : ''}`}
                            onClick={() => setMinRating(rating)}
                          >
                            {rating === 0 ? 'Any' : (
                              <>
                                {rating}+ <i className="fas fa-star"></i>
                              </>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="filter-group">
                      <h4>Availability</h4>
                      <div className="availability-filter">
                        <button
                          className={`availability-btn ${availabilityFilter === 'all' ? 'active' : ''}`}
                          onClick={() => setAvailabilityFilter('all')}
                        >
                          All Products
                        </button>
                        <button
                          className={`availability-btn ${availabilityFilter === 'inStock' ? 'active' : ''}`}
                          onClick={() => setAvailabilityFilter('inStock')}
                        >
                          In Stock Only
                        </button>
                      </div>
                    </div>
                    
                    <div className="filter-actions">
                      <button 
                        className="clear-filters"
                        onClick={() => {
                          setSortBy('popular');
                          setPriceRange([0, 5000]);
                          setMinRating(0);
                          setAvailabilityFilter('all');
                        }}
                      >
                        Clear Filters
                      </button>
                      <button 
                        className="apply-filters"
                        onClick={() => setShowFilters(false)}
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Categories Section - Enhanced with category cards */}
                <div className="categories-carousel">
                  <button className="carousel-btn prev" aria-label="Previous categories">
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <div className="categories-wrapper">
                    {categories.map(category => (
                      <div 
                        key={category.id}
                        className={`category-card ${selectedCategory === category.id ? 'active' : ''}`} 
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <i className={`fas ${category.icon}`}></i>
                        <span>{category.name}</span>
                      </div>
                    ))}
                  </div>
                  <button className="carousel-btn next" aria-label="Next categories">
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
                
                {/* City selector as cards */}
                <div className="city-cards">
                  {cities.map(city => (
                    <div 
                      key={city}
                      className={`city-card ${selectedCity === city ? 'active' : ''}`}
                      onClick={() => setSelectedCity(city)}
                    >
                      <i className="fas fa-city"></i>
                      <span>{city}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className="products-section">
                  <div className="products-header">
                    <h3>Loading Products...</h3>
                  </div>
                  <div className="products-grid">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div className="product-card" key={i}>
                        <div className="skeleton skeleton-img"></div>
                        <div className="product-content">
                          <div className="skeleton skeleton-text lg"></div>
                          <div className="skeleton skeleton-text sm"></div>
                          <div className="skeleton skeleton-text"></div>
                          <div className="skeleton skeleton-text sm"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="products-section fade-in delayed-6">
                  <div className="products-header">
                    <h3>
                      {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''} Found
                      {searchQuery && ` for "${searchQuery}"`}
                      {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
                    </h3>
                  </div>
                  <div className="products-grid">
                    {filteredProducts.map(product => (
                      <Suspense fallback={
                        <div className="product-card" key={`skeleton-${product.id}`}>
                          <div className="skeleton skeleton-img"></div>
                          <div className="product-content">
                            <div className="skeleton skeleton-text lg"></div>
                            <div className="skeleton skeleton-text sm"></div>
                            <div className="skeleton skeleton-text"></div>
                            <div className="skeleton skeleton-text sm"></div>
                          </div>
                        </div>
                      } key={product.id}>
                        <ProductCard 
                          product={product} 
                          viewProductDetails={viewProductDetails} 
                          addToCart={addToCart} 
                          toggleWishlist={toggleWishlist} 
                          isInWishlist={isInWishlist(product.id)} 
                        />
                      </Suspense>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-products fade-in">
                  <i className="fas fa-box-open"></i>
                  <p>No products available for the current filters</p>
                  <button onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setPriceRange([0, 5000]);
                    setMinRating(0);
                    setAvailabilityFilter('all');
                  }}>Reset Filters</button>
                </div>
              )}
            </div>
          </section>
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
