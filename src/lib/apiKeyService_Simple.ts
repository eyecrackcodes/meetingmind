// Simplified API Key Management Service for immediate implementation
// This version uses localStorage initially and can be migrated to database later

export interface UserApiKey {
  id: string;
  provider: 'openai' | 'anthropic';
  api_key_name: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  usage_limit_monthly: number;
  // Usage tracking (in-memory for demo, should be database in production)
  current_month_usage: number;
  requests_today: number;
  requests_hour: number;
}

export interface ApiUsageLog {
  id: string;
  timestamp: string;
  provider: string;
  model: string;
  feature_used: string;
  tokens_used: number;
  estimated_cost: number;
  success: boolean;
  error_message?: string;
}

export interface RateLimitStatus {
  allowed: boolean;
  reason?: string;
  hourly_requests: number;
  hourly_limit: number;
  daily_requests: number;
  daily_limit: number;
  monthly_cost: number;
}

export interface UsageStats {
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  failed_requests: number;
  last_request_at: string;
}

// OpenAI pricing (as of 2024)
const OPENAI_PRICING = {
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
  'gpt-3.5-turbo-16k': { input: 0.003, output: 0.004 },
};

// Default rate limits
const DEFAULT_LIMITS = {
  requests_per_hour: 60,
  requests_per_day: 500,
  tokens_per_hour: 50000,
  tokens_per_day: 500000,
};

export class ApiKeyService {
  private static instance: ApiKeyService;
  private storageKey = 'meetingmind_api_keys';
  private usageKey = 'meetingmind_usage_logs';

  private constructor() {}

  static getInstance(): ApiKeyService {
    if (!ApiKeyService.instance) {
      ApiKeyService.instance = new ApiKeyService();
    }
    return ApiKeyService.instance;
  }

  // Simple encryption (for demo - use proper encryption in production)
  private encryptApiKey(apiKey: string): string {
    return btoa(apiKey + 'meetingmind_salt');
  }

  private decryptApiKey(encryptedKey: string): string {
    try {
      const decrypted = atob(encryptedKey);
      return decrypted.replace('meetingmind_salt', '');
    } catch {
      throw new Error('Invalid encrypted API key');
    }
  }

