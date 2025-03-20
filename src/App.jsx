import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import LoginBusiness from "./pages/LoginBusiness";
import LoginDelivery from "./pages/LoginDelivery";
import RegisterBusiness from "./pages/RegisterBusiness";// Import Register Business
import RegisterDelivery from "./pages/RegisterDelivery";// Import Register Delivery
import D_Homepage from "./pages/D_Homepage"; // Import Delivery Homepage

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login-business" element={<LoginBusiness />} />
        <Route path="/login-delivery" element={<LoginDelivery />} />
        <Route path="/register-business" element={<RegisterBusiness />} />
        <Route path="/register-delivery" element={<RegisterDelivery />} />
        <Route path="/delivery-home" element={<D_Homepage />} /> {/* 🚚 Delivery Agent Home */}
        
      </Routes>
    </Router>
  );
}

export default App;
