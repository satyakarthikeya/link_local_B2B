import React, { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import '../styles/business_home.css';
import B_Navbar from '../components/B_Navbar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ProductCard = lazy(() => import('../components/ProductCard'));
const Cart = lazy(() => import('../components/Cart'));

const CITIES = ['coimbatore', 'chennai', 'bangalore', 'mumbai', 'delhi'];
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
  const { currentUser, getProfileName } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('coimbatore');
  const { cartItems, addToCart } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showCartNotification, setShowCartNotification] = useState(false);
  
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getBusinessOwnerName = () => {
    if (currentUser && currentUser.owner_name) {
      return currentUser.owner_name;
    }
    return 'Business Owner';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.products.getProducts({ city: currentUser?.city });
        let productsData = response.data?.products || [];
        
        console.log('API Response:', response);
        console.log('Raw products data:', productsData);
        
        const transformedProducts = productsData.map(product => ({
          id: product.id,
          name: product.name,
          price: `₹${product.price}`,
          numericPrice: product.price,
          category: product.category || 'uncategorized',
          seller: product.seller,
          seller_id: product.seller_id,
          business_id: product.business_id,
          moq: product.moq ? `${product.moq} units` : '1 unit',
          location: product.location || 'coimbatore',
          area: product.area || 'Local Area',
          rating: 4.5,
          deliveryTime: "1-3 days",
          image: product.image_url || "./src/assests/guddu.jpeg",
          inStock: product.quantity_available > 0,
          popularity: Math.floor(Math.random() * (100 - 70) + 70),
          description: product.description || 'No description available',
          quantity_available: product.quantity_available
        }));
        
        setProducts(transformedProducts);
        console.log('Transformed products:', transformedProducts);
        
        try {
          const dealsResponse = await api.deals.getActiveDeals({ 
            city: currentUser?.city,
            exclude_businessman_id: currentUser?.businessman_id || currentUser?.business_id
          });
          let dealsData = [];
          
          if (dealsResponse.data && dealsResponse.data.data) {
            // Access the deals array from the nested data property
            dealsData = dealsResponse.data.data;
          }
          
          const transformedDeals = Array.isArray(dealsData) ? dealsData.map(deal => ({
            id: deal.deal_id || deal.product_id,
            name: deal.product_name,
            price: `₹${deal.discounted_price || deal.price}`,
            originalPrice: deal.original_price ? `₹${deal.original_price}` : undefined,
            numericPrice: deal.discounted_price || deal.price,
            discount: deal.discount_percentage || 0,
            category: deal.category || 'uncategorized',
            seller: deal.business_name,
            moq: deal.moq ? `${deal.moq} units` : '1 unit',
            location: deal.area || 'coimbatore',
            area: deal.street || 'Local Area',
            rating: 4.5,
            deliveryTime: "1-3 days",
            image: deal.image_url || "./src/assests/guddu.jpeg",
            inStock: deal.quantity_available > 0,
            popularity: Math.floor(Math.random() * (100 - 70) + 70),
            description: deal.description || 'No description available',
            quantity_available: deal.quantity_available,
            isDeal: true
          })) : [];
          
          setDeals(transformedDeals);
        } catch (dealErr) {
          console.error('Failed to fetch deals:', dealErr);
          setDeals([]);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser?.city]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    setShowCartNotification(true);
    setTimeout(() => setShowCartNotification(false), 2000);
  };

  const filteredProducts = useMemo(() => {
    if (!products.length) {
      console.log('No products available before filtering');
      return [];
    }
    
    console.log('Products before filtering:', products);
    console.log('Current user:', currentUser);
    console.log('Selected category:', selectedCategory);
    console.log('Search query:', searchQuery);
    
    // Get IDs of products that are already in deals to filter them out
    const dealProductIds = deals.map(deal => deal.id);
    console.log('Deal product IDs to exclude:', dealProductIds);
    
    // Filter products: exclude own products and products already in deals (unless they're the user's own deals)
    let filtered = products.filter(product => {
      // Skip products owned by the current user
      if (currentUser && product.business_id && 
          (currentUser.businessman_id === product.business_id || 
           currentUser.business_id === product.business_id)) {
        console.log(`Filtering out own product: ${product.name} (ID: ${product.id})`);
        return false;
      }
      
      // Find if this product has a deal
      const productDeal = deals.find(deal => deal.id === product.id);
      
      // If there's a deal for this product, check ownership
      if (productDeal) {
        // Extract business ID from the deal if available
        const dealBusinessId = productDeal.business_id || 
                              (productDeal.seller_id ? parseInt(productDeal.seller_id) : null);
                              
        // If the deal belongs to the current user, keep the product
        if (currentUser && 
            (currentUser.businessman_id === dealBusinessId || 
             currentUser.business_id === dealBusinessId)) {
          console.log(`Keeping product with user's own deal: ${product.name} (ID: ${product.id})`);
          return true;
        }
        
        // Otherwise, filter out products with deals from other users
        console.log(`Filtering out product with other user's deal: ${product.name} (ID: ${product.id})`);
        return false;
      }
      
      return true;
    });
    
    // Apply category filter if selected
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Apply search filter if query exists
    if (searchQuery !== '') {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.seller.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    console.log('Filtered products count:', filtered.length);

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
  }, [products, deals, selectedCategory, searchQuery, sortBy, currentUser]);

  const filteredDeals = useMemo(() => {
    if (!deals.length) return [];
    
    let filtered = deals.filter((deal) => {
      return (
        (selectedCategory === 'all' || deal.category === selectedCategory) &&
        (searchQuery === '' ||
          deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deal.seller.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });

    console.log('Filtered deals:', filtered);

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priceLow':
          return a.numericPrice - b.numericPrice;
        case 'priceHigh':
          return b.numericPrice - a.numericPrice;
        case 'rating':
          return b.rating - a.rating;
        case 'discount':
          return b.discount - a.discount;
        case 'popular':
        default:
          return b.popularity - a.popularity;
      }
    });
  }, [deals, selectedCategory, searchQuery, sortBy]);

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
        <div className="welcome-banner">
          <div className="container">
            <h2>Welcome, {getBusinessOwnerName()}! 👋</h2>
            <p>Find everything you need for your business growth today.</p>
          </div>
        </div>

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

        <section className="featured-products-showcase">
          <div className="container">
            <div className="section-header">
              <h2><i className="fas fa-tag"></i> Today's Best Deals</h2>
              <p>Special offers from local suppliers</p>
            </div>
            
            <div className="featured-products-grid">
              {!loading && filteredDeals.slice(0, 2).map((deal) => (
                <div key={deal.id} className="featured-product-card">
                  <div className="featured-product-image">
                    <img src={deal.image} alt={deal.name} />
                    <div className="featured-badge">Save {deal.discount}%</div>
                  </div>
                  <div className="featured-product-info">
                    <h3>{deal.name}</h3>
                    <div className="featured-product-price">
                      <span className="current-price">{deal.price}</span>
                      <span className="original-price">{deal.originalPrice}</span>
                    </div>
                    <div className="featured-product-seller">by {deal.seller}</div>
                    <button 
                      className="featured-add-to-cart"
                      onClick={() => handleAddToCart(deal)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
              
              {loading && (
                <>
                  <div className="featured-product-skeleton"></div>
                  <div className="featured-product-skeleton"></div>
                </>
              )}

              {!loading && filteredDeals.length === 0 && (
                <div className="no-deals-message">
                  <p>No deals available currently. Check back soon!</p>
                </div>
              )}
            </div>
          </div>
        </section>

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

        <section className="products-section">
          <div className="container">
            <div className="section-header">
              <h2>Regular Products</h2>
              <div className="header-meta">
                <p>Browse regular priced products from trusted sellers</p>
                <div className="sort-options">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="popular">Most Popular</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
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
              <>
                <div className="products-count">
                  <span>{filteredProducts.length} products found</span>
                </div>
                <div className="products-grid">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <Suspense key={product.id} fallback={<div className="product-skeleton"></div>}>
                        <ProductCard 
                          product={{
                            product_id: product.id,
                            product_name: product.name,
                            price: parseFloat(product.numericPrice),
                            quantity_available: product.quantity_available,
                            image_url: product.image,
                            category: product.category,
                            moq: parseInt(product.moq) || 1,
                            business_name: product.seller,
                            area: product.area,
                            in_stock: product.inStock,
                            description: product.description
                          }} 
                          onAddToCart={handleAddToCart} 
                        />
                      </Suspense>
                    ))
                  ) : (
                    <div className="no-products">
                      <i className="fas fa-box-open"></i>
                      <h3>No regular products found</h3>
                      <p>Check out our deals section for special offers!</p>
                      <button onClick={() => {
                        setSelectedCategory('all');
                        setSearchQuery('');
                      }}>Clear Filters</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {showCartNotification && (
          <div className="cart-notification">
            <i className="fas fa-check-circle"></i> Item added to cart!
          </div>
        )}
      </main>

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

export default B_Homepage;