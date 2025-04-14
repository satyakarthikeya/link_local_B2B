import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import B_Navbar from '../components/B_Navbar';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import '../styles/Checkout.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cartItems, clearCart } = useCart();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  
  const [formData, setFormData] = useState({
    shipping_address: currentUser?.address || '',
    city: currentUser?.city || '',
    phone: currentUser?.contact_number || '',
    email: currentUser?.email || '',
    payment_method: 'cod',
    notes: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    if (cartItems.length === 0 && !orderPlaced) {
      // Redirect to cart page if no items
      navigate('/business-home');
    }
  }, [cartItems, navigate, orderPlaced]);
  
  const validateForm = () => {
    const errors = {};
    if (!formData.shipping_address) errors.shipping_address = 'Shipping address is required';
    if (!formData.city) errors.city = 'City is required';
    if (!formData.phone) errors.phone = 'Phone number is required';
    if (!formData.email) errors.email = 'Email is required';
    return errors;
  };
  
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    // Clear error when field is edited
    if (formErrors[id]) {
      setFormErrors(prev => ({ ...prev, [id]: null }));
    }
  };
  
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = 50; // Fixed delivery fee
    return subtotal + deliveryFee;
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      window.scrollTo(0, 0);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Format order data
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.product_id || item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_info: {
          address: formData.shipping_address,
          city: formData.city,
          phone: formData.phone,
          email: formData.email
        },
        payment_method: formData.payment_method,
        notes: formData.notes,
        total_amount: calculateTotal()
      };
      
      console.log('Creating order with data:', orderData);
      
      // In a real-world scenario, you'd call the API to create an order
      // const response = await api.orders.createOrder(orderData);
      // const orderId = response.data.order_id;
      
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      const generatedOrderId = 'ORD-' + Math.floor(Math.random() * 100000);
      
      // Clear cart after successful order - this will clear both local and database cart
      await clearCart();
      
      // Update state to show success message
      setOrderPlaced(true);
      setOrderNumber(generatedOrderId);
      
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to place your order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const goToOrderHistory = () => {
    navigate('/order-history');
  };
  
  if (orderPlaced) {
    return (
      <>
        <B_Navbar />
        <div className="checkout-container">
          <div className="order-success">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h1>Order Placed Successfully!</h1>
            <p>Your order #{orderNumber} has been placed successfully.</p>
            <p>You will receive a confirmation email shortly.</p>
            
            <div className="success-actions">
              <button 
                className="view-order-btn"
                onClick={goToOrderHistory}
              >
                <i className="fas fa-clipboard-list"></i> View Order History
              </button>
              <button 
                className="continue-shopping-btn"
                onClick={() => navigate('/business-home')}
              >
                <i className="fas fa-store"></i> Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <B_Navbar />
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your order by providing the details below</p>
        </div>
        
        {error && (
          <div className="checkout-error">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
          </div>
        )}
        
        <div className="checkout-content">
          <div className="checkout-form-section">
            <form onSubmit={handleSubmit}>
              <div className="checkout-section">
                <h2><i className="fas fa-map-marker-alt"></i> Shipping Information</h2>
                
                <div className="form-group">
                  <label htmlFor="shipping_address">Shipping Address</label>
                  <input 
                    type="text" 
                    id="shipping_address" 
                    value={formData.shipping_address}
                    onChange={handleInputChange}
                    className={formErrors.shipping_address ? 'error' : ''}
                    placeholder="Street address"
                  />
                  {formErrors.shipping_address && <div className="error-message">{formErrors.shipping_address}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input 
                    type="text" 
                    id="city" 
                    value={formData.city}
                    onChange={handleInputChange}
                    className={formErrors.city ? 'error' : ''}
                    placeholder="City"
                  />
                  {formErrors.city && <div className="error-message">{formErrors.city}</div>}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={formErrors.phone ? 'error' : ''}
                      placeholder="Phone number"
                    />
                    {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                      className={formErrors.email ? 'error' : ''}
                      placeholder="Email address"
                    />
                    {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                  </div>
                </div>
              </div>
              
              <div className="checkout-section">
                <h2><i className="fas fa-credit-card"></i> Payment Method</h2>
                
                <div className="payment-options">
                  <div className="payment-option">
                    <input 
                      type="radio" 
                      id="cod" 
                      name="payment_method" 
                      value="cod"
                      checked={formData.payment_method === 'cod'}
                      onChange={() => setFormData({...formData, payment_method: 'cod'})}
                    />
                    <label htmlFor="cod">
                      <i className="fas fa-money-bill-wave"></i>
                      <span>Cash on Delivery</span>
                    </label>
                  </div>
                  
                  <div className="payment-option">
                    <input 
                      type="radio" 
                      id="bank_transfer" 
                      name="payment_method" 
                      value="bank_transfer"
                      checked={formData.payment_method === 'bank_transfer'}
                      onChange={() => setFormData({...formData, payment_method: 'bank_transfer'})}
                    />
                    <label htmlFor="bank_transfer">
                      <i className="fas fa-university"></i>
                      <span>Bank Transfer</span>
                    </label>
                  </div>
                  
                  <div className="payment-option">
                    <input 
                      type="radio" 
                      id="upi" 
                      name="payment_method" 
                      value="upi"
                      checked={formData.payment_method === 'upi'}
                      onChange={() => setFormData({...formData, payment_method: 'upi'})}
                    />
                    <label htmlFor="upi">
                      <i className="fas fa-mobile-alt"></i>
                      <span>UPI</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="checkout-section">
                <h2><i className="fas fa-clipboard"></i> Additional Information</h2>
                
                <div className="form-group">
                  <label htmlFor="notes">Order Notes (Optional)</label>
                  <textarea 
                    id="notes" 
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Special instructions for delivery"
                  ></textarea>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="place-order-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Processing Order...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i> Place Order
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="checkout-summary-section">
            <div className="order-summary">
              <h2>Order Summary</h2>
              
              <div className="summary-items">
                {cartItems.map((item) => (
                  <div className="summary-item" key={item.id}>
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                      <span className="item-quantity">{item.quantity}</span>
                    </div>
                    <div className="item-info">
                      <h3>{item.name}</h3>
                      <p className="item-seller">by {item.seller}</p>
                    </div>
                    <div className="item-price">{formatCurrency(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>
              
              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(50)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;