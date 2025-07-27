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

// OKR Types based on "Measure What Matters" by John Doerr
export interface KeyResult {
  id: string;
  description: string;
  startValue: number;
  targetValue: number;
  currentValue: number;
  unit: string; // e.g., '%', '$', '#', 'ratio'
  confidenceLevel: number; // 1-10 scale
  status: "on-track" | "at-risk" | "off-track";
  lastUpdated: string;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedDate?: string;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  category:
    | "revenue"
    | "operational"
    | "customer"
    | "team"
    | "compliance"
    | "innovation";
  level: "company" | "team" | "individual";
  owner: string;
  quarter: string; // e.g., "2024-Q1"
  year: number;
  keyResults: KeyResult[];
  alignedTo?: string; // Parent objective ID for alignment
  confidenceLevel: number; // 1-10 scale
  status: "draft" | "active" | "completed" | "cancelled";
  createdDate: string;
  lastUpdated: string;
  checkIns: CheckIn[];
}

export interface CheckIn {
  id: string;
  date: string;
  overallProgress: number; // 0-1.0
  confidenceLevel: number; // 1-10
  accomplishments: string[];
  challenges: string[];
  nextSteps: string[];
  supportNeeded?: string;
  notes?: string;
}

export interface OKRCycle {
  id: string;
  name: string; // e.g., "2024 Q1"
  quarter: number;
  year: number;
  startDate: string;
  endDate: string;
  status: "planning" | "active" | "review" | "completed";
  objectives: Objective[];
  cycleTheme?: string;
  companyPriorities: string[];
}

export interface OKRTemplate {
  id: string;
  name: string;
  category:
    | "revenue"
    | "operational"
    | "customer"
    | "team"
    | "compliance"
    | "innovation";
  level: "company" | "team" | "individual";
  objectiveTemplate: string;
  keyResultTemplates: string[];
  description: string;
  tags: string[];
}

export interface OKRMetrics {
  totalObjectives: number;
  completedObjectives: number;
  averageProgress: number;
  averageConfidence: number;
  onTrackCount: number;
  atRiskCount: number;
  offTrackCount: number;
  keyResultsAchieved: number;
  totalKeyResults: number;
}

// Gamification Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category:
    | "objectives"
    | "key-results"
    | "check-ins"
    | "consistency"
    | "performance"
    | "collaboration";
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  points: number;
  condition: AchievementCondition;
  unlockedDate?: string;
}

export interface AchievementCondition {
  type: "count" | "streak" | "percentage" | "time" | "combination";
  target: number;
  metric: string; // e.g., 'objectives_completed', 'check_ins_streak', 'avg_confidence'
  timeframe?: "day" | "week" | "month" | "quarter" | "year";
}

export interface UserStats {
  id: string;
  username: string;
  level: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  joinDate: string;
  lastActive: string;
  achievements: Achievement[];
  stats: {
    objectivesCreated: number;
    objectivesCompleted: number;
    keyResultsAchieved: number;
    checkInsCompleted: number;
    avgConfidenceLevel: number;
    avgProgressRate: number;
    totalSessions: number;
    totalTimeSpent: number; // in minutes
  };
}

export interface GameEvent {
  id: string;
  type:
    | "achievement_unlocked"
    | "level_up"
    | "streak_milestone"
    | "objective_completed"
    | "milestone_reached";
  title: string;
  description: string;
  points: number;
  timestamp: string;
  data?: any;
}

export interface Leaderboard {
  period: "week" | "month" | "quarter" | "all-time";
  category: "points" | "objectives" | "streak" | "performance";
  entries: LeaderboardEntry[];
  lastUpdated: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  rank: number;
  score: number;
  change: number; // position change from last period
  avatar?: string;
}

// Data Persistence Types
export interface UserSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  activities: SessionActivity[];
  totalTimeSpent: number; // in minutes
}

export interface SessionActivity {
  id: string;
  type:
    | "objective_created"
    | "objective_updated"
    | "check_in_completed"
    | "meeting_completed"
    | "template_generated";
  timestamp: string;
  data: any;
  pointsEarned: number;
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  notifications: {
    achievements: boolean;
    reminders: boolean;
    deadlines: boolean;
    weekly_summary: boolean;
  };
  gamification: {
    enabled: boolean;
    showLeaderboards: boolean;
    showPoints: boolean;
    showAchievements: boolean;
  };
  defaultView: "meetings" | "okr";
  autoSave: boolean;
}

export interface AppData {
  version: string;
  lastUpdated: string;
  user: UserStats;
  preferences: UserPreferences;
  objectives: Objective[];
  cycles: OKRCycle[];
  templates: MeetingTemplate[];
  sessions: UserSession[];
  events: GameEvent[];
}
