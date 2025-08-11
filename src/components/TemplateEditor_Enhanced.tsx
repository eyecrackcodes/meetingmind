// Enhanced Template Editor with AI Service Integration
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Plus,
  Trash2,
  Wand2,
  FileText,
  Brain,
  Sparkles,
  X,
} from 'lucide-react';
import { MeetingTemplate } from '../types';
import AIService, { AIError } from '../lib/aiService';
import AIStatusIndicator from './AIStatusIndicator';

interface TemplateEditorProps {
  onClose: () => void;
  onGenerate: (template: MeetingTemplate) => void;
  onOpenApiKeyManager?: () => void;
  onOpenUsageDashboard?: () => void;
}

export function TemplateEditorEnhanced({
  onClose,
  onGenerate,
  onOpenApiKeyManager,
  onOpenUsageDashboard,
}: TemplateEditorProps) {
  const [formData, setFormData] = useState({
    meetingTitle: '',
    meetingDate: new Date().toISOString().slice(0, 16),
    facilitator: '',
    coreQuestion: '',
    meetingContext: '',
    sections: [
      {
        icon: '📊',
        title: '',
        criticalThinkingNotes: '',
        checklistItems: [{ title: '', description: '' }],
      },
    ],
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const aiService = AIService.getInstance();

  const updateSection = (
    sectionIndex: number,
    field: string,
    value: any
  ) => {
    const updatedSections = [...formData.sections];
    updatedSections[sectionIndex] = {
      ...updatedSections[sectionIndex],
      [field]: value,
    };
    setFormData({ ...formData, sections: updatedSections });
  };

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [
        ...formData.sections,
        {
          icon: '📋',
          title: '',
          criticalThinkingNotes: '',
          checklistItems: [{ title: '', description: '' }],
        },
      ],
    });
  };

  const removeSection = (index: number) => {
    if (formData.sections.length > 1) {
      const updatedSections = formData.sections.filter((_, i) => i !== index);
      setFormData({ ...formData, sections: updatedSections });
    }
  };

  const addChecklistItem = (sectionIndex: number) => {
    const currentItems = formData.sections[sectionIndex].checklistItems;
    updateSection(sectionIndex, 'checklistItems', [
      ...currentItems,
      { title: '', description: '' },
    ]);
  };

  const removeChecklistItem = (sectionIndex: number, itemIndex: number) => {
    const currentItems = formData.sections[sectionIndex].checklistItems;
    if (currentItems.length > 1) {
      const updatedItems = currentItems.filter((_, i) => i !== itemIndex);
      updateSection(sectionIndex, 'checklistItems', updatedItems);
    }
  };

  const updateChecklistItem = (
    sectionIndex: number,
    itemIndex: number,
    field: 'title' | 'description',
    value: string
  ) => {
    const currentItems = [...formData.sections[sectionIndex].checklistItems];
    currentItems[itemIndex] = {
      ...currentItems[itemIndex],
      [field]: value,
    };
    updateSection(sectionIndex, 'checklistItems', currentItems);
  };

  const analyzeWithAI = async () => {
    if (
      !formData.meetingTitle ||
      !formData.coreQuestion ||
      !formData.meetingContext
    ) {
      alert(
        'Please fill in the meeting title, core question, and context before running AI analysis.'
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await aiService.analyzeTemplate(
        formData.meetingTitle,
        formData.coreQuestion,
        formData.meetingContext
      );

      setAnalysisResult(response.content);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      
      if (error instanceof Error && 'type' in error) {
        const aiError = error as AIError;
        switch (aiError.type) {
          case 'no_key':
            alert('No API key found. Please add your OpenAI API key to use AI analysis.');
            break;
          case 'rate_limit':
            alert('Rate limit exceeded. Please try again in a moment.');
            break;
          case 'usage_limit':
            alert('Monthly usage limit reached. Please increase your limit or wait for next month.');
            break;
          default:
            alert(`AI analysis failed: ${aiError.message}`);
        }
      } else {
        alert('Error connecting to AI service. Please check your connection and try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = () => {
    // Validate required fields
    if (!formData.meetingTitle.trim()) {
      alert('Please enter a meeting title.');
      return;
    }
    if (!formData.coreQuestion.trim()) {
      alert('Please enter a core question.');
      return;
    }
    if (!formData.meetingContext.trim()) {
      alert('Please enter meeting context.');
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
      meetingTitle: '',
      meetingDate: new Date().toISOString().slice(0, 16),
      facilitator: '',
      coreQuestion: '',
      meetingContext: '',
      sections: [
        {
          icon: '📊',
          title: '',
          criticalThinkingNotes: '',
          checklistItems: [{ title: '', description: '' }],
        },
      ],
    });
    setAnalysisResult(null);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Meeting Template Editor
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* AI Status */}
        <AIStatusIndicator
          feature="AI Analysis"
          onOpenApiKeyManager={onOpenApiKeyManager}
          onOpenUsageDashboard={onOpenUsageDashboard}
        />

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Title *
            </label>
            <Input
              placeholder="Enter meeting title"
              value={formData.meetingTitle}
              onChange={(e) =>
                setFormData({ ...formData, meetingTitle: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Date
            </label>
            <Input
              type="datetime-local"
              value={formData.meetingDate}
              onChange={(e) =>
                setFormData({ ...formData, meetingDate: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facilitator
            </label>
            <Input
              placeholder="Enter facilitator name"
              value={formData.facilitator}
              onChange={(e) =>
                setFormData({ ...formData, facilitator: e.target.value })
              }
            />
          </div>
        </div>

        {/* Core Question */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Core Question *
          </label>
          <Input
            placeholder="What is the primary question this meeting will address?"
            value={formData.coreQuestion}
            onChange={(e) =>
              setFormData({ ...formData, coreQuestion: e.target.value })
            }
          />
        </div>

        {/* Meeting Context */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Context *
          </label>
          <Textarea
            placeholder="Provide background information, goals, and context for this meeting..."
            value={formData.meetingContext}
            onChange={(e) =>
              setFormData({ ...formData, meetingContext: e.target.value })
            }
            rows={3}
          />
        </div>

        {/* AI Analysis Section */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Critical Thinking Analysis
            </h3>
            <Button 
              onClick={analyzeWithAI} 
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              <Wand2 className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
            </Button>
          </div>

          {analysisResult && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Analysis Results
              </h4>
              <div className="text-blue-800 whitespace-pre-wrap text-sm">
                {analysisResult}
              </div>
            </div>
          )}
        </div>

        {/* Meeting Sections */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Meeting Sections</h3>
            <Button variant="outline" onClick={addSection}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>

          {formData.sections.map((section, sectionIndex) => (
            <Card key={sectionIndex} className="mb-4">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Input
                      value={section.icon}
                      onChange={(e) =>
                        updateSection(sectionIndex, 'icon', e.target.value)
                      }
                      className="w-16 text-center"
                      placeholder="📊"
                    />
                    <Input
                      placeholder="Section title"
                      value={section.title}
                      onChange={(e) =>
                        updateSection(sectionIndex, 'title', e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                  {formData.sections.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(sectionIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Critical Thinking Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Critical Thinking Notes
                    </label>
                    <Textarea
                      placeholder="Notes to guide critical thinking for this section..."
                      value={section.criticalThinkingNotes}
                      onChange={(e) =>
                        updateSection(
                          sectionIndex,
                          'criticalThinkingNotes',
                          e.target.value
                        )
                      }
                      rows={2}
                    />
                  </div>

                  {/* Checklist Items */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        Checklist Items
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addChecklistItem(sectionIndex)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Item
                      </Button>
                    </div>

                    {section.checklistItems.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex gap-2 mb-2">
                        <Input
                          placeholder="Item title"
                          value={item.title}
                          onChange={(e) =>
                            updateChecklistItem(
                              sectionIndex,
                              itemIndex,
                              'title',
                              e.target.value
                            )
                          }
                          className="flex-1"
                        />
                        <Input
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) =>
                            updateChecklistItem(
                              sectionIndex,
                              itemIndex,
                              'description',
                              e.target.value
                            )
                          }
                          className="flex-1"
                        />
                        {section.checklistItems.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeChecklistItem(sectionIndex, itemIndex)
                            }
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={handleGenerate} className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            Generate Template
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Clear All
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default TemplateEditorEnhanced;
