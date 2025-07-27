# Environment Setup for MeetingMind

## Required Environment Variables

To connect to Supabase, you need to create a `.env.local` file in the project root with the following variables:

### 1. Create `.env.local` file

```bash
# Copy and paste this into a new file called .env.local
# DO NOT commit .env.local to version control

# OpenAI API Key (optional - for AI template generation)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
# Project URL
VITE_SUPABASE_URL=https://bqgvqxlqecfgmhwgitts.supabase.co

# Anonymous Key (public - safe for client-side use)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxZ3ZxeGxxZWNmZ21od2dpdHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NTI0OTksImV4cCI6MjA2OTIyODQ5OX0.whj16FT-G8uvo-9xiUVHToLeSJPawi8K1URZW-Wy8II

# Service Role Key (PRIVATE - keep secure, only for admin operations)
# Optional: Only needed for advanced admin functions
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxZ3ZxeGxxZWNmZ21od2dpdHRzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY1MjQ5OSwiZXhwIjoyMDY5MjI4NDk5fQ.Stsq9OoGigStgyuaAbZx3PI4R3yuxshGFBty4fukZLY
```

### 2. Database Setup

1. **Go to your Supabase project**: https://bqgvqxlqecfgmhwgitts.supabase.co
2. **Navigate to**: SQL Editor → New Query
3. **Copy and paste** the entire contents of `database-schema.sql`
4. **Run the query** to create all tables, policies, and triggers

### 3. Start Development

```bash
npm run dev
```

## Security Notes

- ✅ **Anonymous Key**: Safe to use in client-side code
- ⚠️ **Service Role Key**: Keep private, never expose in client code
- 🔒 **Environment Variables**: Always use `.env.local` for sensitive data
- 📝 **Git**: Make sure `.env.local` is in `.gitignore`

## Credentials Source

These credentials are for the MeetingMind Supabase project:

- **Project**: `bqgvqxlqecfgmhwgitts`
- **Region**: US East (Virginia)
- **Plan**: Free tier (suitable for development and small teams)

## Getting Your Own Supabase Project

If you want to create your own Supabase project:

1. Go to [supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Get your project URL and API keys from Settings → API
4. Run the `database-schema.sql` script in your project's SQL editor
5. Update the `.env.local` file with your new credentials
