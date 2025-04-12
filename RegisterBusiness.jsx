import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerBusiness } from '../api';

const RegisterBusiness = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessType: '',
    address: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill all required fields');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      // Format the data properly according to API requirements
      const businessData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        // Include other required fields based on your API
        businessType: formData.businessType || 'default',
        address: formData.address || '',
        phone: formData.phone || ''
      };
      
      console.log("Submitting business data:", businessData);
      await registerBusiness(businessData);
      navigate('/login');
    } catch (error) {
      console.log("Registration error:", error);
      setError(error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div>
      <h1>Register Your Business</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Business Name"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        <input
          type="text"
          name="businessType"
          placeholder="Business Type"
          value={formData.businessType}
          onChange={handleChange}
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterBusiness;