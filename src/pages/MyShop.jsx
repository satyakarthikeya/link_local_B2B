import React, { useState, useEffect, useRef } from 'react';
import B_Navbar from '../components/B_Navbar';
import '../styles/MyShop.css';

const MyShop = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [showProductForm, setShowProductForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [orders, setOrders] = useState([
    {
      id: "2305",
      status: "pending",
      items: [
        { qty: 2, name: "Sona masoori RICE", price: 100 },
        { qty: 1, name: "Dabur Honey", price: 250 },
        { qty: 3, name: "Farm Fresh Eggs", price: 150 }
      ],
      total: 900,
      customer: "Kenny Simha",
      date: "March 1, 2025 at 2:45 PM"
    },
    {
      id: "2306",
      status: "pending",
      items: [
        { qty: 1, name: "Raw Cotton", price: 800 },
        { qty: 2, name: "Silk Threads", price: 1000 }
      ],
      total: 2800,
      customer: "Pydi raju",
      date: "March 2, 2025 at 10:15 AM"
    }
  ]);

  const [products, setProducts] = useState([
    {
      name: "Sona Masoori RICE",
      category: "Fresh Produce",
      price: 100,
      stock: 23,
      image: "../assests/rice bags.jpeg",
      description: "Premium quality rice, sourced directly from farms"
    },
    {
      name: "Dabur Honey",
      category: "Pantry Items",
      price: 250,
      stock: 12,
      image: "../assests/honey.jpeg",
      description: "100% pure honey with no additives"
    },
    {
      name: "Farm Fresh Eggs",
      category: "Dairy & Eggs",
      price: 150,
      stock: 40,
      image: "../assests/guddu.jpeg",
      description: "Organic eggs from free-range chickens"
    },
    {
      name: "Raw Cotton",
      category: "Wholesale",
      price: 800,
      stock: 8,
      image: "../assests/cotton.jpeg",
      description: "High-quality raw cotton for textile manufacturing"
    },
    {
      name: "Silk Threads",
      category: "Wholesale",
      price: 1000,
      stock: 15,
      image: "../assests/silk thread.jpeg",
      description: "Premium silk threads for traditional embroidery"
    }
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setFormErrors({
        ...formErrors,
        image: 'Please select an image file (jpg, jpeg, png)'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setFormData({
        ...formData,
        image: reader.result
      });
      
      if (formErrors.image) {
        setFormErrors({
          ...formErrors,
          image: null
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerFileInput();
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = "Product name is required";
    if (!formData.category) errors.category = "Please select a category";
    if (!formData.price) errors.price = "Price is required";
    else if (isNaN(formData.price) || Number(formData.price) <= 0) 
      errors.price = "Price must be a positive number";
    
    if (!formData.stock) errors.stock = "Stock quantity is required";
    else if (isNaN(formData.stock) || Number(formData.stock) <= 0 || !Number.isInteger(Number(formData.stock))) 
      errors.stock = "Stock must be a positive whole number";
    
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.image && !imagePreview) errors.image = "Product image is required";
    
    return errors;
  };

  const closeForm = () => {
    setShowProductForm(false);
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      description: '',
      image: null
    });
    setImagePreview(null);
    setFormErrors({});
    setEditingProductId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingProductId !== null) {
        const updatedProducts = products.map((product, idx) => 
          idx === editingProductId ? {
            name: formData.name,
            category: formData.category,
            price: Number(formData.price),
            stock: Number(formData.stock),
            image: formData.image || product.image,
            description: formData.description
          } : product
        );
        
        setProducts(updatedProducts);
        setEditingProductId(null);
        console.log("Product updated successfully");
      } else {
        const newProduct = {
          name: formData.name,
          category: formData.category,
          price: Number(formData.price),
          stock: Number(formData.stock),
          image: formData.image || imagePreview,
          description: formData.description
        };
        
        setProducts([...products, newProduct]);
        console.log("New product added:", newProduct);
      }
      
      closeForm();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = (idx) => {
    const productToEdit = products[idx];
    setFormData({
      name: productToEdit.name,
      category: productToEdit.category,
      price: productToEdit.price.toString(),
      stock: productToEdit.stock.toString(),
      description: productToEdit.description || '',
      image: null
    });
    
    setImagePreview(productToEdit.image);
    setEditingProductId(idx);
    setShowProductForm(true);
  };
  
  const handleDeleteProduct = (idx) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = [...products];
      updatedProducts.splice(idx, 1);
      setProducts(updatedProducts);
      console.log("Product deleted successfully");
    }
  };
  
  const handleAcceptOrder = (orderId) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: 'accepted' } : order
    );
    setOrders(updatedOrders);
    console.log(`Order #${orderId} accepted`);
  };
  
  const handleRejectOrder = (orderId) => {
    if (window.confirm('Are you sure you want to reject this order?')) {
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: 'rejected' } : order
      );
      setOrders(updatedOrders);
      console.log(`Order #${orderId} rejected`);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showProductForm) {
        closeForm();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showProductForm]);

  return (
    <>
      <B_Navbar />
      <main className="my-shop-section">
        <div className="container" style={{ width: '100%', maxWidth: '100%' }}>
          <div className="section-header">
            <h2>My Shop Dashboard</h2>
            <p>Manage your products and orders from one convenient place</p>
          </div>

          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
              aria-pressed={activeTab === 'orders'}
              aria-label="Orders tab">
              <i className="fas fa-shopping-cart"></i> Orders
            </button>
            <button 
              className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
              aria-pressed={activeTab === 'products'}
              aria-label="Products tab">
              <i className="fas fa-box"></i> Products
            </button>
          </div>

          <div className="dashboard-container">
            {activeTab === 'orders' && (
              <div className="section-card">
                <h3><i className="fas fa-shopping-cart"></i> Incoming Orders</h3>
                <div className="orders-grid">
                  {orders.length > 0 ? orders.map(order => (
                    <div className="order-card" key={order.id}>
                      <div className="order-header">
                        <div className="order-id">Order #{order.id}</div>
                        <div className={`order-status status-${order.status}`}>{order.status}</div>
                      </div>
                      <div className="order-items">
                        {order.items.map((item, idx) => (
                          <div className="order-item" key={idx}>
                            <div className="item-details">
                              <div className="item-qty">{item.qty}</div>
                              <div className="item-name">{item.name}</div>
                            </div>
                            <div className="item-price">₹{item.price}</div>
                          </div>
                        ))}
                      </div>
                      <div className="order-summary">
                        <div>
                          <div>Order Total:</div>
                          <div className="order-total">₹{order.total}</div>
                        </div>
                        <div className="order-meta">
                          <div><i className="fas fa-user"></i> {order.customer}</div>
                          <div><i className="fas fa-calendar-alt"></i> {order.date}</div>
                        </div>
                      </div>
                      <div className="order-actions">
                        {order.status === 'pending' && (
                          <>
                            <button 
                              className="order-btn btn-accept"
                              onClick={() => handleAcceptOrder(order.id)}
                              aria-label={`Accept Order #${order.id}`}
                            >
                              Accept
                            </button>
                            <button 
                              className="order-btn btn-reject"
                              onClick={() => handleRejectOrder(order.id)}
                              aria-label={`Reject Order #${order.id}`}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {order.status === 'accepted' && (
                          <div className="order-status-message success">Order Accepted</div>
                        )}
                        {order.status === 'rejected' && (
                          <div className="order-status-message rejected">Order Rejected</div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="empty-state">
                      <i className="fas fa-inbox fa-3x"></i>
                      <p>No orders available at this time</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="section-card">
                <div className="products-header">
                  <h3><i className="fas fa-box"></i> My Products</h3>
                  <button 
                    className="new-product" 
                    onClick={() => setShowProductForm(true)}
                    aria-label="Add new product"
                  >
                    <i className="fas fa-plus"></i> Add New Product
                  </button>
                </div>
                <div className="products-grid">
                  {products.length > 0 ? products.map((product, idx) => (
                    <div className="product-card" key={idx} tabIndex="0">
                      <div className="product-image">
                        <img src={product.image} alt={product.name} />
                        <div className="product-actions">
                          <button 
                            className="action-btn edit"
                            onClick={() => handleEditProduct(idx)}
                            aria-label={`Edit ${product.name}`}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => handleDeleteProduct(idx)}
                            aria-label={`Delete ${product.name}`}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                      <div className="product-info">
                        <h3 className="product-name">{product.name}</h3>
                        <div className="product-meta">
                          <span className="product-category">
                            <i className="fas fa-tag"></i> {product.category}
                          </span>
                          <span className="product-price">₹{product.price}</span>
                        </div>
                        <div className="inventory">{product.stock} units</div>
                      </div>
                    </div>
                  )) : (
                    <div className="empty-state">
                      <i className="fas fa-box-open fa-3x"></i>
                      <p>No products available. Add your first product!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={`form-overlay ${showProductForm ? 'active' : ''}`} 
             onClick={(e) => e.target.classList.contains('form-overlay') && closeForm()}>
          <div className="product-form" role="dialog" aria-labelledby="form-title">
            <button 
              className="form-close" 
              onClick={closeForm}
              aria-label="Close form"
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="form-header">
              <h3 id="form-title">{editingProductId !== null ? 'Edit Product' : 'Add New Product'}</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-column">
                  <div className="form-group">
                    <label htmlFor="product-name">Product Name</label>
                    <input 
                      type="text" 
                      id="product-name"
                      className={`form-control ${formErrors.name ? 'error-input' : ''}`}
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter product name"
                      aria-describedby={formErrors.name ? "name-error" : undefined}
                      disabled={isSubmitting}
                    />
                    {formErrors.name && <div className="error-message" id="name-error">{formErrors.name}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="product-category">Category</label>
                    <select 
                      id="product-category"
                      className={`form-control ${formErrors.category ? 'error-input' : ''}`}
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      aria-describedby={formErrors.category ? "category-error" : undefined}
                      disabled={isSubmitting}
                    >
                      <option value="">Select a category</option>
                      <option value="Fresh Produce">Fresh Produce</option>
                      <option value="Dairy & Eggs">Dairy & Eggs</option>
                      <option value="Pantry Items">Pantry Items</option>
                      <option value="Wholesale">Wholesale</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Stationery">Stationery</option>
                      <option value="Clothing">Clothing</option>
                    </select>
                    {formErrors.category && <div className="error-message" id="category-error">{formErrors.category}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="product-price">Price (₹)</label>
                    <input 
                      type="number" 
                      id="product-price"
                      className={`form-control ${formErrors.price ? 'error-input' : ''}`}
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="Enter price"
                      min="0"
                      step="0.01"
                      aria-describedby={formErrors.price ? "price-error" : undefined}
                      disabled={isSubmitting}
                    />
                    {formErrors.price && <div className="error-message" id="price-error">{formErrors.price}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="product-stock">Stock Quantity</label>
                    <input 
                      type="number" 
                      id="product-stock"
                      className={`form-control ${formErrors.stock ? 'error-input' : ''}`}
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="Enter available stock"
                      min="0"
                      step="1"
                      aria-describedby={formErrors.stock ? "stock-error" : undefined}
                      disabled={isSubmitting}
                    />
                    {formErrors.stock && <div className="error-message" id="stock-error">{formErrors.stock}</div>}
                  </div>
                </div>
                
                <div className="form-column">
                  <div className="form-group image-upload-container">
                    <label htmlFor="product-image">Product Image</label>
                    <div 
                      className={`image-upload-area ${formErrors.image ? 'error-input' : ''}`}
                      onClick={isSubmitting ? undefined : triggerFileInput}
                      onKeyDown={isSubmitting ? undefined : handleKeyDown}
                      tabIndex="0"
                      role="button"
                      aria-describedby={formErrors.image ? "image-error" : undefined}
                      aria-label="Click to upload image"
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="Product preview" className="image-preview" />
                      ) : (
                        <div className="upload-placeholder">
                          <i className="fas fa-cloud-upload-alt"></i>
                          <p>Click to upload image</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        id="product-image"
                        ref={fileInputRef}
                        accept="image/*" 
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        disabled={isSubmitting}
                      />
                    </div>
                    {formErrors.image && <div className="error-message" id="image-error">{formErrors.image}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="product-description">Description</label>
                    <textarea 
                      id="product-description"
                      className={`form-control ${formErrors.description ? 'error-input' : ''}`}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter product description"
                      rows="4"
                      aria-describedby={formErrors.description ? "description-error" : undefined}
                      disabled={isSubmitting}
                    ></textarea>
                    {formErrors.description && <div className="error-message" id="description-error">{formErrors.description}</div>}
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={closeForm}
                  disabled={isSubmitting}
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting}
                  aria-label={isSubmitting ? 'Submitting...' : (editingProductId !== null ? 'Update Product' : 'Add Product')}
                >
                  <span className="spinner"></span>
                  {editingProductId !== null ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
};

export default MyShop;
