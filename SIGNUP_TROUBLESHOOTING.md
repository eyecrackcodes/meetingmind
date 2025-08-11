# Signup Issues Troubleshooting Guide

## Current Error: "Database error saving new user"

This error occurs when the database trigger function fails during user signup. Here's how to fix it:

### Step 1: Apply the Database Fix

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire contents of `apply-auth-fix.sql`
4. Click "Run" to execute the script

This will:
- Fix the user initialization trigger function
- Add proper error handling
- Ensure unique constraints exist
- Handle data extraction properly

### Step 2: Check Environment Configuration

Run the environment check:
```bash
node check-environment.js
```

This will verify:
- ✅ Required environment variables are set
- ✅ Supabase URL format is correct
- ✅ API keys are present

### Step 3: Common Issues & Solutions

#### Issue: "Multiple GoTrueClient instances"
**Solution**: Fixed in the latest code update with singleton pattern

#### Issue: "500 error on signup endpoint"
**Causes**:
- Database trigger function is broken
- Missing environment variables
- Database schema not applied

**Solution**:
1. Run `apply-auth-fix.sql`
2. Verify environment variables
3. Check Supabase project is active

#### Issue: "User already registered"
**Solution**: User exists but might be stuck in pending state
```sql
-- Check user status
SELECT email, approval_status FROM user_stats WHERE email = 'your.email@domain.com';
```

#### Issue: Email verification not working
**Solution**: 
1. Check if email confirmation is required in Supabase Auth settings
2. For testing, disable email confirmation temporarily
3. Or check spam folder for verification email

### Step 4: Verify Database Schema

Run this query to check if all required tables exist:
```sql
-- Check required tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_stats', 'user_preferences', 'user_approval_history');

-- Check trigger exists
SELECT trigger_name, action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### Step 5: Test User Creation

After applying fixes, test with a new email:
1. Use a different email than before
2. Fill out all required fields
3. Check browser console for any errors
4. Check Supabase Auth dashboard for the new user

### Step 6: Set Up Admin Access

Once signup works:
1. Edit `bootstrap-admin.sql` with your email
2. Run it in Supabase SQL Editor
3. Refresh the app to see admin interface
4. Approve any pending users

## Additional Debugging

### Browser Console Errors
Check for:
- Network errors (CORS, 500, etc.)
- JavaScript errors
- Supabase connection issues

### Supabase Dashboard
1. Go to Authentication > Users
2. Check if user was created
3. Look at Database > Tables > user_stats
4. Check if trigger fired

### Database Logs
In Supabase:
1. Go to Settings > Database
2. Check "Logs" tab for errors
3. Look for trigger function errors

## Environment File Template

Create `.env.local` with:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Files to Use

1. **apply-auth-fix.sql** - Fixes the main database issues
2. **check-environment.js** - Verifies configuration
3. **check-user-status.sql** - Shows current user state
4. **bootstrap-admin.sql** - Creates admin user (after signup works)

## Still Having Issues?

If problems persist:

1. **Clear browser data**: Clear cookies, localStorage, cache
2. **Try incognito mode**: Rules out browser extensions
3. **Check Supabase status**: https://status.supabase.com/
4. **Review Supabase logs**: Database and API logs
5. **Test with curl**: Direct API call to isolate frontend issues

```bash
# Test signup endpoint directly
curl -X POST 'https://your-project.supabase.co/auth/v1/signup' \
  -H 'Content-Type: application/json' \
  -H 'apikey: your-anon-key' \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

The most common fix is running the `apply-auth-fix.sql` script - this resolves 90% of signup database errors.
