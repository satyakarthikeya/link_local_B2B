-- Create deals table
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

-- Create index for faster lookups
CREATE INDEX idx_deals_product_id ON Deals(product_id);
CREATE INDEX idx_deals_businessman_id ON Deals(businessman_id);
CREATE INDEX idx_deals_is_active ON Deals(is_active);
CREATE INDEX idx_deals_is_featured ON Deals(is_featured);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_deals_updated_at
BEFORE UPDATE ON Deals
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();