import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  Brain,
  Lightbulb,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { MeetingTemplate } from "@/types";

interface AICoachingPanelProps {
  apiKey: string;
  template: MeetingTemplate;
  currentSection?: string;
  completedItems: number;
  totalItems: number;
}

export function AICoachingPanel({
  apiKey,
  template,
  currentSection,
  completedItems,
  totalItems,
}: AICoachingPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [coachingAdvice, setCoachingAdvice] = useState("");
  const [userQuestion, setUserQuestion] = useState("");
  const [lastError, setLastError] = useState("");

  const getContextualCoaching = async () => {
    setIsAnalyzing(true);
    setLastError("");

    try {
      const progressPercentage = Math.round(
        (completedItems / totalItems) * 100
      );

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: `You are an expert final expense insurance coach and critical thinking facilitator. You help meeting facilitators ensure they're covering all important aspects and applying critical thinking principles effectively.

Key areas of expertise:
- Final expense insurance products and underwriting
- Sales coaching and agent development  
- Call center operations and management
- Critical thinking methodology (Paul & Elder framework)
- Meeting facilitation and engagement techniques

Provide practical, actionable coaching advice that is specific to final expense call centers. Focus on ensuring comprehensive coverage of topics and effective application of critical thinking elements.`,
              },
              {
                role: "user",
                content: `I'm facilitating a meeting: "${template.meetingTitle}"

Meeting Context: ${template.meetingContext}
Core Question: ${template.coreQuestion}
Current Progress: ${progressPercentage}% complete (${completedItems}/${totalItems} items)
${currentSection ? `Currently discussing: ${currentSection}` : ""}

Please provide specific coaching advice to help me:
1. Ensure I'm covering all critical aspects thoroughly
2. Apply critical thinking principles effectively
3. Keep the meeting focused and productive
4. Address any potential gaps or missing elements

Make your advice specific to final expense operations and this meeting type.`,
              },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const advice = data.choices[0]?.message?.content;

      if (advice) {
        setCoachingAdvice(advice);
      } else {
        throw new Error("No coaching advice received");
      }
    } catch (error) {
      console.error("Coaching error:", error);
      setLastError(
        error instanceof Error ? error.message : "Failed to get coaching advice"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const askSpecificQuestion = async () => {
    if (!userQuestion.trim()) return;

    setIsAnalyzing(true);
    setLastError("");

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
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: `You are an expert final expense insurance consultant with deep knowledge of:
- Final expense insurance products, underwriting, and compliance
- Call center operations and agent coaching
- Critical thinking and meeting facilitation
- Performance metrics and KPI analysis
- Sales processes and customer interactions

Provide specific, actionable answers that are immediately applicable to final expense call center operations.`,
              },
              {
                role: "user",
                content: `Meeting Context: "${template.meetingTitle}" - ${template.meetingContext}

Question: ${userQuestion}

Please provide a specific, practical answer that I can use in this meeting context.`,
              },
            ],
            temperature: 0.7,
            max_tokens: 400,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const answer = data.choices[0]?.message?.content;

      if (answer) {
        setCoachingAdvice(answer);
        setUserQuestion("");
      } else {
        throw new Error("No answer received");
      }
    } catch (error) {
      console.error("Question error:", error);
      setLastError(
        error instanceof Error ? error.message : "Failed to get answer"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const progressStatus = () => {
    const percentage = Math.round((completedItems / totalItems) * 100);
    if (percentage < 25)
      return {
        icon: AlertTriangle,
        color: "text-orange-600",
        message: "Just getting started",
      };
    if (percentage < 50)
      return {
        icon: MessageSquare,
        color: "text-blue-600",
        message: "Making good progress",
      };
    if (percentage < 75)
      return {
        icon: Lightbulb,
        color: "text-purple-600",
        message: "Excellent momentum",
      };
    return {
      icon: CheckCircle,
      color: "text-green-600",
      message: "Nearly complete!",
    };
  };

  const status = progressStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="mb-6 border-green-200 bg-gradient-to-br from-green-50 to-blue-50 no-print">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Bot className="h-5 w-5" />
          AI Meeting Coach
          <StatusIcon className={`h-4 w-4 ${status.color}`} />
        </CardTitle>
        <p className="text-sm text-green-700">
          Real-time guidance and final expense expertise • {status.message}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Coaching Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={getContextualCoaching}
            disabled={isAnalyzing}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <Brain className="h-3 w-3" />
            {isAnalyzing ? "Analyzing..." : "Get Coaching Advice"}
          </Button>
        </div>

        {/* Ask Specific Question */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask a specific question about final expense insurance, agent coaching, metrics, or meeting facilitation..."
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              className="flex-1 min-h-16"
            />
            <Button
              onClick={askSpecificQuestion}
              disabled={isAnalyzing || !userQuestion.trim()}
              size="sm"
              className="self-end"
            >
              <MessageSquare className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {lastError && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <p className="text-red-700 text-sm">{lastError}</p>
          </div>
        )}

        {/* Coaching Advice Display */}
        {coachingAdvice && (
          <div className="bg-white border border-green-200 p-4 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <h4 className="font-semibold text-green-800">
                AI Coaching Advice
              </h4>
            </div>
            <div className="text-sm text-green-700 whitespace-pre-wrap">
              {coachingAdvice}
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200">
          <p className="text-xs text-green-700">
            <strong>Pro Tip:</strong> Use the AI coach throughout your meeting
            for real-time guidance on critical thinking application, content
            coverage, and final expense best practices.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
