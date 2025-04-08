import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import B_Navbar from '../components/B_Navbar';
import "../styles/business_home.css";
import "../styles/profile.css"; // We'll create this next

const B_ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    businessName: "Chennai Silks",
    ownerName: "Ravi Kumar",
    email: "info@chennaisilks.com",
    phone: "+91 98765 43210",
    gstNumber: "33AABCT3518Q1ZW",
    businessType: "Textile Wholesale",
    establishedYear: "1998",
    website: "www.chennaisilks.com",
    address: {
      street: "42 Town Hall Road",
      area: "Gandhipuram",
      city: "Coimbatore",
      state: "Tamil Nadu",
      pincode: "641001"
    },
    businessHours: {
      monday: { open: "09:00", close: "18:00" },
      tuesday: { open: "09:00", close: "18:00" },
      wednesday: { open: "09:00", close: "18:00" },
      thursday: { open: "09:00", close: "18:00" },
      friday: { open: "09:00", close: "18:00" },
      saturday: { open: "10:00", close: "16:00" },
      sunday: { open: "", close: "" }
    },
    businessDescription: "Chennai Silks is a premier wholesale textile supplier specializing in silk fabrics, cotton materials, and other textile products for retail businesses, designers and manufacturers.",
    profilePicture: "../assests/chennai silks.png",
    coverPhoto: "../assests/brookfields.jpg",
  });

  // Bank account information
  const [bankData, setBankData] = useState({
    accountHolderName: "Chennai Silks Pvt Ltd",
    accountNumber: "••••••••3456",
    ifscCode: "SBIN0001234",
    bankName: "State Bank of India",
    branchName: "Gandhipuram Branch"
  });

  // Form validation state
  const [errors, setErrors] = useState({});

  // Documents state
  const [documents, setDocuments] = useState([
    { id: 1, name: "GST Certificate", type: "gst", status: "verified", uploadDate: "12/10/2023" },
    { id: 2, name: "Business Registration", type: "registration", status: "verified", uploadDate: "12/10/2023" },
    { id: 3, name: "Shop License", type: "license", status: "verified", uploadDate: "12/10/2023" }
  ]);

  // Payment history mock data
  const [paymentHistory, setPaymentHistory] = useState([
    { id: "PMT001", date: "15/03/2025", amount: "₹5,200", status: "Completed", method: "Bank Transfer", orderId: "OD12345" },
    { id: "PMT002", date: "02/03/2025", amount: "₹3,750", status: "Completed", method: "UPI", orderId: "OD12332" },
    { id: "PMT003", date: "18/02/2025", amount: "₹8,900", status: "Completed", method: "Credit Card", orderId: "OD12318" },
    { id: "PMT004", date: "05/02/2025", amount: "₹2,100", status: "Completed", method: "Bank Transfer", orderId: "OD12296" }
  ]);

  // Subscription data
  const [subscription, setSubscription] = useState({
    plan: "Business Pro",
    status: "Active",
    nextBillingDate: "15/05/2025",
    amount: "₹999/month",
    features: [
      "Unlimited product listings",
      "Priority customer support",
      "Analytics dashboard",
      "0% transaction fee",
      "Multiple user accounts"
    ]
  });

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData({
        ...profileData,
        [parent]: {
          ...profileData[parent],
          [child]: value
        }
      });
    } else {
      setProfileData({ ...profileData, [name]: value });
    }
  };

  // Handle business hours changes
  const handleHoursChange = (day, type, value) => {
    setProfileData({
      ...profileData,
      businessHours: {
        ...profileData.businessHours,
        [day]: {
          ...profileData.businessHours[day],
          [type]: value
        }
      }
    });
  };

  // Handle bank information changes
  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankData({
      ...bankData,
      [name]: value
    });
  };

  // Handle file upload
  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // File size validation (5MB limit)
    const maxSizeInMB = 5;
    const fileSizeInMB = file.size / (1024 * 1024);
    
    if (fileSizeInMB > maxSizeInMB) {
      alert(`File size exceeds ${maxSizeInMB}MB limit. Please choose a smaller file.`);
      return;
    }

    // In a real app, you would upload the file to your server here
    // For demo, we'll just add it to the documents list
    const newDocument = {
      id: documents.length + 1,
      name: file.name,
      type: type,
      status: "pending",
      uploadDate: new Date().toLocaleDateString()
    };

    setDocuments([...documents, newDocument]);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!profileData.businessName) newErrors.businessName = "Business name is required";
    
    if (!profileData.email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(profileData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!profileData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^(\+\d{1,3})?[\s.-]?\d{10}$/.test(profileData.phone)) {
      newErrors.phone = "Phone number is invalid";
    }
    
    if (!profileData.gstNumber) {
      newErrors.gstNumber = "GST number is required";
    } else if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(profileData.gstNumber)) {
      newErrors.gstNumber = "GST number is invalid (format: 22AAAAA0000A1Z5)";
    }
    
    if (!profileData.address.city) newErrors.city = "City is required";
    if (!profileData.address.pincode) {
      newErrors.pincode = "PIN code is required";
    } else if (!/^\d{6}$/.test(profileData.address.pincode)) {
      newErrors.pincode = "PIN code should be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // In a real app, you would save the profile data to your backend
    console.log("Saving profile data:", profileData);
    console.log("Saving bank data:", bankData);
    
    // Show success message
    setSaveSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
    }, 3000);
  };

  // Handle tab click
  const handleTabClick = (tab) => {
    // If switching tabs while editing, ask for confirmation
    if (isEditing) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave this tab?")) {
        setIsEditing(false);
      } else {
        return;
      }
    }
    
    setActiveTab(tab);
  };

  // Upgrade plan
  const handleUpgradePlan = () => {
    navigate('/business-subscription');
    // For demo purposes
    alert("Navigating to subscription plans page...");
  };

  // Go back function
  const handleGoBack = () => {
    // If we came from My Shop, go back there, otherwise go to business home
    navigate('/business-home/my-shop');
  };

  return (
    <div className="business-app">
      <B_Navbar />

      <main className="profile-page">
        <div className="container">
          {/* Profile Header */}
          <div className="profile-header">
            <button className="back-btn" onClick={handleGoBack}>
              <i className="fas fa-arrow-left"></i> Back to My Shop
            </button>
            <h1>Business Profile</h1>
          </div>

          {/* Profile Content */}
          <div className="profile-container">
            {/* Profile Sidebar */}
            <div className="profile-sidebar">
              <div className="profile-overview">
                <div className="profile-image-container">
                  <img 
                    src={profileData.profilePicture} 
                    alt={profileData.businessName} 
                    className="profile-image"
                    
                  />
                  {isEditing && (
                    <label className="image-upload-btn">
                      <i className="fas fa-camera"></i>
                      <input type="file" accept="image/*" hidden />
                    </label>
                  )}
                </div>
                <h3>{profileData.businessName}</h3>
                <p className="business-type">{profileData.businessType}</p>
                <p className="business-location">
                  <i className="fas fa-map-marker-alt"></i> {profileData.address.city}, {profileData.address.state}
                </p>
              </div>

              <div className="profile-menu">
                <button 
                  className={`menu-item ${activeTab === 'personal' ? 'active' : ''}`}
                  onClick={() => handleTabClick('personal')}
                >
                  <i className="fas fa-user"></i> Business Information
                </button>
                <button 
                  className={`menu-item ${activeTab === 'banking' ? 'active' : ''}`}
                  onClick={() => handleTabClick('banking')}
                >
                  <i className="fas fa-university"></i> Banking Details
                </button>
                <button 
                  className={`menu-item ${activeTab === 'documents' ? 'active' : ''}`}
                  onClick={() => handleTabClick('documents')}
                >
                  <i className="fas fa-file-alt"></i> Documents
                </button>
                <button 
                  className={`menu-item ${activeTab === 'payments' ? 'active' : ''}`}
                  onClick={() => handleTabClick('payments')}
                >
                  <i className="fas fa-credit-card"></i> Payment History
                </button>
                <button 
                  className={`menu-item ${activeTab === 'subscription' ? 'active' : ''}`}
                  onClick={() => handleTabClick('subscription')}
                >
                  <i className="fas fa-crown"></i> Subscription Plan
                </button>
              </div>

              <div className="sidebar-help">
                <h4>Need Help?</h4>
                <p>Contact our business support team for assistance with your account</p>
                <button className="help-btn" onClick={() => navigate('/business-support')}>
                  <i className="fas fa-headset"></i> Get Support
                </button>
              </div>
            </div>

            {/* Profile Content */}
            <div className="profile-content">
              {/* Success message */}
              {saveSuccess && (
                <div className="success-message">
                  <i className="fas fa-check-circle"></i> Profile updated successfully!
                </div>
              )}

              {/* Business Information Tab */}
              {activeTab === 'personal' && (
                <div className="profile-section">
                  <div className="section-header">
                    <h2>Business Information</h2>
                    {!isEditing ? (
                      <button className="edit-btn" onClick={() => setIsEditing(true)}>
                        <i className="fas fa-edit"></i> Edit Information
                      </button>
                    ) : (
                      <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                        <i className="fas fa-times"></i> Cancel
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSubmit}>
                    {/* Cover Photo */}
                    <div className="cover-photo-container">
                      <img 
                        src={profileData.coverPhoto} 
                        alt="Cover" 
                        className="cover-photo"
                      />
                      {isEditing && (
                        <label className="cover-upload-btn">
                          <i className="fas fa-camera"></i> Change Cover
                          <input type="file" accept="image/*" hidden />
                        </label>
                      )}
                    </div>

                    {/* Basic Details */}
                    <div className="form-section">
                      <h3>Basic Details</h3>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="businessName">Business Name</label>
                          <input 
                            type="text" 
                            id="businessName" 
                            name="businessName" 
                            value={profileData.businessName} 
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={errors.businessName ? 'error' : ''}
                          />
                          {errors.businessName && <span className="error-message">{errors.businessName}</span>}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="ownerName">Owner Name</label>
                          <input 
                            type="text" 
                            id="ownerName" 
                            name="ownerName" 
                            value={profileData.ownerName} 
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="email">Email Address</label>
                          <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={profileData.email} 
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={errors.email ? 'error' : ''}
                          />
                          {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="phone">Phone Number</label>
                          <input 
                            type="text" 
                            id="phone" 
                            name="phone" 
                            value={profileData.phone} 
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={errors.phone ? 'error' : ''}
                          />
                          {errors.phone && <span className="error-message">{errors.phone}</span>}
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="gstNumber">GST Number</label>
                          <input 
                            type="text" 
                            id="gstNumber" 
                            name="gstNumber" 
                            value={profileData.gstNumber} 
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={errors.gstNumber ? 'error' : ''}
                          />
                          {errors.gstNumber && <span className="error-message">{errors.gstNumber}</span>}
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="businessType">Business Type</label>
                          <input 
                            type="text" 
                            id="businessType" 
                            name="businessType" 
                            value={profileData.businessType} 
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="establishedYear">Year Established</label>
                          <input 
                            type="text" 
                            id="establishedYear" 
                            name="establishedYear" 
                            value={profileData.establishedYear} 
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="website">Website (Optional)</label>
                          <input 
                            type="text" 
                            id="website" 
                            name="website" 
                            value={profileData.website} 
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="form-section">
                      <h3>Business Address</h3>
                      
                      <div className="form-row">
                        <div className="form-group full-width">
                          <label htmlFor="street">Street Address</label>
                          <input 
                            type="text" 
                            id="street" 
                            name="address.street" 
                            value={profileData.address.street} 
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="area">Area/Locality</label>
                          <input 
                            type="text" 
                            id="area" 
                            name="address.area" 
                            value={profileData.address.area} 
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="city">City</label>
                          <input 
                            type="text" 
                            id="city" 
                            name="address.city" 
                            value={profileData.address.city} 
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={errors.city ? 'error' : ''}
                          />
                          {errors.city && <span className="error-message">{errors.city}</span>}
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="state">State</label>
                          <input 
                            type="text" 
                            id="state" 
                            name="address.state" 
                            value={profileData.address.state} 
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="pincode">PIN Code</label>
                          <input 
                            type="text" 
                            id="pincode" 
                            name="address.pincode" 
                            value={profileData.address.pincode} 
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={errors.pincode ? 'error' : ''}
                          />
                          {errors.pincode && <span className="error-message">{errors.pincode}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Business Hours */}
                    <div className="form-section">
                      <h3>Business Hours</h3>
                      
                      <div className="business-hours">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                          <div className="hours-row" key={day}>
                            <div className="day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</div>
                            <div className="hours-inputs">
                              <input
                                type="time"
                                value={profileData.businessHours[day].open}
                                onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                                disabled={!isEditing}
                              />
                              <span>to</span>
                              <input
                                type="time"
                                value={profileData.businessHours[day].close}
                                onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                                disabled={!isEditing}
                              />
                            </div>
                            {isEditing && (
                              <div className="closed-toggle">
                                <label>
                                  <input 
                                    type="checkbox"
                                    checked={!profileData.businessHours[day].open && !profileData.businessHours[day].close}
                                    onChange={() => {
                                      if (profileData.businessHours[day].open || profileData.businessHours[day].close) {
                                        handleHoursChange(day, 'open', '');
                                        handleHoursChange(day, 'close', '');
                                      } else {
                                        handleHoursChange(day, 'open', '09:00');
                                        handleHoursChange(day, 'close', '18:00');
                                      }
                                    }}
                                  />
                                  Closed
                                </label>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Business Description */}
                    <div className="form-section">
                      <h3>Business Description</h3>
                      <div className="form-group full-width">
                        <textarea
                          name="businessDescription"
                          value={profileData.businessDescription}
                          onChange={handleInputChange}
                          rows="4"
                          disabled={!isEditing}
                          placeholder="Describe your business, products, and services..."
                        ></textarea>
                      </div>
                    </div>

                    {/* Submit Button */}
                    {isEditing && (
                      <div className="form-actions">
                        <button type="button" className="cancel-action" onClick={() => setIsEditing(false)}>
                          Cancel
                        </button>
                        <button type="submit" className="save-action">
                          <i className="fas fa-save"></i> Save Changes
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Banking Details Tab */}
              {activeTab === 'banking' && (
                <div className="profile-section">
                  <div className="section-header">
                    <h2>Banking Information</h2>
                    {!isEditing ? (
                      <button className="edit-btn" onClick={() => setIsEditing(true)}>
                        <i className="fas fa-edit"></i> Edit Banking Details
                      </button>
                    ) : (
                      <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                        <i className="fas fa-times"></i> Cancel
                      </button>
                    )}
                  </div>

                  <div className="banking-info-note">
                    <i className="fas fa-shield-alt"></i>
                    <p>Your banking information is securely stored and encrypted. This information is used for processing payments and refunds.</p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="form-section">
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="accountHolderName">Account Holder Name</label>
                          <input
                            type="text"
                            id="accountHolderName"
                            name="accountHolderName"
                            value={bankData.accountHolderName}
                            onChange={handleBankChange}
                            disabled={!isEditing}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="accountNumber">Account Number</label>
                          <input
                            type="text"
                            id="accountNumber"
                            name="accountNumber"
                            value={isEditing ? bankData.accountNumber.replace(/•/g, '') : bankData.accountNumber}
                            onChange={(e) => {
                              // Only allow numbers in account number
                              const value = e.target.value.replace(/[^\d]/g, '');
                              setBankData({
                                ...bankData,
                                accountNumber: value
                              });
                            }}
                            disabled={!isEditing}
                            maxLength={18}
                          />
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="ifscCode">IFSC Code</label>
                          <input
                            type="text"
                            id="ifscCode"
                            name="ifscCode"
                            value={bankData.ifscCode}
                            onChange={handleBankChange}
                            disabled={!isEditing}
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="bankName">Bank Name</label>
                          <input
                            type="text"
                            id="bankName"
                            name="bankName"
                            value={bankData.bankName}
                            onChange={handleBankChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="branchName">Branch Name</label>
                          <input
                            type="text"
                            id="branchName"
                            name="branchName"
                            value={bankData.branchName}
                            onChange={handleBankChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    {isEditing && (
                      <div className="form-actions">
                        <button type="button" className="cancel-action" onClick={() => setIsEditing(false)}>
                          Cancel
                        </button>
                        <button type="submit" className="save-action">
                          <i className="fas fa-save"></i> Save Changes
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="profile-section">
                  <div className="section-header">
                    <h2>Business Documents</h2>
                    <button className="edit-btn" onClick={() => window.scrollTo(0, document.body.scrollHeight)}>
                      <i className="fas fa-upload"></i> Upload New Document
                    </button>
                  </div>

                  <div className="info-message">
                    <i className="fas fa-info-circle"></i>
                    <p>Please ensure all documents are clear and up-to-date. Verification may take 1-2 business days.</p>
                  </div>

                  <div className="documents-list">
                    {documents.length > 0 ? (
                      <div className="document-table">
                        <div className="document-table-header">
                          <div className="document-name">Document Name</div>
                          <div className="document-date">Upload Date</div>
                          <div className="document-status">Status</div>
                          <div className="document-action">Action</div>
                        </div>
                        
                        {documents.map(doc => (
                          <div className="document-row" key={doc.id}>
                            <div className="document-name">
                              <i className="fas fa-file-pdf"></i> {doc.name}
                            </div>
                            <div className="document-date">{doc.uploadDate}</div>
                            <div className={`document-status status-${doc.status}`}>
                              {doc.status === 'verified' && <i className="fas fa-check-circle"></i>}
                              {doc.status === 'pending' && <i className="fas fa-clock"></i>}
                              {doc.status === 'rejected' && <i className="fas fa-times-circle"></i>}
                              {doc.status === 'verified' ? 'Verified' : 
                               doc.status === 'pending' ? 'Pending Verification' : 'Rejected'}
                            </div>
                            <div className="document-action">
                              <button className="view-doc-btn">View</button>
                              {doc.status !== 'verified' && (
                                <button className="delete-doc-btn">
                                  <i className="fas fa-trash"></i>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-documents">
                        <i className="fas fa-file-alt"></i>
                        <p>No documents uploaded yet</p>
                      </div>
                    )}
                  </div>

                  <div className="upload-documents-section">
                    <h3>Upload New Document</h3>
                    
                    <div className="upload-options">
                      <div className="upload-option">
                        <h4>GST Certificate</h4>
                        <p>Upload your GST registration certificate</p>
                        <label className="upload-btn">
                          <i className="fas fa-upload"></i> Upload File
                          <input 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png" 
                            hidden 
                            onChange={(e) => handleFileUpload(e, 'gst')} 
                          />
                        </label>
                      </div>
                      
                      <div className="upload-option">
                        <h4>Business Registration</h4>
                        <p>Upload your business registration document</p>
                        <label className="upload-btn">
                          <i className="fas fa-upload"></i> Upload File
                          <input 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png" 
                            hidden 
                            onChange={(e) => handleFileUpload(e, 'registration')} 
                          />
                        </label>
                      </div>
                      
                      <div className="upload-option">
                        <h4>PAN Card</h4>
                        <p>Upload your PAN card</p>
                        <label className="upload-btn">
                          <i className="fas fa-upload"></i> Upload File
                          <input 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png" 
                            hidden 
                            onChange={(e) => handleFileUpload(e, 'pan')} 
                          />
                        </label>
                      </div>
                      
                      <div className="upload-option">
                        <h4>Shop License</h4>
                        <p>Upload your shop & establishment license</p>
                        <label className="upload-btn">
                          <i className="fas fa-upload"></i> Upload File
                          <input 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png" 
                            hidden 
                            onChange={(e) => handleFileUpload(e, 'license')} 
                          />
                        </label>
                      </div>
                    </div>

                    <div className="upload-note">
                      <p>Accepted file formats: PDF, JPG, JPEG, PNG (Max size: 5MB)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payments History Tab */}
              {activeTab === 'payments' && (
                <div className="profile-section">
                  <div className="section-header">
                    <h2>Payment History</h2>
                    <button className="edit-btn" onClick={() => alert("Downloading payment reports...")}>
                      <i className="fas fa-download"></i> Download Report
                    </button>
                  </div>

                  <div className="payments-filters">
                    <div className="filter-group">
                      <label htmlFor="payment-period">Period</label>
                      <select id="payment-period" defaultValue="3months">
                        <option value="1month">Last Month</option>
                        <option value="3months">Last 3 Months</option>
                        <option value="6months">Last 6 Months</option>
                        <option value="1year">Last Year</option>
                      </select>
                    </div>
                    
                    <div className="filter-group">
                      <label htmlFor="payment-status">Status</label>
                      <select id="payment-status" defaultValue="all">
                        <option value="all">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                    
                    <div className="filter-group">
                      <label htmlFor="payment-search">Search</label>
                      <input type="text" id="payment-search" placeholder="Search transactions..." />
                    </div>
                  </div>

                  <div className="transactions-list">
                    <div className="transaction-table">
                      <div className="transaction-header">
                        <div className="transaction-id">Transaction ID</div>
                        <div className="transaction-date">Date</div>
                        <div className="transaction-amount">Amount</div>
                        <div className="transaction-method">Method</div>
                        <div className="transaction-status">Status</div>
                        <div className="transaction-action">Action</div>
                      </div>
                      
                      {paymentHistory.map(payment => (
                        <div className="transaction-row" key={payment.id}>
                          <div className="transaction-id">{payment.id}</div>
                          <div className="transaction-date">{payment.date}</div>
                          <div className="transaction-amount">{payment.amount}</div>
                          <div className="transaction-method">{payment.method}</div>
                          <div className={`transaction-status status-${payment.status.toLowerCase()}`}>
                            {payment.status}
                          </div>
                          <div className="transaction-action">
                            <button 
                              className="view-transaction-btn"
                              onClick={() => alert(`Viewing details for transaction ${payment.id}`)}
                            >
                              View Invoice
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="payment-summary">
                    <div className="summary-card">
                      <div className="summary-title">Total Payments</div>
                      <div className="summary-amount">₹19,950</div>
                      <div className="summary-period">Last 3 months</div>
                    </div>
                    
                    <div className="summary-card">
                      <div className="summary-title">Average Transaction</div>
                      <div className="summary-amount">₹4,987</div>
                      <div className="summary-period">Last 3 months</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription Tab */}
              {activeTab === 'subscription' && (
                <div className="profile-section">
                  <div className="section-header">
                    <h2>Subscription Plan</h2>
                    <button className="edit-btn" onClick={handleUpgradePlan}>
                      <i className="fas fa-arrow-circle-up"></i> Upgrade Plan
                    </button>
                  </div>

                  <div className="current-plan-card">
                    <div className="plan-header">
                      <div className="plan-name">
                        <i className="fas fa-crown"></i>
                        <h3>{subscription.plan}</h3>
                      </div>
                      <div className="plan-status">{subscription.status}</div>
                    </div>
                    
                    <div className="plan-details">
                      <div className="plan-pricing">
                        <span className="price">{subscription.amount}</span>
                      </div>
                      
                      <div className="plan-billing">
                        <div className="billing-info">
                          <span className="label">Next billing date:</span>
                          <span className="value">{subscription.nextBillingDate}</span>
                        </div>
                        <div className="payment-method">
                          <span className="label">Payment method:</span>
                          <span className="value">Credit Card (••••4582)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="plan-features">
                      <h4>Features Included</h4>
                      <ul>
                        {subscription.features.map((feature, index) => (
                          <li key={index}>
                            <i className="fas fa-check"></i> {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="plan-actions">
                      <button className="update-payment" onClick={() => alert("Opening payment method page...")}>
                        <i className="fas fa-credit-card"></i> Update Payment Method
                      </button>
                      <button className="view-invoice" onClick={() => alert("Opening invoices page...")}>
                        <i className="fas fa-file-invoice"></i> View Invoices
                      </button>
                    </div>
                  </div>

                  <div className="all-plans-section">
                    <h3>Available Plans</h3>
                    <div className="plans-comparison">
                      <div className="plan-card">
                        <div className="plan-name">Starter</div>
                        <div className="plan-price">₹499/month</div>
                        <ul className="plan-features-list">
                          <li>Up to 50 product listings</li>
                          <li>Email support</li>
                          <li>Basic analytics</li>
                          <li>2% transaction fee</li>
                        </ul>
                        <button className="plan-button">Select Plan</button>
                      </div>
                      
                      <div className="plan-card current">
                        <div className="plan-tag">Current Plan</div>
                        <div className="plan-name">Business Pro</div>
                        <div className="plan-price">₹999/month</div>
                        <ul className="plan-features-list">
                          <li>Unlimited product listings</li>
                          <li>Priority customer support</li>
                          <li>Advanced analytics dashboard</li>
                          <li>0% transaction fee</li>
                          <li>Multiple user accounts</li>
                        </ul>
                        <button className="plan-button active">Current Plan</button>
                      </div>
                      
                      <div className="plan-card premium">
                        <div className="plan-tag">Premium</div>
                        <div className="plan-name">Enterprise</div>
                        <div className="plan-price">₹2,499/month</div>
                        <ul className="plan-features-list">
                          <li>All Business Pro features</li>
                          <li>Dedicated account manager</li>
                          <li>Custom API integration</li>
                          <li>Advanced inventory management</li>
                          <li>Bulk order discounts</li>
                          <li>White label options</li>
                        </ul>
                        <button className="plan-button upgrade" onClick={handleUpgradePlan}>Upgrade</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer will be here, reusing the one from B_Homepage */}
      <footer className="business-footer">
        <div className="container">
          {/* Top Footer Section */}
          <div className="footer-top">
            <div className="footer-brand">
              <h1 className="logo-text">Link<span className="highlight">Local</span></h1>
              <p className="tagline">Empowering local businesses, strengthening communities</p>
            </div>
            <div className="newsletter">
              <h4>Subscribe to our newsletter</h4>
              <div className="newsletter-form">
                <input type="email" placeholder="Enter your email" />
                <button className="subscribe-btn">Subscribe</button>
              </div>
            </div>
          </div>
          
          {/* Footer Main Content */}
          <div className="footer-main">
            <div className="footer-col about-col">
              <h4>About LinkLocal</h4>
              <p>We connect local wholesalers with businesses to facilitate seamless B2B commerce in your community.</p>
              <div className="social-icons">
                <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
              </div>
            </div>
            
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#"><i className="fas fa-angle-right"></i> Home</a></li>
                <li><a href="#"><i className="fas fa-angle-right"></i> About Us</a></li>
                <li><a href="#"><i className="fas fa-angle-right"></i> How It Works</a></li>
                <li><a href="#"><i className="fas fa-angle-right"></i> Services</a></li>
              </ul>
            </div>
            
            <div className="footer-col">
              <h4>Business</h4>
              <ul className="footer-links">
                <li><a href="#"><i className="fas fa-angle-right"></i> Become a Seller</a></li>
                <li><a href="#"><i className="fas fa-angle-right"></i> Seller Dashboard</a></li>
                <li><a href="#"><i className="fas fa-angle-right"></i> Pricing Plans</a></li>
                <li><a href="#"><i className="fas fa-angle-right"></i> Seller FAQ</a></li>
              </ul>
            </div>
            
            <div className="footer-col contact-col">
              <h4>Contact Us</h4>
              <div className="contact-info">
                <p><i className="fas fa-map-marker-alt"></i> 123 Business Hub, Tech Park, Coimbatore</p>
                <p><i className="fas fa-envelope"></i> support@linklocal.com</p>
                <p><i className="fas fa-phone"></i> +91 9876543210</p>
                <p><i className="fas fa-clock"></i> Mon-Sat: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
          
          {/* Footer Bottom */}
          <div className="footer-bottom">
            <div className="copyright">
              <p>&copy; {new Date().getFullYear()} LinkLocal. All rights reserved.</p>
            </div>
            <div className="footer-bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default B_ProfilePage;