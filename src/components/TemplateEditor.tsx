import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Trash2, Rocket, Lightbulb, Bot } from "lucide-react";
import { MeetingTemplate } from "@/types";

interface TemplateEditorProps {
  apiKey: string;
  onClose: () => void;
  onGenerate: (template: MeetingTemplate) => void;
}

interface FormData {
  meetingTitle: string;
  meetingDate: string;
  facilitator: string;
  coreQuestion: string;
  meetingContext: string;
  sections: SectionFormData[];
}

interface SectionFormData {
  icon: string;
  title: string;
  criticalThinkingNotes: string;
  checklistItems: ItemFormData[];
}

interface ItemFormData {
  title: string;
  description: string;
}

const sectionIcons = [
  { value: "📊", label: "📊 Data/Analysis" },
  { value: "🎯", label: "🎯 Goals/Objectives" },
  { value: "💡", label: "💡 Ideas/Brainstorming" },
  { value: "⚡", label: "⚡ Decision Making" },
  { value: "📋", label: "📋 Planning" },
  { value: "🔍", label: "🔍 Review/Analysis" },
  { value: "👥", label: "👥 Team Discussion" },
  { value: "📈", label: "📈 Progress/Results" },
];

export function TemplateEditor({
  apiKey,
  onClose,
  onGenerate,
}: TemplateEditorProps) {
  const [formData, setFormData] = useState<FormData>({
    meetingTitle: "",
    meetingDate: new Date().toISOString().slice(0, 16),
    facilitator: "",
    coreQuestion: "",
    meetingContext: "",
    sections: [
      {
        icon: "📊",
        title: "",
        criticalThinkingNotes: "",
        checklistItems: [{ title: "", description: "" }],
      },
    ],
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          icon: "📊",
          title: "",
          criticalThinkingNotes: "",
          checklistItems: [{ title: "", description: "" }],
        },
      ],
    }));
  };

  const removeSection = (sectionIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, index) => index !== sectionIndex),
    }));
  };

  const updateSection = (
    sectionIndex: number,
    field: keyof SectionFormData,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex ? { ...section, [field]: value } : section
      ),
    }));
  };

  const addChecklistItem = (sectionIndex: number) => {
    updateSection(sectionIndex, "checklistItems", [
      ...formData.sections[sectionIndex].checklistItems,
      { title: "", description: "" },
    ]);
  };

  const removeChecklistItem = (sectionIndex: number, itemIndex: number) => {
    updateSection(
      sectionIndex,
      "checklistItems",
      formData.sections[sectionIndex].checklistItems.filter(
        (_, index) => index !== itemIndex
      )
    );
  };

  const updateChecklistItem = (
    sectionIndex: number,
    itemIndex: number,
    field: keyof ItemFormData,
    value: string
  ) => {
    const updatedItems = formData.sections[sectionIndex].checklistItems.map(
      (item, index) =>
        index === itemIndex ? { ...item, [field]: value } : item
    );
    updateSection(sectionIndex, "checklistItems", updatedItems);
  };

  const analyzeWithAI = async () => {
    if (!apiKey) {
      alert("Please add your OpenAI API key first.");
      return;
    }

    if (
      !formData.meetingTitle ||
      !formData.coreQuestion ||
      !formData.meetingContext
    ) {
      alert(
        "Please fill in the meeting title, core question, and context before running AI analysis."
      );
      return;
    }

    setIsAnalyzing(true);

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
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: `Analyze this meeting plan using critical thinking principles. Provide specific suggestions for improvement:

Title: ${formData.meetingTitle}
Core Question: ${formData.coreQuestion}
Context: ${formData.meetingContext}

Please assess:
1. Clarity - Is the purpose and question clear?
2. Hidden assumptions - What assumptions might be problematic?
3. Missing information - What key information might be needed?
4. Perspectives - What viewpoints might be missing?

Provide concise, actionable feedback.`,
              },
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        }
      );

      const data = await response.json();

      if (data.choices && data.choices[0]) {
        showAnalysisModal(data.choices[0].message.content);
      } else {
        throw new Error("No response from AI");
      }
    } catch (error) {
      alert(
        "Error connecting to AI service. Please check your API key and internet connection."
      );
      console.error("AI Analysis Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showAnalysisModal = (analysis: string) => {
    alert(`AI Critical Thinking Analysis:\n\n${analysis}`);
  };

  const handleGenerate = () => {
    // Validate required fields
    if (!formData.meetingTitle.trim()) {
      alert("Please enter a meeting title.");
      return;
    }
    if (!formData.coreQuestion.trim()) {
      alert("Please enter a core question.");
      return;
    }
    if (!formData.meetingContext.trim()) {
      alert("Please enter meeting context.");
      return;
    }

    // Create the template
    const template: MeetingTemplate = {
      meetingTitle: formData.meetingTitle,
      meetingDate: formData.meetingDate,
      facilitator: formData.facilitator,
      coreQuestion: formData.coreQuestion,
      meetingContext: formData.meetingContext,
      sections: formData.sections
        .map((section) => ({
          icon: section.icon,
          title: section.title,
          criticalThinkingNotes: section.criticalThinkingNotes,
          checklistItems: section.checklistItems
            .filter((item) => item.title.trim() || item.description.trim())
            .map((item) => ({
              title: item.title,
              description: item.description,
              completed: false,
            })),
        }))
        .filter(
          (section) => section.title.trim() || section.checklistItems.length > 0
        ),
    };

    onGenerate(template);
  };

  const handleClear = () => {
    setFormData({
      meetingTitle: "",
      meetingDate: new Date().toISOString().slice(0, 16),
      facilitator: "",
      coreQuestion: "",
      meetingContext: "",
      sections: [
        {
          icon: "📊",
          title: "",
          criticalThinkingNotes: "",
          checklistItems: [{ title: "", description: "" }],
        },
      ],
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Template Editor
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Meeting Title</label>
            <Input
              placeholder="e.g., Q4 Strategic Planning Session"
              value={formData.meetingTitle}
              onChange={(e) => updateFormData("meetingTitle", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              💡 A clear title should specify the meeting's main purpose and
              scope.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date & Time</label>
            <Input
              type="datetime-local"
              value={formData.meetingDate}
              onChange={(e) => updateFormData("meetingDate", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Facilitator</label>
          <Input
            placeholder="Meeting facilitator name"
            value={formData.facilitator}
            onChange={(e) => updateFormData("facilitator", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Core Question/Problem</label>
          <Textarea
            placeholder="What is the central question or problem this meeting aims to address?"
            value={formData.coreQuestion}
            onChange={(e) => updateFormData("coreQuestion", e.target.value)}
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground">
            💡 Frame this as a specific, answerable question that drives the
            entire meeting.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Meeting Context & Background
          </label>
          <Textarea
            placeholder="Provide relevant background information and context for this meeting..."
            value={formData.meetingContext}
            onChange={(e) => updateFormData("meetingContext", e.target.value)}
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground">
            💡 Include assumptions that need to be stated upfront and relevant
            history.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Meeting Sections</h3>
            <Button
              onClick={addSection}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Section
            </Button>
          </div>

          {formData.sections.map((section, sectionIndex) => (
            <Card key={sectionIndex} className="p-4 bg-muted/50">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Section {sectionIndex + 1}</h4>
                  {formData.sections.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSection(sectionIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section Icon</label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={section.icon}
                      onChange={(e) =>
                        updateSection(sectionIndex, "icon", e.target.value)
                      }
                    >
                      {sectionIcons.map((icon) => (
                        <option key={icon.value} value={icon.value}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section Title</label>
                    <Input
                      placeholder="e.g., Budget Analysis"
                      value={section.title}
                      onChange={(e) =>
                        updateSection(sectionIndex, "title", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Critical Thinking Notes
                  </label>
                  <Textarea
                    placeholder="Which critical thinking elements are most important for this section?"
                    value={section.criticalThinkingNotes}
                    onChange={(e) =>
                      updateSection(
                        sectionIndex,
                        "criticalThinkingNotes",
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* Checklist Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-sm">Checklist Items</h5>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addChecklistItem(sectionIndex)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {section.checklistItems.map((item, itemIndex) => (
                    <Card key={itemIndex} className="p-3 bg-background">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Item {itemIndex + 1}
                          </span>
                          {section.checklistItems.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                removeChecklistItem(sectionIndex, itemIndex)
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Input
                            placeholder="e.g., Review budget assumptions"
                            value={item.title}
                            onChange={(e) =>
                              updateChecklistItem(
                                sectionIndex,
                                itemIndex,
                                "title",
                                e.target.value
                              )
                            }
                          />
                          <Textarea
                            placeholder="What specific questions need to be answered? What needs discussion?"
                            value={item.description}
                            onChange={(e) =>
                              updateChecklistItem(
                                sectionIndex,
                                itemIndex,
                                "description",
                                e.target.value
                              )
                            }
                            className="min-h-[60px]"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center pt-4 border-t">
          <Button onClick={handleGenerate} className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            Generate Meeting Template
          </Button>

          <Button variant="outline" onClick={handleClear}>
            <Trash2 className="h-4 w-4" />
            Clear Form
          </Button>

          {apiKey && (
            <Button
              variant="outline"
              onClick={analyzeWithAI}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              <Bot className="h-4 w-4" />
              {isAnalyzing ? "Analyzing..." : "AI Clarity Check"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
