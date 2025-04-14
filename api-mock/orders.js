// Simple mock API service for order data while server issues are being fixed
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Create a new instance of the mock adapter
const mock = new MockAdapter(axios, { delayResponse: 1000 });

// Mock orders data
const mockOrders = [
  {
    id: 1,
    orderNumber: 'ORD-001',
    date: '2023-09-15T10:30:00Z',
    status: 'Completed',
    total: 125.50,
    items: [
      { id: 1, name: 'Product A', quantity: 2, price: 45.00 },
      { id: 2, name: 'Product B', quantity: 1, price: 35.50 }
    ]
  },
  {
    id: 2,
    orderNumber: 'ORD-002',
    date: '2023-09-12T14:45:00Z',
    status: 'Processing',
    total: 89.99,
    items: [
      { id: 3, name: 'Product C', quantity: 1, price: 89.99 }
    ]
  },
  {
    id: 3,
    orderNumber: 'ORD-003',
    date: '2023-09-10T09:15:00Z',
    status: 'Shipped',
    total: 234.75,
    items: [
      { id: 4, name: 'Product D', quantity: 3, price: 78.25 }
    ]
  }
];

// Mock the GET orders/history endpoint
mock.onGet(/\/api\/orders\/history/).reply((config) => {
  console.log('Mock API intercepted request:', config.url);
  
  // Parse query parameters
  const url = new URL(config.url, window.location.origin);
  const sortOption = url.searchParams.get('sort') || 'newest';
  
  // Sort the orders based on the sort option
  let sortedOrders = [...mockOrders];
  if (sortOption === 'newest') {
    sortedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortOption === 'oldest') {
    sortedOrders.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sortOption === 'highest') {
    sortedOrders.sort((a, b) => b.total - a.total);
  } else if (sortOption === 'lowest') {
    sortedOrders.sort((a, b) => a.total - b.total);
  }
  
  return [200, sortedOrders];
});

// Export the mock adapter to be used in main.js or similar initialization file
export default mock;
