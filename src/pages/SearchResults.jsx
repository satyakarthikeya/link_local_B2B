import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import B_Navbar from '../components/B_Navbar';
import '../styles/business_home.css';
import '../styles/Search.css'; // Import the new Search CSS file
import { useCart } from '../context/CartContext';

const ProductCard = lazy(() => import('../components/ProductCard'));

// Import product data (this could be moved to a separate file/context in a production app)
const PRODUCTS = [
  {
    id: 1,
    name: "A4 Sheets (500 sheets)",
    price: "₹250",
    numericPrice: 250,
    category: "stationery",
    seller: "Sunrise Stationers",
    moq: "5 packs",
    location: "coimbatore",
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
    location: "coimbatore",
    area: "Town Hall",
    rating: 4.2,
    deliveryTime: "2-3 days",
    image: "../assests/cotton.jpeg",
    inStock: true,
    popularity: 87
  },
  {
    id: 3,
    name: "Jumper Wires Set",
    price: "₹199",
    numericPrice: 199,
    category: "electronics",
    seller: "Sunrise Electronics",
    moq: "20 sets",
    location: "coimbatore",
    area: "Gandhipuram",
    rating: 4.0,
    deliveryTime: "1 day",
    image: "../assests/jumper wires.jpeg",
    inStock: true,
    popularity: 76
  },
  {
    id: 4,
    name: "Honey (1kg)",
    price: "₹450",
    numericPrice: 450,
    category: "food",
    seller: "Lulu Market",
    moq: "5 units",
    location: "coimbatore",
    area: "Peelamedu",
    rating: 4.7,
    deliveryTime: "Same day",
    image: "../assests/honey.jpeg",
    inStock: true,
    popularity: 92
  },
  {
    id: 5,
    name: "Premium Headphones (Bulk)",
    price: "₹1200",
    numericPrice: 1200,
    category: "electronics",
    seller: "Sunrise Electronics",
    moq: "10 units",
    location: "coimbatore",
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
    location: "coimbatore",
    area: "Brookfields",
    rating: 4.3,
    deliveryTime: "1-2 days",
    image: "../assests/silk thread.jpeg",
    inStock: false,
    popularity: 78,
  }
];

