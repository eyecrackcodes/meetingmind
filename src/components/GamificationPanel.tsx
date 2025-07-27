import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Star,
  Flame,
  Calendar,
  Award,
  TrendingUp,
  Users,
  Clock,
  Target,
  Zap,
  Gift,
  Crown,
  ChevronRight,
  Download,
  Upload,
} from "lucide-react";
import { UserStats, Achievement, GameEvent } from "@/types";
import {
  GamificationService,
  LEVEL_THRESHOLDS,
} from "@/lib/gamificationService";
import { DataService } from "@/lib/dataService";

interface GamificationPanelProps {
  userStats: UserStats;
  onClose?: () => void;
  compact?: boolean;
}

export function GamificationPanel({
  userStats,
  onClose,
  compact = false,
}: GamificationPanelProps) {
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "achievements" | "activity" | "stats"
  >("overview");
  const [recentEvents, setRecentEvents] = useState<GameEvent[]>([]);
  const gamificationService = GamificationService.getInstance();
  const dataService = DataService.getInstance();

  const levelInfo = gamificationService.calculateLevel(userStats.totalPoints);
  const dataStats = dataService.getDataStatistics();

  useEffect(() => {
    setRecentEvents(dataService.getGameEvents(10));
  }, []);

  // Get achievements by category
  const achievementsByCategory = userStats.achievements.reduce(
    (acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push(achievement);
      return acc;
    },
    {} as Record<string, Achievement[]>
  );

  const getStreakEmoji = (streak: number) => {
    if (streak >= 100) return "🔥";
    if (streak >= 30) return "⚡";
    if (streak >= 7) return "🌟";
    return "💫";
  };

  const getEventIcon = (type: GameEvent["type"]) => {
    switch (type) {
      case "achievement_unlocked":
        return <Award className="h-4 w-4 text-yellow-600" />;
      case "level_up":
        return <Star className="h-4 w-4 text-purple-600" />;
      case "streak_milestone":
        return <Flame className="h-4 w-4 text-orange-600" />;
      case "objective_completed":
        return <Target className="h-4 w-4 text-green-600" />;
      case "milestone_reached":
        return <Trophy className="h-4 w-4 text-blue-600" />;
      default:
        return <Zap className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const exportData = () => {
    const data = dataService.exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meetingmind-data-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        if (dataService.importData(data)) {
          alert("Data imported successfully!");
          window.location.reload(); // Refresh to show new data
        } else {
          alert("Failed to import data. Please check the file format.");
        }
      };
      reader.readAsText(file);
    }
  };

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <Badge className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5 bg-yellow-500 text-white">
                  {levelInfo.level}
                </Badge>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {userStats.username}
                </p>
                <p className="text-sm text-gray-600">{levelInfo.title}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">{userStats.totalPoints}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Flame className="h-4 w-4 text-orange-600" />
                <span>{userStats.currentStreak} day streak</span>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Level Progress</span>
              <span>
                {levelInfo.nextLevelPoints > 0
                  ? `${levelInfo.nextLevelPoints} to next level`
                  : "Max Level!"}
              </span>
            </div>
            <Progress value={levelInfo.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Progress</h2>
          <p className="text-gray-600 mt-1">
            Track achievements and level up your performance
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        )}
      </div>

      {/* User Level Card */}
      <Card className="bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-white px-2 py-1">
                  {levelInfo.level}
                </Badge>
              </div>
              <div>
                <h3 className="text-xl font-bold">{userStats.username}</h3>
                <p className="text-purple-100 text-lg">{levelInfo.title}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    <span className="font-medium">
                      {userStats.totalPoints} points
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4" />
                    <span>
                      {userStats.currentStreak} day streak{" "}
                      {getStreakEmoji(userStats.currentStreak)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {userStats.achievements.length}
              </div>
              <p className="text-purple-100">Achievements</p>
            </div>
          </div>

          {levelInfo.nextLevelPoints > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-purple-100 mb-2">
                <span>Progress to Level {levelInfo.level + 1}</span>
                <span>{levelInfo.nextLevelPoints} points needed</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="bg-white rounded-full h-3 transition-all duration-500"
                  style={{ width: `${levelInfo.progress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
        {[
          { id: "overview", label: "Overview", icon: TrendingUp },
          { id: "achievements", label: "Achievements", icon: Award },
          { id: "activity", label: "Activity", icon: Clock },
          { id: "stats", label: "Stats", icon: Target },
        ].map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={selectedTab === id ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedTab(id as any)}
            className="flex-1 flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {dataStats.objectives}
                  </div>
                  <p className="text-sm text-blue-700">Total OKRs</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {dataStats.completedObjectives}
                  </div>
                  <p className="text-sm text-green-700">Completed</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {userStats.currentStreak}
                  </div>
                  <p className="text-sm text-orange-700">Day Streak</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {userStats.achievements.length}
                  </div>
                  <p className="text-sm text-purple-700">Achievements</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userStats.achievements.slice(0, 3).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium">{achievement.name}</p>
                      <p className="text-sm text-gray-600">
                        {achievement.description}
                      </p>
                    </div>
                    <Badge
                      className={gamificationService.getRarityColor(
                        achievement.rarity
                      )}
                    >
                      {achievement.rarity}
                    </Badge>
                  </div>
                ))}
                {userStats.achievements.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>
                      No achievements yet. Start creating OKRs to earn your
                      first achievement!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === "achievements" && (
        <div className="space-y-6">
          {Object.entries(achievementsByCategory).map(
            ([category, achievements]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">
                    {category.replace("-", " ")} Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="p-4 border-2 rounded-lg bg-gradient-to-br from-white to-gray-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-3xl">{achievement.icon}</div>
                          <Badge
                            className={gamificationService.getRarityColor(
                              achievement.rarity
                            )}
                          >
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {achievement.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {achievement.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-600">
                            +{achievement.points} pts
                          </span>
                          {achievement.unlockedDate && (
                            <span className="text-xs text-gray-500">
                              {new Date(
                                achievement.unlockedDate
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          )}

          {userStats.achievements.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Award className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Achievements Yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start creating objectives and completing key results to unlock
                  achievements!
                </p>
                <Button onClick={() => onClose?.()}>
                  Create Your First OKR
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {selectedTab === "activity" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {getEventIcon(event.type)}
                  <div className="flex-1">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-600">{event.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      +{event.points} pts
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {recentEvents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>
                    No recent activity. Start using the app to see your progress
                    here!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTab === "stats" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Detailed Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Performance Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Objectives Created</span>
                  <span className="font-medium">
                    {userStats.stats.objectivesCreated}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Objectives Completed</span>
                  <span className="font-medium">
                    {userStats.stats.objectivesCompleted}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Key Results Achieved</span>
                  <span className="font-medium">
                    {userStats.stats.keyResultsAchieved}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-ins Completed</span>
                  <span className="font-medium">
                    {userStats.stats.checkInsCompleted}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Confidence Level</span>
                  <span className="font-medium">
                    {userStats.stats.avgConfidenceLevel.toFixed(1)}/10
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Time Spent</span>
                  <span className="font-medium">
                    {formatTimeSpent(userStats.stats.totalTimeSpent)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">
                    {dataStats.joinDaysAgo} days ago
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sessions</span>
                  <span className="font-medium">
                    {userStats.stats.totalSessions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Streak</span>
                  <span className="font-medium">
                    {userStats.currentStreak} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Longest Streak</span>
                  <span className="font-medium">
                    {userStats.longestStreak} days
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <Button
                  onClick={exportData}
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
                <label className="block">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Import Data
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
