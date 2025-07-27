import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Calendar,
  User,
  HelpCircle,
  FileText,
} from "lucide-react";
import { MeetingTemplate } from "@/types";
import { formatDate } from "@/lib/utils";

interface InteractiveChecklistProps {
  template: MeetingTemplate;
  onProgressUpdate: (progress: {
    totalItems: number;
    completedItems: number;
    percentage: number;
  }) => void;
}

export function InteractiveChecklist({
  template,
  onProgressUpdate,
}: InteractiveChecklistProps) {
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "section-0",
  ]);

  // Calculate total items and update progress
  useEffect(() => {
    const totalItems = template.sections.reduce(
      (sum, section) => sum + section.checklistItems.length,
      0
    );
    const completedItems = Object.values(checkedItems).filter(Boolean).length;
    const percentage =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    onProgressUpdate({ totalItems, completedItems, percentage });
  }, [checkedItems, template]);

  const handleItemCheck = (
    sectionIndex: number,
    itemIndex: number,
    checked: boolean
  ) => {
    const key = `${sectionIndex}-${itemIndex}`;
    setCheckedItems((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const handleExpandAll = () => {
    const allSections = template.sections.map((_, index) => `section-${index}`);
    setExpandedSections(allSections);
  };

  const handleCollapseAll = () => {
    setExpandedSections([]);
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all checklist progress?")) {
      setCheckedItems({});
    }
  };

  const handleAccordionChange = (value: string[]) => {
    setExpandedSections(value);
  };

  return (
    <div className="space-y-6">
      {/* Meeting Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {template.meetingTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Date:</span>
              <span>{formatDate(template.meetingDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Facilitator:</span>
              <span>{template.facilitator}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <span className="font-medium">Core Question:</span>
                <p className="text-muted-foreground mt-1">
                  {template.coreQuestion}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <span className="font-medium">Context:</span>
                <p className="text-muted-foreground mt-1">
                  {template.meetingContext}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="no-print">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              onClick={handleExpandAll}
              size="sm"
              className="flex items-center gap-2"
            >
              <ChevronDown className="h-4 w-4" />
              Expand All
            </Button>
            <Button
              variant="outline"
              onClick={handleCollapseAll}
              size="sm"
              className="flex items-center gap-2"
            >
              <ChevronUp className="h-4 w-4" />
              Collapse All
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              size="sm"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Progress
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Sections */}
      <Accordion
        type="multiple"
        value={expandedSections}
        onValueChange={handleAccordionChange}
        className="space-y-4"
      >
        {template.sections.map((section, sectionIndex) => {
          const sectionCompletedItems = section.checklistItems.filter(
            (_, itemIndex) => checkedItems[`${sectionIndex}-${itemIndex}`]
          ).length;
          const sectionProgress =
            section.checklistItems.length > 0
              ? Math.round(
                  (sectionCompletedItems / section.checklistItems.length) * 100
                )
              : 0;

          return (
            <AccordionItem
              key={sectionIndex}
              value={`section-${sectionIndex}`}
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="bg-slate-700 text-white px-6 py-4 hover:bg-slate-600 [&[data-state=open]>div>svg]:rotate-180">
                <div className="flex items-center justify-between w-full mr-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{section.icon}</span>
                    <span className="font-semibold">{section.title}</span>
                  </div>
                  <div className="text-sm opacity-90">
                    {sectionProgress}% ({sectionCompletedItems}/
                    {section.checklistItems.length})
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="p-6 bg-white">
                {section.criticalThinkingNotes && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">
                      Critical Thinking Notes:
                    </h4>
                    <p className="text-yellow-700 text-sm">
                      {section.criticalThinkingNotes}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {section.checklistItems.map((item, itemIndex) => {
                    const itemKey = `${sectionIndex}-${itemIndex}`;
                    const isChecked = checkedItems[itemKey] || false;

                    return (
                      <div
                        key={itemIndex}
                        className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                          isChecked
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleItemCheck(
                              sectionIndex,
                              itemIndex,
                              checked as boolean
                            )
                          }
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-medium mb-1 ${
                              isChecked ? "line-through text-gray-600" : ""
                            }`}
                          >
                            {item.title}
                          </h4>
                          <p
                            className={`text-sm ${
                              isChecked
                                ? "line-through text-gray-500"
                                : "text-gray-600"
                            }`}
                          >
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
