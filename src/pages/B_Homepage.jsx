import React, { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import '../styles/business_home.css';

// Lazy-loaded components
const ProductCard = lazy(() => import('../components/ProductCard'));
const Cart = lazy(() => import('../components/Cart'));

// Constants moved outside the component
const CITIES = ['Coimbatore', 'Chennai', 'Bangalore', 'Mumbai', 'Delhi'];
const CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: 'fa-th-large' },
  { id: 'stationery', name: 'Stationery', icon: 'fa-pencil-alt' },
  { id: 'electronics', name: 'Electronics', icon: 'fa-laptop' },
  { id: 'textiles', name: 'Textiles', icon: 'fa-tshirt' },
  { id: 'food', name: 'Food & Beverages', icon: 'fa-utensils' },
  { id: 'furniture', name: 'Furniture', icon: 'fa-chair' },
  { id: 'tools', name: 'Tools & Hardware', icon: 'fa-tools' },
  { id: 'packaging', name: 'Packaging', icon: 'fa-box-open' }
];
const PRODUCTS = [
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
    popularity: 95
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
  }
];

// Custom hook for local storage state
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = value => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// Component extracted for header
const BusinessHeader = ({ 
  isScrolled, 
  selectedCity, 
  setSelectedCity, 
  searchQuery, 
  setSearchQuery, 
  cart, 
  setShowCart, 
  navigate 
}) => {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleLocationSelect = (city) => {
    setSelectedCity(city);
    setShowLocationDropdown(false);
  };

  return (
    <header className={`business-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="location-bar">
        <div className="container">
          <div className="location-wrapper">
            <div className="location-selector" onClick={() => setShowLocationDropdown(!showLocationDropdown)}>
              <i className="fas fa-map-marker-alt"></i>
              <span>Delivering to: {selectedCity}</span>
              <i className={`fas fa-chevron-down ${showLocationDropdown ? 'rotated' : ''}`}></i>

              {showLocationDropdown && (
                <div className="location-dropdown">
                  <div className="location-search">
                    <i className="fas fa-search"></i>
                    <input type="text" placeholder="Search location" />
                  </div>
                  <div className="popular-locations">
                    <h4>Popular Cities</h4>
                    <ul>
                      {CITIES.map(city => (
                        <li key={city} onClick={() => handleLocationSelect(city)}>
                          <i className="fas fa-map-marker-alt"></i> {city}
                        </li>
                      ))}
                    </ul>
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
          <h1>Link<span className="highlight">Local</span></h1>
        </div>

        <div className={`search-container ${isSearchFocused ? 'focused' : ''}`}>
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search products, categories, sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
        </div>

        <div className="nav-buttons">
          <button className="nav-btn cart" onClick={() => setShowCart(true)}>
            <i className="fas fa-shopping-cart"></i>
            <span className="cart-count">{cart.length}</span>
          </button>
          <button className="nav-btn primary" onClick={() => navigate('/business-home/my-shop')}>
            <i className="fas fa-store"></i> My Shop
          </button>
          <div className="user-menu">
            <button className="user-btn" onClick={() => navigate('/business-home/profile')}>
              <i className="fas fa-user-circle"></i>
              <span>My Account</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Component extracted for categories section
const CategoriesSection = ({ selectedCategory, setSelectedCategory }) => (
  <section className="categories-section">
    <div className="container">
      <div className="categories-grid">
        {CATEGORIES.map(category => (
          <div
            key={category.id}
            className={`category-tile ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <i className={`fas ${category.icon}`}></i>
            <span>{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Component extracted for products section
const ProductsSection = ({ 
  filteredProducts, 
  sortBy, 
  setSortBy, 
  addToCart, 
  setSelectedCategory, 
  setSearchQuery 
}) => (
  <section className="products-section">
    <div className="container">
      <div className="products-header">
        <h2>Featured Products</h2>
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
            <ProductCard product={product} onAddToCart={addToCart} />
          </Suspense>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-products">
          <i className="fas fa-search"></i>
          <h3>No products found</h3>
          <p>Try adjusting your search criteria</p>
          <button onClick={() => {
            setSelectedCategory('all');
            setSearchQuery('');
          }}>Clear Filters</button>
        </div>
      )}
    </div>
  </section>
);

// Main component
const B_Homepage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('Coimbatore');
  const [cart, setCart] = useLocalStorage('cart', []);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [wishlist, setWishlist] = useLocalStorage('wishlist', []);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useLocalStorage('recentlyViewed', []);

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add to cart function
  const addToCart = useCallback((product) => {
    setCart(prevCart => [...prevCart, product]);
    setShowCartNotification(true);
    setTimeout(() => setShowCartNotification(false), 2000);
  }, [setCart]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = PRODUCTS.filter((product) => {
      return (
        (selectedCategory === 'all' || product.category === selectedCategory) &&
        product.location === selectedCity &&
        (searchQuery === '' ||
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.seller.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });

    // Sort the filtered products
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priceLow':
          return a.numericPrice - b.numericPrice;
        case 'priceHigh':
          return b.numericPrice - a.numericPrice;
        case 'rating':
          return b.rating - a.rating;
        case 'popular':
        default:
          return b.popularity - a.popularity;
      }
    });
  }, [selectedCategory, selectedCity, searchQuery, sortBy]);

  return (
    <div className="business-app">
      <BusinessHeader
        isScrolled={isScrolled}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cart={cart}
        setShowCart={setShowCart}
        navigate={navigate}
      />

      {showCart && (
        <Suspense fallback={<div>Loading cart...</div>}>
          <Cart items={cart} onClose={() => setShowCart(false)} />
        </Suspense>
      )}

      <main className="business-main">
        <CategoriesSection 
          selectedCategory={selectedCategory} 
          setSelectedCategory={setSelectedCategory} 
        />

        <ProductsSection
          filteredProducts={filteredProducts}
          sortBy={sortBy}
          setSortBy={setSortBy}
          addToCart={addToCart}
          setSelectedCategory={setSelectedCategory}
          setSearchQuery={setSearchQuery}
        />

        {showCartNotification && (
          <div className="cart-notification">
            <i className="fas fa-check-circle"></i> Item added to cart!
          </div>
        )}
      </main>

      <footer className="business-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-col">
              <h3>About LinkLocal</h3>
              <p>Your trusted B2B marketplace connecting local businesses.</p>
            </div>
            <div className="footer-col">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">Categories</a></li>
                <li><a href="#">My Shop</a></li>
                <li><a href="#">Profile</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Contact</h3>
              <p>Email: support@linklocal.com</p>
              <p>Phone: +91 1234567890</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 LinkLocal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default B_Homepage;