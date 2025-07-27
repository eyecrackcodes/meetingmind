-- MeetingMind Database Schema for Supabase (PostgreSQL)
-- This script creates all tables, relationships, and security policies
-- 
-- IMPORTANT: This file uses PostgreSQL syntax, not SQL Server
-- If your IDE shows linter errors, configure it for PostgreSQL or ignore .pgsql files
--
-- To execute: Copy and paste this entire script into Supabase SQL Editor
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create lookup tables for enums
CREATE TABLE achievement_category (
    category TEXT PRIMARY KEY CHECK (category IN ('objectives', 'key-results', 'check-ins', 'consistency', 'performance', 'collaboration'))
);
INSERT INTO achievement_category (category) VALUES
    ('objectives'), ('key-results'), ('check-ins'), ('consistency'), ('performance'), ('collaboration');

CREATE TABLE achievement_rarity (
    rarity TEXT PRIMARY KEY CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary'))
);
INSERT INTO achievement_rarity (rarity) VALUES
    ('common'), ('uncommon'), ('rare'), ('epic'), ('legendary');

CREATE TABLE objective_category (
    category TEXT PRIMARY KEY CHECK (category IN ('revenue', 'operational', 'customer', 'team', 'compliance', 'innovation'))
);
INSERT INTO objective_category (category) VALUES
    ('revenue'), ('operational'), ('customer'), ('team'), ('compliance'), ('innovation');

CREATE TABLE objective_level (
    level TEXT PRIMARY KEY CHECK (level IN ('company', 'team', 'individual'))
);
INSERT INTO objective_level (level) VALUES
    ('company'), ('team'), ('individual');
CREATE TABLE objective_status (
    status TEXT PRIMARY KEY CHECK (status IN ('draft', 'active', 'completed', 'cancelled', 'archived'))
);
INSERT INTO objective_status (status) VALUES 
    ('draft'), ('active'), ('completed'), ('cancelled'), ('archived');

CREATE TABLE cycle_status (
    status TEXT PRIMARY KEY CHECK (status IN ('planning', 'active', 'review', 'completed', 'archived'))
);
INSERT INTO cycle_status (status) VALUES
    ('planning'), ('active'), ('review'), ('completed'), ('archived');

CREATE TABLE game_event_type (
    event_type TEXT PRIMARY KEY CHECK (event_type IN ('achievement_unlocked', 'level_up', 'streak_milestone', 'objective_completed', 'milestone_reached'))
);
INSERT INTO game_event_type (event_type) VALUES
    ('achievement_unlocked'), ('level_up'), ('streak_milestone'), ('objective_completed'), ('milestone_reached');

CREATE TABLE theme_type (
    theme TEXT PRIMARY KEY CHECK (theme IN ('light', 'dark', 'auto'))
);
INSERT INTO theme_type (theme) VALUES
    ('light'), ('dark'), ('auto');

CREATE TABLE default_view_type (
    view_type TEXT PRIMARY KEY CHECK (view_type IN ('meetings', 'okr'))
);
INSERT INTO default_view_type (view_type) VALUES
    ('meetings'), ('okr');

-- User Stats Table (Enhanced with Profile Fields)
CREATE TABLE user_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL DEFAULT 'User',
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'agent' CHECK (role IN ('agent', 'team_lead', 'manager', 'admin')),
    department TEXT,
    team TEXT,
    license_states TEXT[],
    hire_date DATE,
    avatar TEXT,
    level INTEGER DEFAULT 1,
    total_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    join_date TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW(),
    stats JSONB DEFAULT '{
        "objectives_created": 0,
        "objectives_completed": 0,
        "key_results_achieved": 0,
        "check_ins_completed": 0,
        "avg_confidence_level": 0,
        "avg_progress_rate": 0,
        "total_sessions": 0,
        "total_time_spent": 0
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements Table
CREATE TABLE achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL REFERENCES achievement_category(category),
    rarity TEXT NOT NULL REFERENCES achievement_rarity(rarity),
    points INTEGER NOT NULL,
    unlocked_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Objectives Table
