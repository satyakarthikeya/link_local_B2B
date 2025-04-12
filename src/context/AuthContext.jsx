import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null); // 'business' or 'delivery'
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);

  // Function to register a business
  const registerBusiness = async (userData) => {
    try {
      const response = await api.auth.businessRegister(userData);
      setToken(response.token);
      setCurrentUser(response.user);
      setUserType('business');
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userType', 'business');
      return response;
    } catch (error) {
      console.error("Business registration error:", error);
      throw error;
    }
  };

  // Function to register a delivery agent
  const registerDelivery = async (userData) => {
    try {
      const response = await api.auth.deliveryRegister(userData);
      setToken(response.token);
      setCurrentUser(response.user);
      setUserType('delivery');
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userType', 'delivery');
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
      setToken(response.token);
      setCurrentUser(response.user);
      setUserType('business');
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userType', 'business');
      return response;
    } catch (error) {
      console.error("Business login error:", error);
      throw error;
    }
  };

  // Function to log in delivery agent
  const loginDelivery = async (credentials) => {
    try {
      const response = await api.auth.deliveryLogin(credentials);
      setToken(response.token);
      setCurrentUser(response.user);
      setUserType('delivery');
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userType', 'delivery');
      return response;
    } catch (error) {
      console.error("Delivery login error:", error);
      throw error;
    }
  };

  // Function to log out user
  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    setUserType(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
  };

  // Function to update user profile
  const updateProfile = async (userData) => {
    try {
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Call the API to update the profile
      const updatedUser = await api.auth.updateProfile(userData, token);
      
      // Update the local state with the updated user data
      setCurrentUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };

  // Get the current user from the token when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const savedUserType = localStorage.getItem('userType');
        setUserType(savedUserType);
        
        const user = await api.auth.getCurrentUser(token);
        setCurrentUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        // If the token is invalid, clear it
        setToken(null);
        setUserType(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userType');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

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
    isAuthenticated: !!token,
    isBusinessUser: userType === 'business',
    isDeliveryUser: userType === 'delivery'
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