const SearchResults = () => {
  const { cartItems, addToCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedCity, setSelectedCity] = useState('coimbatore');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  
  // Categories derived from products
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'stationery', name: 'Stationery' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'textiles', name: 'Textiles' },
    { id: 'food', name: 'Food & Beverages' }
  ];
  
  // Parse search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchQuery(query);
    
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, [location.search]);

  // Filter products based on search query and filters
  useEffect(() => {
    const filtered = PRODUCTS.filter(product => {
      const matchesQuery = searchQuery ? 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) : true;
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesLocation = product.location === selectedCity;
      const matchesPrice = product.numericPrice >= priceRange[0] && product.numericPrice <= priceRange[1];
      const matchesStock = inStockOnly ? product.inStock : true;
      
      return matchesQuery && matchesCategory && matchesLocation && matchesPrice && matchesStock;
    });
    
    // Sort the filtered products
    const sortedProducts = [...filtered].sort((a, b) => {
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
    
    setFilteredProducts(sortedProducts);
  }, [searchQuery, selectedCategory, selectedCity, sortBy, priceRange, inStockOnly]);

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  // Handle price range change
  const handlePriceChange = (e, index) => {
    const newRange = [...priceRange];
    newRange[index] = parseInt(e.target.value);
    setPriceRange(newRange);
  };

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
      />

      <main className="business-main">
        {/* Enhanced Search Header */}
        <div className="search-hero">
          <div className="container">
            <form className="enhanced-search-box" onSubmit={handleSearchSubmit}>
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, suppliers..."
                aria-label="Search"
                className="enhanced-search-input"
              />
              <button type="submit" className="enhanced-search-btn">Search</button>
            </form>
          </div>
        </div>

        <section className="search-results-section">
          <div className="container">
            <div className="search-results-layout">
              {/* Filter Panel - Mobile Toggle */}
              <div className="filter-toggle-container">
                <button 
                  className="filter-toggle-btn" 
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                >
                  <i className="fas fa-filter"></i> 
                  Filters
                  <span className="filter-count">
                    {(selectedCategory !== 'all' ? 1 : 0) + 
                     (inStockOnly ? 1 : 0) +
                     (priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0)}
                  </span>
                </button>

                <div className="sort-dropdown">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="popular">Popular</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>

              {/* Filter Panel */}
              <div className={`filters-panel ${showFilterPanel ? 'show' : ''}`}>
                <div className="filter-section">
                  <h3 className="filter-title">Categories</h3>
                  <ul className="category-filters">
                    {categories.map(category => (
                      <li key={category.id}>
                        <button 
                          className={`category-filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          {category.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="filter-section">
                  <h3 className="filter-title">Price Range</h3>
                  <div className="price-range-filter">
                    <div className="price-inputs">
                      <div className="price-input-group">
                        <span className="price-symbol">₹</span>
                        <input 
                          type="number" 
                          value={priceRange[0]} 
                          onChange={(e) => handlePriceChange(e, 0)}
                          min="0" max={priceRange[1]}
                        />
                      </div>
                      <span className="price-separator">to</span>
                      <div className="price-input-group">
                        <span className="price-symbol">₹</span>
                        <input 
                          type="number" 
                          value={priceRange[1]} 
                          onChange={(e) => handlePriceChange(e, 1)}
                          min={priceRange[0]} max="5000"
                        />
                      </div>
                    </div>
                    <div className="price-range-slider">
                      <input 
                        type="range" 
                        min="0" 
                        max="5000" 
                        value={priceRange[0]} 
                        onChange={(e) => handlePriceChange(e, 0)} 
                        className="range-slider min-range"
                      />
                      <input 
                        type="range" 
                        min="0" 
                        max="5000" 
                        value={priceRange[1]} 
                        onChange={(e) => handlePriceChange(e, 1)} 
                        className="range-slider max-range"
                      />
                    </div>
                  </div>
                </div>

                <div className="filter-section">
                  <h3 className="filter-title">Availability</h3>
                  <div className="availability-filter">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={inStockOnly} 
                        onChange={() => setInStockOnly(!inStockOnly)} 
                      />
                      <span>In-stock items only</span>
                    </label>
                  </div>
                </div>

                <div className="filter-actions">
                  <button 
                    className="clear-filters-btn"
                    onClick={() => {
                      setSelectedCategory('all');
                      setPriceRange([0, 5000]);
                      setInStockOnly(false);
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="search-results-content">
                <div className="search-heading">
                  <h2>
                    {searchQuery ? `Results for "${searchQuery}"` : 'All Products'}
                    <span className="results-count">({filteredProducts.length} products)</span>
                  </h2>
                </div>

                {isLoading ? (
                  <div className="products-grid">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="product-skeleton">
                        <div className="skeleton-image"></div>
                        <div className="skeleton-content">
                          <div className="skeleton-title"></div>
                          <div className="skeleton-meta"></div>
                          <div className="skeleton-price"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {filteredProducts.length > 0 ? (
                      <div className="products-grid">
                        {filteredProducts.map(product => (
                          <Suspense key={product.id} fallback={<div className="product-skeleton"></div>}>
                            <ProductCard product={product} onAddToCart={addToCart} />
                          </Suspense>
                        ))}
                      </div>
                    ) : (
                      <div className="no-products">
                        <i className="fas fa-search"></i>
                        <h3>No products found</h3>
                        <p>Try adjusting your search criteria or filters</p>
                        <button onClick={() => {
                          setSelectedCategory('all');
                          setPriceRange([0, 5000]);
                          setInStockOnly(false);
                          if (searchQuery) setSearchQuery('');
                          else navigate('/business-home');
                        }}>Reset All Filters</button>
                      </div>
                    )}
                  </>
                )}

                {filteredProducts.length > 0 && (
                  <div className="pagination">
                    <button className="pagination-btn active">1</button>
                    <button className="pagination-btn">2</button>
                    <button className="pagination-btn">3</button>
                    <button className="pagination-btn">
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
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
                <li><a href="/business-home">Home</a></li>
                <li><a href="/business-home/my-shop">My Shop</a></li>
                <li><a href="/business-profile">Profile</a></li>
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

export default SearchResults;
