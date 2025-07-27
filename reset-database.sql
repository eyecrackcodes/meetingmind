-- Reset Database Script for MeetingMind
-- This safely drops all existing tables and recreates them fresh
-- Run this BEFORE applying supabase-schema.pgsql

-- SAFETY WARNING: This will delete ALL existing data!
-- Only run this if you're okay with starting fresh

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS user_approval_history CASCADE;
DROP TABLE IF EXISTS achievement_definitions CASCADE;
DROP TABLE IF EXISTS game_events CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS meeting_templates CASCADE;
DROP TABLE IF EXISTS okr_cycles CASCADE;
DROP TABLE IF EXISTS objectives CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS ai_insights CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS archive_operations CASCADE;

-- Drop lookup tables
DROP TABLE IF EXISTS default_view_type CASCADE;
DROP TABLE IF EXISTS theme_type CASCADE;
DROP TABLE IF EXISTS game_event_type CASCADE;
DROP TABLE IF EXISTS cycle_status CASCADE;
DROP TABLE IF EXISTS objective_status CASCADE;
DROP TABLE IF EXISTS objective_level CASCADE;
DROP TABLE IF EXISTS objective_category CASCADE;
DROP TABLE IF EXISTS achievement_rarity CASCADE;
DROP TABLE IF EXISTS achievement_category CASCADE;
DROP TABLE IF EXISTS user_approval_status CASCADE;

-- Drop custom functions
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS handle_approval_status_change CASCADE;
DROP FUNCTION IF EXISTS initialize_user_data CASCADE;
DROP FUNCTION IF EXISTS is_admin CASCADE;
DROP FUNCTION IF EXISTS is_approved CASCADE;

-- Drop views
DROP VIEW IF EXISTS user_dashboard CASCADE;

-- Success message
SELECT 'Database reset complete! Now run supabase-schema.pgsql' as status; 