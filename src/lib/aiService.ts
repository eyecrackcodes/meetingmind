// Enhanced AI Service with Rate Limiting and Usage Tracking
import ApiKeyService, { RateLimitStatus } from './apiKeyService_Simple';

export interface AIRequest {
  provider: 'openai' | 'anthropic';
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  feature: string; // For tracking: 'template_generation', 'ai_coaching', 'analysis', etc.
}

export interface AIResponse {
  content: string;
  tokens_used: number;
  estimated_cost: number;
  model_used: string;
  success: boolean;
  error_message?: string;
}

export interface AIError extends Error {
  type: 'rate_limit' | 'no_key' | 'usage_limit' | 'network' | 'unknown';
  details?: any;
}

export class AIService {
  private static instance: AIService;
  private apiKeyService: ApiKeyService;

  private constructor() {
    this.apiKeyService = ApiKeyService.getInstance();
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Main method to make AI requests with full protection
  async makeRequest(request: AIRequest): Promise<AIResponse> {
    try {
      // 1. Check rate limits first
      const rateLimitStatus = await this.checkRateLimits(request.provider);
      if (!rateLimitStatus.allowed) {
        throw this.createAIError('rate_limit', rateLimitStatus.reason || 'Rate limit exceeded', rateLimitStatus);
      }

      // 2. Get user's API key
      const apiKey = await this.apiKeyService.getActiveApiKey(request.provider);
      if (!apiKey) {
        throw this.createAIError('no_key', 'No active API key found. Please add your API key in settings.');
      }

      // 3. Get API key info for logging
      const userApiKeys = await this.apiKeyService.getUserApiKeys();
      const activeKey = userApiKeys.find(k => k.provider === request.provider && k.is_active);
      if (!activeKey) {
        throw this.createAIError('no_key', 'Active API key not found in storage.');
      }

      // 4. Estimate tokens and cost before making request
      const estimatedInputTokens = this.estimateTokens(JSON.stringify(request.messages));
      const estimatedCost = this.apiKeyService.calculateCost(request.model, estimatedInputTokens);

      // 5. Check if this request would exceed monthly limit
      const monthlyUsage = await this.getMonthlyUsage(request.provider);
      if (monthlyUsage + estimatedCost > activeKey.usage_limit_monthly) {
        throw this.createAIError('usage_limit', 
          `This request would exceed your monthly limit of $${activeKey.usage_limit_monthly}. Current usage: $${monthlyUsage.toFixed(2)}`
        );
      }

      // 6. Make the API request
      const response = await this.callAI(request, apiKey);

      // 7. Calculate actual usage
      const actualTokens = response.tokens_used || estimatedInputTokens;
      const actualCost = response.estimated_cost || estimatedCost;

      // 8. Log usage
      await this.apiKeyService.logUsage(
        request.provider,
        request.model,
        request.feature,
        actualTokens,
        actualCost,
        response.success,
        response.error_message
      );

      // 9. Add timing and metadata
      return {
        ...response,
        tokens_used: actualTokens,
        estimated_cost: actualCost,
      };

    } catch (error) {
      console.error('AI Service Error:', error);
      
      // Log failed requests too
      try {
        await this.apiKeyService.logUsage(
          request.provider,
          request.model,
          request.feature,
          0,
          0,
          false,
          error instanceof Error ? error.message : 'Unknown error'
        );
      } catch (logError) {
        console.error('Error logging failed request:', logError);
      }

      if (error instanceof Error && 'type' in error) {
        throw error; // Re-throw AIError
      }
      throw this.createAIError('unknown', error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }

  // Check rate limits and return detailed status
  private async checkRateLimits(provider: 'openai' | 'anthropic'): Promise<RateLimitStatus> {
    return await this.apiKeyService.checkRateLimit(provider);
  }

  // Get current monthly usage
  private async getMonthlyUsage(provider: 'openai' | 'anthropic'): Promise<number> {
    const stats = await this.apiKeyService.getUsageStats(provider);
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const monthStats = stats.find(s => s.last_request_at?.startsWith(currentMonth));
    return monthStats?.total_cost || 0;
  }

  // Make the actual API call
  private async callAI(request: AIRequest, apiKey: string): Promise<AIResponse> {
    if (request.provider === 'openai') {
      return await this.callOpenAI(request, apiKey);
    }
    // Add other providers here (Anthropic, etc.)
    throw new Error(`Provider ${request.provider} not implemented`);
  }

  // OpenAI specific implementation
  private async callOpenAI(request: AIRequest, apiKey: string): Promise<AIResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.max_tokens || 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `${response.status} ${response.statusText}`;

      if (response.status === 401) {
        throw this.createAIError('no_key', 'Invalid API key. Please check your OpenAI API key.');
      }
      if (response.status === 429) {
        throw this.createAIError('rate_limit', 'Rate limit exceeded. Please try again in a moment.');
      }
      throw this.createAIError('network', `API request failed: ${errorMessage}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw this.createAIError('unknown', 'No content received from AI');
    }

    // Calculate actual token usage and cost
    const tokensUsed = data.usage?.total_tokens || this.estimateTokens(content);
    const inputTokens = data.usage?.prompt_tokens || this.estimateTokens(JSON.stringify(request.messages));
    const outputTokens = data.usage?.completion_tokens || this.estimateTokens(content);
    const estimatedCost = this.apiKeyService.calculateCost(request.model, inputTokens, outputTokens);

    return {
      content,
      tokens_used: tokensUsed,
      estimated_cost: estimatedCost,
      model_used: request.model,
      success: true,
    };
  }

  // Helper methods
  private estimateTokens(text: string): number {
    return this.apiKeyService.estimateTokens(text);
  }

  private createAIError(type: AIError['type'], message: string, details?: any): AIError {
    const error = new Error(message) as AIError;
    error.type = type;
    error.details = details;
    return error;
  }

  // Convenience methods for different features
  async generateTemplate(prompt: string, context: string): Promise<AIResponse> {
    return this.makeRequest({
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert meeting facilitator helping create critical thinking-based meeting templates.'
        },
        {
          role: 'user',
          content: `${prompt}\n\nContext: ${context}`
        }
      ],
      feature: 'template_generation',
      temperature: 0.7,
      max_tokens: 2000,
    });
  }

  async analyzeTemplate(title: string, question: string, context: string): Promise<AIResponse> {
    return this.makeRequest({
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Analyze this meeting plan using critical thinking principles. Provide specific suggestions for improvement:

Title: ${title}
Core Question: ${question}
Context: ${context}

Please assess:
1. Clarity - Is the purpose and question clear?
2. Hidden assumptions - What assumptions might be problematic?
3. Missing information - What key information might be needed?
4. Perspectives - What viewpoints might be missing?

Provide concise, actionable feedback.`
        }
      ],
      feature: 'template_analysis',
      temperature: 0.7,
      max_tokens: 500,
    });
  }

  async provideCoaching(template: any, currentSection: string, completedItems: number, totalItems: number): Promise<AIResponse> {
    const progressPercentage = Math.round((completedItems / totalItems) * 100);
    
    return this.makeRequest({
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI meeting coach expert in critical thinking and effective facilitation.'
        },
        {
          role: 'user',
          content: `Provide coaching guidance for this meeting section:

Meeting: ${template.meetingTitle}
Current Section: ${currentSection}
Progress: ${completedItems}/${totalItems} items completed (${progressPercentage}%)

Provide specific, actionable coaching tips for this section to help ensure effective critical thinking and productive discussion.`
        }
      ],
      feature: 'ai_coaching',
      temperature: 0.8,
      max_tokens: 300,
    });
  }

  // Get user's current usage status
  async getUsageStatus(): Promise<{
    rateLimits: RateLimitStatus;
    monthlyUsage: number;
    monthlyLimit: number;
    recentRequests: number;
  }> {
    const rateLimits = await this.checkRateLimits('openai');
    const monthlyUsage = await this.getMonthlyUsage('openai');
    const userApiKeys = await this.apiKeyService.getUserApiKeys();
    const activeKey = userApiKeys.find(k => k.provider === 'openai' && k.is_active);
    
    return {
      rateLimits,
      monthlyUsage,
      monthlyLimit: activeKey?.usage_limit_monthly || 50,
      recentRequests: rateLimits.daily_requests,
    };
  }
}

export default AIService;
