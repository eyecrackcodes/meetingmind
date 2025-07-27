import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { Objective, OKRCycle, OKRMetrics } from "@/types";
import {
  sampleOKRObjectives,
  sampleOKRCycle,
  calculateOKRMetrics,
} from "@/lib/sampleOKRData";

interface OKRDashboardProps {
  onCreateObjective: () => void;
  onEditObjective: (objective: Objective) => void;
}

export function OKRDashboard({
  onCreateObjective,
  onEditObjective,
}: OKRDashboardProps) {
  const [currentCycle, setCurrentCycle] = useState<OKRCycle | null>(null);
  const [metrics, setMetrics] = useState<OKRMetrics | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<
    "company" | "team" | "individual"
  >("team");

  useEffect(() => {
    const metrics = calculateOKRMetrics(sampleOKRObjectives);
    setMetrics(metrics);

    // Set current cycle from sample data
    setCurrentCycle(sampleOKRCycle);
  }, []);

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

  if (!metrics || !currentCycle) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">OKR Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Track and achieve what matters most
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            {currentCycle.name}
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

      {/* Level Filter */}
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

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
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
          </CardContent>
        </Card>
      </div>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Key Results Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {metrics.onTrackCount}
              </p>
              <p className="text-sm text-gray-600">On Track</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                {metrics.atRiskCount}
              </p>
              <p className="text-sm text-gray-600">At Risk</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">
                {metrics.offTrackCount}
              </p>
              <p className="text-sm text-gray-600">Off Track</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Objectives List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Current Objectives
        </h2>
        {sampleOKRObjectives
          .filter((obj) => obj.level === selectedLevel)
          .map((objective) => (
            <Card
              key={objective.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getCategoryIcon(objective.category)}
                    <div>
                      <CardTitle className="text-lg">
                        {objective.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {objective.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {objective.owner}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
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
                    onClick={() => onEditObjective(objective)}
                  >
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {objective.keyResults.map((kr) => {
                    const progress = getKeyResultProgress(kr);
                    return (
                      <div key={kr.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {kr.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`text-xs ${getStatusColor(kr.status)}`}
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
            </Card>
          ))}
      </div>

      {/* Cycle Theme and Priorities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            {currentCycle.name} Theme & Priorities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900">Cycle Theme</h4>
              <p className="text-gray-600">{currentCycle.cycleTheme}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                Company Priorities
              </h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {currentCycle.companyPriorities.map((priority, index) => (
                  <Badge key={index} variant="outline">
                    {priority}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
