import { Objective, OKRCycle, OKRTemplate } from "@/types";

export const sampleOKRObjectives: Objective[] = [
  {
    id: "obj-1",
    title: "Increase Final Expense Sales Performance",
    description:
      "Drive significant growth in final expense sales while maintaining quality standards and customer satisfaction",
    category: "revenue",
    level: "team",
    owner: "Sales Team",
    quarter: "2025-Q1",
    year: 2025,
    confidenceLevel: 7,
    status: "active",
    createdDate: "2025-01-01T00:00:00.000Z",
    lastUpdated: "2025-01-15T00:00:00.000Z",
    checkIns: [
      {
        id: "checkin-1",
        date: "2025-01-15T00:00:00.000Z",
        overallProgress: 0.6,
        confidenceLevel: 7,
        accomplishments: [
          "Implemented new lead qualification process",
          "Completed advanced objection handling training for all agents",
          "Launched referral incentive program",
        ],
        challenges: [
          "Higher than expected lapse rates in first month",
          "Some agents struggling with new CRM system",
        ],
        nextSteps: [
          "Implement additional retention follow-up calls",
          "Provide extra CRM training sessions",
          "Review underwriting guidelines with team",
        ],
        supportNeeded: "Additional training resources for CRM system",
        notes:
          "Overall positive momentum, need to focus on retention strategies",
      },
    ],
    keyResults: [
      {
        id: "kr-1",
        description: "Achieve 25% increase in monthly premium volume",
        startValue: 100000,
        targetValue: 125000,
        currentValue: 115000,
        unit: "$",
        confidenceLevel: 8,
        status: "on-track",
        lastUpdated: "2025-01-15T00:00:00.000Z",
        milestones: [
          {
            id: "milestone-1",
            description: "Complete lead generation system upgrade",
            dueDate: "2025-01-31T00:00:00.000Z",
            completed: true,
            completedDate: "2025-01-28T00:00:00.000Z",
          },
          {
            id: "milestone-2",
            description: "Launch agent performance incentive program",
            dueDate: "2025-02-15T00:00:00.000Z",
            completed: false,
          },
        ],
      },
      {
        id: "kr-2",
        description: "Maintain conversion rate above 15%",
        startValue: 12,
        targetValue: 15,
        currentValue: 14.5,
        unit: "%",
        confidenceLevel: 7,
        status: "on-track",
        lastUpdated: "2025-01-15T00:00:00.000Z",
        milestones: [],
      },
      {
        id: "kr-3",
        description: "Reduce policy lapse rate to under 8%",
        startValue: 12,
        targetValue: 8,
        currentValue: 9.5,
        unit: "%",
        confidenceLevel: 6,
        status: "at-risk",
        lastUpdated: "2025-01-15T00:00:00.000Z",
        milestones: [
          {
            id: "milestone-3",
            description: "Implement 7-day welcome call program",
            dueDate: "2025-02-01T00:00:00.000Z",
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: "obj-2",
    title: "Enhance Customer Experience & Compliance",
    description:
      "Improve customer satisfaction while ensuring 100% regulatory compliance across all operations",
    category: "customer",
    level: "team",
    owner: "Operations Team",
    quarter: "2025-Q1",
    year: 2025,
    confidenceLevel: 8,
    status: "active",
    createdDate: "2025-01-01T00:00:00.000Z",
    lastUpdated: "2025-01-15T00:00:00.000Z",
    checkIns: [],
    keyResults: [
      {
        id: "kr-4",
        description: "Achieve customer satisfaction score of 4.5+/5.0",
        startValue: 4.1,
        targetValue: 4.5,
        currentValue: 4.3,
        unit: "/5.0",
        confidenceLevel: 8,
        status: "on-track",
        lastUpdated: "2025-01-15T00:00:00.000Z",
        milestones: [],
      },
      {
        id: "kr-5",
        description: "Complete 100% of compliance audits with no violations",
        startValue: 85,
        targetValue: 100,
        currentValue: 95,
        unit: "%",
        confidenceLevel: 9,
        status: "on-track",
        lastUpdated: "2025-01-15T00:00:00.000Z",
        milestones: [],
      },
      {
        id: "kr-6",
        description: "Reduce average call resolution time to under 8 minutes",
        startValue: 12,
        targetValue: 8,
        currentValue: 10,
        unit: "minutes",
        confidenceLevel: 7,
        status: "on-track",
        lastUpdated: "2025-01-15T00:00:00.000Z",
        milestones: [],
      },
    ],
  },
  {
    id: "obj-3",
    title: "Optimize Sales Operations Efficiency",
    description:
      "Streamline processes and improve operational metrics to support sustainable growth",
    category: "operational",
    level: "team",
    owner: "Operations Manager",
    quarter: "2025-Q1",
    year: 2025,
    confidenceLevel: 6,
    status: "active",
    createdDate: "2025-01-01T00:00:00.000Z",
    lastUpdated: "2025-01-15T00:00:00.000Z",
    checkIns: [],
    keyResults: [
      {
        id: "kr-7",
        description: "Reduce lead response time to under 2 hours",
        startValue: 4,
        targetValue: 2,
        currentValue: 3.2,
        unit: "hours",
        confidenceLevel: 6,
        status: "at-risk",
        lastUpdated: "2025-01-15T00:00:00.000Z",
        milestones: [],
      },
      {
        id: "kr-8",
        description: "Increase appointment show rate to 75%",
        startValue: 65,
        targetValue: 75,
        currentValue: 68,
        unit: "%",
        confidenceLevel: 7,
        status: "on-track",
        lastUpdated: "2025-01-15T00:00:00.000Z",
        milestones: [],
      },
      {
        id: "kr-9",
        description: "Achieve 95% accuracy in underwriting decisions",
        startValue: 88,
        targetValue: 95,
        currentValue: 91,
        unit: "%",
        confidenceLevel: 8,
        status: "on-track",
        lastUpdated: "2025-01-15T00:00:00.000Z",
        milestones: [],
      },
    ],
  },
  {
    id: "obj-4",
    title: "Develop High-Performance Team Culture",
    description:
      "Build a motivated, skilled, and engaged team capable of achieving exceptional results",
    category: "team",
    level: "individual",
    owner: "Team Lead - Sarah Johnson",
    quarter: "2025-Q1",
    year: 2025,
    confidenceLevel: 8,
    status: "active",
    createdDate: "2025-01-01T00:00:00.000Z",
    lastUpdated: "2025-01-15T00:00:00.000Z",
    checkIns: [],
    keyResults: [
      {
        id: "kr-10",
        description:
          "Achieve 90% completion rate for monthly training programs",
        startValue: 75,
        targetValue: 90,
        currentValue: 82,
        unit: "%",
        confidenceLevel: 8,
        status: "on-track",
        lastUpdated: "2025-01-15T00:00:00.000Z",
        milestones: [],
      },
      {
        id: "kr-11",
        description: "Reduce employee turnover to under 15%",
        startValue: 22,
        targetValue: 15,
        currentValue: 18,
        unit: "%",
        confidenceLevel: 7,
        status: "on-track",
        lastUpdated: "2025-01-15T00:00:00.000Z",
        milestones: [],
      },
      {
        id: "kr-12",
        description: "Increase team engagement score to 4.2+/5.0",
        startValue: 3.8,
        targetValue: 4.2,
        currentValue: 4.0,
        unit: "/5.0",
        confidenceLevel: 8,
        status: "on-track",
        lastUpdated: "2025-01-15T00:00:00.000Z",
        milestones: [],
      },
    ],
  },
];

export const sampleOKRCycle: OKRCycle = {
  id: "cycle-2025-q1",
  name: "2025 Q1",
  quarter: 1,
  year: 2025,
  startDate: "2025-01-01T00:00:00.000Z",
  endDate: "2025-03-31T23:59:59.999Z",
  status: "active",
  objectives: sampleOKRObjectives,
  cycleTheme: "Growth & Excellence",
  companyPriorities: [
    "Revenue Growth",
    "Customer Experience",
    "Compliance Excellence",
    "Team Development",
  ],
};

export const finalExpenseOKRTemplates: OKRTemplate[] = [
  {
    id: "template-1",
    name: "Sales Performance Growth",
    category: "revenue",
    level: "team",
    objectiveTemplate: "Increase Final Expense Sales Performance",
    keyResultTemplates: [
      "Achieve X% increase in monthly premium volume",
      "Maintain conversion rate above X%",
      "Reduce policy lapse rate to under X%",
      "Increase average policy value to $X",
    ],
    description: "Focus on driving revenue growth while maintaining quality",
    tags: ["sales", "revenue", "growth", "conversion"],
  },
  {
    id: "template-2",
    name: "Customer Experience Excellence",
    category: "customer",
    level: "team",
    objectiveTemplate: "Enhance Customer Experience & Satisfaction",
    keyResultTemplates: [
      "Achieve customer satisfaction score of X+/5.0",
      "Reduce average call resolution time to under X minutes",
      "Increase customer retention rate to X%",
      "Achieve Net Promoter Score of X+",
    ],
    description: "Improve all aspects of customer interaction and satisfaction",
    tags: ["customer", "satisfaction", "retention", "service"],
  },
  {
    id: "template-3",
    name: "Compliance & Risk Management",
    category: "compliance",
    level: "team",
    objectiveTemplate: "Maintain Regulatory Excellence",
    keyResultTemplates: [
      "Complete 100% of compliance audits with no violations",
      "Achieve X% agent certification completion rate",
      "Implement X new compliance training modules",
      "Reduce compliance-related incidents to zero",
    ],
    description: "Ensure full regulatory compliance and risk mitigation",
    tags: ["compliance", "regulation", "training", "risk"],
  },
  {
    id: "template-4",
    name: "Operational Efficiency",
    category: "operational",
    level: "team",
    objectiveTemplate: "Optimize Sales Operations Efficiency",
    keyResultTemplates: [
      "Reduce lead response time to under X hours",
      "Increase appointment show rate to X%",
      "Achieve X% accuracy in underwriting decisions",
      "Improve lead-to-sale conversion rate to X%",
    ],
    description: "Streamline processes for maximum efficiency",
    tags: ["operations", "efficiency", "process", "productivity"],
  },
  {
    id: "template-5",
    name: "Team Development & Culture",
    category: "team",
    level: "individual",
    objectiveTemplate: "Develop High-Performance Team Culture",
    keyResultTemplates: [
      "Achieve X% completion rate for monthly training programs",
      "Reduce employee turnover to under X%",
      "Increase team engagement score to X+/5.0",
      "Promote X team members to leadership roles",
    ],
    description: "Build a motivated and skilled team",
    tags: ["team", "culture", "development", "engagement"],
  },
  {
    id: "template-6",
    name: "Technology & Innovation",
    category: "innovation",
    level: "company",
    objectiveTemplate: "Leverage Technology for Competitive Advantage",
    keyResultTemplates: [
      "Implement X new technology solutions",
      "Achieve X% adoption rate for new CRM system",
      "Reduce manual processes by X%",
      "Increase automation coverage to X% of workflows",
    ],
    description: "Use technology to improve efficiency and outcomes",
    tags: ["technology", "innovation", "automation", "digital"],
  },
];

// Utility function to get filtered objectives
export const getObjectivesByLevel = (
  level: "company" | "team" | "individual"
): Objective[] => {
  return sampleOKRObjectives.filter((obj) => obj.level === level);
};

// Utility function to calculate OKR metrics
export const calculateOKRMetrics = (objectives: Objective[]) => {
  const totalObjectives = objectives.length;
  const completedObjectives = objectives.filter(
    (obj) => obj.status === "completed"
  ).length;
  const totalKeyResults = objectives.reduce(
    (sum, obj) => sum + obj.keyResults.length,
    0
  );
  const keyResultsAchieved = objectives.reduce(
    (sum, obj) =>
      sum +
      obj.keyResults.filter((kr) => kr.currentValue >= kr.targetValue).length,
    0
  );

  const avgProgress =
    objectives.reduce((sum, obj) => {
      const objProgress =
        obj.keyResults.reduce((krSum, kr) => {
          const progress = Math.min(
            1,
            Math.max(
              0,
              (kr.currentValue - kr.startValue) /
                (kr.targetValue - kr.startValue)
            )
          );
          return krSum + progress;
        }, 0) / obj.keyResults.length;
      return sum + objProgress;
    }, 0) / objectives.length;

  const avgConfidence =
    objectives.reduce((sum, obj) => sum + obj.confidenceLevel, 0) /
    objectives.length;

  const statusCounts = objectives.reduce(
    (acc, obj) => {
      obj.keyResults.forEach((kr) => {
        acc[kr.status]++;
      });
      return acc;
    },
    { "on-track": 0, "at-risk": 0, "off-track": 0 }
  );

  return {
    totalObjectives,
    completedObjectives,
    averageProgress: avgProgress * 100,
    averageConfidence: avgConfidence,
    onTrackCount: statusCounts["on-track"],
    atRiskCount: statusCounts["at-risk"],
    offTrackCount: statusCounts["off-track"],
    keyResultsAchieved,
    totalKeyResults,
  };
};