  // Get stored API keys
  private getStoredKeys(): UserApiKey[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Save API keys to storage
  private saveKeys(keys: UserApiKey[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(keys));
  }

  // Get usage logs
  private getUsageLogs(): ApiUsageLog[] {
    try {
      const stored = localStorage.getItem(this.usageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Save usage logs
  private saveUsageLogs(logs: ApiUsageLog[]): void {
    // Keep only last 1000 logs to prevent storage overflow
    const recentLogs = logs.slice(-1000);
    localStorage.setItem(this.usageKey, JSON.stringify(recentLogs));
  }

  // Validate API key by making a test request
  private async validateApiKey(provider: 'openai' | 'anthropic', apiKey: string): Promise<boolean> {
    try {
      if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        });
        return response.ok;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Save user's API key
  async saveApiKey(
    provider: 'openai' | 'anthropic',
    apiKey: string,
    keyName: string,
    monthlyLimit: number = 50
  ): Promise<boolean> {
    try {
      // Validate API key format
      if (provider === 'openai' && !apiKey.startsWith('sk-')) {
        throw new Error('Invalid OpenAI API key format');
      }

      // Test the API key
      const isValid = await this.validateApiKey(provider, apiKey);
      if (!isValid) {
        throw new Error('API key validation failed');
      }

      const keys = this.getStoredKeys();
      const encryptedKey = this.encryptApiKey(apiKey);

      // Check if key with same name exists
      const existingIndex = keys.findIndex(k => k.provider === provider && k.api_key_name === keyName);

      const newKey: UserApiKey = {
        id: existingIndex >= 0 ? keys[existingIndex].id : `key_${Date.now()}`,
        provider,
        api_key_name: keyName,
        is_active: true,
        created_at: new Date().toISOString(),
        last_used_at: null,
        usage_limit_monthly: monthlyLimit,
        current_month_usage: 0,
        requests_today: 0,
        requests_hour: 0,
      };

      if (existingIndex >= 0) {
        keys[existingIndex] = newKey;
      } else {
        keys.push(newKey);
      }

      this.saveKeys(keys);
      
      // Also store the encrypted key separately for retrieval
      localStorage.setItem(`api_key_${newKey.id}`, encryptedKey);
      
      return true;
    } catch (error) {
      console.error('Error saving API key:', error);
      throw error;
    }
  }

  // Get user's API keys
  async getUserApiKeys(): Promise<UserApiKey[]> {
    return this.getStoredKeys().filter(key => key.is_active);
  }

  // Get active API key for provider
  async getActiveApiKey(provider: 'openai' | 'anthropic'): Promise<string | null> {
    const keys = this.getStoredKeys();
    const activeKey = keys.find(key => key.provider === provider && key.is_active);
    
    if (!activeKey) return null;

    try {
      const encryptedKey = localStorage.getItem(`api_key_${activeKey.id}`);
      if (!encryptedKey) return null;
      
      return this.decryptApiKey(encryptedKey);
    } catch {
      return null;
    }
  }

  // Check rate limits
  async checkRateLimit(provider: 'openai' | 'anthropic'): Promise<RateLimitStatus> {
    const keys = this.getStoredKeys();
    const activeKey = keys.find(key => key.provider === provider && key.is_active);
    
    if (!activeKey) {
      return {
        allowed: false,
        reason: 'No active API key found',
        hourly_requests: 0,
        hourly_limit: DEFAULT_LIMITS.requests_per_hour,
        daily_requests: 0,
        daily_limit: DEFAULT_LIMITS.requests_per_day,
        monthly_cost: 0,
      };
    }

    // Check current usage against limits
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const logs = this.getUsageLogs();
    const recentLogs = logs.filter(log => 
      log.provider === provider && new Date(log.timestamp) >= dayAgo
    );

    const hourlyRequests = recentLogs.filter(log => 
      new Date(log.timestamp) >= hourAgo
    ).length;

    const dailyRequests = recentLogs.length;

    const monthlyUsage = this.getCurrentMonthUsage(provider);

    // Check limits
    let allowed = true;
    let reason = '';

    if (hourlyRequests >= DEFAULT_LIMITS.requests_per_hour) {
      allowed = false;
      reason = 'Hourly request limit exceeded';
    } else if (dailyRequests >= DEFAULT_LIMITS.requests_per_day) {
      allowed = false;
      reason = 'Daily request limit exceeded';
    } else if (monthlyUsage >= activeKey.usage_limit_monthly) {
      allowed = false;
      reason = 'Monthly usage limit exceeded';
    }

    return {
      allowed,
      reason,
      hourly_requests: hourlyRequests,
      hourly_limit: DEFAULT_LIMITS.requests_per_hour,
      daily_requests: dailyRequests,
      daily_limit: DEFAULT_LIMITS.requests_per_day,
      monthly_cost: monthlyUsage,
    };
  }

  // Calculate cost for tokens
  calculateCost(model: string, inputTokens: number, outputTokens: number = 0): number {
    const pricing = OPENAI_PRICING[model as keyof typeof OPENAI_PRICING];
    if (!pricing) return 0;

    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    return Number((inputCost + outputCost).toFixed(4));
  }

  // Estimate tokens in text
  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  // Log API usage
  async logUsage(
    provider: 'openai' | 'anthropic',
    model: string,
    feature: string,
    tokensUsed: number,
    cost: number,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    const logs = this.getUsageLogs();
    
    const newLog: ApiUsageLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      provider,
      model,
      feature_used: feature,
      tokens_used: tokensUsed,
      estimated_cost: cost,
      success,
      error_message: errorMessage,
    };

    logs.push(newLog);
    this.saveUsageLogs(logs);

    // Update key usage
    const keys = this.getStoredKeys();
    const keyIndex = keys.findIndex(key => key.provider === provider && key.is_active);
    if (keyIndex >= 0) {
      keys[keyIndex].last_used_at = new Date().toISOString();
      keys[keyIndex].current_month_usage += cost;
      this.saveKeys(keys);
    }
  }

  // Get current month usage
  private getCurrentMonthUsage(provider: string): number {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const logs = this.getUsageLogs();
    return logs
      .filter(log => 
        log.provider === provider && 
        new Date(log.timestamp) >= monthStart &&
        log.success
      )
      .reduce((sum, log) => sum + log.estimated_cost, 0);
  }

  // Get usage statistics
  async getUsageStats(provider?: string): Promise<UsageStats[]> {
    const logs = this.getUsageLogs();
    const filteredLogs = provider ? logs.filter(log => log.provider === provider) : logs;
    
    // Group by month
    const monthlyStats: Record<string, UsageStats> = {};
    
    filteredLogs.forEach(log => {
      const month = log.timestamp.slice(0, 7); // YYYY-MM
      
      if (!monthlyStats[month]) {
        monthlyStats[month] = {
          total_requests: 0,
          total_tokens: 0,
          total_cost: 0,
          failed_requests: 0,
          last_request_at: log.timestamp,
        };
      }
      
      const stats = monthlyStats[month];
      stats.total_requests++;
      stats.total_tokens += log.tokens_used;
      if (log.success) {
        stats.total_cost += log.estimated_cost;
      } else {
        stats.failed_requests++;
      }
      
      if (log.timestamp > stats.last_request_at) {
        stats.last_request_at = log.timestamp;
      }
    });
    
    return Object.values(monthlyStats);
  }

  // Get recent usage logs
  async getRecentUsage(limit: number = 50): Promise<ApiUsageLog[]> {
    const logs = this.getUsageLogs();
    return logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Delete API key
  async deleteApiKey(keyId: string): Promise<boolean> {
    try {
      const keys = this.getStoredKeys();
      const updatedKeys = keys.map(key => 
        key.id === keyId ? { ...key, is_active: false } : key
      );
      
      this.saveKeys(updatedKeys);
      localStorage.removeItem(`api_key_${keyId}`);
      return true;
    } catch {
      return false;
    }
  }

  // Update rate limits (for future database implementation)
  async updateRateLimits(
    provider: 'openai' | 'anthropic',
    limits: {
      requests_per_hour?: number;
      requests_per_day?: number;
    }
  ): Promise<boolean> {
    // For now, this would update default limits
    // In database implementation, this would update user_rate_limits table
    console.log('Rate limits update requested:', provider, limits);
    return true;
  }

  // Migration helper: export data for database migration
  exportForMigration(): {
    keys: UserApiKey[];
    logs: ApiUsageLog[];
  } {
    return {
      keys: this.getStoredKeys(),
      logs: this.getUsageLogs(),
    };
  }

  // Clear all data (for testing/reset)
  clearAllData(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.usageKey);
    
    // Clear individual encrypted keys
    const keys = this.getStoredKeys();
    keys.forEach(key => {
      localStorage.removeItem(`api_key_${key.id}`);
    });
  }
}

export default ApiKeyService;
