-- API Key Management and Usage Tracking Schema
-- Run this after applying to create the API key management system

-- 1. User API Keys table (encrypted storage)
CREATE TABLE user_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL DEFAULT 'openai', -- openai, anthropic, etc
  api_key_encrypted TEXT NOT NULL, -- Encrypted API key
  api_key_name VARCHAR(100), -- User-friendly name (e.g., "My OpenAI Key")
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE,
  usage_limit_monthly DECIMAL(10,2) DEFAULT 50.00, -- Monthly limit in USD
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, provider, api_key_name)
);

-- 2. API Usage Tracking table
CREATE TABLE api_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_id UUID NOT NULL REFERENCES user_api_keys(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL, -- gpt-4, gpt-3.5-turbo, etc
  feature_used VARCHAR(100) NOT NULL, -- template_generation, ai_coaching, analysis, etc
  tokens_used INTEGER NOT NULL,
  estimated_cost DECIMAL(8,4) NOT NULL, -- Cost in USD
  request_data JSONB, -- Store request details (sanitized)
  response_data JSONB, -- Store response metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

-- 3. Rate Limiting table
CREATE TABLE user_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  requests_per_hour INTEGER DEFAULT 60,
  requests_per_day INTEGER DEFAULT 500,
  tokens_per_hour INTEGER DEFAULT 50000,
  tokens_per_day INTEGER DEFAULT 500000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(user_id, provider)
);

-- 4. Usage Statistics View
CREATE VIEW user_usage_stats AS
SELECT 
  u.user_id,
  u.provider,
  DATE_TRUNC('month', u.created_at) as month,
  COUNT(*) as total_requests,
  SUM(u.tokens_used) as total_tokens,
  SUM(u.estimated_cost) as total_cost,
  COUNT(CASE WHEN u.success = false THEN 1 END) as failed_requests,
  MAX(u.created_at) as last_request_at
FROM api_usage_logs u
GROUP BY u.user_id, u.provider, DATE_TRUNC('month', u.created_at);

-- 5. Real-time Rate Limiting View
CREATE VIEW current_usage_rates AS
SELECT 
  user_id,
  provider,
  -- Last hour
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '1 hour' THEN 1 END) as requests_last_hour,
  SUM(CASE WHEN created_at >= NOW() - INTERVAL '1 hour' THEN tokens_used ELSE 0 END) as tokens_last_hour,
  -- Last day
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as requests_last_day,
  SUM(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN tokens_used ELSE 0 END) as tokens_last_day,
  -- This month
  SUM(CASE WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW()) THEN estimated_cost ELSE 0 END) as cost_this_month
FROM api_usage_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY user_id, provider;

-- 6. Indexes for performance
CREATE INDEX idx_api_usage_user_time ON api_usage_logs(user_id, created_at DESC);
CREATE INDEX idx_api_usage_provider_time ON api_usage_logs(provider, created_at DESC);
CREATE INDEX idx_user_api_keys_active ON user_api_keys(user_id, is_active) WHERE is_active = true;

-- 7. Row Level Security
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own API keys and usage
CREATE POLICY "Users can manage their own API keys" ON user_api_keys
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own usage logs" ON api_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage logs" ON api_usage_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can manage their own rate limits" ON user_rate_limits
  FOR ALL USING (auth.uid() = user_id);

-- 8. Functions for API key management
CREATE OR REPLACE FUNCTION encrypt_api_key(api_key TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Simple encryption - in production, use proper encryption with pgcrypto
  RETURN encode(digest(api_key || 'meetingmind_salt', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(p_user_id UUID, p_provider VARCHAR)
RETURNS JSONB AS $$
DECLARE
  user_limits RECORD;
  current_usage RECORD;
  result JSONB;
BEGIN
  -- Get user's rate limits
  SELECT * INTO user_limits 
  FROM user_rate_limits 
  WHERE user_id = p_user_id AND provider = p_provider;
  
  -- If no limits set, use defaults
  IF user_limits IS NULL THEN
    INSERT INTO user_rate_limits (user_id, provider) VALUES (p_user_id, p_provider);
    SELECT * INTO user_limits FROM user_rate_limits WHERE user_id = p_user_id AND provider = p_provider;
  END IF;
  
  -- Get current usage
  SELECT * INTO current_usage FROM current_usage_rates WHERE user_id = p_user_id AND provider = p_provider;
  
  -- Check limits
  result := jsonb_build_object(
    'allowed', true,
    'hourly_requests', COALESCE(current_usage.requests_last_hour, 0),
    'hourly_limit', user_limits.requests_per_hour,
    'daily_requests', COALESCE(current_usage.requests_last_day, 0),
    'daily_limit', user_limits.requests_per_day,
    'monthly_cost', COALESCE(current_usage.cost_this_month, 0)
  );
  
  -- Check if limits exceeded
  IF COALESCE(current_usage.requests_last_hour, 0) >= user_limits.requests_per_hour THEN
    result := jsonb_set(result, '{allowed}', 'false'::jsonb);
    result := jsonb_set(result, '{reason}', '"Hourly request limit exceeded"'::jsonb);
  ELSIF COALESCE(current_usage.requests_last_day, 0) >= user_limits.requests_per_day THEN
    result := jsonb_set(result, '{allowed}', 'false'::jsonb);
    result := jsonb_set(result, '{reason}', '"Daily request limit exceeded"'::jsonb);
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Function to log API usage
CREATE OR REPLACE FUNCTION log_api_usage(
  p_user_id UUID,
  p_api_key_id UUID,
  p_provider VARCHAR,
  p_model VARCHAR,
  p_feature VARCHAR,
  p_tokens INTEGER,
  p_cost DECIMAL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  usage_id UUID;
BEGIN
  INSERT INTO api_usage_logs (
    user_id, api_key_id, provider, model, feature_used, 
    tokens_used, estimated_cost, success, error_message
  ) VALUES (
    p_user_id, p_api_key_id, p_provider, p_model, p_feature,
    p_tokens, p_cost, p_success, p_error_message
  ) RETURNING id INTO usage_id;
  
  -- Update last_used_at for the API key
  UPDATE user_api_keys SET last_used_at = NOW() WHERE id = p_api_key_id;
  
  RETURN usage_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
