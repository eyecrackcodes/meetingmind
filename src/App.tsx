import { useState, useEffect, useCallback } from "react";
import {
  MeetingTemplate,
  Objective,
  UserStats,
  SessionActivity,
  UserProfile,
  ArchiveOperation,
  BulkOperation,
  AIObjectiveSuggestion,
  AIKeyResultSuggestion,
  AICheckInAnalysis,
  OKRCycle,
} from "@/types";
import { Header } from "@/components/Header";
import { FrameworkPanel } from "@/components/FrameworkPanel";
import { ControlPanel } from "@/components/ControlPanel";
import { ApiKeyManager } from "@/components/ApiKeyManager";
import { TemplateEditor } from "@/components/TemplateEditor";
import { TemplateGenerator } from "@/components/TemplateGenerator";
import { ProgressTracker } from "@/components/ProgressTracker";
import { InteractiveChecklist } from "@/components/InteractiveChecklist";
import { AICoachingPanel } from "@/components/AICoachingPanel";
import { OKRDashboard } from "@/components/OKRDashboard";
import { OKRObjectiveForm } from "@/components/OKRObjectiveForm";
import { GamificationPanel } from "@/components/GamificationPanel";
import { ArchiveManager } from "@/components/ArchiveManager";
import { AIAssistant } from "@/components/AIAssistant";
import { AuthManager } from "@/components/AuthManager";
import {
  NotificationManager,
  ToastManager,
} from "@/components/AchievementNotification";
import { Button } from "@/components/ui/button";
import {
  Target,
  FileText,
  ChevronRight,
  User,
  Archive,
  Bot,
} from "lucide-react";
import { SupabaseDataService } from "@/lib/supabaseDataService";
import { GamificationService } from "@/lib/gamificationService";
import { initializeSupabase } from "@/lib/supabase";
import React from "react";

type AppView =
  | "meetings"
  | "okr"
  | "okr-form"
  | "profile"
  | "archive"
  | "ai-assistant"
  | "auth";

