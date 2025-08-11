-- Debug Template Save Issues
-- Run this in Supabase SQL Editor to diagnose template saving problems

-- Check if meeting_templates table exists and has proper structure
SELECT 
    'Table Structure' as check_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'meeting_templates'
ORDER BY ordinal_position;

-- Check RLS policies for meeting_templates
SELECT 
    'RLS Policies' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'meeting_templates';

-- Check if is_approved() function exists and works
SELECT 
    'Functions Check' as check_type,
    proname as function_name,
    prosrc as function_body
FROM pg_proc 
WHERE proname IN ('is_approved', 'is_admin');

-- Test the is_approved function for current user (replace USER_ID with actual ID)
-- You can get your user ID from: SELECT auth.uid();
-- SELECT 'User Approval Test' as check_type, is_approved('YOUR_USER_ID_HERE') as is_user_approved;

-- Check current user authentication
SELECT 
    'Auth Check' as check_type,
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() IS NULL THEN 'Not authenticated'
        ELSE 'Authenticated'
    END as auth_status;

-- Check user approval status
SELECT 
    'User Status' as check_type,
    us.email,
    us.approval_status,
    us.role,
    is_approved(us.user_id) as is_approved_result
FROM user_stats us
WHERE us.user_id = auth.uid();

-- Check recent template save attempts (last 10)
SELECT 
    'Recent Templates' as check_type,
    mt.meeting_title,
    mt.created_at,
    mt.user_id,
    us.email as user_email
FROM meeting_templates mt
LEFT JOIN user_stats us ON mt.user_id = us.user_id
ORDER BY mt.created_at DESC
LIMIT 10;

-- Test insert permission (this will either work or show the exact error)
-- Uncomment and run this separately if needed:
/*
INSERT INTO meeting_templates (
    user_id,
    meeting_title,
    meeting_date,
    facilitator,
    core_question,
    meeting_context,
    sections
) VALUES (
    auth.uid(),
    'Test Template - Debug',
    '2025-01-11',
    'Test User',
    'Is this working?',
    'Testing template save functionality',
    '[]'::jsonb
);
*/
