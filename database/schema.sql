-- H&H Donations Database Schema for Supabase
-- Run this SQL in your Supabase SQL editor to create the tables

-- Create bins table
CREATE TABLE bins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bin_number VARCHAR(20) UNIQUE NOT NULL,
  location_name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('Available', 'Unavailable', 'Full', 'Almost Full')) DEFAULT 'Available',
  pickup_status VARCHAR(20) CHECK (pickup_status IN ('Scheduled', 'Not Scheduled', 'Completed')) DEFAULT 'Not Scheduled',
  last_pickup DATE,
  contract_file TEXT,
  contract_file_name VARCHAR(255),
  contract_upload_date DATE,
  assigned_driver VARCHAR(255),
  created_date DATE DEFAULT CURRENT_DATE,
  full_since TIMESTAMPTZ,
  -- Sensor integration fields
  sensor_id VARCHAR(100),
  container_id INTEGER,
  fill_level DECIMAL(5, 2),
  last_sensor_update TIMESTAMPTZ,
  battery_level DECIMAL(4, 2),
  temperature DECIMAL(5, 2),
  sensor_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create drivers table
CREATE TABLE drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  license_number VARCHAR(50) NOT NULL,
  hire_date DATE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('Active', 'Inactive', 'On Leave')) DEFAULT 'Active',
  assigned_bins TEXT[] DEFAULT ARRAY[]::TEXT[],
  vehicle_type VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create containers table
CREATE TABLE containers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  container_number VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) CHECK (type IN ('Steel', 'Plastic', 'Cardboard')) NOT NULL,
  capacity INTEGER NOT NULL,
  current_weight DECIMAL(8, 2) DEFAULT 0,
  location VARCHAR(255) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('Empty', 'Partial', 'Full', 'In Transit')) DEFAULT 'Empty',
  last_pickup DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bales table
CREATE TABLE bales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bale_number VARCHAR(50) UNIQUE NOT NULL,
  weight DECIMAL(8, 2) NOT NULL,
  grade VARCHAR(20) CHECK (grade IN ('A - Excellent', 'B - Good', 'C - Fair')) NOT NULL,
  date_created DATE NOT NULL,
  location VARCHAR(255) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('Created', 'Sold', 'Shipped')) DEFAULT 'Created',
  price_per_kg DECIMAL(6, 2),
  buyer_info TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_users table for dashboard login profiles
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('admin', 'manager', 'operator')) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pickup_requests table
CREATE TABLE pickup_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  pickup_address TEXT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  pickup_date DATE NOT NULL,
  pickup_time TEXT,  -- Changed from TIME to TEXT to support time ranges like "9:00 AM - 4:00 PM"
  item_description TEXT NOT NULL,
  estimated_weight DECIMAL(6, 2),
  status VARCHAR(20) CHECK (status IN ('Pending', 'Scheduled', 'Completed', 'Cancelled', 'Picked Up')) DEFAULT 'Pending',
  assigned_driver VARCHAR(255),
  notes TEXT,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create partner_applications table
CREATE TABLE partner_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  website VARCHAR(500),
  tax_id VARCHAR(50),
  street VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  additional_info TEXT,
  status VARCHAR(20) CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')) DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_bins_status ON bins(status);
CREATE INDEX idx_bins_container_id ON bins(container_id);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_pickup_requests_status ON pickup_requests(status);
CREATE INDEX idx_pickup_requests_date ON pickup_requests(pickup_date);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_is_active ON admin_users(is_active);
CREATE INDEX idx_partner_applications_status ON partner_applications(status);
CREATE INDEX idx_partner_applications_email ON partner_applications(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_bins_updated_at BEFORE UPDATE ON bins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_containers_updated_at BEFORE UPDATE ON containers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bales_updated_at BEFORE UPDATE ON bales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pickup_requests_updated_at BEFORE UPDATE ON pickup_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_applications_updated_at BEFORE UPDATE ON partner_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - Important for Supabase
ALTER TABLE bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bales ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on bins" ON bins FOR ALL USING (true);
CREATE POLICY "Allow all operations on drivers" ON drivers FOR ALL USING (true);
CREATE POLICY "Allow all operations on containers" ON containers FOR ALL USING (true);
CREATE POLICY "Allow all operations on bales" ON bales FOR ALL USING (true);
CREATE POLICY "Allow all operations on pickup_requests" ON pickup_requests FOR ALL USING (true);
CREATE POLICY "Allow all operations on admin_users" ON admin_users FOR ALL USING (true);
CREATE POLICY "Allow all operations on partner_applications" ON partner_applications FOR ALL USING (true);

-- Insert default admin user (password is 'admin123' hashed)
INSERT INTO admin_users (email, password_hash, full_name, role) VALUES 
('admin@hhdonations.org', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewXMzM9XQB.0J0Ai', 'System Administrator', 'admin');