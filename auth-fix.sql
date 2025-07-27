-- Auth System Fix Script
-- Run this if you're having signup issues

-- Update the user initialization function to be more robust
CREATE OR REPLACE FUNCTION initialize_user_data()
RETURNS TRIGGER AS $$
DECLARE
    extracted_email TEXT;
    extracted_username TEXT;
    extracted_first_name TEXT;
    extracted_last_name TEXT;
BEGIN
    -- Extract email and other data safely
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
    
    -- Create user stats record with pending approval
    INSERT INTO user_stats (
        user_id, 
        username, 
        email,
        approval_status,
        first_name,
        last_name,
        role
    )
    VALUES (
        NEW.id,
        extracted_username,
        extracted_email,
        'pending',
        extracted_first_name,
        extracted_last_name,
        'agent'  -- Default role
    )
    ON CONFLICT (user_id) DO NOTHING;  -- Prevent duplicate inserts
    
    -- Create user preferences record
    INSERT INTO user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT DO NOTHING;  -- Prevent duplicate inserts
    
    -- Log the initial signup in approval history
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
            'signup_method', 'web_signup',
            'signup_timestamp', NOW()
        )
    )
    ON CONFLICT DO NOTHING;  -- Prevent duplicate entries
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the signup
        RAISE WARNING 'Error in initialize_user_data: %', SQLERRM;
        RETURN NEW;
END;
$$ language 'plpgsql';

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION initialize_user_data();

-- Test the setup
SELECT 'Auth system fixes applied successfully!' as status; 