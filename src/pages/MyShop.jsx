
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../Styles/MyShop.css';

const MyShop = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [showProductForm, setShowProductForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Product 1",
      price: "₹299",
      description: "Product description here",
      image: "../assests/headphones.jpeg"
    },
    {
      id: 2,
      name: "Product 2",
      price: "₹199",
      description: "Product description here",
      image: "../assests/jumper wires.jpeg"
    }
  ]);
  
  const [orders] = useState([
    {
      id: '2305',
      status: 'Pending',
      customer: 'John Doe',
      items: ['Product 1', 'Product 2'],
      total: '₹499',
      date: '2024-02-20'
    }
  ]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowProductForm(false);
  };

  return (
    <>
      <main>
        <section className="my-shop-section">
          <div className="container">
            <div className="section-header">
              <h2>My Shop Dashboard</h2>
              <p>Manage your products and orders from one convenient place</p>
            </div>

            <div className="tabs">
              <button 
                className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <i className="fas fa-shopping-cart"></i> Orders
              </button>
              <button 
                className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <i className="fas fa-box"></i> Products
              </button>
            </div>

            <div className="dashboard-container">
              {activeTab === 'orders' && (
                <div className="section-card">
                  <h3><i className="fas fa-shopping-cart"></i> Recent Orders</h3>
                  <div className="orders-grid">
                    {orders.map(order => (
                      <div key={order.id} className="order-card">
                        <div className="order-header">
                          <div className="order-id">Order #{order.id}</div>
                          <div className={`order-status status-${order.status.toLowerCase()}`}>
                            {order.status}
                          </div>
                        </div>
                        <div className="order-details">
                          <p><strong>Customer:</strong> {order.customer}</p>
                          <p><strong>Items:</strong> {order.items.join(', ')}</p>
                          <p><strong>Total:</strong> {order.total}</p>
                          <p><strong>Date:</strong> {order.date}</p>
                        </div>
                        <div className="order-actions">
                          <button className="accept-btn">Accept</button>
                          <button className="reject-btn">Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="section-card">
                  <div className="products-header">
                    <h3><i className="fas fa-box"></i> My Products</h3>
                    <button className="new-product" onClick={() => setShowProductForm(true)}>
                      <i className="fas fa-plus"></i> Add New Product
                    </button>
                  </div>
                  <div className="products-grid">
                    {products.map(product => (
                      <div key={product.id} className="product-card">
                        <div className="product-image">
                          <img src={product.image} alt={product.name} />
                          <div className="product-actions">
                            <button className="action-btn"><i className="fas fa-edit"></i></button>
                            <button className="action-btn"><i className="fas fa-trash"></i></button>
                          </div>
                        </div>
                        <div className="product-info">
                          <h4>{product.name}</h4>
                          <p>{product.description}</p>
                          <div className="product-price">{product.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {showProductForm && (
        <div className="form-overlay">
          <div className="product-form">
            <button className="form-close" onClick={() => setShowProductForm(false)}>
              <i className="fas fa-times"></i>
            </button>
            <div className="form-header">
              <h3>Add New Product</h3>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" className="form-control" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows="3" required></textarea>
              </div>
              <div className="form-group">
                <label>Price</label>
                <input type="number" className="form-control" required />
              </div>
              <div className="form-group">
                <label>Product Image</label>
                <input type="file" className="form-control" onChange={handleImageChange} accept="image/*" required />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
              <button type="submit" className="submit-btn">Add Product</button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default MyShop;
