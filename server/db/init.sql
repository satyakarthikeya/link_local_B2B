-- Database schema for Link Local B2B application

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS Cart CASCADE;
DROP TABLE IF EXISTS CartItems CASCADE;
DROP TABLE IF EXISTS Reviews CASCADE;
DROP TABLE IF EXISTS Delivery CASCADE;
DROP TABLE IF EXISTS OrderNotifications CASCADE;
DROP TABLE IF EXISTS OrderProducts CASCADE;
DROP TABLE IF EXISTS Orders CASCADE;
DROP TABLE IF EXISTS Product CASCADE;
DROP TABLE IF EXISTS ContactNo CASCADE;
DROP TABLE IF EXISTS BusinessProfile CASCADE;
DROP TABLE IF EXISTS Business_Banking CASCADE;
DROP TABLE IF EXISTS Businessman CASCADE;
DROP TABLE IF EXISTS DeliveryProfile CASCADE;
DROP TABLE IF EXISTS Delivery_Banking CASCADE;
DROP TABLE IF EXISTS DeliveryAgent CASCADE;
DROP TABLE IF EXISTS Deals CASCADE;

-- Base table for Business Users
CREATE TABLE IF NOT EXISTS Businessman (
  businessman_id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Profile Information
CREATE TABLE IF NOT EXISTS BusinessProfile (
  profile_id SERIAL PRIMARY KEY,
  businessman_id INTEGER REFERENCES Businessman(businessman_id) ON DELETE CASCADE,
  business_name VARCHAR(100) NOT NULL,
  owner_name VARCHAR(100) NOT NULL,
  gst_number VARCHAR(20),
  category VARCHAR(100) NOT NULL,
  area VARCHAR(100) NOT NULL,
  street VARCHAR(100) NOT NULL,
  city VARCHAR(100) DEFAULT 'coimbatore',
  state VARCHAR(100) DEFAULT 'tamil nadu',
  pincode VARCHAR(10),
  phone_no VARCHAR(20) NOT NULL,
  website VARCHAR(255),
  established_year INTEGER,
  business_description TEXT,
  UNIQUE(businessman_id)
);

-- Business Banking Details
CREATE TABLE IF NOT EXISTS Business_Banking (
  bank_id SERIAL PRIMARY KEY,
  businessman_id INTEGER REFERENCES Businessman(businessman_id) ON DELETE CASCADE,
  account_holder_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  ifsc_code VARCHAR(20) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  branch_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(businessman_id)
);

-- Base table for Delivery Agents
CREATE TABLE IF NOT EXISTS DeliveryAgent (
  agent_id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Delivery Agent Profile Information
CREATE TABLE IF NOT EXISTS DeliveryProfile (
  profile_id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES DeliveryAgent(agent_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  gender VARCHAR(10),
  date_of_birth DATE,
  area VARCHAR(100) NOT NULL,
  street VARCHAR(100),
  city VARCHAR(100) DEFAULT 'coimbatore',
  state VARCHAR(100) DEFAULT 'tamil nadu',
  pincode VARCHAR(10),
  vehicle_type VARCHAR(50) NOT NULL,
  vehicle_number VARCHAR(50),
  license_no VARCHAR(50) NOT NULL,
  about TEXT,
  availability_status VARCHAR(20) DEFAULT 'Available',
  avg_rating NUMERIC(3,2) DEFAULT 0.0,
  total_deliveries INTEGER DEFAULT 0,
  UNIQUE(agent_id)
);

-- Delivery Agent Banking Details
CREATE TABLE IF NOT EXISTS Delivery_Banking (
  bank_id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES DeliveryAgent(agent_id) ON DELETE CASCADE,
  account_holder_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  ifsc_code VARCHAR(20) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  branch_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(agent_id)
);

-- Create Product table
CREATE TABLE IF NOT EXISTS Product (
  product_id SERIAL PRIMARY KEY,
  businessman_id INTEGER NOT NULL REFERENCES Businessman(businessman_id) ON DELETE CASCADE,
  product_name VARCHAR(100) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  quantity_available INTEGER NOT NULL DEFAULT 0,
  moq INTEGER NOT NULL DEFAULT 1,
  reorder_point INTEGER NOT NULL DEFAULT 10,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Orders table
CREATE TABLE IF NOT EXISTS Orders (
  order_id SERIAL PRIMARY KEY,
  ordering_businessman_id INTEGER NOT NULL REFERENCES Businessman(businessman_id) ON DELETE CASCADE,
  supplying_businessman_id INTEGER NOT NULL REFERENCES Businessman(businessman_id) ON DELETE CASCADE,
  agent_id INTEGER REFERENCES DeliveryAgent(agent_id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Requested',
  delivery_status VARCHAR(20) DEFAULT 'Pending',
  total_amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT different_businessmen CHECK (ordering_businessman_id != supplying_businessman_id)
);

-- Create Order Products junction table
CREATE TABLE IF NOT EXISTS OrderProducts (
  order_product_id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES Orders(order_id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES Product(product_id) ON DELETE CASCADE,
  quantity_requested INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Delivery tracking table
CREATE TABLE IF NOT EXISTS Delivery (
  delivery_id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES Orders(order_id) ON DELETE CASCADE,
  agent_id INTEGER NOT NULL REFERENCES DeliveryAgent(agent_id) ON DELETE CASCADE,
  pickup_time TIMESTAMP,
  delivery_time TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'Assigned',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Deals table
CREATE TABLE IF NOT EXISTS Deals (
    deal_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES Product(product_id) ON DELETE CASCADE,
    businessman_id INTEGER NOT NULL REFERENCES BusinessProfile(businessman_id) ON DELETE CASCADE,
    deal_type VARCHAR(50) NOT NULL CHECK (deal_type IN ('DISCOUNT', 'BUY_ONE_GET_ONE', 'BUNDLE', 'CLEARANCE', 'FLASH_SALE')),
    deal_title VARCHAR(100) NOT NULL,
    deal_description TEXT,
    discount_percentage DECIMAL(5,2),
    discount_amount DECIMAL(10,2),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure discount_percentage or discount_amount is provided for DISCOUNT type
    CONSTRAINT check_discount CHECK (
        deal_type != 'DISCOUNT' OR
        (discount_percentage IS NOT NULL OR discount_amount IS NOT NULL)
    ),
    
    -- Ensure start_date is before end_date if both are provided
    CONSTRAINT check_dates CHECK (
        end_date IS NULL OR 
        start_date IS NULL OR
        start_date <= end_date
    )
);

-- Create OrderNotifications table for delivery agents
CREATE TABLE IF NOT EXISTS OrderNotifications (
    notification_id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES Orders(order_id) ON DELETE CASCADE,
    agent_id INTEGER NOT NULL REFERENCES DeliveryAgent(agent_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected', 'Expired')),
    notification_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_order_agent_notification UNIQUE (order_id, agent_id)
);

-- Create Reviews table
CREATE TABLE IF NOT EXISTS Reviews (
  review_id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES Orders(order_id) ON DELETE CASCADE,
  reviewer_id INTEGER NOT NULL REFERENCES Businessman(businessman_id) ON DELETE CASCADE,
  business_id INTEGER NOT NULL REFERENCES Businessman(businessman_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_order_review UNIQUE (order_id, reviewer_id)
);

-- Create Cart table (stores active shopping carts)
CREATE TABLE IF NOT EXISTS Cart (
  cart_id SERIAL PRIMARY KEY,
  businessman_id INTEGER NOT NULL REFERENCES Businessman(businessman_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_businessman_cart UNIQUE (businessman_id)
);

-- Create CartItems table (stores items in a cart)
CREATE TABLE IF NOT EXISTS CartItems (
  cart_item_id SERIAL PRIMARY KEY,
  cart_id INTEGER NOT NULL REFERENCES Cart(cart_id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES Product(product_id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_cart_product UNIQUE (cart_id, product_id)
);

-- Create indexes for performance
CREATE INDEX idx_product_businessman ON Product(businessman_id);
CREATE INDEX idx_orders_ordering_businessman ON Orders(ordering_businessman_id);
CREATE INDEX idx_orders_supplying_businessman ON Orders(supplying_businessman_id);
CREATE INDEX idx_orders_agent ON Orders(agent_id);
CREATE INDEX idx_order_products_order ON OrderProducts(order_id);
CREATE INDEX idx_order_products_product ON OrderProducts(product_id);
CREATE INDEX idx_delivery_order ON Delivery(order_id);
CREATE INDEX idx_delivery_agent ON Delivery(agent_id);
CREATE INDEX idx_businessman_email ON Businessman(email);
CREATE INDEX idx_delivery_agent_email ON DeliveryAgent(email);
CREATE INDEX idx_business_profile_area ON BusinessProfile(area);
CREATE INDEX idx_delivery_profile_area ON DeliveryProfile(area);
CREATE INDEX idx_deals_product_id ON Deals(product_id);
CREATE INDEX idx_deals_businessman_id ON Deals(businessman_id);
CREATE INDEX idx_deals_is_active ON Deals(is_active);
CREATE INDEX idx_deals_is_featured ON Deals(is_featured);
CREATE INDEX idx_reviews_business_id ON Reviews(business_id);
CREATE INDEX idx_reviews_order_id ON Reviews(order_id);
CREATE INDEX idx_cart_businessman_id ON Cart(businessman_id);
CREATE INDEX idx_cart_items_cart_id ON CartItems(cart_id);
CREATE INDEX idx_cart_items_product_id ON CartItems(product_id);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update timestamp triggers to relevant tables
CREATE TRIGGER update_businessman_modtime
BEFORE UPDATE ON Businessman
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_product_modtime
BEFORE UPDATE ON Product
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_orders_modtime
BEFORE UPDATE ON Orders
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_delivery_modtime
BEFORE UPDATE ON Delivery
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_delivery_agent_modtime
BEFORE UPDATE ON DeliveryAgent
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_deals_updated_at
BEFORE UPDATE ON Deals
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Apply update timestamp triggers to new tables
CREATE TRIGGER update_reviews_modtime
BEFORE UPDATE ON Reviews
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_cart_modtime
BEFORE UPDATE ON Cart
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_cart_items_modtime
BEFORE UPDATE ON CartItems
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_order_notifications_modtime
BEFORE UPDATE ON OrderNotifications
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();