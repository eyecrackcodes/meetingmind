import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CriticalThinkingElement } from "@/types";
import { BookOpen } from "lucide-react";

const frameworkElements: CriticalThinkingElement[] = [
  {
    icon: "🎯",
    title: "Purpose",
    description: "What is the meeting trying to accomplish? What is our goal?",
  },
  {
    icon: "❓",
    title: "Question",
    description:
      "What key problem or issue are we addressing? What needs to be solved?",
  },
  {
    icon: "📊",
    title: "Information",
    description:
      "What data, facts, or evidence do we need to make good decisions?",
  },
  {
    icon: "🔍",
    title: "Interpretation",
    description: "How do we make sense of the information? What does it mean?",
  },
  {
    icon: "💡",
    title: "Concepts",
    description:
      "What key ideas, principles, or frameworks guide our thinking?",
  },
  {
    icon: "🤔",
    title: "Assumptions",
    description:
      "What are we taking for granted? What beliefs underlie our thinking?",
  },
  {
    icon: "⚡",
    title: "Implications",
    description:
      "What are the consequences of our decisions? What could happen?",
  },
  {
    icon: "👥",
    title: "Point of View",
    description:
      "What different perspectives should we consider? Who's affected?",
  },
];

export function FrameworkPanel() {
  return (
    <Card className="mb-6">
      <Accordion type="single" collapsible defaultValue="framework">
        <AccordionItem value="framework">
          <AccordionTrigger className="px-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="text-lg font-semibold">
                Critical Thinking Framework Reference
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6">
            <div className="framework-gradient text-white rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-center">
                Paul & Elder's 8 Elements of Critical Thinking
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {frameworkElements.map((element, index) => (
                  <div
                    key={index}
                    className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{element.icon}</span>
                      <h4 className="font-semibold text-lg">{element.title}</h4>
                    </div>
                    <p className="text-sm opacity-90">{element.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
