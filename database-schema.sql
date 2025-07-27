-- MeetingMind Database Schema for Supabase
-- This script creates all tables, relationships, and security policies

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE achievement_category AS ENUM ('objectives', 'key-results', 'check-ins', 'consistency', 'performance', 'collaboration');
CREATE TYPE achievement_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');
CREATE TYPE objective_category AS ENUM ('revenue', 'operational', 'customer', 'team', 'compliance', 'innovation');
CREATE TYPE objective_level AS ENUM ('company', 'team', 'individual');
CREATE TYPE objective_status AS ENUM ('draft', 'active', 'completed', 'cancelled');
CREATE TYPE cycle_status AS ENUM ('planning', 'active', 'review', 'completed');
CREATE TYPE game_event_type AS ENUM ('achievement_unlocked', 'level_up', 'streak_milestone', 'objective_completed', 'milestone_reached');
CREATE TYPE theme_type AS ENUM ('light', 'dark', 'auto');
CREATE TYPE default_view_type AS ENUM ('meetings', 'okr');

-- User Stats Table
CREATE TABLE user_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL DEFAULT 'User',
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
    category achievement_category NOT NULL,
    rarity achievement_rarity NOT NULL,
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
    category objective_category NOT NULL,
    level objective_level NOT NULL,
    owner TEXT NOT NULL,
    quarter TEXT NOT NULL,
    year INTEGER NOT NULL,
    aligned_to UUID REFERENCES objectives(id) ON DELETE SET NULL,
    confidence_level INTEGER DEFAULT 5 CHECK (confidence_level >= 1 AND confidence_level <= 10),
    status objective_status DEFAULT 'draft',
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
    status cycle_status DEFAULT 'planning',
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
    type game_event_type NOT NULL,
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
    theme theme_type DEFAULT 'auto',
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
    default_view default_view_type DEFAULT 'meetings',
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

-- Insert sample achievement definitions (these will be used by the frontend)
INSERT INTO public.achievement_definitions (id, name, description, icon, category, rarity, points, condition_type, condition_target, condition_metric) VALUES
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

-- Create achievement definitions table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS achievement_definitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category achievement_category NOT NULL,
    rarity achievement_rarity NOT NULL,
    points INTEGER NOT NULL,
    condition_type TEXT NOT NULL,
    condition_target INTEGER NOT NULL,
    condition_metric TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comment on the database
COMMENT ON DATABASE postgres IS 'MeetingMind - Final Expense Insurance Call Center OKR and Meeting Management System with Gamification';

-- This completes the database schema setup
-- Execute this script in your Supabase SQL editor to create all the necessary tables and policies 