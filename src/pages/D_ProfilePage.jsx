import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import D_Navbar from '../components/D_Navbar';
import D_Footer from '../components/D_Footer';
import api from '../utils/api';
import "../styles/delivery_home.css";
import "../styles/profile.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const D_ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [formChanged, setFormChanged] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "Male",
    dateOfBirth: "",
    address: {
      street: "",
      area: "",
      city: "",
      state: "",
      pincode: ""
    },
    profilePicture: "./src/assests/kenny.jpg", // Default image
    vehicleType: "Two Wheeler",
    vehicleNumber: "",
    licenseNumber: "",
    preferredWorkingHours: {
      monday: { working: true, start: "09:00", end: "18:00" },
      tuesday: { working: true, start: "09:00", end: "18:00" },
      wednesday: { working: true, start: "09:00", end: "18:00" },
      thursday: { working: true, start: "09:00", end: "18:00" },
      friday: { working: true, start: "09:00", end: "18:00" },
      saturday: { working: true, start: "10:00", end: "16:00" },
      sunday: { working: false, start: "", end: "" }
    },
    about: "",
    availability_status: true
  });

  // Bank account information
  const [bankData, setBankData] = useState({
    accountHolderName: "",
    accountNumber: "••••••••0000",
    ifscCode: "",
    bankName: "",
    branchName: ""
  });

  // Extract tab from URL params if provided
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab && ['personal', 'banking', 'documents', 'earnings', 'stats'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  // Fetch delivery agent data
  useEffect(() => {
    const fetchAgentData = async () => {
      setIsLoading(true);
      try {
        if (currentUser?.agent_id) {
          const response = await api.delivery.getProfile();
          const agentData = response.data;
          
          // Update online status
          setIsOnline(agentData.availability_status === "Available");
          
          // Update profile data
          setProfileData(prevData => ({
            ...prevData,
            fullName: agentData.name || agentData.full_name || agentData.agent_name || "",
            email: agentData.email || "",
            phone: agentData.contact_number || agentData.phone_number || agentData.phone || "",
            gender: agentData.gender || "Male",
            dateOfBirth: agentData.date_of_birth || agentData.dob || "",
            address: {
              street: agentData.street || agentData.address_line1 || "",
              area: agentData.area || agentData.locality || "",
              city: agentData.city || "",
              state: agentData.state || "",
              pincode: agentData.pincode || agentData.zip_code || ""
            },
            vehicleType: agentData.vehicle_type || "Two Wheeler",
            vehicleNumber: agentData.vehicle_number || agentData.vehicle_reg_no || "",
            licenseNumber: agentData.license_no || agentData.license_number || "",
            about: agentData.about || agentData.bio || "",
            availability_status: agentData.availability_status === "Available"
          }));
          
          // Fetch bank details
          if (agentData.bank_details) {
            setBankData({
              accountHolderName: agentData.bank_details.account_name || agentData.bank_details.account_holder_name || "",
              accountNumber: agentData.bank_details.account_number ? 
                ("••••••••" + agentData.bank_details.account_number.slice(-4)) : "••••••••0000",
              ifscCode: agentData.bank_details.ifsc_code || "",
              bankName: agentData.bank_details.bank_name || "",
              branchName: agentData.bank_details.branch_name || ""
            });
          }
          
          // Fetch earnings data
          await fetchEarningsData();
          
          // Fetch documents
          await fetchDocuments();
        }
      } catch (error) {
        console.error("Error fetching delivery agent profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAgentData();
  }, [currentUser]);

  // Form validation state
  const [errors, setErrors] = useState({});

  // Documents state
  const [documents, setDocuments] = useState([]);
  
  // Fetch documents
  const fetchDocuments = async () => {
    try {
      const response = await api.delivery.getDocuments();
      if (response.data && Array.isArray(response.data)) {
        const formattedDocs = response.data.map(doc => ({
          id: doc.id || doc.document_id,
          name: doc.name || doc.document_name,
          type: doc.type || doc.document_type,
          status: doc.status || 'pending',
          uploadDate: formatDate(doc.upload_date || doc.created_at || new Date())
        }));
        setDocuments(formattedDocs);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      // If API fails, use default documents
      setDocuments([
        { id: 1, name: "Driving License", type: "license", status: "verified", uploadDate: "15/01/2025" },
        { id: 2, name: "Aadhar Card", type: "idproof", status: "verified", uploadDate: "15/01/2025" },
        { id: 3, name: "Vehicle Registration", type: "vehicle", status: "verified", uploadDate: "15/01/2025" }
      ]);
    }
  };

  // Format date 
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  // Format date for input field (yyyy-MM-dd format)
  const formatDateForInput = (dateString) => {
    try {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    } catch (error) {
      console.error('Error formatting date for input:', error);
      return '';
    }
  };

  // Earnings history
  const [earningsHistory, setEarningsHistory] = useState([]);
  
  // Fetch earnings data
  const fetchEarningsData = async () => {
    try {
      const response = await api.delivery.getEarningsHistory();
      if (response.data && Array.isArray(response.data)) {
        const formattedEarnings = response.data.map((earning, index) => ({
          id: earning.id || earning.transaction_id || `TXN${(index + 1).toString().padStart(3, '0')}`,
          date: formatDate(earning.date || earning.created_at),
          amount: `₹${earning.amount}`,
          orders: earning.orders_count || earning.deliveries_count || 0,
          bonus: `₹${earning.bonus || 0}`,
          status: earning.status || 'Completed'
        }));
        setEarningsHistory(formattedEarnings);
      }
    } catch (error) {
      console.error("Error fetching earnings history:", error);
      // If API fails, use default earnings data
      setEarningsHistory([
        { id: "TXN001", date: "15/03/2025", amount: "₹650", orders: 8, bonus: "₹50", status: "Completed" },
        { id: "TXN002", date: "14/03/2025", amount: "₹520", orders: 6, bonus: "₹0", status: "Completed" },
        { id: "TXN003", date: "13/03/2025", amount: "₹720", orders: 9, bonus: "₹100", status: "Completed" },
        { id: "TXN004", date: "12/03/2025", amount: "₹490", orders: 5, bonus: "₹0", status: "Completed" }
      ]);
    }
  };

  // Stats data
  const [statsData, setStatsData] = useState({
    totalDeliveries: 0,
    totalEarnings: "₹0",
    avgDeliveryTime: "0 mins",
    acceptanceRate: "0%",
    customerRating: 0,
    onTimeDelivery: "0%",
    totalDistance: "0 km",
    bonusEarned: "₹0"
  });

  // Fetch stats data
  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        const response = await api.delivery.getPerformanceStats();
        if (response.data) {
          setStatsData({
            totalDeliveries: response.data.total_deliveries || 0,
            totalEarnings: `₹${response.data.total_earnings || 0}`,
            avgDeliveryTime: `${response.data.avg_delivery_time || 0} mins`,
            acceptanceRate: `${response.data.acceptance_rate || 0}%`,
            customerRating: response.data.customer_rating || 0,
            onTimeDelivery: `${response.data.on_time_rate || 0}%`,
            totalDistance: `${response.data.total_distance || 0} km`,
            bonusEarned: `₹${response.data.total_bonus || 0}`
          });
        }
      } catch (error) {
        console.error("Error fetching performance stats:", error);
        // If API fails, use default stats
        setStatsData({
          totalDeliveries: 847,
          totalEarnings: "₹68,950",
          avgDeliveryTime: "28 mins",
          acceptanceRate: "96%",
          customerRating: 4.8,
          onTimeDelivery: "97%",
          totalDistance: "3,245 km",
          bonusEarned: "₹5,400"
        });
      }
    };
    
    fetchStatsData();
  }, []);

  // Handle offline status when browser is closed or component unmounts
  useEffect(() => {
    // Function to handle before the page is unloaded (browser closed, refreshed, etc.)
    const handleBeforeUnload = () => {
      if (isOnline && currentUser?.agent_id) {
        // Using navigator.sendBeacon for reliable delivery even during page unload
        const blob = new Blob([JSON.stringify({ status: false })], { type: 'application/json' });
        navigator.sendBeacon(`/api/delivery/availability/${currentUser.agent_id}/offline`, blob);
        console.log('Setting status to offline on page unload');
      }
    };

    // Add event listener for when the page is about to be unloaded
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup function that runs when component unmounts
    return () => {
      // Set status to offline when component unmounts if user is online
      if (isOnline && currentUser?.agent_id) {
        api.delivery.updateAvailabilityStatus(currentUser.agent_id, false)
          .then(() => console.log('Set availability to offline on unmount'))
          .catch(err => console.error('Failed to set offline status on unmount', err));
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isOnline, currentUser]);

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
    
    // Clear errors when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
    
    // Mark form as changed
    setFormChanged(true);
  };

  // Handle availability status change
  const handleAvailabilityChange = async (status) => {
    try {
      if (currentUser?.agent_id) {
        await api.delivery.updateAvailabilityStatus(currentUser.agent_id, status);
        setIsOnline(status);
      }
    } catch (error) {
      console.error("Error updating availability status:", error);
      alert("Failed to update availability status. Please try again.");
    }
  };

  // Handle working hours changes
  const handleHoursChange = (day, type, value) => {
    setProfileData({
      ...profileData,
      preferredWorkingHours: {
        ...profileData.preferredWorkingHours,
        [day]: {
          ...profileData.preferredWorkingHours[day],
          [type]: value
        }
      }
    });
  };

  // Handle working day toggle
  const handleWorkingDayToggle = (day) => {
    setProfileData({
      ...profileData,
      preferredWorkingHours: {
        ...profileData.preferredWorkingHours,
        [day]: {
          ...profileData.preferredWorkingHours[day],
          working: !profileData.preferredWorkingHours[day].working
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
    
    // Clear errors when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Handle file upload for profile picture
  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File size validation (5MB limit)
    const maxSizeInMB = 5;
    const fileSizeInMB = file.size / (1024 * 1024);
    
    if (fileSizeInMB > maxSizeInMB) {
      alert(`File size exceeds ${maxSizeInMB}MB limit. Please choose a smaller file.`);
      return;
    }

    // Create a preview URL for immediate display
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      setProfileData({
        ...profileData,
        profilePicture: event.target.result
      });
    };
    fileReader.readAsDataURL(file);

    // In a real app, you would upload the file to your server here
    // and then update the profilePicture URL with the response
  };

  // Handle document file upload
  const handleFileUpload = (e, documentType) => {
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
    alert("Document uploaded successfully! It will be verified soon.");
    
    // Add the new document to the local state
    const documentNames = {
      'license': 'Driving License',
      'idproof': 'Aadhar Card',
      'vehicle': 'Vehicle Registration',
      'insurance': 'Vehicle Insurance'
    };
    
    const newDocument = {
      id: Date.now(),
      name: documentNames[documentType] || 'Document',
      type: documentType,
      status: 'pending',
      uploadDate: new Date().toLocaleDateString()
    };
    
    setDocuments(prevDocuments => [...prevDocuments, newDocument]);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Personal info validation
    if (!profileData.fullName) newErrors.fullName = "Full name is required";
    
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
    
    // Address validation
    if (!profileData.address.street) newErrors['address.street'] = "Street address is required";
    if (!profileData.address.city) newErrors['address.city'] = "City is required";
    if (!profileData.address.state) newErrors['address.state'] = "State is required";
    
    if (!profileData.address.pincode) {
      newErrors['address.pincode'] = "PIN code is required";
    } else if (!/^\d{6}$/.test(profileData.address.pincode)) {
      newErrors['address.pincode'] = "PIN code should be 6 digits";
    }
    
    // Vehicle info validation
    if (!profileData.vehicleNumber) newErrors.vehicleNumber = "Vehicle number is required";
    if (!profileData.licenseNumber) newErrors.licenseNumber = "License number is required";

    // Banking validation (if on banking tab)
    if (activeTab === 'banking') {
      if (!bankData.accountHolderName) newErrors.accountHolderName = "Account holder name is required";
      if (!bankData.bankName) newErrors.bankName = "Bank name is required";
      if (!bankData.ifscCode) newErrors.ifscCode = "IFSC code is required";
      
      // Validate account number only if it has been changed (not masked)
      if (bankData.accountNumber && !bankData.accountNumber.includes('•')) {
        if (bankData.accountNumber.length < 8) {
          newErrors.accountNumber = "Account number is too short";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset previous errors and messages
    setErrors({});
    setSaveError(null);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true); // Show loading indicator while saving
      
      // Store current authentication token to preserve it
      const currentToken = localStorage.getItem('authToken');
      
      // Prepare the data for API submission based on current tab
      let updateData = {};
      
      if (activeTab === 'personal') {
        updateData = {
          name: profileData.fullName,
          email: profileData.email,
          phone_number: profileData.phone,
          gender: profileData.gender,
          date_of_birth: profileData.dateOfBirth,
          address: {
            street: profileData.address.street,
            area: profileData.address.area,
            city: profileData.address.city,
            state: profileData.address.state,
            pincode: profileData.address.pincode
          },
          vehicle_type: profileData.vehicleType,
          vehicle_number: profileData.vehicleNumber,
          license_number: profileData.licenseNumber,
          about: profileData.about,
          availability_status: profileData.availability_status ? "Available" : "Unavailable",
          preferred_working_hours: profileData.preferredWorkingHours
        };
      } else if (activeTab === 'banking') {
        updateData = {
          bankDetails: {
            account_holder_name: bankData.accountHolderName,
            // Only include account number if it was changed (not masked)
            ...(bankData.accountNumber && !bankData.accountNumber.includes('•') && {
              account_number: bankData.accountNumber
            }),
            ifsc_code: bankData.ifscCode,
            bank_name: bankData.bankName,
            branch_name: bankData.branchName
          }
        };
      }
      
      // Call the update profile method from API
      const response = await api.delivery.updateProfile(currentUser.agent_id, updateData);
      
      // Make sure we don't lose authentication during profile update
      if (!localStorage.getItem('authToken') && currentToken) {
        localStorage.setItem('authToken', currentToken);
      }
      
      // Only update the context if response was successful and we have proper data
      if (updateProfile && response.data) {
        // Preserve user authentication data when updating profile data
        const userData = response.data.profile || response.data;
        const updatedUserData = { 
          ...currentUser,
          ...userData
        };
        
        // Only update essential profile information, keep authentication intact
        await updateProfile(updatedUserData, false);
      }
      
      // Show success message
      setSaveSuccess(true);
      setFormChanged(false);
      
      // Hide success message after 3 seconds and exit editing mode
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveError(error.message || 'Failed to update profile. Please try again.');
      
      // Scroll to error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };

  // Handle tab click
  const handleTabClick = (tab) => {
    // If switching tabs while editing and form has changed, ask for confirmation
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

  // Go back function
  const handleGoBack = () => {
    navigate('/delivery-home');
  };

  if (isLoading) {
    return (
      <>
        <D_Navbar isOnlineGlobal={isOnline} setIsOnlineGlobal={setIsOnline} />
        <main className="profile-page">
          <div className="container">
            <div className="loading-container">
              <i className="fas fa-spinner fa-spin fa-3x"></i>
              <p>Loading profile data...</p>
            </div>
          </div>
        </main>
        <D_Footer />
      </>
    );
  }

  return (
    <>
      <D_Navbar isOnlineGlobal={isOnline} setIsOnlineGlobal={setIsOnline} />

      <main className="profile-page">
        <div className="container">
          {/* Profile Header */}
          <div className="profile-header">
            <button className="back-btn" onClick={handleGoBack}>
              <i className="fas fa-arrow-left"></i> Back to Dashboard
            </button>
            <h1>My Profile</h1>
          </div>

          {/* Alert Messages */}
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

          {/* Profile Content */}
          <div className="profile-container">
            {/* Profile Sidebar */}
            <div className="profile-sidebar">
              <div className="profile-overview">
                <div className="profile-image-container">
                  <img 
                    src={profileData.profilePicture} 
                    alt={profileData.fullName} 
                    className="profile-image"
                    
                  />
                  {isEditing && (
                    <label className="image-upload-btn">
                      <i className="fas fa-camera"></i>
                      <input 
                        type="file" 
                        accept="image/*" 
                        hidden 
                        onChange={handleProfilePictureUpload}
                      />
                    </label>
                  )}
                </div>
                <h3>{profileData.fullName}</h3>
                <p className="business-type">Delivery Partner</p>
                <p className="business-location">
                  <i className="fas fa-map-marker-alt"></i> {profileData.address.city || 'Not set'}, {profileData.address.state || ''}
                </p>
                <div className="status-indicator">
                  <span>Status: </span>
                  <div className={`status-toggle profile-status`}>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={isOnline} 
                        onChange={() => handleAvailabilityChange(!isOnline)} 
                      />
                      <span className="slider"></span>
                    </label>
                    <span className={`status-text ${isOnline ? 'status-online' : 'status-offline'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="profile-menu">
                <button 
                  className={`menu-item ${activeTab === 'personal' ? 'active' : ''}`}
                  onClick={() => handleTabClick('personal')}
                >
                  <i className="fas fa-user"></i> Personal Information
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
                  className={`menu-item ${activeTab === 'earnings' ? 'active' : ''}`}
                  onClick={() => handleTabClick('earnings')}
                >
                  <i className="fas fa-wallet"></i> Earnings
                </button>
                <button 
                  className={`menu-item ${activeTab === 'stats' ? 'active' : ''}`}
                  onClick={() => handleTabClick('stats')}
                >
                  <i className="fas fa-chart-bar"></i> Performance
                </button>
              </div>

              <div className="sidebar-help">
                <h4>Need Help?</h4>
                <p>Contact our support team for assistance with your account</p>
                <button className="help-btn" onClick={() => navigate('/delivery/support')}>
                  <i className="fas fa-headset"></i> Get Support
                </button>
              </div>
            </div>

            {/* Profile Content */}
            <div className="profile-content">
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <div className="profile-section">
                  <div className="section-header">
                    <h2>Personal Information</h2>
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
                    {/* Basic Details */}
                    <div className="form-section">
                      <h3>Basic Details</h3>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="fullName">Full Name</label>
                          <input 
                            type="text" 
                            id="fullName" 
                            name="fullName" 
                            value={profileData.fullName} 
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={errors.fullName ? 'error' : ''}
                          />
                          {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                        </div>
                        
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
                      </div>
                      
                      <div className="form-row">
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
                        
                        <div className="form-group">
                          <label htmlFor="gender">Gender</label>
                          <select 
                            id="gender" 
                            name="gender" 
                            value={profileData.gender} 
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="dateOfBirth">Date of Birth</label>
                          <input 
                            type="date" 
                            id="dateOfBirth" 
                            name="dateOfBirth" 
                            value={formatDateForInput(profileData.dateOfBirth)} 
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Rest of the form remains unchanged */}
                    {/* Address Information */}
                    <div className="form-section">
                      <h3>Your Address</h3>
                      
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

                    {/* Vehicle Information */}
                    <div className="form-section">
                      <h3>Vehicle Information</h3>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="vehicleType">Vehicle Type</label>
                          <select 
                            id="vehicleType" 
                            name="vehicleType" 
                            value={profileData.vehicleType} 
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          >
                            <option value="Two Wheeler">Two Wheeler</option>
                            <option value="Three Wheeler">Three Wheeler</option>
                            <option value="Four Wheeler">Four Wheeler</option>
                            <option value="Bicycle">Bicycle</option>
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="vehicleNumber">Vehicle Number</label>
                          <input 
                            type="text" 
                            id="vehicleNumber" 
                            name="vehicleNumber" 
                            value={profileData.vehicleNumber} 
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={errors.vehicleNumber ? 'error' : ''}
                          />
                          {errors.vehicleNumber && <span className="error-message">{errors.vehicleNumber}</span>}
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="licenseNumber">Driving License Number</label>
                          <input 
                            type="text" 
                            id="licenseNumber" 
                            name="licenseNumber" 
                            value={profileData.licenseNumber} 
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={errors.licenseNumber ? 'error' : ''}
                          />
                          {errors.licenseNumber && <span className="error-message">{errors.licenseNumber}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Preferred Working Hours */}
                    <div className="form-section">
                      <h3>Preferred Working Hours</h3>
                      
                      <div className="business-hours">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                          <div className="hours-row" key={day}>
                            <div className="day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</div>
                            <div className="hours-inputs">
                              <input
                                type="time"
                                value={profileData.preferredWorkingHours[day].start}
                                onChange={(e) => handleHoursChange(day, 'start', e.target.value)}
                                disabled={!isEditing || !profileData.preferredWorkingHours[day].working}
                              />
                              <span>to</span>
                              <input
                                type="time"
                                value={profileData.preferredWorkingHours[day].end}
                                onChange={(e) => handleHoursChange(day, 'end', e.target.value)}
                                disabled={!isEditing || !profileData.preferredWorkingHours[day].working}
                              />
                            </div>
                            {isEditing && (
                              <div className="closed-toggle">
                                <label>
                                  <input 
                                    type="checkbox"
                                    checked={!profileData.preferredWorkingHours[day].working}
                                    onChange={() => handleWorkingDayToggle(day)}
                                  />
                                  Off Day
                                </label>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* About Section */}
                    <div className="form-section">
                      <h3>About</h3>
                      <div className="form-group full-width">
                        <textarea
                          name="about"
                          value={profileData.about}
                          onChange={handleInputChange}
                          rows="4"
                          disabled={!isEditing}
                          placeholder="Tell us a bit about yourself..."
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
                    <p>Your banking information is securely stored and encrypted. This information is used for processing your earnings payouts.</p>
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

              {/* Rest of the tabs remain unchanged */}
              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="profile-section">
                  <div className="section-header">
                    <h2>Documents</h2>
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
                        <h4>Driving License</h4>
                        <p>Upload your driving license</p>
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
                      
                      <div className="upload-option">
                        <h4>ID Proof</h4>
                        <p>Upload your Aadhar or PAN card</p>
                        <label className="upload-btn">
                          <i className="fas fa-upload"></i> Upload File
                          <input 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png" 
                            hidden 
                            onChange={(e) => handleFileUpload(e, 'idproof')} 
                          />
                        </label>
                      </div>
                      
                      <div className="upload-option">
                        <h4>Vehicle Registration</h4>
                        <p>Upload your vehicle registration certificate</p>
                        <label className="upload-btn">
                          <i className="fas fa-upload"></i> Upload File
                          <input 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png" 
                            hidden 
                            onChange={(e) => handleFileUpload(e, 'vehicle')} 
                          />
                        </label>
                      </div>
                      
                      <div className="upload-option">
                        <h4>Insurance</h4>
                        <p>Upload your vehicle insurance</p>
                        <label className="upload-btn">
                          <i className="fas fa-upload"></i> Upload File
                          <input 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png" 
                            hidden 
                            onChange={(e) => handleFileUpload(e, 'insurance')} 
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

              {/* Earnings Tab */}
              {activeTab === 'earnings' && (
                <div className="profile-section">
                  <div className="section-header">
                    <h2>Earnings History</h2>
                    <button className="edit-btn" onClick={() => alert("Downloading earnings report...")}>
                      <i className="fas fa-download"></i> Download Report
                    </button>
                  </div>

                  <div className="payments-filters">
                    <div className="filter-group">
                      <label htmlFor="payment-period">Period</label>
                      <select id="payment-period" defaultValue="this-week">
                        <option value="today">Today</option>
                        <option value="this-week">This Week</option>
                        <option value="last-week">Last Week</option>
                        <option value="this-month">This Month</option>
                      </select>
                    </div>
                  </div>

                  <div className="payment-summary">
                    <div className="summary-card">
                      <div className="summary-title">Total Earnings</div>
                      <div className="summary-amount">₹2,380</div>
                      <div className="summary-period">This Week</div>
                    </div>
                    
                    <div className="summary-card">
                      <div className="summary-title">Orders Completed</div>
                      <div className="summary-amount">28</div>
                      <div className="summary-period">This Week</div>
                    </div>
                    
                    <div className="summary-card">
                      <div className="summary-title">Bonus Earned</div>
                      <div className="summary-amount">₹150</div>
                      <div className="summary-period">This Week</div>
                    </div>
                  </div>

                  <div className="transactions-list">
                    <div className="transaction-table">
                      <div className="transaction-header">
                        <div className="transaction-id">Transaction ID</div>
                        <div className="transaction-date">Date</div>
                        <div className="transaction-amount">Amount</div>
                        <div className="transaction-method">Orders</div>
                        <div className="transaction-method">Bonus</div>
                        <div className="transaction-status">Status</div>
                      </div>
                      
                      {earningsHistory.map(earning => (
                        <div className="transaction-row" key={earning.id}>
                          <div className="transaction-id">{earning.id}</div>
                          <div className="transaction-date">{earning.date}</div>
                          <div className="transaction-amount">{earning.amount}</div>
                          <div className="transaction-method">{earning.orders}</div>
                          <div className="transaction-method">{earning.bonus}</div>
                          <div className={`transaction-status status-${earning.status.toLowerCase()}`}>
                            {earning.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Stats Tab */}
              {activeTab === 'stats' && (
                <div className="profile-section">
                  <div className="section-header">
                    <h2>Performance Statistics</h2>
                    <div>
                      <label htmlFor="stats-period" className="stats-period-label">Period: </label>
                      <select id="stats-period" className="stats-period-select">
                        <option value="all-time">All Time</option>
                        <option value="this-month">This Month</option>
                        <option value="last-month">Last Month</option>
                      </select>
                    </div>
                  </div>

                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-truck-loading"></i>
                      </div>
                      <div className="stat-details">
                        <h4>Total Deliveries</h4>
                        <div className="stat-value">{statsData.totalDeliveries}</div>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-wallet"></i>
                      </div>
                      <div className="stat-details">
                        <h4>Total Earnings</h4>
                        <div className="stat-value">{statsData.totalEarnings}</div>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-clock"></i>
                      </div>
                      <div className="stat-details">
                        <h4>Avg. Delivery Time</h4>
                        <div className="stat-value">{statsData.avgDeliveryTime}</div>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-check-circle"></i>
                      </div>
                      <div className="stat-details">
                        <h4>Acceptance Rate</h4>
                        <div className="stat-value">{statsData.acceptanceRate}</div>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-star"></i>
                      </div>
                      <div className="stat-details">
                        <h4>Customer Rating</h4>
                        <div className="stat-value">{statsData.customerRating} / 5.0</div>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-medal"></i>
                      </div>
                      <div className="stat-details">
                        <h4>On-Time Delivery</h4>
                        <div className="stat-value">{statsData.onTimeDelivery}</div>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-road"></i>
                      </div>
                      <div className="stat-details">
                        <h4>Total Distance</h4>
                        <div className="stat-value">{statsData.totalDistance}</div>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">
                        <i className="fas fa-gift"></i>
                      </div>
                      <div className="stat-details">
                        <h4>Total Bonus</h4>
                        <div className="stat-value">{statsData.bonusEarned}</div>
                      </div>
                    </div>
                  </div>

                  <div className="performance-tips">
                    <h3><i className="fas fa-lightbulb"></i> Tips to Improve Performance</h3>
                    <ul>
                      <li>Accept more orders during peak hours to increase earnings</li>
                      <li>Keep your vehicle well-maintained to avoid delivery delays</li>
                      <li>Follow delivery instructions carefully for better customer ratings</li>
                      <li>Use the suggested routes in the app to optimize your delivery time</li>
                      <li>Always verify the order before leaving the pickup location</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <D_Footer />
    </>
  );
};

export default D_ProfilePage;