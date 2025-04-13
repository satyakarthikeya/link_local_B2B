import React, { createContext, useState, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  const registerBusiness = async (businessData) => {
    setLoading(true);
    try {
      const response = await api.businessRegister(businessData);
      setLoading(false);
      return { success: true, data: response.data };
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || error.message;
      console.log("Business registration error:", error);
      console.log("Error details:", error.response?.data);
      throw new Error(errorMessage);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await api.login(credentials);
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        registerBusiness,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);