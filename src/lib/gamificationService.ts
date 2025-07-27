import {
  Achievement,
  UserStats,
  GameEvent,
  AchievementCondition,
  Objective,
  CheckIn,
  SessionActivity,
  MeetingTemplate,
} from "@/types";

// Achievement definitions for Final Expense Insurance OKR system
export const ACHIEVEMENTS: Achievement[] = [
  // Objectives Category
  {
    id: "first_objective",
    name: "Getting Started",
    description: "Create your first objective",
    icon: "🎯",
    category: "objectives",
    rarity: "common",
    points: 100,
    condition: { type: "count", target: 1, metric: "objectives_created" },
  },
  {
    id: "objective_master",
    name: "Objective Master",
    description: "Create 10 objectives",
    icon: "🏆",
    category: "objectives",
    rarity: "uncommon",
    points: 500,
    condition: { type: "count", target: 10, metric: "objectives_created" },
  },
  {
    id: "strategic_planner",
    name: "Strategic Planner",
    description: "Complete 5 objectives",
    icon: "🎖️",
    category: "objectives",
    rarity: "rare",
    points: 1000,
    condition: { type: "count", target: 5, metric: "objectives_completed" },
  },

  // Key Results Category
  {
    id: "key_achiever",
    name: "Key Achiever",
    description: "Achieve your first key result",
    icon: "🔑",
    category: "key-results",
    rarity: "common",
    points: 200,
    condition: { type: "count", target: 1, metric: "key_results_achieved" },
  },
  {
    id: "results_champion",
    name: "Results Champion",
    description: "Achieve 25 key results",
    icon: "🏅",
    category: "key-results",
    rarity: "epic",
    points: 2500,
    condition: { type: "count", target: 25, metric: "key_results_achieved" },
  },

  // Check-ins Category
  {
    id: "first_checkin",
    name: "Regular Reporter",
    description: "Complete your first check-in",
    icon: "📊",
    category: "check-ins",
    rarity: "common",
    points: 50,
    condition: { type: "count", target: 1, metric: "check_ins_completed" },
  },
  {
    id: "consistent_tracker",
    name: "Consistent Tracker",
    description: "Complete 20 check-ins",
    icon: "📈",
    category: "check-ins",
    rarity: "uncommon",
    points: 400,
    condition: { type: "count", target: 20, metric: "check_ins_completed" },
  },

  // Consistency Category
  {
    id: "week_warrior",
    name: "Week Warrior",
    description: "Maintain a 7-day check-in streak",
    icon: "🔥",
    category: "consistency",
    rarity: "uncommon",
    points: 300,
    condition: { type: "streak", target: 7, metric: "check_ins_streak" },
  },
  {
    id: "streak_master",
    name: "Streak Master",
    description: "Maintain a 30-day check-in streak",
    icon: "⚡",
    category: "consistency",
    rarity: "rare",
    points: 1500,
    condition: { type: "streak", target: 30, metric: "check_ins_streak" },
  },
  {
    id: "dedication_legend",
    name: "Dedication Legend",
    description: "Maintain a 100-day check-in streak",
    icon: "🌟",
    category: "consistency",
    rarity: "legendary",
    points: 5000,
    condition: { type: "streak", target: 100, metric: "check_ins_streak" },
  },

  // Performance Category
  {
    id: "confident_leader",
    name: "Confident Leader",
    description: "Maintain average confidence level above 8",
    icon: "💪",
    category: "performance",
    rarity: "rare",
    points: 800,
    condition: {
      type: "percentage",
      target: 8,
      metric: "avg_confidence_level",
    },
  },
  {
    id: "sales_superstar",
    name: "Sales Superstar",
    description: "Complete a revenue-focused objective",
    icon: "💰",
    category: "performance",
    rarity: "uncommon",
    points: 600,
    condition: {
      type: "count",
      target: 1,
      metric: "revenue_objectives_completed",
    },
  },
  {
    id: "customer_champion",
    name: "Customer Champion",
    description: "Complete a customer-focused objective",
    icon: "❤️",
    category: "performance",
    rarity: "uncommon",
    points: 600,
    condition: {
      type: "count",
      target: 1,
      metric: "customer_objectives_completed",
    },
  },
  {
    id: "compliance_expert",
    name: "Compliance Expert",
    description: "Complete a compliance-focused objective",
    icon: "🛡️",
    category: "performance",
    rarity: "uncommon",
    points: 600,
    condition: {
      type: "count",
      target: 1,
      metric: "compliance_objectives_completed",
    },
  },

  // Collaboration Category
  {
    id: "team_player",
    name: "Team Player",
    description: "Create a team-level objective",
    icon: "🤝",
    category: "collaboration",
    rarity: "common",
    points: 250,
    condition: { type: "count", target: 1, metric: "team_objectives_created" },
  },
  {
    id: "mentor",
    name: "Mentor",
    description: "Help complete 5 team objectives",
    icon: "🎓",
    category: "collaboration",
    rarity: "epic",
    points: 2000,
    condition: {
      type: "count",
      target: 5,
      metric: "team_objectives_completed",
    },
  },
];

