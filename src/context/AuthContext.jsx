import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Safely parse userData from localStorage with improved error handling
  const getUserDataFromStorage = () => {
    try {
      const userData = localStorage.getItem('userData');
      // Only attempt to parse if userData exists and isn't "undefined"
      if (userData && userData !== "undefined") {
        return JSON.parse(userData);
      }
      // If userData is "undefined" or null, clear it and return null
      if (userData === "undefined") {
        localStorage.removeItem('userData');
      }
      return null;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      localStorage.removeItem('userData'); // Remove invalid data
      return null;
    }
  };

  const [currentUser, setCurrentUser] = useState(getUserDataFromStorage());
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(localStorage.getItem('userType') || null); // 'business' or 'delivery'
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [error, setError] = useState('');

  // Helper function to store user data in local storage
  const storeUserData = (userData, type, authToken) => {
    if (!userData) {
      console.error("Invalid userData provided to storeUserData:", userData);
      return; // Prevent further execution if userData is invalid
    }
    if (userData && typeof userData === 'object') {
      localStorage.setItem('userData', JSON.stringify(userData));
    } else {
      console.warn("Invalid userData provided to storeUserData", userData);
      localStorage.removeItem('userData');
    }
    
    localStorage.setItem('userType', type);
    localStorage.setItem('authToken', authToken);
    
    setCurrentUser(userData);
    setUserType(type);
    setToken(authToken);
  };

  // Function to register a business user
  const registerBusiness = async (businessData) => {
    try {
      // Log what we're sending to help debug
      console.log("Sending business registration data:", businessData);
      
      // Use a direct API call without auth token
      // Fixed endpoint to match the server's route configuration
      const response = await fetch('/api/auth/business/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessData)
      });
      
      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          // Try to parse as JSON if possible
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || `Server error: ${response.status}`;
        } catch (e) {
          // If not JSON, use text or status
          errorMessage = errorText || `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // Store the token
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        setToken(data.token);
      }
      
      // Update the current user and user type
      if (data.user) {
        setCurrentUser(data.user);
        setUserType('business');
        localStorage.setItem('userData', JSON.stringify(data.user));
        localStorage.setItem('userType', 'business');
      }
      
      return data;
    } catch (error) {
      console.error("Business registration error:", error);
      throw error;
    }
  };

  // Function to register a delivery agent
  const registerDelivery = async (userData) => {
    try {
      const response = await api.auth.deliveryRegister(userData);
      storeUserData(response.user, 'delivery', response.token);
      return response;
    } catch (error) {
      console.error("Delivery registration error:", error);
      throw error;
    }
  };

  // Function to log in business user
  const loginBusiness = async (credentials) => {
    try {
      const response = await api.auth.businessLogin(credentials);
      if (!response || !response.data || !response.data.user || !response.data.token) {
        console.error("Invalid API response:", response); // Log the full response for debugging
        throw new Error("Invalid response: Failed to retrieve user data during login.");
      }
      const { user, token } = response.data; // Extract user and token from response
      storeUserData(user, 'business', token);
      return response;
    } catch (error) {
      console.error("Error in loginBusiness:", error.message || error);
      throw new Error(
        error.response?.data?.message || // Use API-provided error message if available
        "Login failed. Please check your credentials and try again."
      );
    }
  };

  // Function to log in delivery agent
  const loginDelivery = async (credentials) => {
    try {
      const response = await api.auth.deliveryLogin(credentials);
      
      // Check if we have the correct response structure
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }
      
      const { user, token } = response.data;
      
      if (!user || !token) {
        throw new Error("Invalid user data or token received");
      }
      
      // Store user data properly
      storeUserData(user, 'delivery', token);
      
      return user;
    } catch (error) {
      console.error("Delivery login error:", error);
      throw error;
    }
  };

  // Function to log out user
  const logout = async () => {
    try {
      // If user is a delivery agent, set availability to offline before logging out
      if (userType === 'delivery' && currentUser?.agent_id) {
        await api.delivery.updateAvailabilityStatus(currentUser.agent_id, false);
        console.log('Set availability status to offline on logout');
      }
    } catch (error) {
      console.error('Error setting offline status during logout:', error);
    } finally {
      // Clear React state
      setCurrentUser(null);
      setToken(null);
      setUserType(null);
      
      // Clear all authentication data from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('userData');
      
      // Clear cart data to ensure next user doesn't see previous user's cart
      localStorage.removeItem('cart');
      
      // Clear any other potential remnants
      localStorage.removeItem('cartItems');
      sessionStorage.removeItem('currentUserData');
      
      // Force reload the auth state to ensure everything is cleared
      window.location.href = '/login';
    }
  };

  // Function to update user profile
  const updateProfile = async (userData) => {
    try {
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Call the API to update the profile
      const response = await api.auth.updateProfile(userData, token);
      
      // Update local storage with the updated user data
      const updatedUser = response.user || response;
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      // Update the local state with the updated user data
      setCurrentUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };

  // Get user profile information
  const getUserProfile = (field) => {
    if (!currentUser) return null;
    
    if (field) {
      return currentUser[field] || null;
    }
    
    return currentUser;
  };
  
  // Get formatted profile name (based on user type)
  const getProfileName = () => {
    if (!currentUser) return null;
    
    if (userType === 'business') {
      return currentUser.business_name || 'Business User';
    } else if (userType === 'delivery') {
      return currentUser.name || 'Delivery Partner';
    }
    
    return 'User';
  };

  // Get the current user from the token when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      // If we already have user data in localStorage, use that
      const savedUserData = localStorage.getItem('userData');
      if (savedUserData && savedUserData !== "undefined") {
        try {
          setCurrentUser(JSON.parse(savedUserData));
          setLoading(false);
          return;
        } catch (error) {
          console.error("Error parsing saved user data:", error);
          localStorage.removeItem('userData'); // Remove invalid data
        }
      }
      
      // Otherwise fetch from API if we have a token
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const savedUserType = localStorage.getItem('userType');
        setUserType(savedUserType);
        
        const user = await api.auth.getCurrentUser(token);
        if (user) {
          setCurrentUser(user);
          localStorage.setItem('userData', JSON.stringify(user));
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        // If the token is invalid, clear it
        setToken(null);
        setUserType(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Effect to handle offline status when browser is closed
  useEffect(() => {
    // Only set up the handler if user is a delivery agent
    if (userType === 'delivery' && currentUser?.agent_id) {
      // Function to handle before the page is unloaded (browser closed, refreshed, etc.)
      const handleBeforeUnload = () => {
        // Using navigator.sendBeacon for reliable delivery even during page unload
        const blob = new Blob([JSON.stringify({ status: false })], { type: 'application/json' });
        navigator.sendBeacon(`/api/delivery/availability/${currentUser.agent_id}/offline`, blob);
        console.log('Setting status to offline on page unload');
      };

      // Add the event listener
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      // Clean up function to remove the event listener
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [userType, currentUser]);

  const value = {
    currentUser,
    userType,
    token,
    registerBusiness,
    registerDelivery,
    loginBusiness,
    loginDelivery,
    logout,
    updateProfile,
    getUserProfile,
    getProfileName,
    isAuthenticated: !!token,
    isBusinessUser: userType === 'business',
    isDeliveryUser: userType === 'delivery',
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}