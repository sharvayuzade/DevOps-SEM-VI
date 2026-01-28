-- ============================================================================
-- LOST & FOUND PORTAL - DATABASE SCHEMA
-- Symbiosis Institute of Technology, Nagpur
-- ============================================================================
-- This schema follows 3NF (Third Normal Form) normalization principles:
-- 1NF: All columns contain atomic values, no repeating groups
-- 2NF: All non-key attributes fully depend on the primary key
-- 3NF: No transitive dependencies (non-key attributes don't depend on other non-key attributes)
-- ============================================================================

-- ============================================================================
-- TABLE 1: users (Base User Table)
-- ============================================================================
-- Stores common user information for both students and staff
-- This is the parent table for authentication and basic user data

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('student', 'staff')),
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all profiles
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- TABLE 2: students (Student-Specific Data)
-- ============================================================================
-- Stores student-specific information
-- Linked to users table via foreign key (1-to-1 relationship)
-- This separation follows 3NF - student-specific data in its own table

CREATE TABLE students (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view student info
CREATE POLICY "Anyone can view student info" ON students
    FOR SELECT USING (true);

-- Policy: Students can update their own info
CREATE POLICY "Students can update own info" ON students
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Students can insert their own info
CREATE POLICY "Students can insert own info" ON students
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- TABLE 3: staff (Staff-Specific Data)
-- ============================================================================
-- Stores staff-specific information
-- Linked to users table via foreign key (1-to-1 relationship)
-- This separation follows 3NF - staff-specific data in its own table

CREATE TABLE staff (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    department VARCHAR(100) NOT NULL,
    employee_id VARCHAR(20) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view staff info
CREATE POLICY "Anyone can view staff info" ON staff
    FOR SELECT USING (true);

-- Policy: Staff can update their own info
CREATE POLICY "Staff can update own info" ON staff
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Staff can insert their own info
CREATE POLICY "Staff can insert own info" ON staff
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- TABLE 4: found_items (Found Items Data)
-- ============================================================================
-- Stores information about found items
-- Linked to users table via foreign key (uploaded_by)
-- Only students can upload items (enforced in application logic)

CREATE TABLE found_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    found_location VARCHAR(200) NOT NULL,
    found_date DATE NOT NULL,
    found_time TIME NOT NULL,
    deposited_location VARCHAR(200) NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE found_items ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view found items
CREATE POLICY "Anyone can view found items" ON found_items
    FOR SELECT USING (true);

-- Policy: Authenticated users can insert items
CREATE POLICY "Authenticated users can insert items" ON found_items
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Policy: Users can update their own items
CREATE POLICY "Users can update own items" ON found_items
    FOR UPDATE USING (auth.uid() = uploaded_by);

-- Policy: Users can delete their own items
CREATE POLICY "Users can delete own items" ON found_items
    FOR DELETE USING (auth.uid() = uploaded_by);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Index on users email for faster login lookups
CREATE INDEX idx_users_email ON users(email);

-- Index on users role for filtering
CREATE INDEX idx_users_role ON users(role);

-- Index on students student_id for faster lookups
CREATE INDEX idx_students_student_id ON students(student_id);

-- Index on staff department for filtering
CREATE INDEX idx_staff_department ON staff(department);

-- Index on found_items for common queries
CREATE INDEX idx_found_items_status ON found_items(status);
CREATE INDEX idx_found_items_found_date ON found_items(found_date DESC);
CREATE INDEX idx_found_items_uploaded_by ON found_items(uploaded_by);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for students table
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for staff table
CREATE TRIGGER update_staff_updated_at
    BEFORE UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for found_items table
CREATE TRIGGER update_found_items_updated_at
    BEFORE UPDATE ON found_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Complete student information (joins users and students)
CREATE OR REPLACE VIEW student_profiles AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.profile_image_url,
    s.student_id,
    s.semester,
    u.created_at,
    u.updated_at
FROM users u
INNER JOIN students s ON u.id = s.id;

-- View: Complete staff information (joins users and staff)
CREATE OR REPLACE VIEW staff_profiles AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.profile_image_url,
    st.department,
    st.employee_id,
    u.created_at,
    u.updated_at
FROM users u
INNER JOIN staff st ON u.id = st.id;

-- View: Found items with uploader information
CREATE OR REPLACE VIEW found_items_with_uploader AS
SELECT 
    fi.id,
    fi.item_name,
    fi.description,
    fi.image_url,
    fi.found_location,
    fi.found_date,
    fi.found_time,
    fi.deposited_location,
    fi.status,
    fi.created_at,
    fi.updated_at,
    u.id AS uploader_id,
    u.full_name AS uploader_name,
    u.email AS uploader_email,
    u.role AS uploader_role
FROM found_items fi
INNER JOIN users u ON fi.uploaded_by = u.id;

-- ============================================================================
-- STORAGE BUCKET SETUP (Run in Supabase Dashboard or via API)
-- ============================================================================
-- Note: Create a storage bucket named 'item-images' in Supabase Dashboard
-- with the following policies:

-- Policy for item-images bucket:
-- 1. Allow authenticated users to upload images
-- 2. Allow public access to view images

-- SQL for storage policies (run in Supabase SQL Editor):
/*
INSERT INTO storage.buckets (id, name, public) VALUES ('item-images', 'item-images', true);

CREATE POLICY "Authenticated users can upload images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'item-images' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Anyone can view images" ON storage.objects
    FOR SELECT USING (bucket_id = 'item-images');

CREATE POLICY "Users can delete own images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'item-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
*/

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================
/*
-- Note: Replace UUIDs with actual user IDs after registration

-- Sample found items
INSERT INTO found_items (uploaded_by, item_name, description, image_url, found_location, found_date, found_time, deposited_location)
VALUES 
    ('user-uuid-here', 'Blue Water Bottle', 'Milton brand, 1 liter capacity', 'https://example.com/bottle.jpg', 'Library - 2nd Floor', '2024-01-15', '14:30:00', 'Security Office - Main Gate'),
    ('user-uuid-here', 'Silver Wristwatch', 'Titan brand with leather strap', 'https://example.com/watch.jpg', 'Cafeteria', '2024-01-16', '12:45:00', 'Admin Office'),
    ('user-uuid-here', 'Black Umbrella', 'Foldable umbrella with wooden handle', 'https://example.com/umbrella.jpg', 'Computer Lab 3', '2024-01-17', '16:00:00', 'IT Department');
*/
