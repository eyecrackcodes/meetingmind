export interface ChecklistItem {
  title: string;
  description: string;
  completed: boolean;
}

export interface MeetingSection {
  icon: string;
  title: string;
  criticalThinkingNotes: string;
  checklistItems: ChecklistItem[];
}

export interface MeetingTemplate {
  meetingTitle: string;
  meetingDate: string;
  facilitator: string;
  coreQuestion: string;
  meetingContext: string;
  sections: MeetingSection[];
}

export interface CriticalThinkingElement {
  icon: string;
  title: string;
  description: string;
}

export interface ProgressData {
  totalItems: number;
  completedItems: number;
  percentage: number;
} 