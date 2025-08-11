import {
  AppData,
  UserStats,
  UserProfile,
  UserPreferences,
  UserSession,
  SessionActivity,
  Objective,
  MeetingTemplate,
  GameEvent,
  Achievement,
} from "@/types";
import { supabase } from "./supabase";

const APP_VERSION = "1.0.0";

// Default user stats for new users
// Default user stats are now inline in database operations

// Default user preferences
const DEFAULT_PREFERENCES: Omit<UserPreferences, "id"> = {
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

export class SupabaseDataService {
  private static instance: SupabaseDataService;
  private currentSession: UserSession | null = null;
  private currentUser: any = null;
  private autoSaveInterval: number | null = null;

  static getInstance(): SupabaseDataService {
    if (!SupabaseDataService.instance) {
      SupabaseDataService.instance = new SupabaseDataService();
    }
    return SupabaseDataService.instance;
  }

  constructor() {
    // Auto-save will be initialized when user authenticates
    // No automatic user initialization - handled by auth flow
  }

  // Initialize user and start session (called after authentication)
  async initializeAuthenticatedUser(user: any) {
    try {
      this.currentUser = user;
      await this.ensureUserDataExists(user.id);
      await this.startSession();
      this.initializeAutoSave();
    } catch (error) {
      console.error("Error initializing authenticated user:", error);
    }
  }

  // Clear user data on sign out
  clearUserData() {
    this.currentUser = null;
    this.currentSession = null;
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  // Ensure user has all required data records
  private async ensureUserDataExists(userId: string) {
    try {
      // Check if user stats exist
      const { data: userStats } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (!userStats) {
        // Create user stats
        await supabase.from("user_stats").insert({
          user_id: userId,
          username: "User",
          level: 1,
          total_points: 0,
          current_streak: 0,
          longest_streak: 0,
          join_date: new Date().toISOString(),
          last_active: new Date().toISOString(),
          stats: {
            objectives_created: 0,
            objectives_completed: 0,
            key_results_achieved: 0,
            check_ins_completed: 0,
            avg_confidence_level: 0,
            avg_progress_rate: 0,
            total_sessions: 0,
            total_time_spent: 0,
          },
        });
      }

      // Check if user preferences exist
      const { data: userPrefs } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (!userPrefs) {
        // Create user preferences
        await supabase.from("user_preferences").insert({
          user_id: userId,
          theme: "auto",
          notifications: DEFAULT_PREFERENCES.notifications,
          gamification: DEFAULT_PREFERENCES.gamification,
          default_view: "meetings",
          auto_save: true,
        });
      }
    } catch (error) {
      console.error("Error ensuring user data exists:", error);
    }
  }

  // Initialize auto-save functionality
  private initializeAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    // Auto-save every 30 seconds
    this.autoSaveInterval = window.setInterval(() => {
      this.saveCurrentSession();
    }, 30000);

    // Save on page unload
    window.addEventListener("beforeunload", () => {
      this.endSession();
    });

    // Save on visibility change (tab switch, minimize)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.saveCurrentSession();
      }
    });
  }

  // User Stats Management
  async getUserStats(): Promise<UserStats | null> {
    if (!this.currentUser) return null;

    try {
      const { data, error } = await supabase
        .from("user_stats")
        .select(
          `
          *,
          achievements(*)
        `
        )
        .eq("user_id", this.currentUser.id)
        .single();

      if (error) {
        console.error("Error fetching user stats:", error);
        return null;
      }

      // Transform database format to application format
      return {
        id: data.id,
        username: data.username,
        level: data.level,
        totalPoints: data.total_points,
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        joinDate: data.join_date,
        lastActive: data.last_active,
        achievements: Array.isArray(data.achievements)
          ? data.achievements.map((a: any) => ({
              id: a.achievement_id,
              name: a.name,
              description: a.description,
              icon: a.icon,
              category: a.category,
              rarity: a.rarity,
              points: a.points,
              unlockedDate: a.unlocked_date,
              condition: { type: "count", target: 1, metric: "default" },
            }))
          : [],
        stats: {
          objectivesCreated: data.stats?.objectives_created || 0,
          objectivesCompleted: data.stats?.objectives_completed || 0,
          keyResultsAchieved: data.stats?.key_results_achieved || 0,
          checkInsCompleted: data.stats?.check_ins_completed || 0,
          avgConfidenceLevel: data.stats?.avg_confidence_level || 0,
          avgProgressRate: data.stats?.avg_progress_rate || 0,
          totalSessions: data.stats?.total_sessions || 0,
          totalTimeSpent: data.stats?.total_time_spent || 0,
        },
      };
    } catch (error) {
      console.error("Error getting user stats:", error);
      return null;
    }
  }

  async getUserProfile(userId?: string): Promise<UserProfile | null> {
    const targetUserId = userId || this.currentUser?.id;
    if (!targetUserId) return null;

    try {
      const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", targetUserId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }

      // Transform database data to UserProfile format
      return {
        id: data.id,
        email: data.email,
        username: data.username,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        department: data.department,
        team: data.team,
        licenseStates: data.license_states || [],
        hireDate: data.hire_date,
        avatar: data.avatar,
        approvalStatus: data.approval_status,
        approvedBy: data.approved_by,
        approvedAt: data.approved_at,
        rejectionReason: data.rejection_reason,
        approvalNotes: data.approval_notes,
        preferences: {
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
        },
        stats: {
          id: data.id,
          username: data.username,
          level: data.level,
          totalPoints: data.total_points,
          currentStreak: data.current_streak,
          longestStreak: data.longest_streak,
          joinDate: data.join_date,
          lastActive: data.last_active,
          achievements: [],
          stats: {
            objectivesCreated: data.stats?.objectives_created || 0,
            objectivesCompleted: data.stats?.objectives_completed || 0,
            keyResultsAchieved: data.stats?.key_results_achieved || 0,
            checkInsCompleted: data.stats?.check_ins_completed || 0,
            avgConfidenceLevel: data.stats?.avg_confidence_level || 0,
            avgProgressRate: data.stats?.avg_progress_rate || 0,
            totalSessions: data.stats?.total_sessions || 0,
            totalTimeSpent: data.stats?.total_time_spent || 0,
          },
        },
      } as UserProfile;
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  }

  async saveUserStats(userStats: UserStats): Promise<boolean> {
    if (!this.currentUser) return false;

    try {
      const { error } = await supabase
        .from("user_stats")
        .update({
          username: userStats.username,
          level: userStats.level,
          total_points: userStats.totalPoints,
          current_streak: userStats.currentStreak,
          longest_streak: userStats.longestStreak,
          last_active: new Date().toISOString(),
          stats: {
            objectives_created: userStats.stats.objectivesCreated,
            objectives_completed: userStats.stats.objectivesCompleted,
            key_results_achieved: userStats.stats.keyResultsAchieved,
            check_ins_completed: userStats.stats.checkInsCompleted,
            avg_confidence_level: userStats.stats.avgConfidenceLevel,
            avg_progress_rate: userStats.stats.avgProgressRate,
            total_sessions: userStats.stats.totalSessions,
            total_time_spent: userStats.stats.totalTimeSpent,
          },
        })
        .eq("user_id", this.currentUser.id);

      if (error) {
        console.error("Error saving user stats:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error saving user stats:", error);
      return false;
    }
  }

  async updateUserStats(
    updates: Partial<UserStats>
  ): Promise<UserStats | null> {
    const currentStats = await this.getUserStats();
    if (!currentStats) return null;

    const updatedStats = { ...currentStats, ...updates };
    await this.saveUserStats(updatedStats);
    return updatedStats;
  }

  // Achievements Management
  async saveAchievement(achievement: Achievement): Promise<boolean> {
    if (!this.currentUser) return false;

    try {
      const { error } = await supabase.from("achievements").insert({
        user_id: this.currentUser.id,
        achievement_id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        rarity: achievement.rarity,
        points: achievement.points,
        unlocked_date: achievement.unlockedDate || new Date().toISOString(),
      });

      if (error) {
        console.error("Error saving achievement:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error saving achievement:", error);
      return false;
    }
  }

  // Preferences Management
  async getPreferences(): Promise<UserPreferences | null> {
    if (!this.currentUser) return DEFAULT_PREFERENCES as UserPreferences;

    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", this.currentUser.id)
        .single();

      if (error || !data) {
        return DEFAULT_PREFERENCES as UserPreferences;
      }

      return {
        theme: data.theme,
        notifications: data.notifications,
        gamification: {
          enabled: data.gamification?.enabled || true,
          showLeaderboards: data.gamification?.show_leaderboards || true,
          showPoints: data.gamification?.show_points || true,
          showAchievements: data.gamification?.show_achievements || true,
        },
        defaultView: data.default_view,
        autoSave: data.auto_save,
      } as UserPreferences;
    } catch (error) {
      console.error("Error loading preferences:", error);
      return DEFAULT_PREFERENCES as UserPreferences;
    }
  }

  async savePreferences(preferences: UserPreferences): Promise<boolean> {
    if (!this.currentUser) return false;

    try {
      const { error } = await supabase
        .from("user_preferences")
        .update({
          theme: preferences.theme,
          notifications: preferences.notifications,
          gamification: preferences.gamification,
          default_view: preferences.defaultView,
          auto_save: preferences.autoSave,
        })
        .eq("user_id", this.currentUser.id);

      if (error) {
        console.error("Error saving preferences:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error saving preferences:", error);
      return false;
    }
  }

  // Objectives Management
  async getObjectives(): Promise<Objective[]> {
    if (!this.currentUser) return [];

    try {
      const { data, error } = await supabase
        .from("objectives")
        .select("*")
        .eq("user_id", this.currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching objectives:", error);
        return [];
      }

      return data.map((obj: any) => ({
        id: obj.id,
        title: obj.title,
        description: obj.description,
        category: obj.category,
        level: obj.level,
        owner: obj.owner,
        quarter: obj.quarter,
        year: obj.year,
        keyResults: obj.key_results || [],
        alignedTo: obj.aligned_to,
        confidenceLevel: obj.confidence_level,
        status: obj.status,
        createdDate: obj.created_date,
        lastUpdated: obj.last_updated,
        checkIns: obj.check_ins || [],
      }));
    } catch (error) {
      console.error("Error getting objectives:", error);
      return [];
    }
  }

  async saveObjective(objective: Objective): Promise<boolean> {
    if (!this.currentUser) return false;

    try {
      const { error } = await supabase.from("objectives").upsert({
        user_id: this.currentUser.id,
        title: objective.title,
        description: objective.description,
        category: objective.category,
        level: objective.level,
        owner: objective.owner,
        quarter: objective.quarter,
        year: objective.year,
        aligned_to: objective.alignedTo,
        confidence_level: objective.confidenceLevel,
        status: objective.status,
        created_date: objective.createdDate,
        last_updated: new Date().toISOString(),
        key_results: objective.keyResults as any,
        check_ins: objective.checkIns as any,
        archived_date: objective.archivedDate,
        archived_by: objective.archivedBy,
        archived_reason: objective.archivedReason,
      });

      if (error) {
        console.error("Error saving objective:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error saving objective:", error);
      return false;
    }
  }

  async deleteObjective(objectiveId: string): Promise<boolean> {
    if (!this.currentUser) return false;

    try {
      const { error } = await supabase
        .from("objectives")
        .delete()
        .eq("id", objectiveId)
        .eq("user_id", this.currentUser.id);

      if (error) {
        console.error("Error deleting objective:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting objective:", error);
      return false;
    }
  }

  // Meeting Templates Management
  async getTemplates(): Promise<MeetingTemplate[]> {
    if (!this.currentUser) return [];

    try {
      const { data, error } = await supabase
        .from("meeting_templates")
        .select("*")
        .eq("user_id", this.currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching templates:", error);
        return [];
      }

      return data.map((template: any) => ({
        meetingTitle: template.meeting_title,
        meetingDate: template.meeting_date,
        facilitator: template.facilitator,
        coreQuestion: template.core_question,
        meetingContext: template.meeting_context,
        sections: template.sections,
      }));
    } catch (error) {
      console.error("Error getting templates:", error);
      return [];
    }
  }

  async saveTemplate(template: MeetingTemplate): Promise<boolean> {
    if (!this.currentUser) {
      console.error("Cannot save template: No current user");
      return false;
    }

    console.log("Saving template for user:", this.currentUser.id);
    console.log("Template data:", {
      meeting_title: template.meetingTitle,
      meeting_date: template.meetingDate,
      facilitator: template.facilitator,
      core_question: template.coreQuestion,
      meeting_context: template.meetingContext,
      sections_count: template.sections?.length,
    });

    try {
      // First check if a template with the same title already exists for this user
      const { data: existingTemplates, error: checkError } = await supabase
        .from("meeting_templates")
        .select("id, meeting_title")
        .eq("user_id", this.currentUser.id)
        .eq("meeting_title", template.meetingTitle);

      if (checkError) {
        console.error("Error checking existing templates:", checkError);
        return false;
      }

      if (existingTemplates && existingTemplates.length > 0) {
        console.log("Template with this title already exists:", existingTemplates);
        // Template already exists, don't create a duplicate
        return true;
      }

      // Template doesn't exist, create a new one
      const { data, error } = await supabase.from("meeting_templates").insert({
        user_id: this.currentUser.id,
        meeting_title: template.meetingTitle,
        meeting_date: template.meetingDate,
        facilitator: template.facilitator,
        core_question: template.coreQuestion,
        meeting_context: template.meetingContext,
        sections: template.sections as any,
        status: template.status || "active",
        created_date: template.createdDate || new Date().toISOString(),
        tags: template.tags || [],
        usage_count: template.usageCount || 0,
        archived_date: template.archivedDate,
        archived_by: template.archivedBy,
      }).select();

      if (error) {
        console.error("Database error saving template:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        return false;
      }

      console.log("Template saved successfully:", data);
      return true;
    } catch (error) {
      console.error("Exception saving template:", error);
      return false;
    }
  }

  // Session Management
  async startSession(): Promise<UserSession | null> {
    if (!this.currentUser) return null;

    const sessionId = "session_" + Date.now();

    this.currentSession = {
      id: sessionId,
      userId: this.currentUser.id,
      startTime: new Date().toISOString(),
      activities: [],
      totalTimeSpent: 0,
    };

    try {
      await supabase.from("user_sessions").insert({
        user_id: this.currentUser.id,
        session_id: sessionId,
        start_time: this.currentSession.startTime,
        total_time_spent: 0,
        activities: [],
      });

      return this.currentSession;
    } catch (error) {
      console.error("Error starting session:", error);
      return null;
    }
  }

  async addSessionActivity(activity: SessionActivity): Promise<boolean> {
    if (!this.currentSession || !this.currentUser) return false;

    this.currentSession.activities.push(activity);
    this.currentSession.totalTimeSpent = this.calculateSessionTime();

    return this.saveCurrentSession();
  }

  private async saveCurrentSession(): Promise<boolean> {
    if (!this.currentSession || !this.currentUser) return false;

    try {
      const { error } = await supabase
        .from("user_sessions")
        .update({
          total_time_spent: this.currentSession.totalTimeSpent,
          activities: this.currentSession.activities as any,
        })
        .eq("session_id", this.currentSession.id)
        .eq("user_id", this.currentUser.id);

      if (error) {
        console.error("Error saving session:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error saving session:", error);
      return false;
    }
  }

  async endSession(): Promise<boolean> {
    if (!this.currentSession || !this.currentUser) return false;

    const endTime = new Date().toISOString();
    this.currentSession.totalTimeSpent = this.calculateSessionTime();

    try {
      const { error } = await supabase
        .from("user_sessions")
        .update({
          end_time: endTime,
          total_time_spent: this.currentSession.totalTimeSpent,
          activities: this.currentSession.activities as any,
        })
        .eq("session_id", this.currentSession.id)
        .eq("user_id", this.currentUser.id);

      if (error) {
        console.error("Error ending session:", error);
        return false;
      }

      // Update user total time spent
      const userStats = await this.getUserStats();
      if (userStats) {
        userStats.stats.totalTimeSpent += this.currentSession.totalTimeSpent;
        userStats.stats.totalSessions++;
        await this.saveUserStats(userStats);
      }

      this.currentSession = null;
      return true;
    } catch (error) {
      console.error("Error ending session:", error);
      return false;
    }
  }

  private calculateSessionTime(): number {
    if (!this.currentSession) return 0;

    const start = new Date(this.currentSession.startTime).getTime();
    const end = Date.now();

    return Math.round((end - start) / (1000 * 60)); // Minutes
  }

  // Game Events Management
  async addGameEvent(event: GameEvent): Promise<boolean> {
    if (!this.currentUser) return false;

    try {
      const { error } = await supabase.from("game_events").insert({
        user_id: this.currentUser.id,
        event_id: event.id,
        type: event.type,
        title: event.title,
        description: event.description,
        points: event.points,
        timestamp: event.timestamp,
        data: event.data,
      });

      if (error) {
        console.error("Error saving game event:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error saving game event:", error);
      return false;
    }
  }

  async getGameEvents(limit: number = 50): Promise<GameEvent[]> {
    if (!this.currentUser) return [];

    try {
      const { data, error } = await supabase
        .from("game_events")
        .select("*")
        .eq("user_id", this.currentUser.id)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching game events:", error);
        return [];
      }

      return data.map((event: any) => ({
        id: event.event_id,
        type: event.type,
        title: event.title,
        description: event.description,
        points: event.points,
        timestamp: event.timestamp,
        data: event.data,
      }));
    } catch (error) {
      console.error("Error getting game events:", error);
      return [];
    }
  }

  // Data Import/Export
  async exportData(): Promise<string> {
    if (!this.currentUser) return "";

    try {
      const [userStats, objectives, templates, preferences, gameEvents] =
        await Promise.all([
          this.getUserStats(),
          this.getObjectives(),
          this.getTemplates(),
          this.getPreferences(),
          this.getGameEvents(100),
        ]);

      const appData: Partial<AppData> = {
        version: APP_VERSION,
        lastUpdated: new Date().toISOString(),
        user: userStats || undefined,
        preferences: preferences || undefined,
        objectives: objectives || [],
        cycles: [], // OKR cycles would be fetched similarly
        templates: templates || [],
        sessions: [], // Session history
        events: gameEvents || [],
      };

      return JSON.stringify(appData, null, 2);
    } catch (error) {
      console.error("Error exporting data:", error);
      return "";
    }
  }

  // Connection status
  async checkConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from("user_stats").select("id").limit(1);

      return !error;
    } catch (error) {
      console.error("Supabase connection error:", error);
      return false;
    }
  }

  // Get statistics about user data
  async getDataStatistics() {
    if (!this.currentUser) {
      return {
        objectives: 0,
        completedObjectives: 0,
        totalCheckIns: 0,
        achievements: 0,
        totalSessions: 0,
        joinDaysAgo: 0,
      };
    }

    try {
      const userStats = await this.getUserStats();
      if (!userStats) {
        return {
          objectives: 0,
          completedObjectives: 0,
          totalCheckIns: 0,
          achievements: 0,
          totalSessions: 0,
          joinDaysAgo: 0,
        };
      }

      const objectives = await this.getObjectives();
      const joinDate = new Date(userStats.joinDate);
      const now = new Date();
      const joinDaysAgo = Math.floor(
        (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        objectives: objectives.length,
        completedObjectives: userStats.stats.objectivesCompleted,
        totalCheckIns: userStats.stats.checkInsCompleted,
        achievements: userStats.achievements.length,
        totalSessions: userStats.stats.totalSessions,
        joinDaysAgo,
      };
    } catch (error) {
      console.error("Error getting data statistics:", error);
      return {
        objectives: 0,
        completedObjectives: 0,
        totalCheckIns: 0,
        achievements: 0,
        totalSessions: 0,
        joinDaysAgo: 0,
      };
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Sign out
  async signOut(): Promise<boolean> {
    try {
      await this.endSession();

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        return false;
      }

      this.currentUser = null;
      this.currentSession = null;

      if (this.autoSaveInterval) {
        clearInterval(this.autoSaveInterval);
        this.autoSaveInterval = null;
      }

      return true;
    } catch (error) {
      console.error("Error during sign out:", error);
      return false;
    }
  }
}
