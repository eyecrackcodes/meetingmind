import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Plus,
  Target,
  TrendingUp,
  DollarSign,
  Heart,
  Settings,
  Users,
  Shield,
  Lightbulb,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Objective, KeyResult } from "@/types";

interface OKRObjectiveFormProps {
  objective?: Objective;
  onSave: (objective: Objective) => void;
  onCancel: () => void;
}

export function OKRObjectiveForm({
  objective,
  onSave,
  onCancel,
}: OKRObjectiveFormProps) {
  const [formData, setFormData] = useState<Partial<Objective>>({
    title: objective?.title || "",
    description: objective?.description || "",
    category: objective?.category || "operational",
    level: objective?.level || "team",
    owner: objective?.owner || "",
    quarter: objective?.quarter || "2024-Q1",
    year: objective?.year || 2024,
    confidenceLevel: objective?.confidenceLevel || 5,
    keyResults: objective?.keyResults || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    {
      value: "revenue",
      label: "Revenue",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      value: "customer",
      label: "Customer",
      icon: Heart,
      color: "text-red-600",
    },
    {
      value: "operational",
      label: "Operational",
      icon: Settings,
      color: "text-blue-600",
    },
    { value: "team", label: "Team", icon: Users, color: "text-purple-600" },
    {
      value: "compliance",
      label: "Compliance",
      icon: Shield,
      color: "text-orange-600",
    },
    {
      value: "innovation",
      label: "Innovation",
      icon: Lightbulb,
      color: "text-yellow-600",
    },
  ];

  const levels = [
    { value: "company", label: "Company" },
    { value: "team", label: "Team" },
    { value: "individual", label: "Individual" },
  ];

  const quarters = [
    { value: "2024-Q1", label: "2024 Q1" },
    { value: "2024-Q2", label: "2024 Q2" },
    { value: "2024-Q3", label: "2024 Q3" },
    { value: "2024-Q4", label: "2024 Q4" },
  ];

  // Final expense insurance specific templates
  const okrTemplates = [
    {
      category: "revenue",
      level: "team",
      objective: "Increase Final Expense Sales Performance",
      keyResults: [
        "Achieve X% increase in monthly premium volume",
        "Maintain conversion rate above X%",
        "Reduce policy lapse rate to under X%",
      ],
    },
    {
      category: "customer",
      level: "team",
      objective: "Enhance Customer Experience & Satisfaction",
      keyResults: [
        "Achieve customer satisfaction score of X+/5.0",
        "Reduce average call resolution time to under X minutes",
        "Increase customer retention rate to X%",
      ],
    },
    {
      category: "compliance",
      level: "team",
      objective: "Maintain Regulatory Excellence",
      keyResults: [
        "Complete 100% of compliance audits with no violations",
        "Achieve X% agent certification completion rate",
        "Implement X new compliance training modules",
      ],
    },
    {
      category: "operational",
      level: "team",
      objective: "Optimize Sales Operations Efficiency",
      keyResults: [
        "Reduce lead response time to under X hours",
        "Increase appointment show rate to X%",
        "Achieve X% accuracy in underwriting decisions",
      ],
    },
  ];

  const addKeyResult = () => {
    const newKeyResult: KeyResult = {
      id: `kr-${Date.now()}`,
      description: "",
      startValue: 0,
      targetValue: 100,
      currentValue: 0,
      unit: "%",
      confidenceLevel: 5,
      status: "on-track",
      lastUpdated: new Date().toISOString(),
      milestones: [],
    };

    setFormData((prev) => ({
      ...prev,
      keyResults: [...(prev.keyResults || []), newKeyResult],
    }));
  };

  const updateKeyResult = (
    index: number,
    field: keyof KeyResult,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      keyResults:
        prev.keyResults?.map((kr, i) =>
          i === index ? { ...kr, [field]: value } : kr
        ) || [],
    }));
  };

  const removeKeyResult = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      keyResults: prev.keyResults?.filter((_, i) => i !== index) || [],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Objective title is required";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Objective description is required";
    }

    if (!formData.owner?.trim()) {
      newErrors.owner = "Owner is required";
    }

    if (!formData.keyResults || formData.keyResults.length === 0) {
      newErrors.keyResults = "At least one key result is required";
    } else {
      formData.keyResults.forEach((kr, index) => {
        if (!kr.description.trim()) {
          newErrors[`keyResult-${index}-description`] =
            "Key result description is required";
        }
        if (kr.targetValue <= kr.startValue) {
          newErrors[`keyResult-${index}-target`] =
            "Target value must be greater than start value";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const newObjective: Objective = {
      id: objective?.id || `obj-${Date.now()}`,
      title: formData.title!,
      description: formData.description!,
      category: formData.category!,
      level: formData.level!,
      owner: formData.owner!,
      quarter: formData.quarter!,
      year: formData.year!,
      confidenceLevel: formData.confidenceLevel!,
      status: objective?.status || "active",
      createdDate: objective?.createdDate || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      keyResults: formData.keyResults!,
      checkIns: objective?.checkIns || [],
      alignedTo: formData.alignedTo,
    };

    onSave(newObjective);
  };

  const applyTemplate = (template: any) => {
    setFormData((prev) => ({
      ...prev,
      title: template.objective,
      category: template.category,
      level: template.level,
      keyResults: template.keyResults.map(
        (krTemplate: string, index: number) => ({
          id: `kr-${Date.now()}-${index}`,
          description: krTemplate,
          startValue: 0,
          targetValue: 100,
          currentValue: 0,
          unit: "%",
          confidenceLevel: 5,
          status: "on-track",
          lastUpdated: new Date().toISOString(),
          milestones: [],
        })
      ),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {objective ? "Edit Objective" : "Create New Objective"}
          </h2>
          <p className="text-gray-600 mt-1">
            Follow the FOCUS principles: Fewer priorities, better outcomes
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Templates */}
      {!objective && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Final Expense OKR Templates
            </CardTitle>
            <p className="text-sm text-blue-700">
              Start with proven templates designed for final expense insurance
              operations
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {okrTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-left h-auto p-3 justify-start"
                  onClick={() => applyTemplate(template)}
                >
                  <div className="space-y-1">
                    <div className="font-medium text-blue-800">
                      {template.objective}
                    </div>
                    <div className="text-xs text-blue-600">
                      {template.category} • {template.level}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Objective Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objective Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Button
                      key={cat.value}
                      type="button"
                      variant={
                        formData.category === cat.value ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          category: cat.value as any,
                        }))
                      }
                      className="flex items-center gap-2 justify-start"
                    >
                      <Icon className={`h-3 w-3 ${cat.color}`} />
                      <span className="text-xs">{cat.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {levels.map((level) => (
                  <Button
                    key={level.value}
                    type="button"
                    variant={
                      formData.level === level.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        level: level.value as any,
                      }))
                    }
                  >
                    {level.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objective Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="What do you want to achieve? (e.g., Increase Final Expense Sales Performance)"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe the purpose and context of this objective..."
              className={errors.description ? "border-red-500" : ""}
              rows={3}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.description}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner *
              </label>
              <Input
                value={formData.owner}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, owner: e.target.value }))
                }
                placeholder="Team or person responsible"
                className={errors.owner ? "border-red-500" : ""}
              />
              {errors.owner && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.owner}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quarter
              </label>
              <select
                value={formData.quarter}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, quarter: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {quarters.map((quarter) => (
                  <option key={quarter.value} value={quarter.value}>
                    {quarter.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confidence Level
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.confidenceLevel}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confidenceLevel: parseInt(e.target.value),
                    }))
                  }
                  className="flex-1"
                />
                <span className="text-sm font-medium w-8 text-center">
                  {formData.confidenceLevel}/10
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Key Results
            </CardTitle>
            <Button
              onClick={addKeyResult}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Key Result
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Define 2-5 measurable outcomes that will indicate success
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.keyResults && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.keyResults}
            </p>
          )}

          {formData.keyResults?.map((kr, index) => (
            <div key={kr.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-gray-900">
                  Key Result {index + 1}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeKeyResult(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <Input
                  value={kr.description}
                  onChange={(e) =>
                    updateKeyResult(index, "description", e.target.value)
                  }
                  placeholder="What will you measure? (e.g., Achieve 25% increase in monthly premium volume)"
                  className={
                    errors[`keyResult-${index}-description`]
                      ? "border-red-500"
                      : ""
                  }
                />
                {errors[`keyResult-${index}-description`] && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors[`keyResult-${index}-description`]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Value
                  </label>
                  <Input
                    type="number"
                    value={kr.startValue}
                    onChange={(e) =>
                      updateKeyResult(
                        index,
                        "startValue",
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Value *
                  </label>
                  <Input
                    type="number"
                    value={kr.targetValue}
                    onChange={(e) =>
                      updateKeyResult(
                        index,
                        "targetValue",
                        parseFloat(e.target.value)
                      )
                    }
                    className={
                      errors[`keyResult-${index}-target`]
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {errors[`keyResult-${index}-target`] && (
                    <p className="text-red-500 text-xs mt-1">
                      Must be greater than start
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={kr.unit}
                    onChange={(e) =>
                      updateKeyResult(index, "unit", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="%">Percentage (%)</option>
                    <option value="$">Dollar ($)</option>
                    <option value="#">Number (#)</option>
                    <option value="/5.0">Rating (/5.0)</option>
                    <option value="ratio">Ratio</option>
                    <option value="days">Days</option>
                    <option value="hours">Hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confidence
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={kr.confidenceLevel}
                      onChange={(e) =>
                        updateKeyResult(
                          index,
                          "confidenceLevel",
                          parseInt(e.target.value)
                        )
                      }
                      className="flex-1"
                    />
                    <span className="text-xs w-6 text-center">
                      {kr.confidenceLevel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {(!formData.keyResults || formData.keyResults.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No key results yet. Add your first measurable outcome.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          {objective ? "Update Objective" : "Create Objective"}
        </Button>
      </div>
    </div>
  );
}
