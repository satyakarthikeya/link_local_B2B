import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import B_Navbar from '../components/B_Navbar';
import "../styles/business_home.css";
import "../styles/profile.css"; // We'll create this next

const B_ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser , updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formChanged, setFormChanged] = useState(false);

  const [profileData, setProfileData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    gstNumber: "",
    businessType: "",
    establishedYear: "",
    website: "",
    address: {
      street: "",
      area: "",
      city: "",
      state: "",
      pincode: ""
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
    businessDescription: "",
    profilePicture: "./src/assests/chennai silks.png", // Default image
    coverPhoto: "./src/assests/brookfields.jpg", // Default image
  });

  const [bankData, setBankData] = useState({
    accountHolderName: "",
    accountNumber: "••••••••0000",
    ifscCode: "",
    bankName: "",
    branchName: ""
  });

  const [errors, setErrors] = useState({});
  const [documents, setDocuments] = useState([
    { id: 1, name: "GST Certificate", type: "gst", status: "verified", uploadDate: "12/10/2023" },
    { id: 2, name: "Business Registration", type: "registration", status: "verified", uploadDate: "12/10/2023" },
    { id: 3, name: "Shop License", type: "license", status: "verified", uploadDate: "12/10/2023" }
  ]);

  const [paymentHistory, setPaymentHistory] = useState([
    { id: "PMT001", date: "15/03/2025", amount: "₹5,200", status: "Completed", method: "Bank Transfer", orderId: "OD12345" },
    { id: "PMT002", date: "02/03/2025", amount: "₹3,750", status: "Completed", method: "UPI", orderId: "OD12332" },
    { id: "PMT003", date: "18/02/2025", amount: "₹8,900", status: "Completed", method: "Credit Card", orderId: "OD12318" },
    { id: "PMT004", date: "05/02/2025", amount: "₹2,100", status: "Completed", method: "Bank Transfer", orderId: "OD12296" }
  ]);

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
      "Multiple currentUser accounts"
    ]
  });

  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      console.log('Business currentUser data:', currentUser);

      setProfileData(prevData => ({
        ...prevData,
        businessName: currentUser.business_name || "",
        ownerName: currentUser.owner_name || currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone_no || currentUser.phone_number || currentUser.contact_number || "",
        gstNumber: currentUser.gst_number || "",
        businessType: currentUser.category || currentUser.business_type || "",
        establishedYear: currentUser.established_year || currentUser.year_established || "",
        website: currentUser.website || "",
        address: {
          street: currentUser.street_address || currentUser.street || "",
          area: currentUser.area || currentUser.locality || "",
          city: currentUser.city || "",
          state: currentUser.state || "",
          pincode: currentUser.pincode || currentUser.pin_code || ""
        },
        businessDescription: currentUser.business_description || currentUser.description || ""
      }));

      fetchBankDetails();
      loadBusinessHours();
      setIsLoading(false);
    }
  }, [currentUser]);

  const fetchBankDetails = async () => {
    try {
      const bankDetails = currentUser.bank_details || {};

      setBankData({
        accountHolderName: bankDetails.account_holder_name || bankDetails.account_name || currentUser.account_holder_name || "",
        accountNumber: bankDetails.account_number ? 
          ("••••••••" + bankDetails.account_number.slice(-4)) : 
          currentUser.bank_account_number ?
          ("••••••••" + currentUser.bank_account_number.slice(-4)) :
          "••••••••0000",
        ifscCode: bankDetails.ifsc_code || currentUser.bank_ifsc_code || "",
        bankName: bankDetails.bank_name || currentUser.bank_name || "",
        branchName: bankDetails.branch_name || currentUser.bank_branch || ""
      });
    } catch (error) {
      console.error("Error fetching bank details:", error);
    }
  };

  const loadBusinessHours = () => {
    if (currentUser.business_hours && Array.isArray(currentUser.business_hours)) {
      const hoursObject = {};

      currentUser.business_hours.forEach(hour => {
        if (hour.day && (hour.open_time || hour.close_time)) {
          hoursObject[hour.day.toLowerCase()] = {
            open: hour.open_time || "",
            close: hour.close_time || ""
          };
        }
      });

      if (Object.keys(hoursObject).length > 0) {
        setProfileData(prevData => ({
          ...prevData,
          businessHours: {
            ...prevData.businessHours,
            ...hoursObject
          }
        }));
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

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

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }

    setFormChanged(true);
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankData({
      ...bankData,
      [name]: value
    });

    setFormChanged(true);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});
    setSaveError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      let updateData = {};

      if (activeTab === 'personal') {
        updateData = {
          business_name: profileData.businessName,
          owner_name: profileData.ownerName,
          email: profileData.email,
          phone_number: profileData.phone,
          gst_number: profileData.gstNumber,
          category: profileData.businessType,
          established_year: profileData.establishedYear,
          website: profileData.website,
          street_address: profileData.address.street,
          area: profileData.address.area,
          city: profileData.address.city,
          state: profileData.address.state,
          pincode: profileData.address.pincode,
          business_description: profileData.businessDescription
        };

        const businessHoursArray = [];
        for (const [day, hours] of Object.entries(profileData.businessHours)) {
          if (hours.open || hours.close) {
            businessHoursArray.push({
              day: day.charAt(0).toUpperCase() + day.slice(1),
              open_time: hours.open,
              close_time: hours.close
            });
          }
        }

        if (businessHoursArray.length > 0) {
          updateData.business_hours = businessHoursArray;
        }
      } else if (activeTab === 'banking') {
        updateData = {
          bank_details: {
            account_holder_name: bankData.accountHolderName,
            bank_name: bankData.bankName,
            ifsc_code: bankData.ifscCode,
            branch_name: bankData.branchName
          }
        };

        if (bankData.accountNumber && !bankData.accountNumber.includes('•')) {
          updateData.bank_details.account_number = bankData.accountNumber;
        }
      }

      await updateProfile(updateData);

      setSaveSuccess(true);
      setFormChanged(false);

      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 3000);

    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveError(error.message || 'Failed to update profile. Please try again.');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabClick = (tab) => {
    if (isEditing && formChanged) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave this tab?")) {
        setIsEditing(false);
        setFormChanged(false);
        setActiveTab(tab);
      }
    } else {
      setActiveTab(tab);
    }
  };

  const handleGoBack = () => {
    navigate('/business-home/my-shop');
  };

  return (
    <div className="business-app">
      <B_Navbar />

      <main className="profile-page">
        <div className="container">
          <div className="profile-header">
            <button className="back-btn" onClick={handleGoBack}>
              <i className="fas fa-arrow-left"></i> Back to My Shop
            </button>
            <h1>Business Profile</h1>
          </div>

          {saveSuccess && (
            <div className="alert success">
              <i className="fas fa-check-circle"></i>
              <span>Profile updated successfully!</span>
              <button className="close-btn" onClick={() => setSaveSuccess(false)}>×</button>
            </div>
          )}

          {saveError && (
            <div className="alert error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{saveError}</span>
              <button className="close-btn" onClick={() => setSaveError(null)}>×</button>
            </div>
          )}

          {isLoading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading your profile information...</p>
            </div>
          )}

          {!isLoading && (
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
                        <input 
                          type="file" 
                          accept="image/*" 
                          hidden 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setProfileData({
                                  ...profileData,
                                  profilePicture: e.target.result
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <h3>{profileData.businessName}</h3>
                  <p className="business-type">{profileData.businessType}</p>
                  <p className="business-location">
                    <i className="fas fa-map-marker-alt"></i> {profileData.address.city || 'Not set'}, {profileData.address.state || ''}
                  </p>
                </div>

                <div className="profile-menu">
                  <button 
                    className={`menu-item ${activeTab === 'personal' ? 'active' : ''}`}
                    onClick={() => handleTabClick('personal')}
                  >
                    <i className="fas fa-store"></i> Business Information
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
                    <i className="fas fa-receipt"></i> Payment History
                  </button>
                  <button 
                    className={`menu-item ${activeTab === 'subscription' ? 'active' : ''}`}
                    onClick={() => handleTabClick('subscription')}
                  >
                    <i className="fas fa-crown"></i> Subscription
                  </button>
                </div>

                <div className="sidebar-help">
                  <h4>Need Help?</h4>
                  <p>Contact our support team for assistance with your business account</p>
                  <button className="help-btn" onClick={() => navigate('/business/support')}>
                    <i className="fas fa-headset"></i> Get Support
                  </button>
                </div>
              </div>

              {/* Profile Content Area */}
              <div className="profile-content">
                {/* Personal Information Tab */}
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
                          alt="Business Cover" 
                          className="cover-photo"
                        />
                        {isEditing && (
                          <label className="cover-upload-btn">
                            <i className="fas fa-camera"></i> Update Cover Photo
                            <input 
                              type="file" 
                              accept="image/*" 
                              hidden 
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    setProfileData({
                                      ...profileData,
                                      coverPhoto: e.target.result
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>

                      {/* Basic Business Details */}
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
                            <label htmlFor="businessType">Business Category</label>
                            <select
                              id="businessType"
                              name="businessType"
                              value={profileData.businessType}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            >
                              <option value="">Select a category</option>
                              <option value="SuperMarket">SuperMarket</option>
                              <option value="Electronics">Electronics</option>
                              <option value="Wholesale">Wholesale</option>
                              <option value="Restaurant">Restaurant</option>
                              <option value="Textiles">Textiles</option>
                              <option value="Stationery">Stationery</option>
                              <option value="Hardware">Hardware</option>
                            </select>
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor="establishedYear">Established Year</label>
                            <input 
                              type="text" 
                              id="establishedYear" 
                              name="establishedYear" 
                              value={profileData.establishedYear} 
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
                            <label htmlFor="website">Website (optional)</label>
                            <input 
                              type="text" 
                              id="website" 
                              name="website" 
                              value={profileData.website} 
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              placeholder="e.g. www.yourbusiness.com"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Business Address */}
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
                                  onChange={(e) => {
                                    const { value } = e.target;
                                    setProfileData({
                                      ...profileData,
                                      businessHours: {
                                        ...profileData.businessHours,
                                        [day]: {
                                          ...profileData.businessHours[day],
                                          open: value
                                        }
                                      }
                                    });
                                    setFormChanged(true);
                                  }}
                                  disabled={!isEditing || (day === 'sunday' && !profileData.businessHours[day].open && !profileData.businessHours[day].close)}
                                />
                                <span>to</span>
                                <input
                                  type="time"
                                  value={profileData.businessHours[day].close}
                                  onChange={(e) => {
                                    const { value } = e.target;
                                    setProfileData({
                                      ...profileData,
                                      businessHours: {
                                        ...profileData.businessHours,
                                        [day]: {
                                          ...profileData.businessHours[day],
                                          close: value
                                        }
                                      }
                                    });
                                    setFormChanged(true);
                                  }}
                                  disabled={!isEditing || (day === 'sunday' && !profileData.businessHours[day].open && !profileData.businessHours[day].close)}
                                />
                              </div>
                              {isEditing && day === 'sunday' && (
                                <div className="closed-toggle">
                                  <label>
                                    <input 
                                      type="checkbox"
                                      checked={!profileData.businessHours[day].open && !profileData.businessHours[day].close}
                                      onChange={() => {
                                        setProfileData({
                                          ...profileData,
                                          businessHours: {
                                            ...profileData.businessHours,
                                            [day]: {
                                              open: profileData.businessHours[day].open && profileData.businessHours[day].close ? "" : "09:00",
                                              close: profileData.businessHours[day].open && profileData.businessHours[day].close ? "" : "18:00"
                                            }
                                          }
                                        });
                                        setFormChanged(true);
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
                            rows="5"
                            disabled={!isEditing}
                            placeholder="Enter a detailed description of your business..."
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
                              className={errors.accountHolderName ? 'error' : ''}
                            />
                            {errors.accountHolderName && <span className="error-message">{errors.accountHolderName}</span>}
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
                              className={errors.accountNumber ? 'error' : ''}
                            />
                            {errors.accountNumber && <span className="error-message">{errors.accountNumber}</span>}
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
                              className={errors.ifscCode ? 'error' : ''}
                            />
                            {errors.ifscCode && <span className="error-message">{errors.ifscCode}</span>}
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
                              className={errors.bankName ? 'error' : ''}
                            />
                            {errors.bankName && <span className="error-message">{errors.bankName}</span>}
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
                      <p>All business documents must be clear and valid. Our team will verify your documents within 1-2 business days.</p>
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
                              onChange={(e) => {
                                if (e.target.files[0]) {
                                  alert("Document uploaded successfully! It will be verified soon.");
                                  // In a real implementation, you would upload the file to your server
                                  // and then add it to the documents list
                                  const newDoc = {
                                    id: Date.now(),
                                    name: "GST Certificate",
                                    type: "gst",
                                    status: "pending",
                                    uploadDate: new Date().toLocaleDateString()
                                  };
                                  setDocuments([...documents, newDoc]);
                                }
                              }} 
                            />
                          </label>
                        </div>
                        
                        <div className="upload-option">
                          <h4>FSSAI License</h4>
                          <p>Upload your food safety license (if applicable)</p>
                          <label className="upload-btn">
                            <i className="fas fa-upload"></i> Upload File
                            <input 
                              type="file" 
                              accept=".pdf,.jpg,.jpeg,.png" 
                              hidden 
                              onChange={(e) => {
                                if (e.target.files[0]) {
                                  alert("Document uploaded successfully! It will be verified soon.");
                                  const newDoc = {
                                    id: Date.now(),
                                    name: "FSSAI License",
                                    type: "fssai",
                                    status: "pending",
                                    uploadDate: new Date().toLocaleDateString()
                                  };
                                  setDocuments([...documents, newDoc]);
                                }
                              }} 
                            />
                          </label>
                        </div>
                        
                        <div className="upload-option">
                          <h4>Shop & Establishment License</h4>
                          <p>Upload your business license</p>
                          <label className="upload-btn">
                            <i className="fas fa-upload"></i> Upload File
                            <input 
                              type="file" 
                              accept=".pdf,.jpg,.jpeg,.png" 
                              hidden 
                              onChange={(e) => {
                                if (e.target.files[0]) {
                                  alert("Document uploaded successfully! It will be verified soon.");
                                  const newDoc = {
                                    id: Date.now(),
                                    name: "Shop License",
                                    type: "license",
                                    status: "pending",
                                    uploadDate: new Date().toLocaleDateString()
                                  };
                                  setDocuments([...documents, newDoc]);
                                }
                              }} 
                            />
                          </label>
                        </div>
                        
                        <div className="upload-option">
                          <h4>Other Document</h4>
                          <p>Upload any other relevant document</p>
                          <label className="upload-btn">
                            <i className="fas fa-upload"></i> Upload File
                            <input 
                              type="file" 
                              accept=".pdf,.jpg,.jpeg,.png" 
                              hidden 
                              onChange={(e) => {
                                if (e.target.files[0]) {
                                  const fileName = prompt("Please enter a name for this document:");
                                  if (fileName) {
                                    alert("Document uploaded successfully! It will be verified soon.");
                                    const newDoc = {
                                      id: Date.now(),
                                      name: fileName,
                                      type: "other",
                                      status: "pending",
                                      uploadDate: new Date().toLocaleDateString()
                                    };
                                    setDocuments([...documents, newDoc]);
                                  }
                                }
                              }} 
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
                      <button className="edit-btn" onClick={() => alert("Downloading payment history...")}>
                        <i className="fas fa-download"></i> Download Report
                      </button>
                    </div>

                    <div className="payments-filters">
                      <div className="filter-group">
                        <label htmlFor="payment-period">Period</label>
                        <select id="payment-period" defaultValue="this-month">
                          <option value="this-week">This Week</option>
                          <option value="last-week">Last Week</option>
                          <option value="this-month">This Month</option>
                          <option value="last-month">Last Month</option>
                          <option value="last-quarter">Last 3 Months</option>
                          <option value="all-time">All Time</option>
                        </select>
                      </div>
                      <div className="filter-group">
                        <label htmlFor="payment-status">Status</label>
                        <select id="payment-status" defaultValue="all">
                          <option value="all">All Status</option>
                          <option value="completed">Completed</option>
                          <option value="pending">Pending</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                      <div className="filter-group">
                        <label htmlFor="payment-method">Payment Method</label>
                        <select id="payment-method" defaultValue="all">
                          <option value="all">All Methods</option>
                          <option value="bank-transfer">Bank Transfer</option>
                          <option value="card">Credit/Debit Card</option>
                          <option value="upi">UPI</option>
                        </select>
                      </div>
                    </div>

                    <div className="payment-summary">
                      <div className="summary-card">
                        <div className="summary-title">Total Revenue</div>
                        <div className="summary-amount">₹19,950</div>
                        <div className="summary-period">This Month</div>
                      </div>
                      
                      <div className="summary-card">
                        <div className="summary-title">Orders Fulfilled</div>
                        <div className="summary-amount">48</div>
                        <div className="summary-period">This Month</div>
                      </div>
                      
                      <div className="summary-card">
                        <div className="summary-title">Average Order Value</div>
                        <div className="summary-amount">₹415</div>
                        <div className="summary-period">This Month</div>
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
                                onClick={() => alert(`View details for Order ${payment.orderId}`)}
                              >
                                View
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Subscription Tab */}
                {activeTab === 'subscription' && (
                  <div className="profile-section">
                    <div className="section-header">
                      <h2>Subscription Plan</h2>
                      <button className="edit-btn" onClick={() => alert("Opening subscription management...")}>
                        <i className="fas fa-edit"></i> Manage Subscription
                      </button>
                    </div>
                    
                    <div className="current-plan-card">
                      <div className="plan-header">
                        <div className="plan-name">
                          <i className="fas fa-crown"></i>
                          <h3>{subscription.plan}</h3>
                        </div>
                        <div className="plan-status">
                          {subscription.status}
                        </div>
                      </div>
                      
                      <div className="plan-details">
                        <div className="plan-pricing">
                          <div className="price">{subscription.amount}</div>
                          <div className="renewal">Next billing: {subscription.nextBillingDate}</div>
                        </div>
                        
                        <div className="plan-billing">
                          <div className="billing-info">
                            <span className="label">Billing cycle:</span>
                            <span className="value">Monthly</span>
                          </div>
                          <div className="payment-method">
                            <span className="label">Payment method:</span>
                            <span className="value">••••••••1234 (Visa)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="plan-features">
                        <h4>Plan Features</h4>
                        <ul>
                          {subscription.features.map((feature, index) => (
                            <li key={index}>
                              <i className="fas fa-check-circle"></i> {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="plan-actions">
                        <button className="update-payment">
                          <i className="fas fa-credit-card"></i> Update Payment Method
                        </button>
                        <button className="view-invoice">
                          <i className="fas fa-file-invoice"></i> View Invoices
                        </button>
                      </div>
                    </div>
                    
                    <div className="all-plans-section">
                      <h3>Available Plans</h3>
                      <div className="plans-comparison">
                        <div className="plan-card">
                          <h4 className="plan-name">Starter</h4>
                          <div className="plan-price">₹499/month</div>
                          <ul className="plan-features-list">
                            <li>Up to 50 product listings</li>
                            <li>Standard customer support</li>
                            <li>Basic analytics</li>
                            <li>2% transaction fee</li>
                            <li>Single user account</li>
                          </ul>
                          <button className="plan-button">Downgrade Plan</button>
                        </div>
                        
                        <div className="plan-card current">
                          <div className="plan-tag">Current Plan</div>
                          <h4 className="plan-name">Business Pro</h4>
                          <div className="plan-price">₹999/month</div>
                          <ul className="plan-features-list">
                            <li>Unlimited product listings</li>
                            <li>Priority customer support</li>
                            <li>Advanced analytics dashboard</li>
                            <li>0% transaction fee</li>
                            <li>Up to 3 user accounts</li>
                          </ul>
                          <button className="plan-button active" disabled>Current Plan</button>
                        </div>
                        
                        <div className="plan-card premium">
                          <div className="plan-tag">Best Value</div>
                          <h4 className="plan-name">Enterprise</h4>
                          <div className="plan-price">₹2,499/month</div>
                          <ul className="plan-features-list">
                            <li>Unlimited product listings</li>
                            <li>24/7 dedicated support</li>
                            <li>Premium analytics & reporting</li>
                            <li>0% transaction fee</li>
                            <li>Unlimited user accounts</li>
                            <li>Custom branding options</li>
                            <li>API access for custom integration</li>
                          </ul>
                          <button className="plan-button upgrade">Upgrade Plan</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default B_ProfilePage;