import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import CartProvider from './context/CartContext';
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import LoginBusiness from "./pages/LoginBusiness";
import LoginDelivery from "./pages/LoginDelivery";
import RegisterBusiness from "./pages/RegisterBusiness";
import RegisterDelivery from "./pages/RegisterDelivery";
import D_Homepage from "./pages/D_Homepage";
import D_MapView from "./pages/D_MapView";
import D_ProfilePage from "./pages/D_ProfilePage";
import MyShop from "./pages/Myshop";
import B_Homepage from "./pages/B_Homepage";
import B_ProfilePage from "./pages/B_ProfilePage";
import SearchResults from "./pages/SearchResults";
import OrderHistory from "./pages/OrderHistory";

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login-business" element={<LoginBusiness />} />
            <Route path="/login-delivery" element={<LoginDelivery />} />
            <Route path="/register-business" element={<RegisterBusiness />} />
            <Route path="/register-delivery" element={<RegisterDelivery />} />
            <Route path="/delivery-home" element={<D_Homepage />} />
            <Route path="/map-view" element={<D_MapView />} />
            <Route path="/delivery-profile" element={<D_ProfilePage />} />
            <Route path="/business-home" element={<B_Homepage />} />
            <Route path="/business-home/my-shop" element={<MyShop />} />
            <Route path="/business-profile" element={<B_ProfilePage />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/business-home/notifications" element={<div>Notifications Page</div>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;