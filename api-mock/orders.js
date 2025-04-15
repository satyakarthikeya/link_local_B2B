// Mock API service for order history and delivery agent functionality
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Create a new instance of the mock adapter
const mock = new MockAdapter(axios, { delayResponse: 800 });

// Mock business profiles
const businesses = [
  { id: 1, name: "Sunrise Electronics", area: "Jayanagar", city: "Bangalore" },
  { id: 2, name: "Kenny's Apparel", area: "Koramangala", city: "Bangalore" },
  { id: 3, name: "SS Restaurant Supplies", area: "Indiranagar", city: "Bangalore" },
  { id: 4, name: "Lulu Market", area: "Whitefield", city: "Bangalore" }
];

// Mock delivery agents
const deliveryAgents = [
  { id: 101, name: "Rahul K", contact_number: "9876543210", vehicle_type: "Bike", availability_status: "Available" },
  { id: 102, name: "Suresh M", contact_number: "9876543211", vehicle_type: "Van", availability_status: "Available" },
  { id: 103, name: "Deepak R", contact_number: "9876543212", vehicle_type: "Bike", availability_status: "Unavailable" }
];

// Generate current date and past dates
const now = new Date();
const today = now.toISOString();
const yesterday = new Date(now.setDate(now.getDate() - 1)).toISOString();
const lastWeek = new Date(now.setDate(now.getDate() - 6)).toISOString();
const twoWeeksAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();

// Mock products
const mockProducts = [
  { id: 1, name: 'JK Copier A4 Sheets', price: 299.99, image_url: '/src/assests/Jk copier.jpeg', category: 'Stationery' },
  { id: 2, name: 'Premium Cotton T-shirt', price: 599.50, image_url: '/src/assests/cotton.jpeg', category: 'Apparel' },
  { id: 3, name: 'Wireless Headphones', price: 1499.99, image_url: '/src/assests/headphones.jpeg', category: 'Electronics' },
  { id: 4, name: 'Organic Honey 500g', price: 349.75, image_url: '/src/assests/honey.jpeg', category: 'Grocery' },
  { id: 5, name: 'Rice 5kg Pack', price: 449.99, image_url: '/src/assests/rice bags.jpeg', category: 'Grocery' },
  { id: 6, name: 'Silk Thread Set', price: 199.50, image_url: '/src/assests/silk thread.jpeg', category: 'Craft' }
];

