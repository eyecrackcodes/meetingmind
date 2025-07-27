import {
  AppData,
  UserStats,
  UserPreferences,
  UserSession,
  SessionActivity,
  Objective,
  OKRCycle,
  MeetingTemplate,
  GameEvent,
} from "@/types";

const APP_VERSION = "1.0.0";
const STORAGE_KEYS = {
  APP_DATA: "meetingmind_app_data",
  CURRENT_SESSION: "meetingmind_current_session",
  PREFERENCES: "meetingmind_preferences",
  BACKUP: "meetingmind_backup",
};

// Default user stats for new users
const DEFAULT_USER_STATS: UserStats = {
  id: "user_" + Math.random().toString(36).substr(2, 9),
  username: "User",
  level: 1,
  totalPoints: 0,
  currentStreak: 0,
  longestStreak: 0,
  joinDate: new Date().toISOString(),
  lastActive: new Date().toISOString(),
  achievements: [],
  stats: {
    objectivesCreated: 0,
    objectivesCompleted: 0,
    keyResultsAchieved: 0,
    checkInsCompleted: 0,
    avgConfidenceLevel: 0,
    avgProgressRate: 0,
    totalSessions: 0,
    totalTimeSpent: 0,
  },
};

// Default user preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "auto",
  notifications: {
    achievements: true,
    reminders: true,
    deadlines: true,
    weekly_summary: true,
  },
  gamification: {
    enabled: true,
    showLeaderboards: true,
    showPoints: true,
    showAchievements: true,
  },
  defaultView: "meetings",
  autoSave: true,
};

export class DataService {
  private static instance: DataService;
  private currentSession: UserSession | null = null;
  private autoSaveInterval: number | null = null;

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  constructor() {
    this.initializeAutoSave();
    this.startSession();
  }

  // Initialize auto-save functionality
  private initializeAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    // Auto-save every 30 seconds
    this.autoSaveInterval = window.setInterval(() => {
      this.saveAppData();
    }, 30000);

    // Save on page unload
    window.addEventListener("beforeunload", () => {
      this.endSession();
      this.saveAppData();
    });