// Level thresholds and rewards
export const LEVEL_THRESHOLDS = [
  { level: 1, requiredPoints: 0, title: "Newcomer", bonus: 0 },
  { level: 2, requiredPoints: 500, title: "Apprentice", bonus: 50 },
  { level: 3, requiredPoints: 1500, title: "Practitioner", bonus: 100 },
  { level: 4, requiredPoints: 3000, title: "Expert", bonus: 200 },
  { level: 5, requiredPoints: 6000, title: "Master", bonus: 300 },
  { level: 6, requiredPoints: 10000, title: "Guru", bonus: 500 },
  { level: 7, requiredPoints: 15000, title: "Legend", bonus: 750 },
  { level: 8, requiredPoints: 25000, title: "Champion", bonus: 1000 },
  { level: 9, requiredPoints: 40000, title: "Grandmaster", bonus: 1500 },
  { level: 10, requiredPoints: 60000, title: "Immortal", bonus: 2000 },
];

export class GamificationService {
  private static instance: GamificationService;
  private events: GameEvent[] = [];
  private eventListeners: ((event: GameEvent) => void)[] = [];

  static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  // Event system for real-time notifications
  addEventListener(callback: (event: GameEvent) => void) {
    this.eventListeners.push(callback);
  }

  removeEventListener(callback: (event: GameEvent) => void) {
    this.eventListeners = this.eventListeners.filter(
      (listener) => listener !== callback
    );
  }

  private triggerEvent(event: GameEvent) {
    this.events.push(event);
    this.eventListeners.forEach((listener) => listener(event));
  }

  // Calculate user level based on points
  calculateLevel(points: number): {
    level: number;
    title: string;
    nextLevelPoints: number;
    progress: number;
  } {
    let currentLevel = LEVEL_THRESHOLDS[0];
    let nextLevel = LEVEL_THRESHOLDS[1];

    for (let i = 0; i < LEVEL_THRESHOLDS.length - 1; i++) {
      if (
        points >= LEVEL_THRESHOLDS[i].requiredPoints &&
        points < LEVEL_THRESHOLDS[i + 1].requiredPoints
      ) {
        currentLevel = LEVEL_THRESHOLDS[i];
        nextLevel = LEVEL_THRESHOLDS[i + 1];
        break;
      }
    }

    // Handle max level
    if (
      points >= LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].requiredPoints
    ) {
      const maxLevel = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
      return {
        level: maxLevel.level,
        title: maxLevel.title,
        nextLevelPoints: 0,
        progress: 100,
      };
    }

    const progress =
      ((points - currentLevel.requiredPoints) /
        (nextLevel.requiredPoints - currentLevel.requiredPoints)) *
      100;

