-- Database schema for Link Local B2B application

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS Delivery CASCADE;
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
  city VARCHAR(100) DEFAULT 'Coimbatore',
  state VARCHAR(100) DEFAULT 'Tamil Nadu',
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
  city VARCHAR(100) DEFAULT 'Coimbatore',
  state VARCHAR(100) DEFAULT 'Tamil Nadu',
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