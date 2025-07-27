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
  id?: string;
  meetingTitle: string;
  meetingDate: string;
  facilitator: string;
  coreQuestion: string;
  meetingContext: string;
  sections: MeetingSection[];
  status?: "active" | "archived";
  createdDate?: string;
  archivedDate?: string;
  archivedBy?: string;
  tags?: string[];
  usageCount?: number;
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
  quarter: string; // e.g., "2025-Q1"
  year: number;
  keyResults: KeyResult[];
  alignedTo?: string | null;
  confidenceLevel: number; // 1-10 scale
  status: "draft" | "active" | "completed" | "cancelled" | "archived";
  createdDate: string;
  lastUpdated: string;
  checkIns: CheckIn[];
  archivedDate?: string;
  archivedBy?: string;
  archivedReason?: string;
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
  name: string; // e.g., "2025 Q1"
  quarter: number;
  year: number;
  startDate: string;
  endDate: string;
  status: "planning" | "active" | "review" | "completed" | "archived";
  objectives: Objective[];
  cycleTheme?: string;
  companyPriorities: string[];
  archivedDate?: string;
  archivedBy?: string;
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

// AI Integration Types
export interface AIObjectiveSuggestion {
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
  suggestedKeyResults: string[];
  reasoning: string;
  confidence: number; // AI confidence in suggestion (0-1)
  industryBased: boolean;
}

export interface AIKeyResultSuggestion {
  id: string;
  description: string;
  startValue?: number;
  targetValue?: number;
  unit: string;
  reasoning: string;
  difficulty: "easy" | "medium" | "hard";
  timeframe: string;
  dependencies?: string[];
}

export interface AICheckInAnalysis {
  id: string;
  objectiveId: string;
  overallScore: number; // 0-10
  progressAnalysis: string;
  riskAssessment: string;
  recommendations: string[];
  confidenceAdjustment?: number;
  nextStepSuggestions: string[];
  blockerIdentification?: string[];
}

export interface AIInsight {
  id: string;
  type: "progress" | "risk" | "opportunity" | "recommendation";
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  objectiveIds: string[];
  actionItems?: string[];
  deadline?: string;
  createdDate: string;
}

// User Authentication Types
export interface UserProfile {
  id: string;
  email?: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: "agent" | "team_lead" | "manager" | "admin";
  department?: string;
  team?: string;
  licenseStates?: string[];
  hireDate?: string;
  avatar?: string;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: "member" | "lead" | "manager";
  joinDate: string;
  permissions: TeamPermission[];
}

export interface TeamPermission {
  id: string;
  action: "view" | "edit" | "delete" | "archive" | "create" | "manage_team";
  resource: "objectives" | "templates" | "analytics" | "users" | "settings";
  granted: boolean;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  managerId: string;
  members: TeamMember[];
  objectives: string[]; // objective IDs
  createdDate: string;
  status: "active" | "archived";
}

// Archive/Delete Operations
export interface ArchiveOperation {
  id: string;
  userId: string;
  resourceType: "objective" | "cycle" | "template";
  resourceId: string;
  resourceTitle: string;
  action: "archive" | "restore" | "delete";
  reason?: string;
  timestamp: string;
  canRestore: boolean;
}

export interface BulkOperation {
  id: string;
  userId: string;
  operation: "archive" | "restore" | "delete" | "update_status";
  resourceType: "objective" | "cycle" | "template";
  resourceIds: string[];
  parameters?: any;
  timestamp: string;
  results: {
    successful: string[];
    failed: Array<{
      id: string;
      error: string;
    }>;
  };
}

// Filter and View Types
export interface FilterOptions {
  status?: ("draft" | "active" | "completed" | "cancelled" | "archived")[];
  category?: (
    | "revenue"
    | "operational"
    | "customer"
    | "team"
    | "compliance"
    | "innovation"
  )[];
  level?: ("company" | "team" | "individual")[];
  owner?: string[];
  quarter?: string[];
  year?: number[];
  dateRange?: {
    start: string;
    end: string;
  };
  showArchived?: boolean;
  aiInsights?: boolean;
}

export interface ViewPreset {
  id: string;
  name: string;
  description: string;
  filters: FilterOptions;
  sortBy: string;
  sortOrder: "asc" | "desc";
  isDefault?: boolean;
  userId?: string;
}
