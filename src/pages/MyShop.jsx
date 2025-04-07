
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../Styles/main.css';

const MyShop = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [showProductForm, setShowProductForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

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
    // Handle form submission logic here
    setShowProductForm(false);
  };

  return (
    <>
      <Navbar />
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
              {/* Orders Tab */}
              <div className={`tab-content ${activeTab === 'orders' ? 'active' : ''}`}>
                <div className="section-card">
                  <h3><i className="fas fa-shopping-cart"></i> Incoming Orders</h3>
                  <div className="orders-grid">
                    {/* Order cards */}
                    <div className="order-card">
                      <div className="order-header">
                        <div className="order-id">Order #2305</div>
                        <div className="order-status status-pending">Pending</div>
                      </div>
                      {/* Rest of the order card content */}
                    </div>
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
                    {/* Product cards */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

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
            <form onSubmit={handleFormSubmit}>
              {/* Form fields */}
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default MyShop;