// Enhanced mock orders data for order history - primarily for the OrderHistory.jsx page
export const mockOrderHistory = [
  {
    order_id: 10001,
    order_number: 'ORD-10001',
    created_at: today,
    updated_at: today,
    status: 'Delivered',
    delivery_status: 'Delivered',
    total_amount: 599.50,
    ordering_businessman_id: 1,
    supplying_businessman_id: 2,
    agent_id: 101,
    ordering_business_name: "Sunrise Electronics",
    supplying_business_name: "Kenny's Apparel",
    ordering_area: "Jayanagar",
    ordering_city: "Bangalore",
    supplying_area: "Koramangala",
    supplying_city: "Bangalore",
    ordering_street: "123 Main St",
    supplying_street: "456 Market Ave",
    agent_name: "Rahul K",
    agent_contact: "9876543210",
    vehicle_type: "Bike",
    shipping_address: "123 Main St, Jayanagar, Bangalore",
    product_name: 'Premium Cotton T-shirt',
    price: 599.50,
    quantity_requested: 1,
    unit_price: 599.50,
    subtotal: 599.50,
    image_url: '/src/assests/cotton.jpeg',
    payment_method: "UPI",
    rating: 4,
    comment: "Good quality product, timely delivery",
    review_date: today
  },
  {
    order_id: 10002,
    order_number: 'ORD-10002',
    created_at: yesterday,
    updated_at: yesterday,
    status: 'Delivered',
    delivery_status: 'Delivered',
    total_amount: 1499.99,
    ordering_businessman_id: 1,
    supplying_businessman_id: 3,
    agent_id: 101,
    ordering_business_name: "Sunrise Electronics",
    supplying_business_name: "SS Restaurant Supplies",
    ordering_area: "Jayanagar",
    ordering_city: "Bangalore",
    supplying_area: "Indiranagar",
    supplying_city: "Bangalore",
    ordering_street: "123 Main St",
    supplying_street: "789 Food St",
    agent_name: "Rahul K",
    agent_contact: "9876543210",
    vehicle_type: "Bike",
    shipping_address: "123 Main St, Jayanagar, Bangalore",
    product_name: 'Wireless Headphones',
    price: 1499.99,
    quantity_requested: 1,
    unit_price: 1499.99,
    subtotal: 1499.99,
    image_url: '/src/assests/headphones.jpeg',
    payment_method: "UPI"
  },
  {
    order_id: 10003,
    order_number: 'ORD-10003',
    created_at: lastWeek,
    updated_at: lastWeek,
    status: 'Cancelled',
    delivery_status: 'Cancelled',
    total_amount: 349.75,
    ordering_businessman_id: 1,
    supplying_businessman_id: 4,
    agent_id: null,
    ordering_business_name: "Sunrise Electronics",
    supplying_business_name: "Lulu Market",
    ordering_area: "Jayanagar",
    ordering_city: "Bangalore",
    supplying_area: "Whitefield",
    supplying_city: "Bangalore",
    ordering_street: "123 Main St",
    supplying_street: "321 Market St",
    shipping_address: "123 Main St, Jayanagar, Bangalore",
    product_name: 'Organic Honey 500g',
    price: 349.75,
    quantity_requested: 1,
    unit_price: 349.75,
    subtotal: 349.75,
    image_url: '/src/assests/honey.jpeg',
    payment_method: "Cash"
  },
  {
    order_id: 10004,
    order_number: 'ORD-10004',
    created_at: twoWeeksAgo,
    updated_at: twoWeeksAgo,
    status: 'Delivered',
    delivery_status: 'Delivered',
    total_amount: 1349.97,
    ordering_businessman_id: 1,
    supplying_businessman_id: 4,
    agent_id: 102,
    ordering_business_name: "Sunrise Electronics",
    supplying_business_name: "Lulu Market",
    ordering_area: "Jayanagar",
    ordering_city: "Bangalore",
    supplying_area: "Whitefield",
    supplying_city: "Bangalore",
    ordering_street: "123 Main St",
    supplying_street: "321 Market St",
    agent_name: "Suresh M",
    agent_contact: "9876543211",
    vehicle_type: "Van",
    shipping_address: "123 Main St, Jayanagar, Bangalore",
    product_name: 'Rice 5kg Pack',
    price: 449.99,
    quantity_requested: 3,
    unit_price: 449.99,
    subtotal: 1349.97,
    image_url: '/src/assests/rice bags.jpeg',
    payment_method: "UPI",
    rating: 5,
    comment: "Excellent product quality!",
    review_date: twoWeeksAgo
  },
  {
    order_id: 10005,
    order_number: 'ORD-10005',
    created_at: yesterday,
    updated_at: yesterday,
    status: 'Confirmed',
    delivery_status: 'Assigned',
    total_amount: 599.50,
    ordering_businessman_id: 1,
    supplying_businessman_id: 2,
    agent_id: 101,
    ordering_business_name: "Sunrise Electronics",
    supplying_business_name: "Kenny's Apparel",
    ordering_area: "Jayanagar",
    ordering_city: "Bangalore",
    supplying_area: "Koramangala",
    supplying_city: "Bangalore",
    ordering_street: "123 Main St",
    supplying_street: "456 Market Ave",
    agent_name: "Rahul K",
    agent_contact: "9876543210",
    vehicle_type: "Bike",
    shipping_address: "123 Main St, Jayanagar, Bangalore",
    product_name: 'Premium Cotton T-shirt',
    price: 599.50,
    quantity_requested: 1,
    unit_price: 599.50,
    subtotal: 599.50,
    image_url: '/src/assests/cotton.jpeg',
    payment_method: "UPI"
  },
  {
    order_id: 10006,
    order_number: 'ORD-10006',
    created_at: today,
    updated_at: today,
    status: 'Requested',
    delivery_status: 'Pending',
    total_amount: 299.99,
    ordering_businessman_id: 1,
    supplying_businessman_id: 3,
    agent_id: null,
    ordering_business_name: "Sunrise Electronics",
    supplying_business_name: "SS Restaurant Supplies",
    ordering_area: "Jayanagar",
    ordering_city: "Bangalore",
    supplying_area: "Indiranagar",
    supplying_city: "Bangalore",
    ordering_street: "123 Main St",
    supplying_street: "789 Food St",
    shipping_address: "123 Main St, Jayanagar, Bangalore",
    product_name: 'JK Copier A4 Sheets',
    price: 299.99,
    quantity_requested: 1,
    unit_price: 299.99,
    subtotal: 299.99,
    image_url: '/src/assests/Jk copier.jpeg',
    payment_method: "Cash"
  }
];

