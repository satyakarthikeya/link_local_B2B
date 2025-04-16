import React, { useEffect, useState } from "react";
import D_Navbar from "../components/D_Navbar";
import D_Footer from "../components/D_Footer";
import "../styles/delivery_home.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const D_MapView = () => {
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState({
    lat: 11.0168, // Default to coimbatore coordinates
    lng: 76.9558
  });
  
  // Sample delivery locations data (in production, this would come from an API)
  const deliveryLocations = [
    {
      id: "OD12345",
      name: "Sunrise Stationers",
      address: "RS Puram, coimbatore",
      lat: 11.0132,
      lng: 76.9462,
      status: "pickup"
    },
    {
      id: "OD12345-D",
      name: "Chennai Silks",
      address: "Gandhipuram, coimbatore",
      lat: 11.0187,
      lng: 76.9675,
      status: "dropoff"
    },
    {
      id: "OD12346",
      name: "Lulu Market",
      address: "Avinashi Road, coimbatore",
      lat: 11.0319,
      lng: 77.0298,
      status: "pickup"
    },
    {
      id: "OD12346-D",
      name: "SS Hypermarket",
      address: "Peelamedu, coimbatore",
      lat: 11.0235,
      lng: 77.0026,
      status: "dropoff"
    }
  ];

  useEffect(() => {
    // In a real implementation, we would load an actual map API like Google Maps
    // For now, we'll simulate the loading of a map
    
    // Get user's current location if possible
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
        }
      );
    } else {
      console.log("Geolocation not supported by this browser");
      setLoading(false);
    }
  }, []);

  const handleBackToDashboard = () => {
    window.history.back();
  };

  return (
    <>
      <D_Navbar />

      <div className="map-page">
        <div className="container">
          <div className="map-header">
            <button className="back-btn" onClick={handleBackToDashboard}>
              <i className="fas fa-arrow-left"></i> Back to Dashboard
            </button>
            <h1><i className="fas fa-map-marked-alt"></i> Delivery Map</h1>
            <p>View all your pending deliveries and optimal routes</p>
          </div>

          <div className="map-controls">
            <div className="map-filter">
              <span>Filter:</span>
              <select className="map-select">
                <option value="all">All Deliveries</option>
                <option value="pending">Pending Pickups</option>
                <option value="active">In Transit</option>
              </select>
            </div>
            <button className="refresh-btn">
              <i className="fas fa-sync-alt"></i> Refresh Map
            </button>
          </div>

          <div className="full-map-container">
            {loading ? (
              <div className="map-loading">
                <i className="fas fa-circle-notch fa-spin"></i>
                <p>Loading map...</p>
              </div>
            ) : (
              <div className="map-content">
                <div className="map-placeholder">
                  <i className="fas fa-map-marked-alt"></i>
                  <p>Interactive map showing current deliveries and optimal routes</p>
                  <p className="map-note">Current location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="delivery-locations">
            <h2>Active Delivery Points</h2>
            <div className="locations-list">
              {deliveryLocations.map((loc) => (
                <div className={`location-card ${loc.status}`} key={loc.id}>
                  <div className="location-icon">
                    {loc.status === "pickup" ? (
                      <i className="fas fa-store"></i>
                    ) : (
                      <i className="fas fa-map-marker-alt"></i>
                    )}
                  </div>
                  <div className="location-details">
                    <h3>{loc.name}</h3>
                    <p>{loc.address}</p>
                    <div className="location-meta">
                      <span className="location-tag">
                        {loc.status === "pickup" ? "Pickup Point" : "Delivery Point"}
                      </span>
                      <button className="navigate-btn">
                        <i className="fas fa-directions"></i> Navigate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <D_Footer />
    </>
  );
};

export default D_MapView;