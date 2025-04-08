
import React, { useState } from 'react';
import '../styles/MyShop.css';

const MyShop = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProductForm, setShowProductForm] = useState(false);

  const stats = {
    totalSales: "₹45,250",
    totalOrders: 127,
    pendingOrders: 12,
    activeProducts: 45
  };

  const recentOrders = [
    {
      id: "ORD001",
      customer: "John Doe",
      amount: "₹1,200",
      status: "pending",
      date: "2024-02-20"
    },
    {
      id: "ORD002",
      customer: "Jane Smith",
      amount: "₹2,500",
      status: "completed",
      date: "2024-02-19"
    },
    {
      id: "ORD003",
      customer: "Mike Johnson",
      amount: "₹800",
      status: "processing",
      date: "2024-02-18"
    }
  ];

  const topProducts = [
    {
      id: 1,
      name: "Premium A4 Sheets",
      sales: 45,
      revenue: "₹4,500",
      trend: "up"
    },
    {
      id: 2,
      name: "Cotton Fabric Bundle",
      sales: 38,
      revenue: "₹7,600",
      trend: "up"
    },
    {
      id: 3,
      name: "Electronic Components Kit",
      sales: 32,
      revenue: "₹3,200",
      trend: "down"
    }
  ];

  return (
    <div className="myshop-container">
      <div className="dashboard-header">
        <h1>My Shop Dashboard</h1>
        <div className="header-actions">
          <button className="add-product-btn" onClick={() => setShowProductForm(true)}>
            <i className="fas fa-plus"></i> Add New Product
          </button>
          <button className="generate-report-btn">
            <i className="fas fa-download"></i> Generate Report
          </button>
        </div>
      </div>

      <div className="dashboard-nav">
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <i className="fas fa-chart-line"></i> Dashboard
        </button>
        <button 
          className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <i className="fas fa-box"></i> Products
        </button>
        <button 
          className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <i className="fas fa-shopping-cart"></i> Orders
        </button>
        <button 
          className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <i className="fas fa-chart-bar"></i> Analytics
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="dashboard-content">
          <div className="stats-grid">
            {Object.entries(stats).map(([key, value]) => (
              <div className="stat-card" key={key}>
                <h3>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</h3>
                <div className="stat-value">{value}</div>
                <div className="stat-trend up">
                  <i className="fas fa-arrow-up"></i> 12% from last month
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-grid">
            <div className="recent-orders card">
              <h3>Recent Orders</h3>
              <div className="orders-list">
                {recentOrders.map(order => (
                  <div className="order-item" key={order.id}>
                    <div className="order-info">
                      <span className="order-id">{order.id}</span>
                      <span className="order-customer">{order.customer}</span>
                    </div>
                    <div className="order-details">
                      <span className="order-amount">{order.amount}</span>
                      <span className={`order-status ${order.status}`}>{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="top-products card">
              <h3>Top Products</h3>
              <div className="products-list">
                {topProducts.map(product => (
                  <div className="product-item" key={product.id}>
                    <div className="product-info">
                      <span className="product-name">{product.name}</span>
                      <span className="product-sales">{product.sales} sales</span>
                    </div>
                    <div className="product-revenue">
                      <span className="amount">{product.revenue}</span>
                      <i className={`fas fa-arrow-${product.trend}`}></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showProductForm && (
        <div className="modal-overlay">
          <div className="product-form-modal">
            <h2>Add New Product</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" placeholder="Enter product name" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select>
                  <option>Select category</option>
                  <option>Stationery</option>
                  <option>Electronics</option>
                  <option>Textiles</option>
                  <option>Food & Beverages</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price</label>
                  <input type="number" placeholder="Enter price" />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input type="number" placeholder="Enter stock quantity" />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="4" placeholder="Enter product description"></textarea>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowProductForm(false)}>Cancel</button>
                <button type="submit">Add Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyShop;
