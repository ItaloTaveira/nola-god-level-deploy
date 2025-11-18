-- Minimal schema for app to work on Render
-- Creates the essential tables expected by the backend queries
-- Add additional columns as needed; these are the minimum required

-- channels
CREATE TABLE IF NOT EXISTS channels (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER,
  name TEXT NOT NULL,
  description TEXT,
  type CHAR(1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- customers (minimal)
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  customer_name TEXT,
  email TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- products (minimal)
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  brand_id INTEGER,
  sub_brand_id INTEGER,
  category_id INTEGER,
  name TEXT NOT NULL,
  pos_uuid TEXT
);

-- sales
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  store_id INTEGER,
  customer_id INTEGER REFERENCES customers(id),
  channel_id INTEGER REFERENCES channels(id),
  customer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sale_status_desc TEXT,
  total_amount NUMERIC(12,2) DEFAULT 0,
  value_paid NUMERIC(12,2) DEFAULT 0,
  production_seconds INTEGER,
  delivery_seconds INTEGER,
  total_amount_items NUMERIC(12,2) DEFAULT 0,
  total_discount NUMERIC(12,2) DEFAULT 0,
  total_increase NUMERIC(12,2) DEFAULT 0,
  delivery_fee NUMERIC(12,2) DEFAULT 0,
  service_tax_fee NUMERIC(12,2) DEFAULT 0,
  people_quantity INTEGER,
  origin TEXT
);

-- product_sales
CREATE TABLE IF NOT EXISTS product_sales (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  base_price NUMERIC(12,2) DEFAULT 0,
  total_price NUMERIC(12,2) DEFAULT 0
);

-- Useful indexes to speed queries used by the app
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales (created_at);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales (sale_status_desc);
CREATE INDEX IF NOT EXISTS idx_product_sales_product_id ON product_sales (product_id);

-- End of minimal schema
