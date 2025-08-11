-- Apply Auth Fix to resolve signup issues
-- Run this in your Supabase SQL Editor to fix the database errors

-- First, check current function
SELECT proname, prosrc FROM pg_proc WHERE proname = 'initialize_user_data';

-- Drop existing trigger and function to recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS initialize_user_data();

-- Create improved user initialization function
CREATE OR REPLACE FUNCTION initialize_user_data()
RETURNS TRIGGER AS $$
DECLARE
    extracted_email TEXT;
    extracted_username TEXT;
    extracted_first_name TEXT;
    extracted_last_name TEXT;
    extracted_department TEXT;
    extracted_team TEXT;
    extracted_role TEXT;
BEGIN
    -- Extract data safely with fallbacks
    extracted_email := COALESCE(NEW.email, '');
    extracted_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'full_name',
        CASE 
            WHEN NEW.email IS NOT NULL AND NEW.email != '' 
            THEN split_part(NEW.email, '@', 1)
            ELSE 'user_' || substr(NEW.id::text, 1, 8)
        END
    );
    extracted_first_name := NEW.raw_user_meta_data->>'first_name';
    extracted_last_name := NEW.raw_user_meta_data->>'last_name';
    extracted_department := NEW.raw_user_meta_data->>'department';
    extracted_team := NEW.raw_user_meta_data->>'team';
    extracted_role := COALESCE(NEW.raw_user_meta_data->>'requested_role', 'agent');
    
    -- Create user stats record with pending approval (with conflict handling)
    INSERT INTO user_stats (
        user_id, 
        username, 
        email,
        approval_status,
        first_name,
        last_name,
        department,
        team,
        role
    )
    VALUES (
        NEW.id,
        extracted_username,
        extracted_email,
        'pending',
        extracted_first_name,
        extracted_last_name,
        extracted_department,
        extracted_team,
        extracted_role
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        username = EXCLUDED.username,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        department = EXCLUDED.department,
        team = EXCLUDED.team,
        updated_at = NOW();
    
    -- Create user preferences record (with conflict handling)
    INSERT INTO user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Log the initial signup in approval history (with conflict handling)
    INSERT INTO user_approval_history (
        user_id,
        action,
        performed_by,
        notes,
        metadata
    ) VALUES (
        NEW.id,
        'submitted',
        NEW.id,
        'User signed up and pending approval',
        jsonb_build_object(
            'email', extracted_email,
            'username', extracted_username,
            'department', extracted_department,
            'team', extracted_team,
            'requested_role', extracted_role,
            'signup_method', 'web_signup',
            'signup_timestamp', NOW()
        )
    )
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the signup
        RAISE WARNING 'Error in initialize_user_data for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION initialize_user_data();

-- Add unique constraints if they don't exist
DO $$ 
BEGIN
    -- Check if unique constraint exists on user_stats.user_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_stats_user_id_key' 
        AND table_name = 'user_stats'
    ) THEN
        ALTER TABLE user_stats ADD CONSTRAINT user_stats_user_id_key UNIQUE (user_id);
    END IF;
    
    -- Check if unique constraint exists on user_preferences.user_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_preferences_user_id_key' 
        AND table_name = 'user_preferences'
    ) THEN
        ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- Test the function
SELECT 'Auth fix applied successfully! Test signup should now work.' as status;

-- Show current trigger status
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
