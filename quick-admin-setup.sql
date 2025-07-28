-- Quick Admin Setup for MeetingMind
-- This creates an admin user automatically

-- STEP 1: First, sign up normally through your app
-- 1. Run your app: npm run dev
-- 2. Go to the signup page
-- 3. Create account with your preferred email/password
-- 4. You'll be stuck on "Approval Pending" screen - that's normal!

-- STEP 2: Run this SQL to make that user an admin
-- REPLACE 'your.email@domain.com' with the email you just signed up with

DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Find the user by email and update to admin
    SELECT user_id INTO admin_user_id 
    FROM user_stats 
    WHERE email = 'your.email@domain.com';  -- REPLACE WITH YOUR EMAIL
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email your.email@domain.com not found. Please sign up first!';
    END IF;
    
    -- Update user to admin with approval
    UPDATE user_stats 
    SET 
        role = 'admin',
        approval_status = 'approved',
        approved_by = admin_user_id,
        approved_at = NOW(),
        approval_notes = 'Bootstrap admin user',
        username = 'admin',
        first_name = COALESCE(first_name, 'Admin'),
        last_name = COALESCE(last_name, 'User')
    WHERE user_id = admin_user_id;
    
    -- Log the approval
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
            'method', 'bootstrap',
            'timestamp', NOW()
        )
    );
    
    -- Show success message
    RAISE NOTICE 'SUCCESS! User % is now an admin with full access', admin_user_id;
END $$;

-- Verify the setup
SELECT 
    us.user_id,
    us.email,
    us.username,
    us.role,
    us.approval_status,
    us.approved_at
FROM user_stats us
WHERE us.role = 'admin';

-- You should see your user listed as admin/approved
-- Now refresh your app and you'll have full admin access! 