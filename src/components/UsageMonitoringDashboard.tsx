// Real-time Usage Monitoring Dashboard
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import {
  Activity,
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Settings,
  Key,
  Zap,
  Calendar,
  BarChart3,
} from 'lucide-react';
import ApiKeyService, { ApiUsageLog, UsageStats, UserApiKey } from '../lib/apiKeyService_Simple';
import AIService from '../lib/aiService';

interface UsageDashboardProps {
  onOpenApiKeyManager: () => void;
}

export function UsageMonitoringDashboard({ onOpenApiKeyManager }: UsageDashboardProps) {
  const [usageStats, setUsageStats] = useState<UsageStats[]>([]);
  const [recentUsage, setRecentUsage] = useState<ApiUsageLog[]>([]);
  const [userApiKeys, setUserApiKeys] = useState<UserApiKey[]>([]);
  const [currentUsageStatus, setCurrentUsageStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const apiKeyService = ApiKeyService.getInstance();
  const aiService = AIService.getInstance();

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [stats, recent, keys, status] = await Promise.all([
        apiKeyService.getUsageStats(),
        apiKeyService.getRecentUsage(20),
        apiKeyService.getUserApiKeys(),
        aiService.getUsageStatus(),
      ]);

      setUsageStats(stats);
      setRecentUsage(recent);
      setUserApiKeys(keys);
      setCurrentUsageStatus(status);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentMonthStats = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return usageStats.find(stat => 
      stat.last_request_at?.startsWith(currentMonth)
    ) || {
      total_requests: 0,
      total_tokens: 0,
      total_cost: 0,
      failed_requests: 0,
    };
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  // Removed unused function

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const currentMonthStats = getCurrentMonthStats();
  const hasApiKeys = userApiKeys.length > 0;

  if (!hasApiKeys) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Key className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No API Keys Configured
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            To start using AI features, you'll need to add your own OpenAI API key. 
            This ensures you control your usage and costs.
          </p>
          <Button onClick={onOpenApiKeyManager} className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Add Your API Key
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Usage Dashboard</h2>
          <p className="text-gray-600">
            Monitor your AI usage, costs, and rate limits in real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDashboardData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={onOpenApiKeyManager}>
            <Settings className="h-4 w-4 mr-2" />
            Manage Keys
          </Button>
        </div>
      </div>

      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Cost */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(currentUsageStatus?.monthlyUsage || 0)}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                of {formatCurrency(currentUsageStatus?.monthlyLimit || 50)} limit
              </span>
              <Badge variant={
                (currentUsageStatus?.monthlyUsage || 0) > (currentUsageStatus?.monthlyLimit || 50) * 0.9 
                  ? 'destructive' : 'secondary'
              }>
                {Math.round(((currentUsageStatus?.monthlyUsage || 0) / (currentUsageStatus?.monthlyLimit || 50)) * 100)}%
              </Badge>
            </div>
            <Progress 
              value={getUsagePercentage(currentUsageStatus?.monthlyUsage || 0, currentUsageStatus?.monthlyLimit || 50)}
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Daily Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentUsageStatus?.rateLimits?.daily_requests || 0}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                of {currentUsageStatus?.rateLimits?.daily_limit || 500} limit
              </span>
              <Badge variant={
                (currentUsageStatus?.rateLimits?.daily_requests || 0) > 
                (currentUsageStatus?.rateLimits?.daily_limit || 500) * 0.9 ? 'destructive' : 'secondary'
              }>
                {Math.round(((currentUsageStatus?.rateLimits?.daily_requests || 0) / (currentUsageStatus?.rateLimits?.daily_limit || 500)) * 100)}%
              </Badge>
            </div>
            <Progress 
              value={getUsagePercentage(
                currentUsageStatus?.rateLimits?.daily_requests || 0, 
                currentUsageStatus?.rateLimits?.daily_limit || 500
              )}
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Hourly Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hourly Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentUsageStatus?.rateLimits?.hourly_requests || 0}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                of {currentUsageStatus?.rateLimits?.hourly_limit || 60} limit
              </span>
              <Badge variant={
                (currentUsageStatus?.rateLimits?.hourly_requests || 0) > 
                (currentUsageStatus?.rateLimits?.hourly_limit || 60) * 0.9 ? 'destructive' : 'secondary'
              }>
                {Math.round(((currentUsageStatus?.rateLimits?.hourly_requests || 0) / (currentUsageStatus?.rateLimits?.hourly_limit || 60)) * 100)}%
              </Badge>
            </div>
            <Progress 
              value={getUsagePercentage(
                currentUsageStatus?.rateLimits?.hourly_requests || 0, 
                currentUsageStatus?.rateLimits?.hourly_limit || 60
              )}
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Total Tokens */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(currentMonthStats.total_tokens || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rate Limit Status */}
      {currentUsageStatus?.rateLimits && !currentUsageStatus.rateLimits.allowed && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Rate Limit Exceeded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              {currentUsageStatus.rateLimits.reason}
            </p>
            <p className="text-sm text-red-600 mt-2">
              AI features are temporarily disabled. Limits reset hourly/daily.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent AI Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentUsage.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent usage</p>
              ) : (
                recentUsage.map((usage) => (
                  <div
                    key={usage.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {usage.feature_used}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {usage.model}
                        </Badge>
                        {!usage.success && (
                          <Badge variant="destructive" className="text-xs">
                            Failed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(usage.timestamp)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatCurrency(usage.estimated_cost)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {usage.tokens_used?.toLocaleString()} tokens
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* API Key Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userApiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{key.api_key_name}</span>
                      <Badge variant={key.is_active ? 'default' : 'secondary'}>
                        {key.provider}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Limit: {formatCurrency(key.usage_limit_monthly)}/month
                    </p>
                    {key.last_used_at && (
                      <p className="text-xs text-gray-500">
                        Last used: {formatDate(key.last_used_at)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      key.is_active ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Statistics */}
      {usageStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Usage History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {usageStats.slice(0, 4).map((stat, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {new Date(stat.last_request_at || '').toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short' 
                      })}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold">
                      {formatCurrency(stat.total_cost)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stat.total_requests} requests
                    </div>
                    <div className="text-sm text-gray-600">
                      {stat.total_tokens?.toLocaleString()} tokens
                    </div>
                    {stat.failed_requests > 0 && (
                      <div className="text-sm text-red-600">
                        {stat.failed_requests} failed
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {lastRefresh.toLocaleTimeString()}
      </div>
    </div>
  );
}

export default UsageMonitoringDashboard;
