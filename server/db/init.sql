-- Drop tables if they exist to avoid conflicts
DROP TABLE IF EXISTS Deals;
DROP TABLE IF EXISTS Rating;
DROP TABLE IF EXISTS Contacts;
DROP TABLE IF EXISTS Delivery_Agent;
DROP TABLE IF EXISTS Requests;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Product;
DROP TABLE IF EXISTS ContactNo;
DROP TABLE IF EXISTS Businessman;

-- Create tables according to the schema
CREATE TABLE Businessman (
  businessman_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  area VARCHAR(255),
  street VARCHAR(255),
  category VARCHAR(50) CHECK (category IN ('Restaurant', 'Clothing', 'SuperMarket', 'Electronics', 'Wholesale')),
  rating FLOAT DEFAULT 0,
  product_id INT,
  order_id INT,
  rating_id INT,
  deal_id INT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE ContactNo (
  businessman_id INT REFERENCES Businessman(businessman_id) ON DELETE CASCADE,
  phone_no VARCHAR(15),
  PRIMARY KEY (businessman_id, phone_no)
);

CREATE TABLE Product (
  product_id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity_available INT CHECK (quantity_available >= 0),
  businessman_id INT REFERENCES Businessman(businessman_id) ON DELETE CASCADE,
  rating_id INT,
  description TEXT,
  image_url VARCHAR(255)
);

CREATE TABLE Orders (
  order_id SERIAL PRIMARY KEY,
  requesting_businessman_id INT REFERENCES Businessman(businessman_id) ON DELETE CASCADE,
  supplying_businessman_id INT REFERENCES Businessman(businessman_id) ON DELETE CASCADE,
  product_id INT REFERENCES Product(product_id) ON DELETE CASCADE,
  quantity_requested INT CHECK (quantity_requested > 0),
  status VARCHAR(20) CHECK (status IN ('Requested', 'Confirmed', 'Dispatched', 'Delivered')),
  order_date DATE DEFAULT CURRENT_DATE,
  agent_id INT,
  delivery_status VARCHAR(20) CHECK (delivery_status IN ('Accepted', 'In Transit', 'Delivered'))
);

CREATE TABLE Requests (
  businessman_id INT REFERENCES Businessman(businessman_id) ON DELETE CASCADE,
  product_id INT REFERENCES Product(product_id) ON DELETE CASCADE,
  PRIMARY KEY (businessman_id, product_id)
);

CREATE TABLE Delivery_Agent (
  agent_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_number VARCHAR(15) UNIQUE NOT NULL,
  availability_status BOOLEAN DEFAULT TRUE,
  vehicle_type VARCHAR(20) CHECK (vehicle_type IN ('Bike', 'Van', 'Truck')),
  license_no VARCHAR(20) UNIQUE NOT NULL,
  order_id INT REFERENCES Orders(order_id) ON DELETE SET NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE Contacts (
  businessman_id INT REFERENCES Businessman(businessman_id) ON DELETE CASCADE,
  agent_id INT REFERENCES Delivery_Agent(agent_id) ON DELETE CASCADE,
  PRIMARY KEY (businessman_id, agent_id)
);

CREATE TABLE Rating (
  rating_id SERIAL PRIMARY KEY,
  product_id INT REFERENCES Product(product_id) ON DELETE CASCADE,
  businessman_id INT REFERENCES Businessman(businessman_id) ON DELETE CASCADE,
  rating_value INT CHECK (rating_value BETWEEN 1 AND 5)
);

CREATE TABLE Deals (
  deal_id SERIAL PRIMARY KEY,
  product_id INT REFERENCES Product(product_id) ON DELETE CASCADE,
  businessman_id INT REFERENCES Businessman(businessman_id) ON DELETE CASCADE,
  discount_percentage DECIMAL(5,2) CHECK (discount_percentage BETWEEN 0 AND 100),
  valid_till DATE NOT NULL
);