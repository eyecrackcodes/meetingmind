-- Test Admin Function - Check if is_admin() function works correctly
-- This is likely the root cause of the pending approval issue

-- 1. Check if is_admin() function exists
SELECT 
    'Function exists check' as test_type,
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'is_admin';

-- 2. Test if is_admin() function returns true for current user
SELECT 
    'Admin function test' as test_type,
    auth.uid() as current_user_id,
    is_admin() as is_admin_result;

-- 3. Check current user's role directly
SELECT 
    'User role check' as test_type,
    user_id,
    email,
    username,
    role,
    approval_status
FROM user_stats 
WHERE user_id = auth.uid();

-- 4. If is_admin() function doesn't exist, create it
-- This function checks if current user has admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_stats 
        WHERE user_id = auth.uid() 
        AND role = 'admin' 
        AND approval_status = 'approved'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Test the function again after creation
SELECT 
    'Admin function test after creation' as test_type,
    auth.uid() as current_user_id,
    is_admin() as is_admin_result;

-- 6. Now test if admin can see pending users
SELECT 
    'Pending users visible test' as test_type,
    user_id,
    email,
    username,
    approval_status,
    created_at
FROM user_stats
WHERE approval_status = 'pending'
ORDER BY created_at DESC;

-- 7. Count all users by status (admin should see all)
SELECT 
    'User counts by status' as test_type,
    approval_status,
    COUNT(*) as count
FROM user_stats
GROUP BY approval_status
ORDER BY approval_status;
