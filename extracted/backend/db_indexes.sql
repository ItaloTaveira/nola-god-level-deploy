-- Recommended indexes for analytics performance

-- Sales queries by date and status
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_status_created_at ON sales(sale_status_desc, created_at);
CREATE INDEX IF NOT EXISTS idx_sales_store_created_at ON sales(store_id, created_at);

-- Product sales
CREATE INDEX IF NOT EXISTS idx_product_sales_product_id ON product_sales(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sales_sale_id ON product_sales(sale_id);

-- Delivery / address
CREATE INDEX IF NOT EXISTS idx_delivery_addresses_lat_long ON delivery_addresses(latitude, longitude);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_sale_id ON payments(sale_id);

-- Consider materialized views for daily aggregates
-- CREATE MATERIALIZED VIEW mv_sales_daily AS
-- SELECT DATE(created_at) as day, store_id, channel_id, COUNT(*) as sales, SUM(total_amount) as revenue
-- FROM sales WHERE sale_status_desc = 'COMPLETED' GROUP BY DATE(created_at), store_id, channel_id;

-- Then create indexes on mv_sales_daily(day, store_id)
