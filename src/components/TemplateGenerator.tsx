import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Bot, Sparkles, X, Clock, Users, Target } from "lucide-react";
import { MeetingTemplate } from "@/types";

interface TemplateGeneratorProps {
  apiKey: string;
  onClose: () => void;
  onGenerate: (template: MeetingTemplate) => void;
}

export function TemplateGenerator({
  apiKey,
  onClose,
  onGenerate,
}: TemplateGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [meetingType, setMeetingType] = useState("");
  const [duration, setDuration] = useState("60");
  const [participants, setParticipants] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastError, setLastError] = useState("");

  const suggestedPrompts = [
    {
      icon: "🎯",
      title: "New Agent Onboarding",
      prompt:
        "Create a comprehensive onboarding meeting for new final expense agents covering product basics, sales process, compliance requirements, and initial goal setting.",
    },
    {
      icon: "📊",
      title: "Monthly Performance Review",
      prompt:
        "Design a monthly team performance review meeting analyzing conversion rates, persistency, call quality, and identifying improvement opportunities.",
    },
    {
      icon: "🔄",
      title: "Process Improvement Session",
      prompt:
        "Build a meeting template for identifying and implementing process improvements in our lead management and appointment scheduling workflows.",
    },
    {
      icon: "🏆",
      title: "Top Producer Training",
      prompt:
        "Create an advanced training session for top-performing agents to share best practices, advanced objection handling, and leadership development.",
    },
  ];

  const generateTemplate = async () => {
    if (!prompt.trim()) {
      setLastError(
        "Please provide a description of the meeting you want to create."
      );
      return;
    }

    setIsGenerating(true);
    setLastError("");

    try {
      const systemMessage = `You are an expert in final expense insurance and critical thinking methodologies. You help create structured meeting templates that incorporate Paul and Elder's 8 Elements of Critical Thinking.

For final expense call centers, focus on:
- Product knowledge (whole life, term, final expense specific features)
- Underwriting guidelines and health questions
- Customer demographics (seniors, fixed income considerations)
- Compliance requirements (state regulations, HIPAA, recording consent)
- Sales techniques (needs-based selling, objection handling)
- Performance metrics (conversion rates, persistency, average premium)
- Team management and coaching
- Process optimization and quality assurance

Create a comprehensive meeting template that includes:
1. Clear meeting title, facilitator role, core question, and context
2. 3-4 sections with relevant icons and critical thinking notes
3. Each section should have 3-5 specific, actionable checklist items
4. Critical thinking notes should reference specific elements (Purpose, Information, Interpretation, Concepts, Assumptions, Implications, Point of View)
5. Content should be practical and immediately applicable to final expense operations

Return ONLY a valid JSON object matching this exact structure:
{
  "meetingTitle": "string",
            "meetingDate": "2025-01-01T10:00",
  "facilitator": "string",
  "coreQuestion": "string",
  "meetingContext": "string",
  "sections": [
    {
      "icon": "emoji",
      "title": "string",
      "criticalThinkingNotes": "string referencing specific CT elements",
      "checklistItems": [
        {
          "title": "string",
          "description": "string with specific question or action",
          "completed": false
        }
      ]
    }
  ]
}`;

      const userMessage = `Create a meeting template for: ${prompt}

Meeting Details:
- Type: ${meetingType || "General Meeting"}
- Duration: ${duration} minutes
- Participants: ${participants || "Team members"}

Make it specific to final expense insurance operations and include critical thinking elements throughout.`;

      // Try GPT-4 first, then fallback to GPT-3.5-turbo
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
                  {
                    role: "system",
                    content: systemMessage,
                  },
                  {
                    role: "user",
                    content: userMessage,
                  },
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
              // Likely model access issue, try next model
              lastError = new Error(
                `GPT-4 not available (${errorMessage}), trying GPT-3.5-turbo...`
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

          // Parse the JSON response
          let template: MeetingTemplate;
          try {
            template = JSON.parse(content);
          } catch (parseError) {
            throw new Error("Invalid JSON response from AI");
          }

          // Validate required fields
          if (
            !template.meetingTitle ||
            !template.sections ||
            !Array.isArray(template.sections)
          ) {
            throw new Error("Generated template is missing required fields");
          }

          // Add metadata for the new template structure
          const enhancedTemplate: MeetingTemplate = {
            ...template,
            id: `template_${Date.now()}`,
            status: "active",
            createdDate: new Date().toISOString(),
            tags: ["ai-generated"],
            usageCount: 0,
          };

          onGenerate(enhancedTemplate);
          return; // Success - exit the function
        } catch (error) {
          lastError = error as Error;
          // Continue to next model if available
        }
      }

      // If we get here, all models failed
      throw lastError || new Error("Failed to generate template");
    } catch (error) {
      console.error("Template generation error:", error);
      setLastError(
        error instanceof Error ? error.message : "Failed to generate template"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestedPrompt = (suggestedPrompt: string, type: string) => {
    setPrompt(suggestedPrompt);
    setMeetingType(type);
  };

  return (
    <Card className="mb-6 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Bot className="h-5 w-5" />
            AI Template Generator
            <Sparkles className="h-4 w-4 text-purple-600" />
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-purple-700">
          Describe the meeting you need, and AI will create a custom template
          with critical thinking integration
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Start Options */}
        <div className="bg-white p-4 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Quick Start Templates
          </h4>
          <div className="grid md:grid-cols-2 gap-2">
            {suggestedPrompts.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-left h-auto p-3 justify-start"
                onClick={() =>
                  handleSuggestedPrompt(suggestion.prompt, suggestion.title)
                }
              >
                <div>
                  <div className="font-medium text-purple-800">
                    {suggestion.icon} {suggestion.title}
                  </div>
                  <div className="text-xs text-purple-600 mt-1 line-clamp-2">
                    {suggestion.prompt.substring(0, 60)}...
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Prompt */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-800 mb-2">
              Describe Your Meeting
            </label>
            <Textarea
              placeholder="Example: Create a weekly team huddle for reviewing lead quality, discussing customer feedback, and planning daily activities. Focus on motivation and goal tracking."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-24"
            />
          </div>

          {/* Meeting Details */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-1">
                Meeting Type
              </label>
              <Input
                placeholder="e.g., Training Session"
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Duration (minutes)
              </label>
              <Input
                type="number"
                placeholder="60"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-1 flex items-center gap-1">
                <Users className="h-3 w-3" />
                Participants
              </label>
              <Input
                placeholder="e.g., All agents"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Error Display */}
        {lastError && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <p className="text-red-700 text-sm">{lastError}</p>
          </div>
        )}

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button
            onClick={generateTemplate}
            disabled={isGenerating || !prompt.trim()}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <Bot className="h-4 w-4" />
            {isGenerating ? "Generating Template..." : "Generate AI Template"}
          </Button>
        </div>

        {/* AI Features Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-purple-200">
          <p className="text-xs text-purple-700">
            <strong>AI Features:</strong> Final expense expertise • Critical
            thinking integration • Industry-specific terminology • Compliance
            awareness • Performance optimization focus
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
