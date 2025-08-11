-- Quick User Status Check for MeetingMind
-- Run this to see the current state of users in your system

-- Check all users and their approval status
SELECT 
    '👥 All Users Overview' as section,
    email,
    username,
    CONCAT(first_name, ' ', last_name) as full_name,
    role,
    approval_status,
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as signup_date,
    CASE 
        WHEN approved_at IS NOT NULL THEN TO_CHAR(approved_at, 'YYYY-MM-DD HH24:MI')
        ELSE 'Not approved'
    END as approval_date
FROM user_stats 
ORDER BY created_at DESC;

-- Show admins specifically
SELECT 
    '👑 Admin Users' as section,
    email,
    username,
    approval_status,
    TO_CHAR(approved_at, 'YYYY-MM-DD HH24:MI') as approved_date
FROM user_stats 
WHERE role = 'admin'
ORDER BY created_at;

-- Show pending users
SELECT 
    '⏳ Users Waiting for Approval' as section,
    email,
    username,
    CONCAT(first_name, ' ', last_name) as full_name,
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as signup_date,
    EXTRACT(DAY FROM NOW() - created_at) as days_waiting
FROM user_stats 
WHERE approval_status = 'pending'
ORDER BY created_at;

-- Summary counts
SELECT 
    '📊 Summary' as section,
    COUNT(*) as total_users,
    COUNT(CASE WHEN approval_status = 'pending' THEN 1 END) as pending_users,
    COUNT(CASE WHEN approval_status = 'approved' THEN 1 END) as approved_users,
    COUNT(CASE WHEN approval_status = 'rejected' THEN 1 END) as rejected_users,
    COUNT(CASE WHEN role = 'admin' AND approval_status = 'approved' THEN 1 END) as active_admins
FROM user_stats;

-- Check if system needs admin setup
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '❌ No admin users found! Run bootstrap-admin.sql to create one.'
        ELSE CONCAT('✅ Found ', COUNT(*), ' admin user(s)')
    END as admin_status
FROM user_stats 
WHERE role = 'admin' AND approval_status = 'approved';
