import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Bot,
  Target,
  TrendingUp,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  BarChart,
  Zap,
  Send,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Brain,
} from "lucide-react";
import {
  Objective,
  KeyResult,
  AIObjectiveSuggestion,
  AIKeyResultSuggestion,
  AICheckInAnalysis,
  AIInsight,
} from "@/types";

interface AIAssistantProps {
  currentObjectives: Objective[];
  companyGoals?: string[];
  department?: string;
  role?: string;
  onObjectiveSuggestion: (suggestion: AIObjectiveSuggestion) => void;
  onKeyResultSuggestion: (suggestion: AIKeyResultSuggestion) => void;
  onAnalysisComplete: (analysis: AICheckInAnalysis) => void;
}

export function AIAssistant({
  currentObjectives,
  companyGoals = [],
  department = "Sales",
  role = "Team Lead",
  onObjectiveSuggestion,
  onKeyResultSuggestion,
  onAnalysisComplete,
}: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<
    "generate" | "analyze" | "insights"
  >("generate");
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [suggestions, setSuggestions] = useState<AIObjectiveSuggestion[]>([]);
  const [keyResultSuggestions, setKeyResultSuggestions] = useState<
    AIKeyResultSuggestion[]
  >([]);
  const [analysis, setAnalysis] = useState<AICheckInAnalysis | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [selectedObjective, setSelectedObjective] = useState<string>("");

  // Check if OpenAI API key is available
  const hasAPIKey = Boolean(
    import.meta.env.VITE_OPENAI_API_KEY ||
      localStorage.getItem("openai_api_key")
  );

  const getAPIKey = () => {
    return (
      import.meta.env.VITE_OPENAI_API_KEY ||
      localStorage.getItem("openai_api_key")
    );
  };

  const callAI = async (systemMessage: string, userMessage: string) => {
    const apiKey = getAPIKey();
    if (!apiKey) {
      throw new Error(
        "OpenAI API key not found. Please add your API key in settings."
      );
    }

    const models = ["gpt-4", "gpt-3.5-turbo"];
    let lastError: Error | null = null;

    for (const model of models) {
      try {
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userMessage },
              ],
              temperature: 0.7,
              max_tokens: model === "gpt-4" ? 2000 : 3000,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage =
            errorData.error?.message ||
            `${response.status} ${response.statusText}`;

          if (response.status === 400 && model === "gpt-4") {
            lastError = new Error(
              `GPT-4 not available, trying GPT-3.5-turbo...`
            );
            continue;
          }
          if (response.status === 401) {
            throw new Error(
              "Invalid API key. Please check your OpenAI API key."
            );
          }
          if (response.status === 429) {
            throw new Error(
              "Rate limit exceeded. Please try again in a moment."
            );
          }
          throw new Error(`API request failed: ${errorMessage}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
          throw new Error("No content received from AI");
        }

        return content;
      } catch (error) {
        lastError = error as Error;
        if (model === "gpt-3.5-turbo") break; // Last model, don't continue
      }
    }

    throw lastError || new Error("Failed to get AI response");
  };

  const generateObjectives = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const systemMessage = `You are an expert OKR consultant specializing in final expense insurance sales operations. You help create SMART objectives that align with business goals and drive measurable results.

Context:
- Industry: Final expense insurance
- Department: ${department}
- Role: ${role}
- Company Goals: ${
        companyGoals.join(", ") ||
        "Revenue growth, customer satisfaction, operational efficiency"
      }

Your task is to generate 3 high-quality objective suggestions based on the user's input. Each objective should:
1. Be specific and actionable
2. Align with final expense insurance business goals
3. Be appropriate for the user's role and department
4. Include suggested key results
5. Consider industry best practices

Return your response as a JSON array of objects with this structure:
{
  "id": "unique_id",
  "title": "Objective title",
  "description": "Detailed description",
  "category": "revenue|operational|customer|team|compliance|innovation",
  "level": "company|team|individual",
  "suggestedKeyResults": ["kr1", "kr2", "kr3"],
  "reasoning": "Why this objective is important",
  "confidence": 0.8,
  "industryBased": true
}`;

      const userMessage = `Generate OKR objectives for: ${prompt}

Current objectives context:
${currentObjectives.map((obj) => `- ${obj.title} (${obj.status})`).join("\n")}

Please ensure the new objectives complement existing ones and don't duplicate efforts.`;

      const response = await callAI(systemMessage, userMessage);

      try {
        const objectiveSuggestions = JSON.parse(response);
        setSuggestions(objectiveSuggestions);
      } catch (parseError) {
        throw new Error("AI returned invalid JSON. Please try again.");
      }
    } catch (error) {
      console.error("Error generating objectives:", error);
      alert(
        error instanceof Error ? error.message : "Failed to generate objectives"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const generateKeyResults = async (objectiveTitle: string) => {
    setIsLoading(true);
    try {
      const systemMessage = `You are an expert OKR consultant specializing in final expense insurance. Generate specific, measurable key results for the given objective.

Each key result should:
1. Be quantifiable with clear metrics
2. Have realistic but ambitious targets
3. Be time-bound
4. Directly support the objective
5. Be relevant to final expense insurance operations

Return JSON array with this structure:
{
  "id": "unique_id",
  "description": "Key result description",
  "startValue": 0,
  "targetValue": 100,
  "unit": "units",
  "reasoning": "Why this KR is important",
  "difficulty": "easy|medium|hard",
  "timeframe": "timeframe description",
  "dependencies": ["dependency1", "dependency2"]
}`;

      const userMessage = `Generate 3-4 key results for this objective: "${objectiveTitle}"

Consider final expense insurance metrics like:
- Premium volume and growth rates
- Conversion rates and lead quality
- Policy persistence and lapse rates
- Customer satisfaction scores
- Compliance metrics
- Agent productivity measures`;

      const response = await callAI(systemMessage, userMessage);

      try {
        const krSuggestions = JSON.parse(response);
        setKeyResultSuggestions(krSuggestions);
      } catch (parseError) {
        throw new Error("AI returned invalid JSON. Please try again.");
      }
    } catch (error) {
      console.error("Error generating key results:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to generate key results"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeProgress = async () => {
    if (!selectedObjective) return;

    const objective = currentObjectives.find(
      (obj) => obj.id === selectedObjective
    );
    if (!objective) return;

    setIsLoading(true);
    try {
      const systemMessage = `You are an expert performance analyst specializing in final expense insurance operations. Analyze the given objective's progress and provide actionable insights.

Provide analysis covering:
1. Overall progress assessment (0-10 score)
2. Risk identification and mitigation
3. Specific recommendations for improvement
4. Confidence level adjustments
5. Next steps and action items
6. Blocker identification

Return JSON with this structure:
{
  "id": "analysis_id",
  "objectiveId": "objective_id",
  "overallScore": 7.5,
  "progressAnalysis": "Detailed analysis text",
  "riskAssessment": "Risk analysis text",
  "recommendations": ["rec1", "rec2", "rec3"],
  "confidenceAdjustment": 1,
  "nextStepSuggestions": ["step1", "step2"],
  "blockerIdentification": ["blocker1", "blocker2"]
}`;

      const userMessage = `Analyze this objective's progress:

Title: ${objective.title}
Description: ${objective.description}
Status: ${objective.status}
Current Confidence: ${objective.confidenceLevel}/10
Quarter: ${objective.quarter}

Key Results:
${objective.keyResults
  .map(
    (kr) => `
- ${kr.description}
  Current: ${kr.currentValue} ${kr.unit}
  Target: ${kr.targetValue} ${kr.unit}
  Progress: ${((kr.currentValue / kr.targetValue) * 100).toFixed(1)}%
  Status: ${kr.status}
`
  )
  .join("")}

Recent Check-ins:
${objective.checkIns
  .slice(0, 2)
  .map(
    (ci) => `
- Date: ${new Date(ci.date).toLocaleDateString()}
  Progress: ${(ci.overallProgress * 100).toFixed(1)}%
  Accomplishments: ${ci.accomplishments.join(", ")}
  Challenges: ${ci.challenges.join(", ")}
`
  )
  .join("")}

Focus on final expense insurance context and provide specific, actionable insights.`;

      const response = await callAI(systemMessage, userMessage);

      try {
        const analysisResult = JSON.parse(response);
        setAnalysis(analysisResult);
        onAnalysisComplete(analysisResult);
      } catch (parseError) {
        throw new Error("AI returned invalid JSON. Please try again.");
      }
    } catch (error) {
      console.error("Error analyzing progress:", error);
      alert(
        error instanceof Error ? error.message : "Failed to analyze progress"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const systemMessage = `You are a strategic business analyst specializing in final expense insurance. Generate actionable insights based on the current OKR portfolio.

Analyze for:
1. Portfolio balance and gaps
2. Risk identification
3. Opportunity spotting
4. Strategic recommendations
5. Performance optimization

Return JSON array with this structure:
{
  "id": "insight_id",
  "type": "progress|risk|opportunity|recommendation",
  "title": "Insight title",
  "description": "Detailed description",
  "priority": "low|medium|high|critical",
  "objectiveIds": ["obj1", "obj2"],
  "actionItems": ["action1", "action2"],
  "deadline": "2025-02-01T00:00:00.000Z",
  "createdDate": "2025-01-15T00:00:00.000Z"
}`;

      const userMessage = `Analyze this OKR portfolio for insights:

${currentObjectives
  .map(
    (obj) => `
Objective: ${obj.title}
Status: ${obj.status}
Confidence: ${obj.confidenceLevel}/10
Category: ${obj.category}
Level: ${obj.level}
Progress: ${obj.keyResults
      .map((kr) => `${((kr.currentValue / kr.targetValue) * 100).toFixed(1)}%`)
      .join(", ")}
`
  )
  .join("\n")}

Focus on final expense insurance business context and provide strategic insights for Q1 2025.`;

      const response = await callAI(systemMessage, userMessage);

      try {
        const insightResults = JSON.parse(response);
        setInsights(insightResults);
      } catch (parseError) {
        throw new Error("AI returned invalid JSON. Please try again.");
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      alert(
        error instanceof Error ? error.message : "Failed to generate insights"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!hasAPIKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI OKR Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              AI Assistant Unavailable
            </h3>
            <p className="text-gray-600 mb-4">
              To use the AI-powered OKR assistant, please add your OpenAI API
              key in the settings.
            </p>
            <Button variant="outline">Add API Key</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            AI OKR Assistant
          </h2>
          <p className="text-gray-600">
            Get AI-powered suggestions and insights for your OKRs
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: "generate", label: "Generate", icon: Target },
          { id: "analyze", label: "Analyze", icon: BarChart },
          { id: "insights", label: "Insights", icon: Brain },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "generate" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Generate Objectives
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe what you want to achieve
                </label>
                <Textarea
                  placeholder="e.g., Increase final expense sales performance, improve customer satisfaction, streamline operations..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={generateObjectives}
                disabled={isLoading || !prompt.trim()}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Generate Objectives
              </Button>
            </CardContent>
          </Card>

          {/* Objective Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                AI Suggestions
              </h3>

              {suggestions.map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-2">
                          {suggestion.title}
                        </h4>
                        <p className="text-gray-600 mb-3">
                          {suggestion.description}
                        </p>

                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline">{suggestion.category}</Badge>
                          <Badge variant="outline">{suggestion.level}</Badge>
                          <span
                            className={`text-sm font-medium ${getConfidenceColor(
                              suggestion.confidence
                            )}`}
                          >
                            {(suggestion.confidence * 100).toFixed(0)}%
                            confidence
                          </span>
                        </div>

                        <div className="mb-4">
                          <h5 className="font-medium mb-2">
                            Suggested Key Results:
                          </h5>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {suggestion.suggestedKeyResults.map((kr, index) => (
                              <li key={index}>{kr}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h5 className="font-medium text-sm mb-1">
                            AI Reasoning:
                          </h5>
                          <p className="text-sm text-gray-700">
                            {suggestion.reasoning}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => onObjectiveSuggestion(suggestion)}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Use This
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(suggestion.title)}
                          className="flex items-center gap-1"
                        >
                          <Copy className="h-4 w-4" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateKeyResults(suggestion.title)}
                          className="flex items-center gap-1"
                        >
                          <TrendingUp className="h-4 w-4" />
                          Get KRs
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Key Result Suggestions */}
          {keyResultSuggestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Key Result Suggestions
              </h3>

              {keyResultSuggestions.map((kr) => (
                <Card key={kr.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">{kr.description}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span>
                            Target: {kr.targetValue} {kr.unit}
                          </span>
                          <Badge variant="outline">{kr.difficulty}</Badge>
                          <span>{kr.timeframe}</span>
                        </div>
                        <p className="text-sm text-gray-600">{kr.reasoning}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onKeyResultSuggestion(kr)}
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Use
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "analyze" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Progress Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select objective to analyze
                </label>
                <select
                  value={selectedObjective}
                  onChange={(e) => setSelectedObjective(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Choose an objective...</option>
                  {currentObjectives.map((obj) => (
                    <option key={obj.id} value={obj.id}>
                      {obj.title} ({obj.status})
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={analyzeProgress}
                disabled={isLoading || !selectedObjective}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <BarChart className="h-4 w-4" />
                )}
                Analyze Progress
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Analysis Results
                  </span>
                  <Badge variant="outline">
                    Score: {analysis.overallScore}/10
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Progress Analysis</h4>
                  <p className="text-gray-700">{analysis.progressAnalysis}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Risk Assessment</h4>
                  <p className="text-gray-700">{analysis.riskAssessment}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-gray-700">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Next Steps</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.nextStepSuggestions.map((step, index) => (
                      <li key={index} className="text-gray-700">
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                {analysis.blockerIdentification &&
                  analysis.blockerIdentification.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-red-600">
                        Identified Blockers
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.blockerIdentification.map(
                          (blocker, index) => (
                            <li key={index} className="text-red-600">
                              {blocker}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "insights" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Portfolio Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={generateInsights}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                Generate Insights
              </Button>
            </CardContent>
          </Card>

          {/* Insights */}
          {insights.length > 0 && (
            <div className="space-y-4">
              {insights.map((insight) => (
                <Card key={insight.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{insight.title}</h4>
                          <Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority}
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-3">
                          {insight.description}
                        </p>

                        {insight.actionItems &&
                          insight.actionItems.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2">
                                Action Items:
                              </h5>
                              <ul className="list-disc list-inside space-y-1">
                                {insight.actionItems.map((action, index) => (
                                  <li key={index} className="text-gray-600">
                                    {action}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>

                      {insight.deadline && (
                        <div className="text-sm text-gray-500 ml-4">
                          <Clock className="h-4 w-4 inline mr-1" />
                          Due: {new Date(insight.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