// Mock delivery agent's order history
export const mockDeliveryOrderHistory = [
  {
    order_id: 50001,
    order_number: 'ORD-50001',
    created_at: yesterday,
    status: 'Delivered',
    delivery_status: 'Delivered',
    total_amount: 2997.50,
    ordering_businessman_id: 1,
    supplying_businessman_id: 2,
    ordering_business_name: "Sunrise Electronics",
    supplying_business_name: "Kenny's Apparel",
    ordering_area: "Jayanagar",
    ordering_city: "Bangalore",
    supplying_area: "Koramangala",
    supplying_city: "Bangalore",
    ordering_street: "123 Main St",
    supplying_street: "456 Market Ave",
    pickup_address: "Shop 12, Koramangala Complex, Bangalore",
    delivery_address: "123 Main St, Jayanagar, Bangalore",
    product_name: 'Premium Cotton T-shirt',
    price: 599.50,
    quantity_requested: 5,
    unit_price: 599.50,
    subtotal: 2997.50,
    earnings: "₹150",
    pickup_time: yesterday,
    delivery_time: yesterday
  },
  {
    order_id: 50002,
    order_number: 'ORD-50002',
    created_at: lastWeek,
    status: 'Delivered',
    delivery_status: 'Delivered',
    total_amount: 1499.99,
    ordering_businessman_id: 1,
    supplying_businessman_id: 3,
    ordering_business_name: "Sunrise Electronics",
    supplying_business_name: "SS Restaurant Supplies",
    ordering_area: "Jayanagar",
    ordering_city: "Bangalore",
    supplying_area: "Indiranagar",
    supplying_city: "Bangalore",
    ordering_street: "123 Main St",
    supplying_street: "789 Food St",
    pickup_address: "45 Park Lane, Indiranagar, Bangalore",
    delivery_address: "123 Main St, Jayanagar, Bangalore",
    product_name: 'Wireless Headphones',
    price: 1499.99,
    quantity_requested: 1,
    unit_price: 1499.99,
    subtotal: 1499.99,
    earnings: "₹75",
    pickup_time: lastWeek,
    delivery_time: lastWeek
  },
  {
    order_id: 50003,
    order_number: 'ORD-50003',
    created_at: yesterday,
    status: 'Cancelled',
    delivery_status: 'Cancelled',
    total_amount: 899.25,
    ordering_businessman_id: 3,
    supplying_businessman_id: 2,
    ordering_business_name: "SS Restaurant Supplies",
    supplying_business_name: "Kenny's Apparel",
    ordering_area: "Indiranagar",
    ordering_city: "Bangalore",
    supplying_area: "Koramangala",
    supplying_city: "Bangalore",
    ordering_street: "789 Food St",
    supplying_street: "456 Market Ave",
    product_name: 'Premium Cotton T-shirt',
    price: 599.50,
    quantity_requested: 1.5,
    unit_price: 599.50,
    subtotal: 899.25,
    earnings: "₹0",
    cancel_reason: "Customer requested cancellation"
  }
];

// Function to get filtered orders based on params
const getFilteredOrders = (orders, params) => {
  let filteredOrders = [...orders];
  
  // Filter by status if provided
  if (params.status) {
    filteredOrders = filteredOrders.filter(order => 
      order.status.toLowerCase() === params.status.toLowerCase() || 
      order.delivery_status.toLowerCase() === params.status.toLowerCase()
    );
  }
  
  // Filter by role if provided (for business users)
  if (params.role) {
    const businessId = parseInt(params.businessId || 1);
    
    if (params.role === 'ordering') {
      filteredOrders = filteredOrders.filter(order => order.ordering_businessman_id === businessId);
    } else if (params.role === 'supplying') {
      filteredOrders = filteredOrders.filter(order => order.supplying_businessman_id === businessId);
    }
  }
  
  // Filter by date range if provided
  if (params.start_date) {
    const startDate = new Date(params.start_date);
    filteredOrders = filteredOrders.filter(order => new Date(order.created_at) >= startDate);
  }
  
  if (params.end_date) {
    const endDate = new Date(params.end_date);
    filteredOrders = filteredOrders.filter(order => new Date(order.created_at) <= endDate);
  }
  
  // Sort based on the sort parameter
  if (params.sort) {
    if (params.sort === 'newest') {
      filteredOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (params.sort === 'oldest') {
      filteredOrders.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (params.sort === 'highToLow') {
      filteredOrders.sort((a, b) => b.total_amount - a.total_amount);
    } else if (params.sort === 'lowToHigh') {
      filteredOrders.sort((a, b) => a.total_amount - b.total_amount);
    }
  } else {
    // Default sort by newest
    filteredOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  
  return filteredOrders;
};

// Helper to parse URL search params
const parseParams = (url) => {
  const searchParams = new URL(url, 'http://dummy.com').searchParams;
  const params = {};
  
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  
  return params;
};

// ===== MOCK API ENDPOINTS =====

// 1. Order History - Fix for the 404 error by intercepting both URL patterns
mock.onGet(/\/orders\/history/).reply((config) => {
  console.log('Mock API - Order History:', config.url);
  const params = parseParams(config.url);
  
  // Different response based on user type (business vs delivery)
  if (params.user_type === 'delivery') {
    const filteredOrders = getFilteredOrders(mockDeliveryOrderHistory, params);
    return [200, filteredOrders];
  } else {
    // Default to business user
    const filteredOrders = getFilteredOrders(mockOrderHistory, params);
    return [200, filteredOrders];
  }
});

// Also intercept the alternative API pattern with /api/ prefix
mock.onGet(/\/api\/orders\/history/).reply((config) => {
  console.log('Mock API - Order History (alternative path):', config.url);
  const params = parseParams(config.url);
  
  if (params.user_type === 'delivery') {
    const filteredOrders = getFilteredOrders(mockDeliveryOrderHistory, params);
    return [200, filteredOrders];
  } else {
    const filteredOrders = getFilteredOrders(mockOrderHistory, params);
    return [200, filteredOrders];
  }
});

// 2. Delivery Order History endpoint
mock.onGet(/\/delivery\/orders\/history/).reply((config) => {
  console.log('Mock API - Delivery Order History:', config.url);
  const params = parseParams(config.url);
  const filteredOrders = getFilteredOrders(mockDeliveryOrderHistory, params);
  return [200, filteredOrders];
});

export default mock;
