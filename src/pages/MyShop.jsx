
import React, { useState, useEffect } from 'react';
import B_Navbar from '../components/B_Navbar';
import '../styles/MyShop.css';

const MyShop = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [showProductForm, setShowProductForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    image: null
  });

  const orders = [
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
  ];

  const products = [
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
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add product logic here
    setShowProductForm(false);
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
            <div className={`tab-content ${activeTab === 'orders' ? 'active' : ''}`}>
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
                        <button className="order-btn btn-accept">Accept</button>
                        <button className="order-btn btn-reject">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Tab */}
            <div className={`tab-content ${activeTab === 'products' ? 'active' : ''}`}>
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
                          <button className="action-btn edit"><i className="fas fa-edit"></i></button>
                          <button className="action-btn delete"><i className="fas fa-trash"></i></button>
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
            </div>
          </div>
        </div>

        {/* Product Form Modal */}
        {showProductForm && (
          <div className="form-overlay active">
            <div className="product-form">
              <button className="form-close" onClick={() => setShowProductForm(false)}>
                <i className="fas fa-times"></i>
              </button>
              <div className="form-header">
                <h3>Add New Product</h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Product Name</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Fresh Produce">Fresh Produce</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Pantry Items">Pantry Items</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <button type="submit" className="submit-btn">Add Product</button>
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
