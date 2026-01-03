-- SalesBook Supabase Schema
-- Execute this SQL in your Supabase project SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom UUID function if not exists
CREATE OR REPLACE FUNCTION generate_uuid()
RETURNS UUID
LANGUAGE SQL
AS $$
    SELECT uuid_generate_v4()
$$;

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Général',
    brand TEXT,
    purchase_price DECIMAL(10,2) NOT NULL CHECK (purchase_price >= 0),
    sale_price DECIMAL(10,2) NOT NULL CHECK (sale_price >= 0),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    status_id UUID REFERENCES statuses(id) ON DELETE RESTRICT,
    reorder_threshold INTEGER NOT NULL DEFAULT 5 CHECK (reorder_threshold >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Statuses table
CREATE TABLE IF NOT EXISTS statuses (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    label TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    date TEXT NOT NULL, -- ISO date string
    total_revenue DECIMAL(10,2) NOT NULL CHECK (total_revenue >= 0),
    total_cost DECIMAL(10,2) NOT NULL CHECK (total_cost >= 0),
    total_profit DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sale items table
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT generate_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    qty INTEGER NOT NULL CHECK (qty > 0),
    unit_sale_price DECIMAL(10,2) NOT NULL CHECK (unit_sale_price >= 0),
    unit_cost_price DECIMAL(10,2) NOT NULL CHECK (unit_cost_price >= 0),
    profit_line DECIMAL(10,2) NOT NULL
);

-- Preferences table
CREATE TABLE IF NOT EXISTS preferences (
    id TEXT PRIMARY KEY DEFAULT 'default',
    currency TEXT NOT NULL DEFAULT 'EUR',
    payment_methods TEXT NOT NULL DEFAULT '[]', -- JSON string
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status_id ON products(status_id);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at);
CREATE INDEX IF NOT EXISTS idx_statuses_order ON statuses("order");
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

-- RLS (Row Level Security) policies
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (full access to their own data)
-- Note: In a multi-tenant app, you'd add user_id columns and restrict access accordingly
-- For now, we'll allow authenticated users full access

CREATE POLICY "Users can view all products" ON products
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert products" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update products" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete products" ON products
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all statuses" ON statuses
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert statuses" ON statuses
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update statuses" ON statuses
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete statuses" ON statuses
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all sales" ON sales
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert sales" ON sales
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update sales" ON sales
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete sales" ON sales
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all sale items" ON sale_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert sale items" ON sale_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update sale items" ON sale_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete sale items" ON sale_items
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view preferences" ON preferences
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update preferences" ON preferences
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_statuses_updated_at BEFORE UPDATE ON statuses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default statuses
INSERT INTO statuses (label, color, is_default, "order") VALUES
('Disponible', '#10b981', true, 0),
('Rupture', '#ef4444', false, 1),
('Commande', '#f59e0b', false, 2)
ON CONFLICT (label) DO NOTHING;

-- Insert default preferences
INSERT INTO preferences (id, currency, payment_methods) VALUES
('default', 'EUR', '[{"value":"cash","label":"Espèces"},{"value":"card","label":"Carte bancaire"},{"value":"transfer","label":"Virement bancaire"}]')
ON CONFLICT (id) DO NOTHING;
