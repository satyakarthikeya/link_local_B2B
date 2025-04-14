// Mock data service for development when backend API is unavailable

export const mockDeliveryData = {
  // Mock available orders nearby for delivery agents
  nearbyOrders: [
    {
      order_id: "ORD10001",
      supplying_business_name: "Fresh Grocers",
      supplying_area: "Koramangala",
      ordering_business_name: "Cafe Bistro",
      ordering_area: "Indiranagar",
      ordering_phone: "9876543210",
      created_at: new Date(Date.now() - 30 * 60000).toISOString(),
      product_name: "Fresh Vegetables Assortment",
      quantity_requested: 5,
      total_amount: 2500.00,
      notes: "Please deliver before lunch hour"
    },
    {
      order_id: "ORD10002",
      supplying_business_name: "Organic Farms",
      supplying_area: "JP Nagar",
      ordering_business_name: "Health Kitchen",
      ordering_area: "HSR Layout",
      ordering_phone: "9876543211",
      created_at: new Date(Date.now() - 45 * 60000).toISOString(),
      product_name: "Organic Fruits Bundle",
      quantity_requested: 3,
      total_amount: 1800.00,
      notes: "Handle with care"
    },
    {
      order_id: "ORD10003",
      supplying_business_name: "City Bakery",
      supplying_area: "Whitefield",
      ordering_business_name: "Coffee House",
      ordering_area: "MG Road",
      ordering_phone: "9876543212",
      created_at: new Date(Date.now() - 15 * 60000).toISOString(),
      product_name: "Fresh Bread Assortment",
      quantity_requested: 10,
      total_amount: 1200.00,
      notes: "Need urgently"
    }
  ],
  
  // Mock current orders assigned to the delivery agent
  currentOrders: [
    {
      order_id: "ORD9998",
      status: "Assigned",
      delivery_status: "PickedUp",
      supplying_business_name: "Metro Wholesalers",
      supplying_area: "Electronic City",
      ordering_business_name: "Corner Store",
      ordering_area: "Marathahalli",
      ordering_phone: "9876543213",
      created_at: new Date(Date.now() - 60 * 60000).toISOString(),
      product_name: "Snack Items",
      quantity_requested: 20,
      total_amount: 3500.00
    }
  ],
  
  // Mock dashboard statistics
  dashboardStats: {
    earnings: {
      today: "₹850",
      weekly: "₹4,200",
      monthly: "₹18,500"
    },
    orders: {
      active: 1,
      completed: 42,
      total: 43
    },
    rating: 4.8,
    metrics: {
      completionRate: 98,
      onTimeRate: 95
    }
  },
  
  // Mock profile data
  profile: {
    agent_id: 1,
    name: "Rahul Kumar",
    email: "rahul@example.com",
    contact_number: "9876543210",
    vehicle_type: "Motorcycle",
    license_no: "DL123456789",
    availability_status: "Available"
  }
};

// Helper function to simulate API responses with delay
export const mockApiCall = (data, delay = 500, shouldSucceed = true) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldSucceed) {
        resolve({ data });
      } else {
        reject(new Error("Mock API call failed"));
      }
    }, delay);
  });
};
