-- Check Admin Permissions - Ensure admin can see pending users
-- Run this to check if RLS policies are blocking admin access

-- 1. Check current user and their role
SELECT 
    'Current user check' as check_type,
    auth.uid() as current_user_id,
    us.email,
    us.username,
    us.role,
    us.approval_status
FROM user_stats us
WHERE us.user_id = auth.uid();

-- 2. Check if current user can see ALL user_stats (admin should be able to)
SELECT 
    'Admin can see users count' as check_type,
    COUNT(*) as total_users,
    COUNT(CASE WHEN approval_status = 'pending' THEN 1 END) as pending_users,
    COUNT(CASE WHEN approval_status = 'approved' THEN 1 END) as approved_users
FROM user_stats;

-- 3. Test the exact query the admin UI runs
SELECT 
    'Admin UI query test' as test_type,
    user_id,
    email,
    username,
    approval_status,
    created_at
FROM user_stats
WHERE approval_status = 'pending'
ORDER BY created_at DESC;

-- 4. Check RLS policies on user_stats
SELECT 
    'RLS Policy Check' as check_type,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_stats';

-- 5. If admin can't see pending users, temporarily disable RLS to test
-- WARNING: Only run this for testing, re-enable afterwards
-- ALTER TABLE user_stats DISABLE ROW LEVEL SECURITY;

-- Then test the query again:
-- SELECT * FROM user_stats WHERE approval_status = 'pending';

-- Re-enable RLS after testing:
-- ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- 6. Check if the admin user has the correct role in database
SELECT 
    'Admin role verification' as check_type,
    user_id,
    email,
    username,
    role,
    approval_status,
    approved_by,
    approved_at
FROM user_stats 
WHERE role = 'admin'
ORDER BY created_at DESC;
