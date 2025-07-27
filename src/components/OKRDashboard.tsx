import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Target,
  TrendingUp,
  Users,
  Calendar,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  Lightbulb,
  DollarSign,
  Shield,
  Heart,
  Settings,
  Award,
  Filter,
  Eye,
  EyeOff,
} from "lucide-react";
import { Objective, OKRMetrics } from "@/types";
import { SupabaseDataService } from "@/lib/supabaseDataService";

interface OKRDashboardProps {
  onCreateObjective: () => void;
  onEditObjective: (objective: Objective) => void;
}

export function OKRDashboard({
  onCreateObjective,
  onEditObjective,
}: OKRDashboardProps) {
  // State management
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [metrics, setMetrics] = useState<OKRMetrics | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<
    "company" | "team" | "individual"
  >("team");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showMetrics, setShowMetrics] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuarter] = useState("2025-Q1");

  // Data service
  const dataService = SupabaseDataService.getInstance();

  // Load real data
  useEffect(() => {
    loadObjectives();
  }, []);

  const loadObjectives = async () => {
    setIsLoading(true);
    try {
      const data = await dataService.getObjectives();
      setObjectives(data);
      setMetrics(calculateMetrics(data));
    } catch (error) {
      console.error("Error loading objectives:", error);
      // Fallback to empty state instead of sample data
      setObjectives([]);
      setMetrics({
        totalObjectives: 0,
        completedObjectives: 0,
        averageProgress: 0,
        averageConfidence: 0,
        keyResultsAchieved: 0,
        totalKeyResults: 0,
        onTrackCount: 0,
        atRiskCount: 0,
        offTrackCount: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate metrics from real data
  const calculateMetrics = (objectives: Objective[]): OKRMetrics => {
    if (objectives.length === 0) {
      return {
        totalObjectives: 0,
        completedObjectives: 0,
        averageProgress: 0,
        averageConfidence: 0,
        keyResultsAchieved: 0,
        totalKeyResults: 0,
        onTrackCount: 0,
        atRiskCount: 0,
        offTrackCount: 0,
      };
    }

    const totalKRs = objectives.reduce(
      (sum, obj) => sum + obj.keyResults.length,
      0
    );
    const achievedKRs = objectives.reduce(
      (sum, obj) =>
        sum +
        obj.keyResults.filter((kr) => getKeyResultProgress(kr) >= 100).length,
      0
    );

    const allKeyResults = objectives.flatMap((obj) => obj.keyResults);
    const onTrack = allKeyResults.filter(
      (kr) => kr.status === "on-track"
    ).length;
    const atRisk = allKeyResults.filter((kr) => kr.status === "at-risk").length;
    const offTrack = allKeyResults.filter(
      (kr) => kr.status === "off-track"
    ).length;

    const avgProgress =
      objectives.length > 0
        ? objectives.reduce((sum, obj) => {
            const objProgress =
              obj.keyResults.reduce(
                (krSum, kr) => krSum + getKeyResultProgress(kr),
                0
              ) / obj.keyResults.length;
            return sum + objProgress;
          }, 0) / objectives.length
        : 0;

    const avgConfidence =
      objectives.length > 0
        ? objectives.reduce((sum, obj) => sum + obj.confidenceLevel, 0) /
          objectives.length
        : 0;

    return {
      totalObjectives: objectives.length,
      completedObjectives: objectives.filter(
        (obj) => obj.status === "completed"
      ).length,
      averageProgress: avgProgress,
      averageConfidence: avgConfidence,
      keyResultsAchieved: achievedKRs,
      totalKeyResults: totalKRs,
      onTrackCount: onTrack,
      atRiskCount: atRisk,
      offTrackCount: offTrack,
    };
  };

  // Utility functions
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "revenue":
        return <DollarSign className="h-4 w-4" />;
      case "customer":
        return <Heart className="h-4 w-4" />;
      case "operational":
        return <Settings className="h-4 w-4" />;
      case "team":
        return <Users className="h-4 w-4" />;
      case "compliance":
        return <Shield className="h-4 w-4" />;
      case "innovation":
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "bg-green-100 text-green-800";
      case "at-risk":
        return "bg-yellow-100 text-yellow-800";
      case "off-track":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getKeyResultProgress = (kr: any) => {
    return Math.min(
      100,
      Math.max(
        0,
        ((kr.currentValue - kr.startValue) / (kr.targetValue - kr.startValue)) *
          100
      )
    );
  };

  // Filter objectives
  const filteredObjectives = objectives.filter((obj) => {
    const levelMatch = obj.level === selectedLevel;
    const categoryMatch =
      selectedCategory === "all" || obj.category === selectedCategory;
    return levelMatch && categoryMatch;
  });

  // Get unique categories
  const categories = [
    "all",
    ...Array.from(new Set(objectives.map((obj) => obj.category))),
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading objectives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-600" />
            OKR Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Track objectives that drive business success
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            {currentQuarter}
          </Button>
          <Button
            onClick={onCreateObjective}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Objective
          </Button>
        </div>
      </div>

      {/* Collapsible Filters & Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Views
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMetrics(!showMetrics)}
              className="flex items-center gap-2"
            >
              {showMetrics ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {showMetrics ? "Hide Metrics" : "Show Metrics"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Level Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Organizational Level
            </label>
            <div className="flex gap-2">
              {(["company", "team", "individual"] as const).map((level) => (
                <Button
                  key={level}
                  variant={selectedLevel === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLevel(level)}
                  className="capitalize"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Category
            </label>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category === "all" ? "All Categories" : category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collapsible Metrics Overview */}
      {showMetrics && metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <Target className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Active Objectives
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.totalObjectives}
                  </p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Avg Progress
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.averageProgress.toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Avg Confidence
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.averageConfidence.toFixed(1)}/10
                  </p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
                <Award className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    KRs Achieved
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.keyResultsAchieved}/{metrics.totalKeyResults}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">
                Key Results Status
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600 mb-1" />
                  <p className="text-xl font-bold text-green-600">
                    {metrics.onTrackCount}
                  </p>
                  <p className="text-xs text-gray-600">On Track</p>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="h-6 w-6 text-yellow-600 mb-1" />
                  <p className="text-xl font-bold text-yellow-600">
                    {metrics.atRiskCount}
                  </p>
                  <p className="text-xs text-gray-600">At Risk</p>
                </div>
                <div className="flex flex-col items-center">
                  <AlertTriangle className="h-6 w-6 text-red-600 mb-1" />
                  <p className="text-xl font-bold text-red-600">
                    {metrics.offTrackCount}
                  </p>
                  <p className="text-xs text-gray-600">Off Track</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Objectives List - Collapsible Accordion */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)}{" "}
            Objectives
            <span className="ml-2 text-sm text-gray-500">
              ({filteredObjectives.length})
            </span>
          </h2>
        </div>

        {filteredObjectives.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Objectives Yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first {selectedLevel} objective to start tracking
                progress
              </p>
              <Button
                onClick={onCreateObjective}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Objective
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {filteredObjectives.map((objective) => (
              <AccordionItem
                key={objective.id}
                value={objective.id}
                className="border rounded-lg"
              >
                <Card>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-start gap-3 text-left">
                        {getCategoryIcon(objective.category)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {objective.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {objective.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {objective.owner}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {objective.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Confidence: {objective.confidenceLevel}/10
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditObjective(objective);
                        }}
                        className="ml-4"
                      >
                        Edit
                      </Button>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">
                          Key Results
                        </h4>
                        {objective.keyResults.map((kr) => {
                          const progress = getKeyResultProgress(kr);
                          return (
                            <div
                              key={kr.id}
                              className="space-y-2 p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">
                                  {kr.description}
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={`text-xs ${getStatusColor(
                                      kr.status
                                    )}`}
                                  >
                                    {kr.status.replace("-", " ")}
                                  </Badge>
                                  <span className="text-sm text-gray-600">
                                    {kr.currentValue}
                                    {kr.unit} / {kr.targetValue}
                                    {kr.unit}
                                  </span>
                                </div>
                              </div>
                              <Progress value={progress} className="h-2" />
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Progress: {progress.toFixed(0)}%</span>
                                <span>Confidence: {kr.confidenceLevel}/10</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