    // Save on visibility change (tab switch, minimize)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.saveAppData();
      }
    });
  }

  // Load complete app data
  loadAppData(): AppData {
    try {
      const savedData = localStorage.getItem(STORAGE_KEYS.APP_DATA);
      if (savedData) {
        const appData: AppData = JSON.parse(savedData);

        // Migrate data if version mismatch
        if (appData.version !== APP_VERSION) {
          return this.migrateData(appData);
        }

        return appData;
      }
    } catch (error) {
      console.error("Error loading app data:", error);
      this.createBackup();
    }

    // Return default data for new users
    return this.getDefaultAppData();
  }

  // Save complete app data
  saveAppData(data?: Partial<AppData>): boolean {
    try {
      const currentData = this.loadAppData();
      const updatedData: AppData = {
        ...currentData,
        ...data,
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEYS.APP_DATA, JSON.stringify(updatedData));
      return true;
    } catch (error) {
      console.error("Error saving app data:", error);

      // Try to free up space by removing old backups
      this.cleanupStorage();

      // Retry save
      try {
        const currentData = this.loadAppData();
        const updatedData: AppData = {
          ...currentData,
          ...data,
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(
          STORAGE_KEYS.APP_DATA,
          JSON.stringify(updatedData)
        );
        return true;
      } catch (retryError) {
        console.error("Failed to save data after cleanup:", retryError);
        return false;
      }
    }
  }

  // User Stats Management
  getUserStats(): UserStats {
    const appData = this.loadAppData();
    return appData.user;
  }

  saveUserStats(userStats: UserStats): boolean {
    return this.saveAppData({ user: userStats });
  }

  updateUserStats(updates: Partial<UserStats>): UserStats {
    const currentStats = this.getUserStats();
    const updatedStats = { ...currentStats, ...updates };
    this.saveUserStats(updatedStats);
    return updatedStats;
  }

  // Preferences Management
  getPreferences(): UserPreferences {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (saved) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
    return DEFAULT_PREFERENCES;
  }

  savePreferences(preferences: UserPreferences): boolean {
    try {
      localStorage.setItem(
        STORAGE_KEYS.PREFERENCES,
        JSON.stringify(preferences)
      );
      this.saveAppData({ preferences });
      return true;
    } catch (error) {
      console.error("Error saving preferences:", error);
      return false;
    }
  }

  // Objectives Management
  getObjectives(): Objective[] {
    const appData = this.loadAppData();
    return appData.objectives || [];
  }

  saveObjective(objective: Objective): boolean {
    const objectives = this.getObjectives();
    const existingIndex = objectives.findIndex(
      (obj) => obj.id === objective.id
    );

    if (existingIndex >= 0) {
      objectives[existingIndex] = objective;
    } else {
      objectives.push(objective);
    }

    return this.saveAppData({ objectives });
  }

  deleteObjective(objectiveId: string): boolean {
    const objectives = this.getObjectives().filter(
      (obj) => obj.id !== objectiveId
    );
    return this.saveAppData({ objectives });
  }

  // OKR Cycles Management
  getOKRCycles(): OKRCycle[] {
    const appData = this.loadAppData();
    return appData.cycles || [];
  }

  saveOKRCycle(cycle: OKRCycle): boolean {
    const cycles = this.getOKRCycles();
    const existingIndex = cycles.findIndex((c) => c.id === cycle.id);

    if (existingIndex >= 0) {
      cycles[existingIndex] = cycle;
    } else {
      cycles.push(cycle);
    }

    return this.saveAppData({ cycles });
  }

  // Meeting Templates Management
  getTemplates(): MeetingTemplate[] {
    const appData = this.loadAppData();
    return appData.templates || [];
  }

  saveTemplate(template: MeetingTemplate): boolean {
    const templates = this.getTemplates();
    const existingIndex = templates.findIndex(
      (t) =>
        t.meetingTitle === template.meetingTitle &&
        t.meetingDate === template.meetingDate
    );

    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }

    return this.saveAppData({ templates });
  }

  // Session Management
  startSession(): UserSession {
    const userStats = this.getUserStats();

    this.currentSession = {
      id: "session_" + Date.now(),
      userId: userStats.id,
      startTime: new Date().toISOString(),
      activities: [],
      totalTimeSpent: 0,
    };

    localStorage.setItem(
      STORAGE_KEYS.CURRENT_SESSION,
      JSON.stringify(this.currentSession)
    );
    return this.currentSession;
  }

  getCurrentSession(): UserSession | null {
    if (this.currentSession) {
      return this.currentSession;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
      if (saved) {
        this.currentSession = JSON.parse(saved);
        return this.currentSession;
      }
    } catch (error) {
      console.error("Error loading current session:", error);
    }

    return null;
  }

  addSessionActivity(activity: SessionActivity): boolean {
    if (!this.currentSession) {
      this.startSession();
    }

    if (this.currentSession) {
      this.currentSession.activities.push(activity);
      this.currentSession.totalTimeSpent = this.calculateSessionTime();

      localStorage.setItem(
        STORAGE_KEYS.CURRENT_SESSION,
        JSON.stringify(this.currentSession)
      );
      return true;
    }

    return false;
  }

  endSession(): boolean {
    if (!this.currentSession) {
      return false;
    }

    this.currentSession.endTime = new Date().toISOString();
    this.currentSession.totalTimeSpent = this.calculateSessionTime();

    // Save session to history
    const appData = this.loadAppData();
    const sessions = appData.sessions || [];
    sessions.push(this.currentSession);

    // Keep only last 100 sessions to avoid storage bloat
    if (sessions.length > 100) {
      sessions.splice(0, sessions.length - 100);
    }

    const saved = this.saveAppData({ sessions });

    // Update user total time spent
    const userStats = this.getUserStats();
    userStats.stats.totalTimeSpent += this.currentSession.totalTimeSpent;
    this.saveUserStats(userStats);

    // Clear current session
    this.currentSession = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);

    return saved;
  }

  private calculateSessionTime(): number {
    if (!this.currentSession) return 0;

    const start = new Date(this.currentSession.startTime).getTime();
    const end = this.currentSession.endTime
      ? new Date(this.currentSession.endTime).getTime()
      : Date.now();

    return Math.round((end - start) / (1000 * 60)); // Minutes
  }

  // Game Events Management
  addGameEvent(event: GameEvent): boolean {
    const appData = this.loadAppData();
    const events = appData.events || [];
    events.push(event);

    // Keep only last 500 events
    if (events.length > 500) {
      events.splice(0, events.length - 500);
    }

    return this.saveAppData({ events });
  }

  getGameEvents(limit: number = 50): GameEvent[] {
    const appData = this.loadAppData();
    const events = appData.events || [];
    return events
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);
  }

  // Data Import/Export
  exportData(): string {
    const appData = this.loadAppData();
    return JSON.stringify(appData, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const importedData: AppData = JSON.parse(jsonData);

      // Validate data structure
      if (!this.validateAppData(importedData)) {
        throw new Error("Invalid data structure");
      }

      // Create backup before import
      this.createBackup();

      // Merge with existing data
      // const currentData = this.loadAppData(); // Commented out as currently unused
      const mergedData: AppData = {
        ...importedData,
        version: APP_VERSION,
        lastUpdated: new Date().toISOString(),
        // Preserve current session if exists
        user: {
          ...importedData.user,
          lastActive: new Date().toISOString(),
        },
      };

      return this.saveAppData(mergedData);
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }

  // Backup and Recovery
  createBackup(): boolean {
    try {
      const appData = this.loadAppData();
      const backup = {
        timestamp: new Date().toISOString(),
        data: appData,
      };

      localStorage.setItem(STORAGE_KEYS.BACKUP, JSON.stringify(backup));
      return true;
    } catch (error) {
      console.error("Error creating backup:", error);
      return false;
    }
  }

  restoreFromBackup(): boolean {
    try {
      const backup = localStorage.getItem(STORAGE_KEYS.BACKUP);
      if (backup) {
        const { data } = JSON.parse(backup);
        return this.saveAppData(data);
      }
      return false;
    } catch (error) {
      console.error("Error restoring from backup:", error);
      return false;
    }
  }

  // Storage Management
  getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      // Connection test placeholder
      let used = 0;

      // Calculate used space
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // Estimate available space (5MB typical limit)
      const totalAvailable = 5 * 1024 * 1024; // 5MB in bytes
      const available = totalAvailable - used;
      const percentage = (used / totalAvailable) * 100;

      return { used, available, percentage };
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  cleanupStorage(): boolean {
    try {
      // Remove old backups except the most recent
      const backup = localStorage.getItem(STORAGE_KEYS.BACKUP);
      localStorage.removeItem(STORAGE_KEYS.BACKUP);

      // Clear old session data if exists
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);

      // Restore only the most recent backup
      if (backup) {
        localStorage.setItem(STORAGE_KEYS.BACKUP, backup);
      }

      return true;
    } catch (error) {
      console.error("Error cleaning up storage:", error);
      return false;
    }
  }

  // Data Validation
  private validateAppData(data: any): boolean {
    return (
      data &&
      typeof data === "object" &&
      data.version &&
      data.user &&
      data.user.id &&
      Array.isArray(data.objectives) &&
      Array.isArray(data.cycles)
    );
  }

  // Data Migration
  private migrateData(oldData: AppData): AppData {
    // Handle version migrations here
    console.log(
      "Migrating data from version",
      oldData.version,
      "to",
      APP_VERSION
    );

    const migratedData: AppData = {
      ...oldData,
      version: APP_VERSION,
      lastUpdated: new Date().toISOString(),
    };

    // Add any missing properties with defaults
    if (!migratedData.preferences) {
      migratedData.preferences = DEFAULT_PREFERENCES;
    }

    if (!migratedData.sessions) {
      migratedData.sessions = [];
    }

    if (!migratedData.events) {
      migratedData.events = [];
    }

    return migratedData;
  }

  // Get default app data for new users
  private getDefaultAppData(): AppData {
    return {
      version: APP_VERSION,
      lastUpdated: new Date().toISOString(),
      user: DEFAULT_USER_STATS,
      preferences: DEFAULT_PREFERENCES,
      objectives: [],
      cycles: [],
      templates: [],
      sessions: [],
      events: [],
    };
  }

  // Reset all data (for testing or user request)
  resetAllData(): boolean {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });

      this.currentSession = null;
      return true;
    } catch (error) {
      console.error("Error resetting data:", error);
      return false;
    }
  }

  // Get statistics about user data
  getDataStatistics(): {
    objectives: number;
    completedObjectives: number;
    totalCheckIns: number;
    achievements: number;
    totalSessions: number;
    joinDaysAgo: number;
  } {
    const appData = this.loadAppData();
    const user = appData.user;

    const joinDate = new Date(user.joinDate);
    const now = new Date();
    const joinDaysAgo = Math.floor(
      (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      objectives: appData.objectives.length,
      completedObjectives: user.stats.objectivesCompleted,
      totalCheckIns: user.stats.checkInsCompleted,
      achievements: user.achievements.length,
      totalSessions: user.stats.totalSessions,
      joinDaysAgo,
    };
  }
}
