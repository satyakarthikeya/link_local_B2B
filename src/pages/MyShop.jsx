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
      image: "../assests/rice bags.jpeg"
    },
    {
      name: "Dabur Honey",
      category: "Pantry Items",
      price: 250,
      stock: 12,
      image: "../assests/honey.jpeg"
    },
    {
      name: "Farm Fresh Eggs",
      category: "Dairy & Eggs",
      price: 150,
      stock: 40,
      image: "../assests/guddu.jpeg"
    },
    {
      name: "Raw Cotton",
      category: "Wholesale",
      price: 800,
      stock: 8,
      image: "../assests/cotton.jpeg"
    },
    {
      name: "Silk Threads",
      category: "Wholesale",
      price: 1000,
      stock: 15,
      image: "../assests/silk thread.jpeg"
    }
  ]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Handle image upload
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

    // Create image preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setFormData({
        ...formData,
        image: reader.result
      });
      
      // Clear image error if exists
      if (formErrors.image) {
        setFormErrors({
          ...formErrors,
          image: null
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Form validation
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

  // Close form modal
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    if (editingProductId !== null) {
      // Update existing product
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
      // Create new product
      const newProduct = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        image: formData.image || imagePreview,
        description: formData.description
      };
      
      // Add product to list
      setProducts([...products, newProduct]);
      
      // In a real app, you would send this data to a server
      console.log("New product added:", newProduct);
    }
    
    // Reset form and close modal
    closeForm();
  };

  // Handle product editing
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
    
    setEditingProductId(idx);
    setShowProductForm(true);
  };
  
  // Handle product deletion
  const handleDeleteProduct = (idx) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = [...products];
      updatedProducts.splice(idx, 1);
      setProducts(updatedProducts);
      console.log("Product deleted successfully");
    }
  };
  
  // Handle order acceptance
  const handleAcceptOrder = (orderId) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: 'accepted' } : order
    );
    setOrders(updatedOrders);
    console.log(`Order #${orderId} accepted`);
  };
  
  // Handle order rejection
  const handleRejectOrder = (orderId) => {
    if (window.confirm('Are you sure you want to reject this order?')) {
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: 'rejected' } : order
      );
      setOrders(updatedOrders);
      console.log(`Order #${orderId} rejected`);
    }
  };

  return (
    <>
      <B_Navbar />
      <main className="my-shop-section">
        <div className="container">
          <div className="section-header">
            <h2>My Shop Dashboard</h2>
            <p>Manage your products and orders from one convenient place</p>
          </div>

          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}>
              <i className="fas fa-shopping-cart"></i> Orders
            </button>
            <button 
              className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}>
              <i className="fas fa-box"></i> Products
            </button>
          </div>

          <div className="dashboard-container">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="section-card">
                <h3><i className="fas fa-shopping-cart"></i> Incoming Orders</h3>
                <div className="orders-grid">
                  {orders.map(order => (
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
                            <div className="item-price">{item.price}Rs</div>
                          </div>
                        ))}
                      </div>
                      <div className="order-summary">
                        <div>
                          <div>Order Total:</div>
                          <div className="order-total">{order.total}Rs</div>
                        </div>
                        <div className="order-meta">
                          <div>Customer: {order.customer}</div>
                          <div>{order.date}</div>
                        </div>
                      </div>
                      <div className="order-actions">
                        {order.status === 'pending' && (
                          <>
                            <button 
                              className="order-btn btn-accept"
                              onClick={() => handleAcceptOrder(order.id)}
                            >
                              Accept
                            </button>
                            <button 
                              className="order-btn btn-reject"
                              onClick={() => handleRejectOrder(order.id)}
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
                  ))}
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="section-card">
                <div className="products-header">
                  <h3><i className="fas fa-box"></i> My Products</h3>
                  <button className="new-product" onClick={() => setShowProductForm(true)}>
                    <i className="fas fa-plus"></i> Add New Product
                  </button>
                </div>
                <div className="products-grid">
                  {products.map((product, idx) => (
                    <div className="product-card" key={idx}>
                      <div className="product-image">
                        <img src={product.image} alt={product.name} />
                        <div className="product-actions">
                          <button 
                            className="action-btn edit"
                            onClick={() => handleEditProduct(idx)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => handleDeleteProduct(idx)}
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
                        <div className="inventory">In stock: {product.stock} units</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Form Modal */}
        {showProductForm && (
          <div className="form-overlay active">
            <div className="product-form">
              <button className="form-close" onClick={closeForm}>
                <i className="fas fa-times"></i>
              </button>
              <div className="form-header">
                <h3>{editingProductId !== null ? 'Edit Product' : 'Add New Product'}</h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-column">
                    <div className="form-group">
                      <label>Product Name</label>
                      <input 
                        type="text" 
                        className={`form-control ${formErrors.name ? 'error-input' : ''}`}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter product name"
                      />
                      {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label>Category</label>
                      <select 
                        className={`form-control ${formErrors.category ? 'error-input' : ''}`}
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
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
                      {formErrors.category && <div className="error-message">{formErrors.category}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label>Price (₹)</label>
                      <input 
                        type="number" 
                        className={`form-control ${formErrors.price ? 'error-input' : ''}`}
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="Enter price"
                        min="0"
                        step="0.01"
                      />
                      {formErrors.price && <div className="error-message">{formErrors.price}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label>Stock Quantity</label>
                      <input 
                        type="number" 
                        className={`form-control ${formErrors.stock ? 'error-input' : ''}`}
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        placeholder="Enter available stock"
                        min="0"
                        step="1"
                      />
                      {formErrors.stock && <div className="error-message">{formErrors.stock}</div>}
                    </div>
                  </div>
                  
                  <div className="form-column">
                    <div className="form-group image-upload-container">
                      <label>Product Image</label>
                      <div 
                        className={`image-upload-area ${formErrors.image ? 'error-input' : ''}`}
                        onClick={triggerFileInput}
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
                          ref={fileInputRef}
                          accept="image/*" 
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                        />
                      </div>
                      {formErrors.image && <div className="error-message">{formErrors.image}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label>Description</label>
                      <textarea 
                        className={`form-control ${formErrors.description ? 'error-input' : ''}`}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter product description"
                        rows="4"
                      ></textarea>
                      {formErrors.description && <div className="error-message">{formErrors.description}</div>}
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={closeForm}>Cancel</button>
                  <button type="submit" className="submit-btn">
                    {editingProductId !== null ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default MyShop;
