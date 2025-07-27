-- Admin User Setup Script for MeetingMind
-- Run this AFTER applying the main supabase-schema.pgsql

-- Step 1: Create admin user in auth.users table
-- REPLACE these values with your preferred admin credentials:
-- Email: your.admin@email.com  
-- Password: Use Supabase Auth UI or this INSERT (but password needs to be hashed)

-- Option A: Use Supabase Auth UI (RECOMMENDED)
-- 1. Go to Authentication > Users in Supabase Dashboard
-- 2. Click "Add User" 
-- 3. Enter your email: your.admin@email.com
-- 4. Enter secure password
-- 5. Leave "Email Confirm" UNCHECKED (so it's immediately active)
-- 6. Copy the User ID from the created user

-- Option B: Direct SQL Insert (Advanced - requires password hashing)
-- Don't use this unless you know what you're doing

-- Step 2: Update the user_stats record to make them admin
-- REPLACE 'USER_ID_HERE' with the actual UUID from step 1
-- REPLACE 'your.admin@email.com' with your actual email

UPDATE user_stats 
SET 
    role = 'admin',
    approval_status = 'approved',
    approved_by = user_id, -- Self-approved since they're the first admin
    approved_at = NOW(),
    approval_notes = 'Initial admin user setup',
    email = 'your.admin@email.com',  -- REPLACE WITH YOUR EMAIL
    username = 'admin',
    first_name = 'Admin',
    last_name = 'User'
WHERE user_id = 'USER_ID_HERE';  -- REPLACE WITH ACTUAL USER ID

-- Step 3: Log the admin creation in approval history
INSERT INTO user_approval_history (
    user_id,
    action,
    performed_by,
    notes,
    metadata
) VALUES (
    'USER_ID_HERE',  -- REPLACE WITH ACTUAL USER ID
    'approved',
    'USER_ID_HERE',  -- REPLACE WITH ACTUAL USER ID (self-approved)
    'Initial admin user setup - system bootstrap',
    jsonb_build_object(
        'method', 'manual_setup',
        'timestamp', NOW(),
        'initial_admin', true
    )
);

-- Step 4: Verify the setup
SELECT 
    u.id as user_id,
    u.email,
    us.username,
    us.role,
    us.approval_status,
    us.approved_at,
    us.approval_notes
FROM auth.users u
JOIN user_stats us ON u.id = us.user_id
WHERE us.role = 'admin';

-- Step 5: Test helper functions
SELECT is_admin('USER_ID_HERE');  -- Should return true
SELECT is_approved('USER_ID_HERE');  -- Should return true

-- If everything looks good, you're ready to log in!
-- Your credentials:
-- Email: your.admin@email.com (whatever you used)
-- Password: (whatever you set in step 1)
-- Role: admin (full access to user management) 