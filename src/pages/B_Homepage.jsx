import React, { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import '../styles/business_home.css';
import B_Navbar from '../components/B_Navbar';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

const ProductCard = lazy(() => import('../components/ProductCard'));
const Cart = lazy(() => import('../components/Cart'));

const CITIES = ['Coimbatore', 'Chennai', 'Bangalore', 'Mumbai', 'Delhi'];
const CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: 'fa-th-large' },
  { id: 'SuperMarket', name: 'Supermarket', icon: 'fa-shopping-basket' },
  { id: 'Electronics', name: 'Electronics', icon: 'fa-laptop' },
  { id: 'Wholesale', name: 'Wholesale', icon: 'fa-warehouse' },
  { id: 'Restaurant', name: 'Food & Beverages', icon: 'fa-utensils' },
  { id: 'furniture', name: 'Furniture', icon: 'fa-chair' },
  { id: 'tools', name: 'Tools & Hardware', icon: 'fa-tools' },
  { id: 'packaging', name: 'Packaging', icon: 'fa-box-open' }
];

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


const B_Homepage = () => {
  useEffect(() => {
    document.body.style.minHeight = '100vh';
    document.body.style.display = 'flex';
    document.body.style.flexDirection = 'column';
    
    return () => {
      document.body.style = '';
    };
  }, []);
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('Coimbatore');
  const { cartItems, addToCart } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showCartNotification, setShowCartNotification] = useState(false);
  
  // New state for products loaded from API
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from backend API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsData = await api.products.getAll();
        
        // Transform the products to match the expected format
        const transformedProducts = productsData.map(product => ({
          id: product.product_id,
          name: product.product_name,
          price: `₹${product.price}`,
          numericPrice: product.price,
          category: product.category || 'uncategorized',
          seller: product.business_name,
          moq: `${Math.ceil(product.quantity_available * 0.1)} units`, // Just an example
          location: product.area || 'Coimbatore',
          area: product.street || 'Local Area',
          rating: 4.5, // Example default rating
          deliveryTime: "1-3 days",
          image: product.image_url || "./src/assests/guddu.jpeg", // Default image if none provided
          inStock: product.quantity_available > 0,
          popularity: 80, // Example default popularity
          description: product.description || 'No description available',
          quantity_available: product.quantity_available
        }));
        
        setProducts(transformedProducts);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle add to cart with notification
  const handleAddToCart = (product) => {
    addToCart(product);
    setShowCartNotification(true);
    setTimeout(() => setShowCartNotification(false), 2000);
  };

  const filteredProducts = useMemo(() => {
    if (!products.length) return [];
    
    let filtered = products.filter((product) => {
      return (
        (selectedCategory === 'all' || product.category === selectedCategory) &&
        (searchQuery === '' ||
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.seller.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });

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
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="business-app">
      <B_Navbar 
        selectedCity={selectedCity} 
        setSelectedCity={setSelectedCity} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        cart={cartItems}
        setShowCart={setShowCart} 
        navigate={navigate} 
        showLocationDropdown={showLocationDropdown}
        setShowLocationDropdown={setShowLocationDropdown}
      />

      <main className="business-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <h1>Your B2B Marketplace <br />For Local Business Growth</h1>
              <p>Connect with trusted suppliers and grow your business network</p>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">500+</span>
                  <span>Suppliers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">5000+</span>
                  <span>Products</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">20+</span>
                  <span>Cities</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="categories-section">
          <div className="container">
            <div className="section-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <h2>Explore Categories</h2>
              <p>Find everything your business needs</p>
            </div>
           
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

        {/* Products Section */}
        <ProductsSection
          filteredProducts={filteredProducts}
          loading={loading}
          error={error}
          sortBy={sortBy}
          setSortBy={setSortBy}
          addToCart={handleAddToCart}
          setSelectedCategory={setSelectedCategory}
          setSearchQuery={setSearchQuery}
        />

        {showCartNotification && (
          <div className="cart-notification">
            <i className="fas fa-check-circle"></i> Item added to cart!
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <Suspense fallback={<div>Loading cart...</div>}>
          <Cart items={cartItems} onClose={() => setShowCart(false)} />
        </Suspense>
      )}

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

const ProductsSection = ({ 
  filteredProducts,
  loading,
  error, 
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

      {loading ? (
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading products...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map(product => (
            <Suspense key={product.id} fallback={<div className="product-skeleton"></div>}>
              <ProductCard product={product} onAddToCart={addToCart} />
            </Suspense>
          ))}
        </div>
      )}

      {!loading && !error && filteredProducts.length === 0 && (
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

export default B_Homepage;