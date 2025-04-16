-- Create Cart table
CREATE TABLE IF NOT EXISTS Cart (
  cart_id SERIAL PRIMARY KEY,
  businessman_id INTEGER NOT NULL REFERENCES BusinessProfile(businessman_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(businessman_id)
);

-- Create CartItems table to store items in cart
CREATE TABLE IF NOT EXISTS CartItems (
  cart_item_id SERIAL PRIMARY KEY,
  cart_id INTEGER NOT NULL REFERENCES Cart(cart_id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES Product(product_id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cart_id, product_id)
);

-- Create Reviews table
CREATE TABLE IF NOT EXISTS Reviews (
  review_id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES Orders(order_id) ON DELETE CASCADE,
  reviewer_id INTEGER NOT NULL REFERENCES BusinessProfile(businessman_id) ON DELETE CASCADE,
  business_id INTEGER NOT NULL REFERENCES BusinessProfile(businessman_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(order_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_cart_businessman ON Cart(businessman_id);
CREATE INDEX IF NOT EXISTS idx_cartitems_cart ON CartItems(cart_id);
CREATE INDEX IF NOT EXISTS idx_cartitems_product ON CartItems(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order ON Reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON Reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_business ON Reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON Reviews(rating);