CREATE TABLE objectives (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL REFERENCES objective_category(category),
    level TEXT NOT NULL REFERENCES objective_level(level),
    owner TEXT NOT NULL,
    quarter TEXT NOT NULL,
    year INTEGER NOT NULL,
    aligned_to UUID REFERENCES objectives(id) ON DELETE SET NULL,
    confidence_level INTEGER DEFAULT 5 CHECK (confidence_level >= 1 AND confidence_level <= 10),
    status TEXT DEFAULT 'draft' REFERENCES objective_status(status),
    created_date TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    key_results JSONB DEFAULT '[]'::jsonb,
    check_ins JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OKR Cycles Table
CREATE TABLE okr_cycles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quarter INTEGER NOT NULL CHECK (quarter >= 1 AND quarter <= 4),
    year INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'planning' REFERENCES cycle_status(status),
    cycle_theme TEXT,
    company_priorities TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting Templates Table
CREATE TABLE meeting_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    meeting_title TEXT NOT NULL,
    meeting_date TEXT NOT NULL,
    facilitator TEXT NOT NULL,
    core_question TEXT NOT NULL,
    meeting_context TEXT NOT NULL,
    sections JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Sessions Table
CREATE TABLE user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    total_time_spent INTEGER DEFAULT 0, -- in minutes
    activities JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Events Table
CREATE TABLE game_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id TEXT NOT NULL,
    type TEXT NOT NULL REFERENCES game_event_type(event_type),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    points INTEGER NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences Table
CREATE TABLE user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'auto' REFERENCES theme_type(theme),
    notifications JSONB DEFAULT '{
        "achievements": true,
        "reminders": true,
        "deadlines": true,
        "weekly_summary": true
    }'::jsonb,
    gamification JSONB DEFAULT '{
        "enabled": true,
        "show_leaderboards": true,
        "show_points": true,
        "show_achievements": true
    }'::jsonb,
    default_view TEXT DEFAULT 'meetings' REFERENCES default_view_type(view_type),
    auto_save BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);
