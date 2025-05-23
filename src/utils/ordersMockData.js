// Mock orders data for fallback when API is not available

// Generate current date and past dates
const now = new Date();
const today = now.toISOString();
const yesterday = new Date(now.setDate(now.getDate() - 1)).toISOString();
const lastWeek = new Date(now.setDate(now.getDate() - 6)).toISOString();
const twoWeeksAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();

// Enhanced mock orders data for order history
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
