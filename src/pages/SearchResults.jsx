import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import B_Navbar from '../components/B_Navbar';
import '../styles/business_home.css';
import '../styles/Search.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productAPI } from '../utils/api';

const ProductCard = lazy(() => import('../components/ProductCard'));

const SearchResults = () => {
  const { cartItems, addToCart } = useCart();
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const filtersRef = useRef(null);
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
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Categories with icons
  const categories = [
    { id: 'all', name: 'All Categories', icon: 'fa-th-large' },
    { id: 'stationery', name: 'Stationery', icon: 'fa-pencil-alt' },
    { id: 'electronics', name: 'Electronics', icon: 'fa-laptop' },
    { id: 'textiles', name: 'Textiles', icon: 'fa-tshirt' },
    { id: 'food', name: 'Food & Beverages', icon: 'fa-utensils' }
  ];
  
  // Click outside handler for filters panel
  useEffect(() => {
    function handleClickOutside(event) {
      if (filtersRef.current && !filtersRef.current.contains(event.target) && 
          !event.target.closest('.filter-toggle-btn')) {
        setShowFilterPanel(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Parse search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchQuery(query);
    
    // Reset other states when query changes
    setCurrentPage(1);
    
    // Call search immediately with the new query
    if (query) {
      setIsLoading(true);
      fetchSearchResults();
      
      // Add to recent searches
      if (query.trim() !== '') {
        const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
        setRecentSearches(updatedSearches);
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      }
    }
  }, [location.search]);

  // Save recent searches to localStorage when updated
  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Fetch search results from API based on query and filters
  const fetchSearchResults = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Prepare filters for API
      const filters = {
        search_query: searchQuery,
        category: selectedCategory !== 'all' ? selectedCategory : null,
        city: selectedCity,
        min_price: priceRange[0] > 0 ? priceRange[0] : null,
        max_price: priceRange[1] < 5000 ? priceRange[1] : null,
        stock_status: inStockOnly ? 'in_stock' : null,
        page: currentPage,
        limit: 12,
        sort: sortBy
      };
      
      console.log('Searching with filters:', filters);
      
      // Call API with filters
      const response = await productAPI.searchProducts(filters);
      console.log('Search API response:', response.data);
      
      // If no response or empty products, show a message
      if (!response || !response.data || 
          !response.data.products || 
          response.data.products.length === 0) {
        
        setFilteredProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
        setError('No products matched your search criteria. Try a different search term or browse categories.');
        setIsLoading(false);
        return;
      }
      
      // Format products for display - map API response to match ProductCard component props
      const products = response.data.products.map(product => {
        return {
          id: product.id,
          product_id: product.id,
          name: product.name,
          product_name: product.name,
          price: product.price,
          numericPrice: parseFloat(product.price) || 0,
          category: product.category || 'Uncategorized',
          seller: product.seller || product.business_name || 'Unknown Seller',
          business_name: product.seller || product.business_name || 'Unknown Seller',
          moq: parseInt(product.moq) || 1,
          quantity_available: product.quantity_available || 0,
          area: product.area || 'Local Area',
          city: product.city || selectedCity,
          inStock: product.inStock !== undefined ? product.inStock : (product.quantity_available > 0),
          in_stock: product.inStock !== undefined ? product.inStock : (product.quantity_available > 0),
          image: product.image_url ||null,
          image_url: product.image_url ||null,
          description: product.description || 'No description available',
          reorder_point: product.reorder_point || 5,
          rating: product.rating || (Math.random() * 2 + 3).toFixed(1), // Random rating between 3-5 if not provided
          
          // Deal information for consistent styling with B_Homepage
          isDeal: product.is_deal || product.isDeal || false,
          deal_type: product.deal_type || null,
          discount: product.discount_percentage || 0,
          discount_percentage: product.discount_percentage || 0,
          originalPrice: product.original_price ? `₹${product.original_price}` : undefined,
          discounted_price: product.discounted_price || product.price
        };
      });
      
      // Apply client-side sorting
      const sortedProducts = sortProducts(products, sortBy);
      setFilteredProducts(sortedProducts);
      
      // Update pagination data if available
      if (response.data.pagination) {
        setTotalProducts(response.data.pagination.totalProducts || products.length);
        setTotalPages(response.data.pagination.totalPages || 1);
        setCurrentPage(response.data.pagination.currentPage || 1);
      } else {
        setTotalProducts(products.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError('Failed to fetch products. Please try again later.');
      setFilteredProducts([]);
      setTotalProducts(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Sort products based on selected sort option
  const sortProducts = (products, sortOption) => {
    switch (sortOption) {
      case 'priceLow':
        return [...products].sort((a, b) => a.numericPrice - b.numericPrice);
      case 'priceHigh':
        return [...products].sort((a, b) => b.numericPrice - a.numericPrice);
      case 'rating':
        return [...products].sort((a, b) => b.rating - a.rating);
      case 'newest':
        return [...products]; // Assuming products are already sorted by date on the server
      case 'popular':
      default:
        return products;
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Filter products based on search query and filters
  useEffect(() => {
    // Don't fetch if search query is empty, except when the user has explicitly cleared the search
    if (searchQuery !== '' || location.pathname === '/search') {
      fetchSearchResults();
    }
  }, [selectedCategory, selectedCity, sortBy, inStockOnly, currentPage]);
  
  // Apply price range filter with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== '' || location.pathname === '/search') {
        fetchSearchResults();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [priceRange]);

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowRecentSearches(false);
    
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle price range change
  const handlePriceChange = (e, index) => {
    const newRange = [...priceRange];
    newRange[index] = parseInt(e.target.value);
    setPriceRange(newRange);
  };
  
  // Handle click on recent search
  const handleRecentSearchClick = (search) => {
    setSearchQuery(search);
    setShowRecentSearches(false);
    navigate(`/search?q=${encodeURIComponent(search)}`);
  };
  
  // Clear recent searches
  const clearRecentSearches = (e) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
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
            <form 
              className={`enhanced-search-box ${isSearchFocused ? 'focused' : ''}`} 
              onSubmit={handleSearchSubmit}
            >
              <i className="fas fa-search search-icon"></i>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, suppliers..."
                  aria-label="Search"
                  className="enhanced-search-input"
                  onFocus={() => {
                    setIsSearchFocused(true);
                    setShowRecentSearches(true);
                  }}
                  onBlur={() => {
                    setIsSearchFocused(false);
                    // Delayed hiding to allow clicking recent searches
                    setTimeout(() => setShowRecentSearches(false), 200);
                  }}
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    className="clear-search" 
                    onClick={() => setSearchQuery('')}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
                
                {/* Recent searches dropdown */}
                {showRecentSearches && recentSearches.length > 0 && (
                  <div className="recent-searches-dropdown">
                    <div className="recent-searches-header">
                      <span>Recent Searches</span>
                      <button 
                        className="clear-recent" 
                        onClick={clearRecentSearches}
                      >
                        Clear
                      </button>
                    </div>
                    <ul>
                      {recentSearches.map((search, index) => (
                        <li key={index} onClick={() => handleRecentSearchClick(search)}>
                          <i className="fas fa-history"></i>
                          <span>{search}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <button type="submit" className="enhanced-search-btn">
                <i className="fas fa-search"></i>
                <span>Search</span>
              </button>
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
                  aria-expanded={showFilterPanel}
                  aria-controls="filters-panel"
                >
                  <i className="fas fa-filter"></i> 
                  Filters
                  {((selectedCategory !== 'all') || 
                    inStockOnly || 
                    (priceRange[0] > 0 || priceRange[1] < 5000)) && (
                    <span className="filter-count">
                      {(selectedCategory !== 'all' ? 1 : 0) + 
                       (inStockOnly ? 1 : 0) +
                       (priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0)}
                    </span>
                  )}
                </button>

                <div className="sort-dropdown">
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort products by"
                  >
                    <option value="popular">Popular</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              </div>

              {/* Filter Panel */}
              <div 
                ref={filtersRef}
                id="filters-panel"
                className={`filters-panel ${showFilterPanel ? 'show' : ''}`}
              >
                <div className="filters-panel-header">
                  <h3>Filters</h3>
                  <button 
                    className="close-filters-btn"
                    onClick={() => setShowFilterPanel(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                <div className="filter-section">
                  <h3 className="filter-title">Categories</h3>
                  <ul className="category-filters">
                    {categories.map(category => (
                      <li key={category.id}>
                        <button 
                          className={`category-filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <i className={`fas ${category.icon}`}></i>
                          {category.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="filter-section">
                  <h3 className="filter-title">Price Range</h3>
                  <div className="price-range-filter">
                    <div className="price-slider">
                      <div className="slider-track"></div>
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
                    
                    <div className="price-inputs">
                      <div className="price-input-group">
                        <span className="price-symbol">₹</span>
                        <input 
                          type="number" 
                          value={priceRange[0]} 
                          onChange={(e) => handlePriceChange(e, 0)}
                          min="0" max={priceRange[1]}
                          aria-label="Minimum price"
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
                          aria-label="Maximum price"
                        />
                      </div>
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
                        aria-label="Show in-stock items only"
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
                    <i className="fas fa-times-circle"></i> Clear All Filters
                  </button>
                  <button 
                    className="apply-filters-btn"
                    onClick={() => setShowFilterPanel(false)}
                  >
                    <i className="fas fa-check"></i> Apply Filters
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="search-results-content">
                <div className="search-heading">
                  <h2>
                    {searchQuery ? (
                      <>Results for "<span className="search-term">{searchQuery}</span>"</>
                    ) : (
                      'All Products'
                    )}
                    <span className="results-count">
                      {totalProducts} product{totalProducts !== 1 ? 's' : ''}
                    </span>
                  </h2>
                  
                  {/* Active filters display */}
                  {(selectedCategory !== 'all' || inStockOnly || priceRange[0] > 0 || priceRange[1] < 5000) && (
                    <div className="active-filters">
                      <span className="active-filters-label">Active Filters:</span>
                      <div className="active-filters-tags">
                        {selectedCategory !== 'all' && (
                          <div className="filter-tag">
                            {categories.find(c => c.id === selectedCategory)?.name}
                            <button onClick={() => setSelectedCategory('all')}>
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        )}
                        
                        {inStockOnly && (
                          <div className="filter-tag">
                            In Stock Only
                            <button onClick={() => setInStockOnly(false)}>
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        )}
                        
                        {(priceRange[0] > 0 || priceRange[1] < 5000) && (
                          <div className="filter-tag">
                            ₹{priceRange[0]} - ₹{priceRange[1]}
                            <button onClick={() => setPriceRange([0, 5000])}>
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        )}
                        
                        <button 
                          className="clear-all-tag"
                          onClick={() => {
                            setSelectedCategory('all');
                            setPriceRange([0, 5000]);
                            setInStockOnly(false);
                          }}
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {isLoading ? (
                  <div className="products-grid">
                    {[...Array(8)].map((_, index) => (
                      <div key={index} className="product-skeleton">
                        <div className="skeleton-image"></div>
                        <div className="skeleton-content">
                          <div className="skeleton-title"></div>
                          <div className="skeleton-meta"></div>
                          <div className="skeleton-price"></div>
                          <div className="skeleton-button"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {filteredProducts.length > 0 ? (
                      <div className="products-grid">
                        {filteredProducts.map(product => (
                          <Suspense key={product.product_id} fallback={<div className="product-skeleton"></div>}>
                            <ProductCard product={product} onAddToCart={addToCart} />
                          </Suspense>
                        ))}
                      </div>
                    ) : (
                      <div className="no-products">
                        <div className="no-results-icon">
                          <i className="fas fa-search"></i>
                        </div>
                        <h3>No products found</h3>
                        <p>{error || "We couldn't find any products matching your criteria."}</p>
                        <div className="no-results-actions">
                          <button 
                            onClick={() => {
                              setSelectedCategory('all');
                              setPriceRange([0, 5000]);
                              setInStockOnly(false);
                            }}
                          >
                            <i className="fas fa-filter"></i> Reset Filters
                          </button>
                          {searchQuery && (
                            <button onClick={() => {
                              setSearchQuery('');
                              navigate('/search');
                            }}>
                              <i className="fas fa-times"></i> Clear Search
                            </button>
                          )}
                          <button onClick={() => navigate('/business-home')}>
                            <i className="fas fa-home"></i> Back to Home
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {filteredProducts.length > 0 && totalPages > 1 && (
                  <div className="pagination">
                    {currentPage > 1 && (
                      <button 
                        className="pagination-btn nav-btn" 
                        onClick={() => handlePageChange(currentPage - 1)}
                        aria-label="Previous page"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                    )}
                    
                    {getPaginationRange().map(pageNum => {
                      if (pageNum === 'ellipsis') {
                        return <span key={`ellipsis-${Math.random()}`} className="pagination-ellipsis">...</span>;
                      }
                      
                      return (
                        <button 
                          key={pageNum}
                          className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => handlePageChange(pageNum)}
                          aria-label={`Page ${pageNum}`}
                          aria-current={currentPage === pageNum ? 'page' : undefined}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {currentPage < totalPages && (
                      <button 
                        className="pagination-btn nav-btn" 
                        onClick={() => handlePageChange(currentPage + 1)}
                        aria-label="Next page"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    )}
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
            <p>&copy; {new Date().getFullYear()} LinkLocal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper function for pagination display
function getPaginationRange() {
  const delta = 1; // Pages to show on either side of current page
  let range = [];
  
  // Always include first page
  range.push(1);
  
  // Calculate start and end pages to show
  const rangeStart = Math.max(2, currentPage - delta);
  const rangeEnd = Math.min(totalPages - 1, currentPage + delta);
  
  // Add ellipsis after first page if needed
  if (rangeStart > 2) {
    range.push('ellipsis');
  }
  
  // Add pages in the middle
  for (let i = rangeStart; i <= rangeEnd; i++) {
    range.push(i);
  }
  
  // Add ellipsis before last page if needed
  if (rangeEnd < totalPages - 1) {
    range.push('ellipsis');
  }
  
  // Always include last page if there is more than one page
  if (totalPages > 1) {
    range.push(totalPages);
  }
  
  return range;
}

export default SearchResults;
