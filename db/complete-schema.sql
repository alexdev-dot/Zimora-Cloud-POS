-- Complete Supabase Database Schema for Zimora Cloud POS
-- This schema includes all entities: products, sales, inventory, customers, employees, suppliers, expenses, purchase orders, settings

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  brand TEXT,
  description TEXT,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  sold INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'pcs',
  location TEXT NOT NULL DEFAULT 'Main',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'discontinued')),
  image_url TEXT,
  supplier_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for products
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- ============================================
-- SALES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_no TEXT NOT NULL UNIQUE,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  customer_id UUID,
  customer_name TEXT NOT NULL DEFAULT 'Walk-in Customer',
  cashier TEXT NOT NULL,
  branch TEXT NOT NULL DEFAULT 'Main Branch',
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'mpesa', 'card', 'split')),
  payment_ref TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'refunded', 'partially_refunded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for sales
ALTER PUBLICATION supabase_realtime ADD TABLE sales;

-- ============================================
-- INVENTORY TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  product_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'sale', 'adjustment', 'transfer', 'return')),
  qty INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  created_by TEXT NOT NULL,
  reference TEXT,
  note TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for inventory_transactions
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_transactions;

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Kenya',
  customer_type TEXT DEFAULT 'regular' CHECK (customer_type IN ('regular', 'vip', 'wholesale')),
  loyalty_points INTEGER DEFAULT 0,
  total_purchases DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for customers
ALTER PUBLICATION supabase_realtime ADD TABLE customers;

-- ============================================
-- EMPLOYEES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier', 'stockkeeper')),
  department TEXT,
  branch TEXT DEFAULT 'Main',
  hire_date DATE,
  salary DECIMAL(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'terminated')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for employees
ALTER PUBLICATION supabase_realtime ADD TABLE employees;

-- ============================================
-- SUPPLIERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Kenya',
  tax_id TEXT,
  payment_terms TEXT DEFAULT 'NET 30',
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for suppliers
ALTER PUBLICATION supabase_realtime ADD TABLE suppliers;

-- ============================================
-- EXPENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'mpesa', 'card')),
  reference TEXT,
  supplier_id UUID,
  branch TEXT DEFAULT 'Main',
  approved_by TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for expenses
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;

-- ============================================
-- PURCHASE ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_no TEXT NOT NULL UNIQUE,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  supplier_id UUID NOT NULL,
  expected_date DATE,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'received', 'cancelled')),
  notes TEXT,
  created_by TEXT NOT NULL,
  branch TEXT DEFAULT 'Main',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for purchase_orders
ALTER PUBLICATION supabase_realtime ADD TABLE purchase_orders;

-- ============================================
-- SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for settings
ALTER PUBLICATION supabase_realtime ADD TABLE settings;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (allow all for now - customize based on auth)
CREATE POLICY "Enable all access for products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for inventory_transactions" ON inventory_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for employees" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for purchase_orders" ON purchase_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for settings" ON settings FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_order_no ON sales(order_no);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);

-- Inventory transactions indexes
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_date ON inventory_transactions(date);
CREATE INDEX IF NOT EXISTS idx_inventory_type ON inventory_transactions(type);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

-- Employees indexes
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

-- Suppliers indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_email ON suppliers(email);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);

-- Expenses indexes
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);

-- Purchase orders indexes
CREATE INDEX IF NOT EXISTS idx_purchase_order_no ON purchase_orders(order_no);
CREATE INDEX IF NOT EXISTS idx_purchase_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_status ON purchase_orders(status);

-- Settings indexes
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA (OPTIONAL)
-- ============================================

-- Insert default settings
INSERT INTO settings (key, value, category, description) VALUES
('business_name', '"Zimora Cloud POS"', 'general', 'Business name for receipts and reports'),
('currency', '"KES"', 'general', 'Default currency'),
('tax_rate', '16', 'financial', 'Default tax rate percentage'),
('receipt_footer', '"Thank you for shopping with us!"', 'receipt', 'Footer text for receipts'),
('low_stock_threshold', '10', 'inventory', 'Minimum stock level before alert')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get product stock with low stock warning
CREATE OR REPLACE FUNCTION get_product_stock_status(p_stock INTEGER, p_min_stock INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF p_stock = 0 THEN
    RETURN 'out_of_stock';
  ELSEIF p_stock <= p_min_stock THEN
    RETURN 'low_stock';
  ELSE
    RETURN 'in_stock';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate total sales for a date range
CREATE OR REPLACE FUNCTION get_total_sales(start_date TIMESTAMP WITH TIME ZONE, end_date TIMESTAMP WITH TIME ZONE)
RETURNS DECIMAL AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(total) FROM sales 
     WHERE date >= start_date 
     AND date <= end_date 
     AND status = 'completed'),
    0
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get low stock products
CREATE OR REPLACE FUNCTION get_low_stock_products()
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  current_stock INTEGER,
  min_stock INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.stock, p.min_stock
  FROM products p
  WHERE p.stock <= p.min_stock
  AND p.status = 'active'
  ORDER BY p.stock ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FOREIGN KEY CONSTRAINTS (Added after all tables exist)
-- ============================================

-- Products → Suppliers
ALTER TABLE products 
ADD CONSTRAINT products_supplier_id_fkey 
FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;

-- Sales → Customers
ALTER TABLE sales 
ADD CONSTRAINT sales_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;

-- Inventory Transactions → Products
ALTER TABLE inventory_transactions 
ADD CONSTRAINT inventory_transactions_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Purchase Orders → Suppliers
ALTER TABLE purchase_orders 
ADD CONSTRAINT purchase_orders_supplier_id_fkey 
FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT;

-- Expenses → Suppliers
ALTER TABLE expenses 
ADD CONSTRAINT expenses_supplier_id_fkey 
FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;