function App() {
  const [currentView, setCurrentView] = useState<AppView>("meetings");
  const [currentTemplate, setCurrentTemplate] =
    useState<MeetingTemplate | null>(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showTemplateGenerator, setShowTemplateGenerator] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(
    null
  );
  const [apiKey, setApiKey] = useState<string>("");
  const [progress, setProgress] = useState({
    totalItems: 0,
    completedItems: 0,
    percentage: 0,
  });
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [templates, setTemplates] = useState<MeetingTemplate[]>([]);
  const [cycles, setCycles] = useState<OKRCycle[]>([]);
  const [archiveHistory] = useState<ArchiveOperation[]>([]);

  // Services
  const dataService = SupabaseDataService.getInstance();
  const gamificationService = GamificationService.getInstance();

  // Initialize app and load data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize Supabase connection
        const isConnected = await initializeSupabase();
        if (!isConnected) {
          console.error("Failed to connect to Supabase");
          return;
        }

        // Load API key from environment or localStorage
        const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
        const localApiKey = localStorage.getItem("openai_api_key");

        if (envApiKey) {
          setApiKey(envApiKey);
        } else if (localApiKey) {
          setApiKey(localApiKey);
        }

        // Load all data
        await loadAppData();
      } catch (error) {
        console.error("Error initializing app:", error);
      }
    };

    initializeApp();
  }, []);

  // Load all application data
  const loadAppData = async () => {
    try {
      const [stats, objectivesData, templatesData, cyclesData, preferences] =
        await Promise.all([
          dataService.getUserStats(),
          dataService.getObjectives(),
          dataService.getTemplates(),
          // dataService.getCycles(), // Would need to implement this
          [] as OKRCycle[], // Placeholder
          dataService.getPreferences(),
        ]);

      setUserStats(stats);
      setObjectives(objectivesData);
      setTemplates(templatesData);
      setCycles(cyclesData);

      // Set default view from preferences
      if (preferences?.defaultView && preferences.defaultView !== currentView) {
        setCurrentView(preferences.defaultView);
      }
    } catch (error) {
      console.error("Error loading app data:", error);
    }
  };

  // Track user activity and award points
  const trackActivity = useCallback(
    async (activityType: SessionActivity["type"], data?: any) => {
      if (!userStats) return;

      const points = gamificationService.calculateActivityPoints(
        activityType,
        data
      );
      const activity: SessionActivity = {
        id: `activity_${Date.now()}`,
        type: activityType,
        timestamp: new Date().toISOString(),
        data,
        pointsEarned: points,
      };

      // Add to current session
      await dataService.addSessionActivity(activity);

      // Update user stats
      const updatedStats = gamificationService.updateUserStats(
        userStats,
        activity
      );

      // Check for new achievements
      const { newAchievements, pointsEarned } =
        gamificationService.checkAchievements(updatedStats);

      if (newAchievements.length > 0) {
        updatedStats.achievements.push(...newAchievements);
        updatedStats.totalPoints += pointsEarned;

        // Save new achievements to database
        for (const achievement of newAchievements) {
          await dataService.saveAchievement(achievement);
        }
      }

      // Save updated stats
      await dataService.saveUserStats(updatedStats);
      setUserStats(updatedStats);
    },
    [userStats, dataService, gamificationService]
  );

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("openai_api_key", key);
  };

  const handleLoadTemplate = async (template: MeetingTemplate) => {
    setCurrentTemplate(template);
    setShowTemplateEditor(false);

    // Save template and track activity
    await dataService.saveTemplate(template);
    trackActivity("meeting_completed", { template: template.meetingTitle });
  };

  const handleTemplateGenerated = async (template: MeetingTemplate) => {
    setCurrentTemplate(template);
    setShowTemplateEditor(false);
    setShowTemplateGenerator(false);

    // Save template and track activity
    await dataService.saveTemplate(template);
    trackActivity("template_generated", { template: template.meetingTitle });
  };

  const handleImportTemplate = async (template: MeetingTemplate) => {
    setCurrentTemplate(template);
    setShowTemplateEditor(false);
    setShowTemplateGenerator(false);

    // Save template
    await dataService.saveTemplate(template);
    trackActivity("template_generated", {
      template: template.meetingTitle,
      imported: true,
    });
  };

  const handleProgressUpdate = (newProgress: {
    totalItems: number;
    completedItems: number;
    percentage: number;
  }) => {
    setProgress(newProgress);

    // Track check-in activity when progress is updated
    if (newProgress.percentage > progress.percentage) {
      trackActivity("check_in_completed", {
        progress: newProgress.percentage,
        itemsCompleted: newProgress.completedItems - progress.completedItems,
      });
    }
  };

  const handleCreateObjective = () => {
    setEditingObjective(null);
    setCurrentView("okr-form");
  };

  const handleEditObjective = (objective: Objective) => {
    setEditingObjective(objective);
    setCurrentView("okr-form");
  };

  const handleSaveObjective = async (objective: Objective) => {
    // Save objective
    await dataService.saveObjective(objective);

    // Track activity
    const isNew = !editingObjective;
    if (isNew) {
      trackActivity("objective_created", {
        objective: objective.title,
        category: objective.category,
        level: objective.level,
      });
    } else {
      trackActivity("objective_updated", {
        objective: objective.title,
        completed: objective.status === "completed",
      });
    }

    setCurrentView("okr");
    setEditingObjective(null);
  };

  const handleCancelObjectiveEdit = () => {
    setCurrentView("okr");
    setEditingObjective(null);
  };

  const handleViewProfile = () => {
    setCurrentView("profile");
  };

  const handleViewAchievements = () => {
    setCurrentView("profile");
  };

  // Authentication handlers
  const handleAuthStateChange = (user: any, profile: UserProfile | null) => {
    setCurrentUser(user);
    setUserProfile(profile);
    if (user && profile) {
      // Convert UserProfile to UserStats if needed
      const stats: UserStats = {
        id: profile.id,
        username: profile.username,
        level: profile.stats.level,
        totalPoints: profile.stats.totalPoints,
        currentStreak: profile.stats.currentStreak,
        longestStreak: profile.stats.longestStreak,
        joinDate: profile.stats.joinDate,
        lastActive: profile.stats.lastActive,
        achievements: profile.stats.achievements,
        stats: profile.stats.stats,
      };
      setUserStats(stats);
    }
  };

  const handleProfileUpdate = (profile: UserProfile) => {
    setUserProfile(profile);
    // Reload app data after profile update
    loadAppData();
  };

  // Archive management handlers
  const handleArchive = async (
    type: "objective" | "template" | "cycle",
    id: string,
    reason?: string
  ): Promise<boolean> => {
    try {
      // Implementation would depend on the specific type
      if (type === "objective") {
        const objective = objectives.find((obj) => obj.id === id);
        if (objective) {
          const updatedObjective = {
            ...objective,
            status: "archived" as const,
            archivedDate: new Date().toISOString(),
            archivedReason: reason,
          };
          await dataService.saveObjective(updatedObjective);
        }
      }
      // Add similar logic for templates and cycles

      await loadAppData(); // Refresh data
      return true;
    } catch (error) {
      console.error("Error archiving item:", error);
      return false;
    }
  };

  const handleRestore = async (
    type: "objective" | "template" | "cycle",
    id: string
  ): Promise<boolean> => {
    try {
      if (type === "objective") {
        const objective = objectives.find((obj) => obj.id === id);
        if (objective) {
          const updatedObjective = {
            ...objective,
            status: "active" as const,
            archivedDate: undefined,
            archivedReason: undefined,
          };
          await dataService.saveObjective(updatedObjective);
        }
      }
      // Add similar logic for templates and cycles

      await loadAppData(); // Refresh data
      return true;
    } catch (error) {
      console.error("Error restoring item:", error);
      return false;
    }
  };

  const handlePermanentDelete = async (
    type: "objective" | "template" | "cycle",
    id: string
  ): Promise<boolean> => {
    try {
      if (type === "objective") {
        await dataService.deleteObjective(id);
      }
      // Add similar logic for templates and cycles

      await loadAppData(); // Refresh data
      return true;
    } catch (error) {
      console.error("Error permanently deleting item:", error);
      return false;
    }
  };

  const handleBulkOperation = async (
    operation: BulkOperation
  ): Promise<boolean> => {
    try {
      // Implementation would handle bulk operations
      for (const id of operation.resourceIds) {
        switch (operation.operation) {
          case "archive":
            await handleArchive(operation.resourceType, id);
            break;
          case "restore":
            await handleRestore(operation.resourceType, id);
            break;
          case "delete":
            await handlePermanentDelete(operation.resourceType, id);
            break;
        }
      }
      return true;
    } catch (error) {
      console.error("Error performing bulk operation:", error);
      return false;
    }
  };

  // AI Assistant handlers
  const handleObjectiveSuggestion = (suggestion: AIObjectiveSuggestion) => {
    // Convert AI suggestion to Objective
    const newObjective: Objective = {
      id: `obj_${Date.now()}`,
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      level: suggestion.level,
      owner: userProfile?.username || "Current User",
      quarter: "2025-Q1",
      year: 2025,
      keyResults: suggestion.suggestedKeyResults.map((kr, index) => ({
        id: `kr_${Date.now()}_${index}`,
        description: kr,
        startValue: 0,
        targetValue: 100,
        currentValue: 0,
        unit: "units",
        confidenceLevel: 5,
        status: "on-track" as const,
        lastUpdated: new Date().toISOString(),
        milestones: [],
      })),
      alignedTo: null,
      confidenceLevel: Math.round(suggestion.confidence * 10),
      status: "draft",
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      checkIns: [],
    };

    setEditingObjective(newObjective);
    setCurrentView("okr-form");
  };

  const handleKeyResultSuggestion = (suggestion: AIKeyResultSuggestion) => {
    // This could be used to add KRs to an existing objective
    console.log("Key result suggestion:", suggestion);
  };

  const handleAnalysisComplete = (analysis: AICheckInAnalysis) => {
    // Handle AI analysis results
    console.log("AI analysis complete:", analysis);
  };

  const renderBreadcrumbs = () => {
    if (currentView === "meetings") return null;

    const breadcrumbs = [];

    if (currentView.startsWith("okr")) {
      breadcrumbs.push({ label: "OKR Dashboard", view: "okr" as AppView });
    }

    if (currentView === "profile") {
      breadcrumbs.push({ label: "Profile", view: "profile" as AppView });
    }

    if (currentView === "okr-form") {
      breadcrumbs.push({
        label: editingObjective ? "Edit Objective" : "Create Objective",
        view: "okr-form" as AppView,
      });
    }

    if (breadcrumbs.length === 0) return null;

    return (
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView("meetings")}
            className="text-gray-600 hover:text-gray-900"
          >
            Meetings
          </Button>
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.view}>
              <ChevronRight className="h-4 w-4" />
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-gray-900">
                  {breadcrumb.label}
                </span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView(breadcrumb.view)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {breadcrumb.label}
                </Button>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Header />

        {/* Main Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <Button
                variant={currentView === "meetings" ? "default" : "outline"}
                onClick={() => setCurrentView("meetings")}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Meeting Templates & Critical Thinking
              </Button>
              <Button
                variant={currentView.startsWith("okr") ? "default" : "outline"}
                onClick={() => setCurrentView("okr")}
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                OKR Management
              </Button>
              <Button
                variant={currentView === "ai-assistant" ? "default" : "outline"}
                onClick={() => setCurrentView("ai-assistant")}
                className="flex items-center gap-2"
              >
                <Bot className="h-4 w-4" />
                AI Assistant
              </Button>
              <Button
                variant={currentView === "archive" ? "default" : "outline"}
                onClick={() => setCurrentView("archive")}
                className="flex items-center gap-2"
              >
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            </div>

            {/* User Profile Section */}
            {userStats && (
              <div className="flex items-center gap-3">
                {/* Compact Profile Display */}
                <GamificationPanel userStats={userStats} compact={true} />
                <Button
                  variant={currentView === "profile" ? "default" : "outline"}
                  onClick={handleViewProfile}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </div>
            )}
          </div>
        </div>

        {renderBreadcrumbs()}

        {!apiKey && currentView === "meetings" && (
          <ApiKeyManager onSaveApiKey={handleSaveApiKey} />
        )}

        {/* Meeting Templates View */}
        {currentView === "meetings" && (
          <>
            <FrameworkPanel />

            <ControlPanel
              hasTemplate={!!currentTemplate}
              onCreateNew={() => setShowTemplateEditor(true)}
              onCreateAI={() => setShowTemplateGenerator(true)}
              onLoadTemplate={handleLoadTemplate}
              onImportTemplate={handleImportTemplate}
              currentTemplate={currentTemplate}
              hasApiKey={!!apiKey}
            />

            {showTemplateEditor && (
              <TemplateEditor
                apiKey={apiKey}
                onClose={() => setShowTemplateEditor(false)}
                onGenerate={handleTemplateGenerated}
              />
            )}

            {showTemplateGenerator && apiKey && (
              <TemplateGenerator
                apiKey={apiKey}
                onClose={() => setShowTemplateGenerator(false)}
                onGenerate={handleTemplateGenerated}
              />
            )}

            {currentTemplate && (
              <>
                <ProgressTracker progress={progress} />
                {apiKey && (
                  <AICoachingPanel
                    apiKey={apiKey}
                    template={currentTemplate}
                    completedItems={progress.completedItems}
                    totalItems={progress.totalItems}
                  />
                )}
                <InteractiveChecklist
                  template={currentTemplate}
                  onProgressUpdate={handleProgressUpdate}
                />
              </>
            )}
          </>
        )}

        {/* OKR Dashboard View */}
        {currentView === "okr" && (
          <OKRDashboard
            onCreateObjective={handleCreateObjective}
            onEditObjective={handleEditObjective}
          />
        )}

        {/* OKR Form View */}
        {currentView === "okr-form" && (
          <OKRObjectiveForm
            objective={editingObjective || undefined}
            onSave={handleSaveObjective}
            onCancel={handleCancelObjectiveEdit}
          />
        )}

        {/* Profile View */}
        {currentView === "profile" && userStats && (
          <GamificationPanel
            userStats={userStats}
            onClose={() => setCurrentView("meetings")}
          />
        )}

        {/* Archive Management View */}
        {currentView === "archive" && (
          <ArchiveManager
            objectives={objectives}
            templates={templates}
            cycles={cycles}
            onArchive={handleArchive}
            onRestore={handleRestore}
            onPermanentDelete={handlePermanentDelete}
            onBulkOperation={handleBulkOperation}
            archiveHistory={archiveHistory}
          />
        )}

        {/* AI Assistant View */}
        {currentView === "ai-assistant" && (
          <AIAssistant
            currentObjectives={objectives}
            companyGoals={[
              "Revenue Growth",
              "Customer Satisfaction",
              "Operational Excellence",
            ]}
            department={userProfile?.department}
            role={userProfile?.role}
            onObjectiveSuggestion={handleObjectiveSuggestion}
            onKeyResultSuggestion={handleKeyResultSuggestion}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {/* Authentication View */}
        {currentView === "auth" && (
          <AuthManager
            currentUser={currentUser}
            userProfile={userProfile}
            onAuthStateChange={handleAuthStateChange}
            onProfileUpdate={handleProfileUpdate}
          />
        )}

        {/* Notification Systems */}
        <NotificationManager onViewAchievements={handleViewAchievements} />
        <ToastManager />
      </div>
    </div>
  );
}

export default App;