    return {
      level: currentLevel.level,
      title: currentLevel.title,
      nextLevelPoints: nextLevel.requiredPoints - points,
      progress,
    };
  }

  // Check and award achievements
  checkAchievements(
    userStats: UserStats,
    activity?: SessionActivity
  ): { newAchievements: Achievement[]; pointsEarned: number } {
    const newAchievements: Achievement[] = [];
    let pointsEarned = 0;

    for (const achievement of ACHIEVEMENTS) {
      // Skip if already unlocked
      if (userStats.achievements.some((a) => a.id === achievement.id)) {
        continue;
      }

      if (this.isAchievementUnlocked(achievement, userStats)) {
        const unlockedAchievement = {
          ...achievement,
          unlockedDate: new Date().toISOString(),
        };

        newAchievements.push(unlockedAchievement);
        pointsEarned += achievement.points;

        // Trigger achievement event
        this.triggerEvent({
          id: `achievement_${achievement.id}_${Date.now()}`,
          type: "achievement_unlocked",
          title: `Achievement Unlocked: ${achievement.name}`,
          description: achievement.description,
          points: achievement.points,
          timestamp: new Date().toISOString(),
          data: { achievement: unlockedAchievement },
        });
      }
    }

    return { newAchievements, pointsEarned };
  }

  private isAchievementUnlocked(
    achievement: Achievement,
    userStats: UserStats
  ): boolean {
    const { condition } = achievement;
    const { stats } = userStats;

    switch (condition.metric) {
      case "objectives_created":
        return stats.objectivesCreated >= condition.target;
      case "objectives_completed":
        return stats.objectivesCompleted >= condition.target;
      case "key_results_achieved":
        return stats.keyResultsAchieved >= condition.target;
      case "check_ins_completed":
        return stats.checkInsCompleted >= condition.target;
      case "check_ins_streak":
        return userStats.currentStreak >= condition.target;
      case "avg_confidence_level":
        return stats.avgConfidenceLevel >= condition.target;
      // Category-specific metrics would need additional tracking
      case "revenue_objectives_completed":
      case "customer_objectives_completed":
      case "compliance_objectives_completed":
      case "team_objectives_created":
      case "team_objectives_completed":
        // These would require category-specific tracking in the stats
        return false; // Placeholder
      default:
        return false;
    }
  }

  // Update user stats based on activity
  updateUserStats(userStats: UserStats, activity: SessionActivity): UserStats {
    const updatedStats = { ...userStats };
    const oldLevel = this.calculateLevel(userStats.totalPoints).level;

    // Update activity-specific stats
    switch (activity.type) {
      case "objective_created":
        updatedStats.stats.objectivesCreated++;
        break;
      case "objective_updated":
        if (activity.data?.completed) {
          updatedStats.stats.objectivesCompleted++;
        }
        break;
      case "check_in_completed":
        updatedStats.stats.checkInsCompleted++;
        this.updateStreak(updatedStats);
        break;
    }

    // Add points from activity
    updatedStats.totalPoints += activity.pointsEarned;

    // Check for level up
    const newLevel = this.calculateLevel(updatedStats.totalPoints).level;
    if (newLevel > oldLevel) {
      const levelInfo = LEVEL_THRESHOLDS.find((l) => l.level === newLevel);
      if (levelInfo) {
        updatedStats.totalPoints += levelInfo.bonus;

        this.triggerEvent({
          id: `level_up_${newLevel}_${Date.now()}`,
          type: "level_up",
          title: `Level Up! You're now a ${levelInfo.title}`,
          description: `You've reached level ${newLevel} and earned ${levelInfo.bonus} bonus points!`,
          points: levelInfo.bonus,
          timestamp: new Date().toISOString(),
          data: { newLevel, title: levelInfo.title },
        });
      }
    }

    // Update last active
    updatedStats.lastActive = new Date().toISOString();
    updatedStats.stats.totalSessions++;

    return updatedStats;
  }

  private updateStreak(userStats: UserStats) {
    const today = new Date().toDateString();
    const lastActive = new Date(userStats.lastActive).toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    if (lastActive === today) {
      // Already counted today, don't increment
      return;
    } else if (lastActive === yesterday) {
      // Consecutive day, increment streak
      userStats.currentStreak++;
    } else {
      // Streak broken, reset to 1
      userStats.currentStreak = 1;
    }

    // Update longest streak
    if (userStats.currentStreak > userStats.longestStreak) {
      userStats.longestStreak = userStats.currentStreak;
    }

    // Check for streak milestones
    if ([7, 14, 30, 50, 100].includes(userStats.currentStreak)) {
      this.triggerEvent({
        id: `streak_${userStats.currentStreak}_${Date.now()}`,
        type: "streak_milestone",
        title: `${userStats.currentStreak}-Day Streak!`,
        description: `You've maintained a ${userStats.currentStreak}-day check-in streak. Keep it up!`,
        points: userStats.currentStreak * 10,
        timestamp: new Date().toISOString(),
        data: { streak: userStats.currentStreak },
      });
    }
  }

  // Calculate points for different activities
  calculateActivityPoints(
    activityType: SessionActivity["type"],
    data?: any
  ): number {
    switch (activityType) {
      case "objective_created":
        return 100;
      case "objective_updated":
        if (data?.completed) return 500;
        return 25;
      case "check_in_completed":
        return 50;
      case "meeting_completed":
        return 200;
      case "template_generated":
        if (data?.imported) return 75; // Less points for importing vs generating
        return 150;
      case "ai_suggestion_used":
        return 200;
      case "archive_operation":
        return 25;
      case "bulk_operation":
        return data?.count ? data.count * 10 : 50;
      default:
        return 10;
    }
  }

  // Get user's rank in leaderboard
  getUserRank(
    userStats: UserStats,
    allUsers: UserStats[],
    category: "points" | "objectives" | "streak" = "points"
  ): number {
    const sortedUsers = [...allUsers].sort((a, b) => {
      switch (category) {
        case "points":
          return b.totalPoints - a.totalPoints;
        case "objectives":
          return b.stats.objectivesCompleted - a.stats.objectivesCompleted;
        case "streak":
          return b.currentStreak - a.currentStreak;
        default:
          return 0;
      }
    });

    return sortedUsers.findIndex((user) => user.id === userStats.id) + 1;
  }

  // Get achievement rarity color
  getRarityColor(rarity: Achievement["rarity"]): string {
    switch (rarity) {
      case "common":
        return "text-gray-600 bg-gray-100";
      case "uncommon":
        return "text-green-600 bg-green-100";
      case "rare":
        return "text-blue-600 bg-blue-100";
      case "epic":
        return "text-purple-600 bg-purple-100";
      case "legendary":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  }

  // Get recent events
  getRecentEvents(limit: number = 10): GameEvent[] {
    return this.events
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);
  }
}
