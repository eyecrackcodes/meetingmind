-- Fix Missing User Stats - Manually create user_stats entries for users missing them
-- Run this if users exist in auth.users but not in user_stats

-- First, check which users are missing from user_stats
SELECT 
    'Users missing from user_stats:' as message,
    au.id,
    au.email,
    au.created_at
FROM auth.users au
LEFT JOIN user_stats us ON au.id = us.user_id
WHERE us.user_id IS NULL;

-- If the above shows missing users, run this to create their user_stats entries:
INSERT INTO user_stats (
    user_id,
    username,
    email,
    first_name,
    last_name,
    role,
    approval_status,
    created_at,
    updated_at
)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'username', SPLIT_PART(au.email, '@', 1)) as username,
    au.email,
    au.raw_user_meta_data->>'firstName' as first_name,
    au.raw_user_meta_data->>'lastName' as last_name,
    'agent' as role,
    'pending' as approval_status,
    au.created_at,
    NOW()
FROM auth.users au
LEFT JOIN user_stats us ON au.id = us.user_id
WHERE us.user_id IS NULL
  AND au.email IS NOT NULL;

-- Create approval history entry for the new pending users
INSERT INTO user_approval_history (
    user_id,
    action,
    notes,
    created_at
)
SELECT 
    au.id,
    'submitted',
    'Manually created user_stats entry - user signup was incomplete',
    au.created_at
FROM auth.users au
LEFT JOIN user_stats us ON au.id = us.user_id
WHERE us.user_id IS NULL
  AND au.email IS NOT NULL;

-- Verify the fix worked
SELECT 
    'After fix - pending users:' as message,
    user_id,
    email,
    username,
    approval_status,
    created_at
FROM user_stats 
WHERE approval_status = 'pending'
ORDER BY created_at DESC;
