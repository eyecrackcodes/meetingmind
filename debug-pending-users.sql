-- Debug Pending Users - Check why pending approvals aren't showing up
-- Run this in your Supabase SQL editor to diagnose the issue

-- 1. Check all users in auth.users table
SELECT 
    'AUTH USERS' as table_name,
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check all users in user_stats table
SELECT 
    'USER STATS' as table_name,
    user_id,
    email,
    username,
    approval_status,
    role,
    created_at,
    first_name,
    last_name,
    department
FROM user_stats 
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check for users with pending status specifically
SELECT 
    'PENDING USERS' as table_name,
    user_id,
    email,
    username,
    approval_status,
    role,
    created_at,
    first_name,
    last_name
FROM user_stats 
WHERE approval_status = 'pending'
ORDER BY created_at DESC;

-- 4. Check if there are users in auth.users but NOT in user_stats (broken trigger)
SELECT 
    'MISSING FROM USER_STATS' as issue,
    au.id as auth_user_id,
    au.email,
    au.created_at as auth_created,
    us.user_id as stats_user_id
FROM auth.users au
LEFT JOIN user_stats us ON au.id = us.user_id
WHERE us.user_id IS NULL
ORDER BY au.created_at DESC;

-- 5. Check user approval history
SELECT 
    'APPROVAL HISTORY' as table_name,
    uah.user_id,
    us.email,
    uah.action,
    uah.created_at,
    uah.notes
FROM user_approval_history uah
LEFT JOIN user_stats us ON uah.user_id = us.user_id
ORDER BY uah.created_at DESC
LIMIT 10;

-- 6. Check the initialize_user_data trigger function exists
SELECT 
    'TRIGGER CHECK' as check_type,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 7. Check if RLS policies are blocking the query
SELECT 
    'RLS POLICIES' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_stats';

-- 8. Test the exact query the admin UI uses
SELECT 
    'ADMIN UI QUERY TEST' as test_type,
    user_id,
    email,
    username,
    first_name,
    last_name,
    department,
    team,
    role,
    approval_status,
    created_at
FROM user_stats
WHERE approval_status = 'pending'
ORDER BY created_at DESC;