CREATE INDEX idx_objectives_user_id ON objectives(user_id);
CREATE INDEX idx_objectives_status ON objectives(status);
CREATE INDEX idx_objectives_category ON objectives(category);
CREATE INDEX idx_objectives_quarter_year ON objectives(quarter, year);
CREATE INDEX idx_okr_cycles_user_id ON okr_cycles(user_id);
CREATE INDEX idx_okr_cycles_year_quarter ON okr_cycles(year, quarter);
CREATE INDEX idx_meeting_templates_user_id ON meeting_templates(user_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_start_time ON user_sessions(start_time);
CREATE INDEX idx_game_events_user_id ON game_events(user_id);
CREATE INDEX idx_game_events_type ON game_events(type);
CREATE INDEX idx_game_events_timestamp ON game_events(timestamp);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Create unique constraints
ALTER TABLE user_stats ADD CONSTRAINT unique_user_stats_per_user UNIQUE (user_id);
ALTER TABLE achievements ADD CONSTRAINT unique_achievement_per_user UNIQUE (user_id, achievement_id);
ALTER TABLE user_preferences ADD CONSTRAINT unique_preferences_per_user UNIQUE (user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE okr_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User Stats Policies
CREATE POLICY "Users can view their own stats" ON user_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON user_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON user_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Achievements Policies
CREATE POLICY "Users can view their own achievements" ON achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Objectives Policies
CREATE POLICY "Users can view their own objectives" ON objectives
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own objectives" ON objectives
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own objectives" ON objectives
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own objectives" ON objectives
    FOR DELETE USING (auth.uid() = user_id);

-- OKR Cycles Policies
CREATE POLICY "Users can view their own cycles" ON okr_cycles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cycles" ON okr_cycles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cycles" ON okr_cycles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cycles" ON okr_cycles
    FOR DELETE USING (auth.uid() = user_id);

-- Meeting Templates Policies
CREATE POLICY "Users can view their own templates" ON meeting_templates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates" ON meeting_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON meeting_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON meeting_templates
    FOR DELETE USING (auth.uid() = user_id);

-- User Sessions Policies
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Game Events Policies
CREATE POLICY "Users can view their own events" ON game_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events" ON game_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Preferences Policies
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_objectives_updated_at BEFORE UPDATE ON objectives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_okr_cycles_updated_at BEFORE UPDATE ON okr_cycles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_templates_updated_at BEFORE UPDATE ON meeting_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to initialize user data
CREATE OR REPLACE FUNCTION initialize_user_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Create user stats record
    INSERT INTO user_stats (user_id, username)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'User')
    );
    
    -- Create user preferences record
    INSERT INTO user_preferences (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to initialize user data on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION initialize_user_data();

-- Create view for user dashboard data
CREATE OR REPLACE VIEW user_dashboard AS
SELECT 
    us.user_id,
    us.username,
    us.level,
    us.total_points,
    us.current_streak,
    us.longest_streak,
    us.stats,
    COUNT(DISTINCT a.id) as total_achievements,
    COUNT(DISTINCT o.id) as total_objectives,
    COUNT(DISTINCT CASE WHEN o.status = 'completed' THEN o.id END) as completed_objectives,
    COUNT(DISTINCT oc.id) as total_cycles
FROM user_stats us
LEFT JOIN achievements a ON us.user_id = a.user_id
LEFT JOIN objectives o ON us.user_id = o.user_id
LEFT JOIN okr_cycles oc ON us.user_id = oc.user_id
GROUP BY us.user_id, us.username, us.level, us.total_points, us.current_streak, us.longest_streak, us.stats;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create achievement definitions table first
CREATE TABLE IF NOT EXISTS achievement_definitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL REFERENCES achievement_category(category),
    rarity TEXT NOT NULL REFERENCES achievement_rarity(rarity),
    points INTEGER NOT NULL,
    condition_type TEXT NOT NULL,
    condition_target INTEGER NOT NULL,
    condition_metric TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample achievement definitions (these will be used by the frontend)
INSERT INTO achievement_definitions (id, name, description, icon, category, rarity, points, condition_type, condition_target, condition_metric) VALUES
('first_objective', 'Getting Started', 'Create your first objective', '🎯', 'objectives', 'common', 100, 'count', 1, 'objectives_created'),
('objective_master', 'Objective Master', 'Create 10 objectives', '🏆', 'objectives', 'uncommon', 500, 'count', 10, 'objectives_created'),
('strategic_planner', 'Strategic Planner', 'Complete 5 objectives', '🎖️', 'objectives', 'rare', 1000, 'count', 5, 'objectives_completed'),
('key_achiever', 'Key Achiever', 'Achieve your first key result', '🔑', 'key-results', 'common', 200, 'count', 1, 'key_results_achieved'),
('results_champion', 'Results Champion', 'Achieve 25 key results', '🏅', 'key-results', 'epic', 2500, 'count', 25, 'key_results_achieved'),
('first_checkin', 'Regular Reporter', 'Complete your first check-in', '📊', 'check-ins', 'common', 50, 'count', 1, 'check_ins_completed'),
('consistent_tracker', 'Consistent Tracker', 'Complete 20 check-ins', '📈', 'check-ins', 'uncommon', 400, 'count', 20, 'check_ins_completed'),
('week_warrior', 'Week Warrior', 'Maintain a 7-day check-in streak', '🔥', 'consistency', 'uncommon', 300, 'streak', 7, 'check_ins_streak'),
('streak_master', 'Streak Master', 'Maintain a 30-day check-in streak', '⚡', 'consistency', 'rare', 1500, 'streak', 30, 'check_ins_streak'),
('dedication_legend', 'Dedication Legend', 'Maintain a 100-day check-in streak', '🌟', 'consistency', 'legendary', 5000, 'streak', 100, 'check_ins_streak'),
('confident_leader', 'Confident Leader', 'Maintain average confidence level above 8', '💪', 'performance', 'rare', 800, 'percentage', 8, 'avg_confidence_level'),
('sales_superstar', 'Sales Superstar', 'Complete a revenue-focused objective', '💰', 'performance', 'uncommon', 600, 'count', 1, 'revenue_objectives_completed'),
('customer_champion', 'Customer Champion', 'Complete a customer-focused objective', '❤️', 'performance', 'uncommon', 600, 'count', 1, 'customer_objectives_completed'),
('compliance_expert', 'Compliance Expert', 'Complete a compliance-focused objective', '🛡️', 'performance', 'uncommon', 600, 'count', 1, 'compliance_objectives_completed'),
('team_player', 'Team Player', 'Create a team-level objective', '🤝', 'collaboration', 'common', 250, 'count', 1, 'team_objectives_created'),
('mentor', 'Mentor', 'Help complete 5 team objectives', '🎓', 'collaboration', 'epic', 2000, 'count', 5, 'team_objectives_completed')
ON CONFLICT DO NOTHING;



-- Archive Operations Table
CREATE TABLE archive_operations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('objective', 'cycle', 'template')),
    resource_id UUID NOT NULL,
    resource_title TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('archive', 'restore', 'delete')),
    reason TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    can_restore BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams Table
CREATE TABLE teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members Table
CREATE TABLE team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'lead', 'manager')),
    joined_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, team_id)
);

-- AI Insights Table
CREATE TABLE ai_insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('progress', 'risk', 'opportunity', 'recommendation')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    objective_ids UUID[],
    action_items TEXT[],
    deadline TIMESTAMPTZ,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comment on the database
COMMENT ON DATABASE postgres IS 'MeetingMind - Final Expense Insurance Call Center OKR and Meeting Management System with Gamification';

-- This completes the database schema setup
-- Execute this script in your Supabase SQL editor to create all the necessary tables and policies 