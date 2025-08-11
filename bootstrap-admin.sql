-- Bootstrap Admin User for MeetingMind
-- This script will help you create the first admin user to manage approvals

-- INSTRUCTIONS:
-- 1. First, sign up normally through your app with the email you want to be admin
-- 2. Copy that email address and replace 'YOUR_EMAIL_HERE' below
-- 3. Run this script in your Supabase SQL Editor
-- 4. Refresh your app - you'll now have admin access!

-- REPLACE THIS EMAIL with the email you used to sign up:
\set admin_email 'eyecrackcodes@gmail.com'

-- The script will find your user and make them admin
DO $$
DECLARE
    admin_user_id UUID;
    admin_email TEXT := 'eyecrackcodes@gmail.com';  -- Replace with your email
BEGIN
    -- Find the user by email
    SELECT user_id INTO admin_user_id 
    FROM user_stats 
    WHERE email = admin_email;
    
    -- Check if user was found
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found. Please sign up through the app first!', admin_email;
    END IF;
    
    -- Check if user is already admin
    IF EXISTS (
        SELECT 1 FROM user_stats 
        WHERE user_id = admin_user_id 
        AND role = 'admin' 
        AND approval_status = 'approved'
    ) THEN
        RAISE NOTICE 'User % is already an approved admin!', admin_email;
        RETURN;
    END IF;
    
    -- Update user to admin with approval
    UPDATE user_stats 
    SET 
        role = 'admin',
        approval_status = 'approved',
        approved_by = admin_user_id,
        approved_at = NOW(),
        approval_notes = 'Bootstrap admin user - initial setup',
        username = COALESCE(username, 'admin'),
        first_name = COALESCE(first_name, 'Admin'),
        last_name = COALESCE(last_name, 'User')
    WHERE user_id = admin_user_id;
    
    -- Log the approval in history
    INSERT INTO user_approval_history (
        user_id,
        action,
        performed_by,
        notes,
        metadata
    ) VALUES (
        admin_user_id,
        'approved',
        admin_user_id,
        'Bootstrap admin user - initial setup',
        jsonb_build_object(
            'method', 'bootstrap_script',
            'timestamp', NOW(),
            'email', admin_email
        )
    );
    
    -- Success message
    RAISE NOTICE '✅ SUCCESS! User % (%) is now an admin with full access!', admin_email, admin_user_id;
    RAISE NOTICE '🔄 Refresh your app to see the admin interface for approving users.';
    
END $$;

-- Verify the setup worked
SELECT 
    '✅ Admin Users:' as status,
    email,
    username,
    first_name,
    last_name,
    role,
    approval_status,
    approved_at
FROM user_stats 
WHERE role = 'admin' AND approval_status = 'approved';

-- Show any pending users waiting for approval
SELECT 
    '⏳ Users Waiting for Approval:' as status,
    email,
    username,
    first_name,
    last_name,
    approval_status,
    created_at
FROM user_stats 
WHERE approval_status = 'pending'
ORDER BY created_at;
