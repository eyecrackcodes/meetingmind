// AI Status Indicator with Graceful Degradation
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Key,
  Zap,
  RefreshCw,
  Settings,
} from 'lucide-react';
import AIService from '../lib/aiService';
import ApiKeyService from '../lib/apiKeyService_Simple';

interface AIStatusIndicatorProps {
  onOpenApiKeyManager?: () => void;
  onOpenUsageDashboard?: () => void;
  feature?: string; // Which AI feature is being used
  compact?: boolean;
}

export function AIStatusIndicator({ 
  onOpenApiKeyManager, 
  onOpenUsageDashboard,
  feature = 'AI Features',
  compact = false 
}: AIStatusIndicatorProps) {
  const [status, setStatus] = useState<{
    available: boolean;
    reason?: string;
    type: 'no_key' | 'rate_limit' | 'usage_limit' | 'error' | 'ready';
    details?: any;
  }>({ available: false, type: 'no_key' });
  const [isLoading, setIsLoading] = useState(true);
  const [usageInfo, setUsageInfo] = useState<any>(null);

  const aiService = AIService.getInstance();
  const apiKeyService = ApiKeyService.getInstance();

  useEffect(() => {
    checkAIAvailability();
    const interval = setInterval(checkAIAvailability, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkAIAvailability = async () => {
    try {
      setIsLoading(true);

      // Check if user has API keys
      const apiKeys = await apiKeyService.getUserApiKeys();
      const hasActiveKey = apiKeys.some(key => key.is_active && key.provider === 'openai');

      if (!hasActiveKey) {
        setStatus({
          available: false,
          type: 'no_key',
          reason: 'No active API key found'
        });
        return;
      }

      // Check rate limits and usage
      const usageStatus = await aiService.getUsageStatus();
      setUsageInfo(usageStatus);

      if (!usageStatus.rateLimits.allowed) {
        setStatus({
          available: false,
          type: 'rate_limit',
          reason: usageStatus.rateLimits.reason,
          details: usageStatus.rateLimits
        });
        return;
      }

      // Check monthly usage limit
      if (usageStatus.monthlyUsage >= usageStatus.monthlyLimit) {
        setStatus({
          available: false,
          type: 'usage_limit',
          reason: `Monthly limit of $${usageStatus.monthlyLimit} exceeded`,
          details: usageStatus
        });
        return;
      }

      // All good!
      setStatus({
        available: true,
        type: 'ready',
        reason: 'AI features are available'
      });

    } catch (error) {
      console.error('Error checking AI availability:', error);
      setStatus({
        available: false,
        type: 'error',
        reason: 'Error checking AI status'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }

    switch (status.type) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'no_key':
        return <Key className="h-4 w-4 text-orange-500" />;
      case 'rate_limit':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'usage_limit':
        return <DollarSign className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status.type) {
      case 'ready':
        return 'AI Ready';
      case 'no_key':
        return 'Setup Required';
      case 'rate_limit':
        return 'Rate Limited';
      case 'usage_limit':
        return 'Limit Reached';
      case 'error':
        return 'Error';
      default:
        return 'Checking...';
    }
  };

  const getStatusColor = () => {
    switch (status.type) {
      case 'ready':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'no_key':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'rate_limit':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'usage_limit':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getActionButton = () => {
    switch (status.type) {
      case 'no_key':
        return onOpenApiKeyManager ? (
          <Button size="sm" onClick={onOpenApiKeyManager} className="ml-2">
            <Key className="h-3 w-3 mr-1" />
            Add API Key
          </Button>
        ) : null;
      case 'rate_limit':
        return (
          <Button size="sm" variant="outline" onClick={checkAIAvailability} className="ml-2">
            <RefreshCw className="h-3 w-3 mr-1" />
            Check Again
          </Button>
        );
      case 'usage_limit':
        return onOpenUsageDashboard ? (
          <Button size="sm" variant="outline" onClick={onOpenUsageDashboard} className="ml-2">
            <Settings className="h-3 w-3 mr-1" />
            Manage Usage
          </Button>
        ) : null;
      case 'ready':
        return onOpenUsageDashboard ? (
          <Button size="sm" variant="ghost" onClick={onOpenUsageDashboard} className="ml-2">
            <Zap className="h-3 w-3 mr-1" />
            Usage
          </Button>
        ) : null;
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <Badge variant="outline" className={getStatusColor()}>
          {getStatusText()}
        </Badge>
        {usageInfo && status.type === 'ready' && (
          <span className="text-xs text-gray-500">
            ${usageInfo.monthlyUsage.toFixed(2)}/${usageInfo.monthlyLimit}
          </span>
        )}
      </div>
    );
  }

  if (status.available) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <div>
            <span className="font-medium text-green-800">{feature} Available</span>
            {usageInfo && (
              <div className="text-sm text-green-600">
                Usage: ${usageInfo.monthlyUsage.toFixed(2)} / ${usageInfo.monthlyLimit} this month
                {usageInfo.rateLimits.daily_requests > 0 && (
                  <span className="ml-2">
                    • {usageInfo.rateLimits.daily_requests} requests today
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {getActionButton()}
      </div>
    );
  }

  // Error states
  return (
    <Alert className={getStatusColor()}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <div>
            <AlertDescription className="font-medium">
              {feature} Unavailable
            </AlertDescription>
            <AlertDescription className="text-sm mt-1">
              {status.reason}
            </AlertDescription>
            
            {/* Additional context for each error type */}
            {status.type === 'no_key' && (
              <AlertDescription className="text-sm mt-1">
                Add your OpenAI API key to enable AI features. You control the costs directly.
              </AlertDescription>
            )}
            
            {status.type === 'rate_limit' && status.details && (
              <AlertDescription className="text-sm mt-1">
                Hourly: {status.details.hourly_requests}/{status.details.hourly_limit} • 
                Daily: {status.details.daily_requests}/{status.details.daily_limit}
              </AlertDescription>
            )}
            
            {status.type === 'usage_limit' && status.details && (
              <AlertDescription className="text-sm mt-1">
                Current usage: ${status.details.monthlyUsage.toFixed(2)} / ${status.details.monthlyLimit}
              </AlertDescription>
            )}
          </div>
        </div>
        {getActionButton()}
      </div>
    </Alert>
  );
}

export default AIStatusIndicator;
