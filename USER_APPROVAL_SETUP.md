# User Approval System Setup Guide

## Problem: "Approval Pending" with No Admin Interface

If you're seeing "Approval Pending" and can't find where to approve users, it's because you need to set up the first admin user.

## Quick Solution

### Step 1: Sign Up First
1. Start your app: `npm run dev`
2. Go to the signup page
3. Create an account with your email (you'll be stuck on "Approval Pending" - that's normal!)

### Step 2: Make Yourself Admin
1. Open the file `bootstrap-admin.sql`
2. Replace `'eyecrackcodes@gmail.com'` with the email you just used to sign up
3. Go to your Supabase project dashboard
4. Navigate to SQL Editor
5. Copy and paste the entire `bootstrap-admin.sql` script
6. Click "Run" to execute it

### Step 3: Access Admin Interface
1. Refresh your app
2. You should now see an "Admin Access" badge
3. You'll have access to the user approval interface

## What You'll See as Admin

Once you're an admin, you'll see:
- **Pending Approvals**: List of users waiting for approval
- **Approval Actions**: Approve/Reject buttons for each user
- **User Management**: Full control over user roles and permissions
- **Approval History**: Log of all approval actions

## Admin Interface Features

### Approving Users
- Click "Approve" to give users access
- Optionally change their role (agent, team_lead, manager, admin)
- Add approval notes

### Rejecting Users
- Click "Reject" with a reason
- Users will see the rejection reason
- They can contact you to resolve issues

### User Roles
- **Agent**: Basic user access
- **Team Lead**: Can manage their team
- **Manager**: Can manage multiple teams
- **Admin**: Full system access (can approve users)

## Troubleshooting

### "User not found" Error
- Make sure you signed up through the app first
- Check that the email in the script exactly matches your signup email
- Case sensitivity matters!

### Still Seeing "Approval Pending"
- Clear your browser cache/cookies
- Log out and log back in
- Check the database to confirm the script ran successfully

### Script Errors
- Make sure your Supabase database schema is up to date
- Run `supabase-schema.pgsql` first if needed
- Check the SQL Editor for error messages

## Database Verification

To check if the setup worked, run this query in Supabase SQL Editor:

```sql
-- Check admin users
SELECT email, role, approval_status, approved_at 
FROM user_stats 
WHERE role = 'admin';

-- Check pending users
SELECT email, approval_status, created_at 
FROM user_stats 
WHERE approval_status = 'pending';
```

## Need Help?

If you're still having issues:
1. Check the browser console for errors
2. Verify your Supabase connection
3. Ensure the database schema is properly applied
4. Contact support with the specific error messages

Once you have admin access, you can approve all other users through the web interface!
