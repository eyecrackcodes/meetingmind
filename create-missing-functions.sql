-- Create Missing Functions for RLS Policies
-- This creates the is_admin() and is_approved() functions needed by RLS policies

-- Function to check if current user is admin
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

-- Function to check if current user is approved
CREATE OR REPLACE FUNCTION is_approved()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_stats 
        WHERE user_id = auth.uid() 
        AND approval_status = 'approved'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the functions
SELECT 
    'Function test results' as test_type,
    auth.uid() as current_user,
    is_admin() as is_admin_result,
    is_approved() as is_approved_result,
    (SELECT role FROM user_stats WHERE user_id = auth.uid()) as user_role,
    (SELECT approval_status FROM user_stats WHERE user_id = auth.uid()) as user_status;

-- Grant execute permissions to public (authenticated users)
GRANT EXECUTE ON FUNCTION is_admin() TO PUBLIC;
GRANT EXECUTE ON FUNCTION is_approved() TO PUBLIC;
