import { MeetingTemplate } from '@/types'

// Final Expense Call Center Meeting Framework
// This framework applies critical thinking elements to five key meeting types:
// 1. Product Knowledge & Training
// 2. Agent Coaching & Development  
// 3. Manager Best Practices
// 4. Metrics & KPI Analysis
// 5. Sales Operations & Process

export function getSampleTemplate(): MeetingTemplate {
  return getProductMeetingTemplate()
}

export function getProductMeetingTemplate(): MeetingTemplate {
  return {
    meetingTitle: "Final Expense Product Knowledge & Training",
    meetingDate: new Date().toISOString().slice(0, 16),
    facilitator: "Product Training Manager",
    coreQuestion: "How can we ensure our agents have comprehensive product knowledge to better serve customers and increase conversion rates?",
    meetingContext: "Regular product training is essential for agent confidence and customer trust. We need to cover product features, benefits, pricing strategies, underwriting guidelines, and competitive positioning to maximize sales effectiveness.",
    sections: [
      {
        icon: "📋",
        title: "Product Knowledge Foundation",
        criticalThinkingNotes: "Focus on INFORMATION and CONCEPTS - Ensure agents understand core product details and industry terminology.",
        checklistItems: [
          {
            title: "Review final expense product portfolio",
            description: "What are the key features, benefits, and limitations of each product we offer?",
            completed: false
          },
          {
            title: "Understand underwriting guidelines",
            description: "What are the age limits, health questions, and approval criteria for each product?",
            completed: false
          },
          {
            title: "Master pricing structure and premiums",
            description: "How do premiums vary by age, gender, coverage amount, and payment frequency?",
            completed: false
          },
          {
            title: "Learn policy terms and conditions",
            description: "What are the waiting periods, benefit structures, and policy exclusions?",
            completed: false
          }
        ]
      },
      {
        icon: "🎯",
        title: "Customer Needs Assessment",
        criticalThinkingNotes: "Focus on PURPOSE and POINT OF VIEW - Understanding customer perspectives and motivations for purchasing final expense insurance.",
        checklistItems: [
          {
            title: "Identify target customer demographics",
            description: "Who are our ideal customers and what are their primary concerns about final expenses?",
            completed: false
          },
          {
            title: "Understand customer objections",
            description: "What are the most common reasons customers hesitate or decline coverage?",
            completed: false
          },
          {
            title: "Practice needs-based selling",
            description: "How do we match customer situations to appropriate coverage amounts and products?",
            completed: false
          }
        ]
      },
      {
        icon: "⚔️",
        title: "Competitive Analysis",
        criticalThinkingNotes: "Focus on ASSUMPTIONS and IMPLICATIONS - Challenge assumptions about our competitive position and understand market dynamics.",
        checklistItems: [
          {
            title: "Compare competitor products",
            description: "How do our products, pricing, and benefits compare to major competitors?",
            completed: false
          },
          {
            title: "Identify unique selling propositions",
            description: "What makes our products and company stand out in the marketplace?",
            completed: false
          },
          {
            title: "Address competitive objections",
            description: "How do we respond when customers mention competitor offers or pricing?",
            completed: false
          }
        ]
      },
      {
        icon: "🗣️",
        title: "Sales Presentation Skills",
        criticalThinkingNotes: "Focus on INTERPRETATION and INFERENCES - How to effectively communicate product value and respond to customer concerns.",
        checklistItems: [
          {
            title: "Practice product presentations",
            description: "Can each agent clearly explain product benefits in terms customers understand?",
            completed: false
          },
          {
            title: "Role-play customer scenarios",
            description: "How effectively can agents handle various customer situations and objections?",
            completed: false
          },
          {
            title: "Review compliance requirements",
            description: "Are agents following all regulatory guidelines and required disclosures?",
            completed: false
          },
          {
            title: "Develop closing techniques",
            description: "What are the most effective ways to guide customers toward making a decision?",
            completed: false
          }
        ]
      }
    ]
  }
}

export function getCoachingMeetingTemplate(): MeetingTemplate {
  return {
    meetingTitle: "Agent Coaching & Development Session",
    meetingDate: new Date().toISOString().slice(0, 16),
    facilitator: "Sales Manager",
    coreQuestion: "How can we develop this agent's skills and performance to achieve consistent success and career growth?",
    meetingContext: "Individual coaching sessions are crucial for agent development. We focus on performance analysis, skill building, goal setting, and addressing specific challenges to help agents reach their full potential.",
    sections: [
      {
        icon: "📊",
        title: "Performance Review",
        criticalThinkingNotes: "Focus on INFORMATION and INTERPRETATION - Analyze data objectively and understand what performance metrics really indicate.",
        checklistItems: [
          {
            title: "Review call volume and contact rates",
            description: "How many calls is the agent making and what is their contact rate compared to targets?",
            completed: false
          },
          {
            title: "Analyze conversion metrics",
            description: "What are the agent's lead-to-appointment and appointment-to-sale conversion rates?",
            completed: false
          },
          {
            title: "Examine average premium and persistency",
            description: "Is the agent selling appropriate coverage amounts and are policies staying in force?",
            completed: false
          },
          {
            title: "Assess activity consistency",
            description: "Is the agent maintaining consistent daily and weekly activity levels?",
            completed: false
          }
        ]
      },
      {
        icon: "🎧",
        title: "Call Quality Assessment",
        criticalThinkingNotes: "Focus on CONCEPTS and PURPOSE - Understanding effective communication principles and sales methodology.",
        checklistItems: [
          {
            title: "Review recorded calls",
            description: "What specific strengths and improvement areas are evident in the agent's calls?",
            completed: false
          },
          {
            title: "Evaluate rapport building",
            description: "How effectively does the agent connect with prospects and build trust?",
            completed: false
          },
          {
            title: "Assess needs discovery",
            description: "Is the agent asking the right questions to understand customer situations?",
            completed: false
          },
          {
            title: "Analyze objection handling",
            description: "How well does the agent address concerns and move conversations forward?",
            completed: false
          }
        ]
      },
      {
        icon: "🎯",
        title: "Skill Development Plan",
        criticalThinkingNotes: "Focus on ASSUMPTIONS and IMPLICATIONS - What assumptions are we making about the agent's learning style and what will be the impact of different development approaches?",
        checklistItems: [
          {
            title: "Identify top development priorities",
            description: "What 2-3 skills would have the biggest impact on the agent's performance?",
            completed: false
          },
          {
            title: "Create specific action steps",
            description: "What concrete actions will the agent take to improve in priority areas?",
            completed: false
          },
          {
            title: "Establish practice schedule",
            description: "How will the agent practice new skills and when will we review progress?",
            completed: false
          },
          {
            title: "Assign learning resources",
            description: "What training materials, scripts, or resources will support the agent's development?",
            completed: false
          }
        ]
      },
      {
        icon: "🚀",
        title: "Goal Setting & Motivation",
        criticalThinkingNotes: "Focus on POINT OF VIEW and INFERENCES - Understanding the agent's perspective, motivations, and what success means to them.",
        checklistItems: [
          {
            title: "Set specific performance goals",
            description: "What measurable goals will the agent work toward over the next 30-60-90 days?",
            completed: false
          },
          {
            title: "Discuss career aspirations",
            description: "What are the agent's long-term goals and how can current performance support them?",
            completed: false
          },
          {
            title: "Address challenges and obstacles",
            description: "What barriers is the agent facing and how can we help overcome them?",
            completed: false
          },
          {
            title: "Plan follow-up support",
            description: "What ongoing support and check-ins will help ensure the agent's success?",
            completed: false
          }
        ]
      }
    ]
  }
}

export function getManagerMeetingTemplate(): MeetingTemplate {
  return {
    meetingTitle: "Manager Best Practices & Leadership Development",
    meetingDate: new Date().toISOString().slice(0, 16),
    facilitator: "Sales Director",
    coreQuestion: "How can we enhance our management practices to better support agent success and achieve organizational goals?",
    meetingContext: "Effective management is the cornerstone of a successful call center. We focus on leadership skills, team building, performance management, and operational excellence to create an environment where agents thrive.",
    sections: [
      {
        icon: "👥",
        title: "Team Performance Analysis",
        criticalThinkingNotes: "Focus on INFORMATION and INTERPRETATION - Analyze team metrics objectively and understand underlying performance drivers.",
        checklistItems: [
          {
            title: "Review team production metrics",
            description: "What are the team's overall sales, conversion rates, and activity levels compared to goals?",
            completed: false
          },
          {
            title: "Identify top and bottom performers",
            description: "Who are the top 20% and bottom 20% of performers and what differentiates them?",
            completed: false
          },
          {
            title: "Analyze team retention and turnover",
            description: "What is our retention rate and what factors contribute to agent turnover?",
            completed: false
          },
          {
            title: "Assess team morale and engagement",
            description: "How engaged is the team and what impacts their motivation and job satisfaction?",
            completed: false
          }
        ]
      },
      {
        icon: "🎯",
        title: "Leadership Effectiveness",
        criticalThinkingNotes: "Focus on PURPOSE and CONCEPTS - Understanding effective leadership principles and management methodologies.",
        checklistItems: [
          {
            title: "Evaluate coaching frequency and quality",
            description: "Are managers providing regular, effective coaching to all team members?",
            completed: false
          },
          {
            title: "Review communication practices",
            description: "How effectively are managers communicating expectations, feedback, and company updates?",
            completed: false
          },
          {
            title: "Assess recognition and motivation strategies",
            description: "Are managers using appropriate recognition and incentive programs to motivate agents?",
            completed: false
          },
          {
            title: "Examine problem-solving approaches",
            description: "How effectively are managers addressing performance issues and team challenges?",
            completed: false
          }
        ]
      },
      {
        icon: "⚙️",
        title: "Operational Excellence",
        criticalThinkingNotes: "Focus on ASSUMPTIONS and IMPLICATIONS - Question current processes and consider the impact of operational changes.",
        checklistItems: [
          {
            title: "Review daily management routines",
            description: "Are managers following consistent daily practices for monitoring and supporting their teams?",
            completed: false
          },
          {
            title: "Evaluate meeting effectiveness",
            description: "Are team meetings productive, engaging, and driving desired behaviors?",
            completed: false
          },
          {
            title: "Assess training and onboarding",
            description: "How effective are our new hire training and ongoing development programs?",
            completed: false
          },
          {
            title: "Review compliance and quality assurance",
            description: "Are managers ensuring agents follow all compliance requirements and quality standards?",
            completed: false
          }
        ]
      },
      {
        icon: "📈",
        title: "Continuous Improvement",
        criticalThinkingNotes: "Focus on INFERENCES and POINT OF VIEW - Consider different perspectives on improvement opportunities and their potential impact.",
        checklistItems: [
          {
            title: "Identify process improvement opportunities",
            description: "What operational processes could be streamlined or enhanced to improve efficiency?",
            completed: false
          },
          {
            title: "Develop management skills",
            description: "What specific leadership skills should managers focus on developing?",
            completed: false
          },
          {
            title: "Plan team development initiatives",
            description: "What team-building or skill development programs would benefit the organization?",
            completed: false
          },
          {
            title: "Set management goals and accountability",
            description: "What specific goals and metrics will hold managers accountable for team success?",
            completed: false
          }
        ]
      }
    ]
  }
}

export function getMetricsMeetingTemplate(): MeetingTemplate {
  return {
    meetingTitle: "Metrics & KPI Analysis Session",
    meetingDate: new Date().toISOString().slice(0, 16),
    facilitator: "Operations Manager",
    coreQuestion: "What do our performance metrics tell us about our current effectiveness and what actions should we take to improve results?",
    meetingContext: "Data-driven decision making is essential for call center success. We analyze key performance indicators, identify trends, set targets, and develop action plans to continuously improve our operations and results.",
    sections: [
      {
        icon: "📊",
        title: "Core Performance Metrics",
        criticalThinkingNotes: "Focus on INFORMATION and INTERPRETATION - Ensure data accuracy and understand what metrics really indicate about performance.",
        checklistItems: [
          {
            title: "Review sales conversion rates",
            description: "What are our lead-to-contact, contact-to-appointment, and appointment-to-sale conversion rates?",
            completed: false
          },
          {
            title: "Analyze activity metrics",
            description: "What are our daily call volumes, contact rates, and agent productivity levels?",
            completed: false
          },
          {
            title: "Examine revenue and premium metrics",
            description: "What are our total sales, average premium, and revenue per agent/hour metrics?",
            completed: false
          },
          {
            title: "Assess quality metrics",
            description: "What are our call quality scores, compliance rates, and customer satisfaction levels?",
            completed: false
          }
        ]
      },
      {
        icon: "📈",
        title: "Trend Analysis",
        criticalThinkingNotes: "Focus on CONCEPTS and INFERENCES - Understanding patterns in data and what they suggest about future performance.",
        checklistItems: [
          {
            title: "Identify performance trends",
            description: "What positive and negative trends are evident over the past 30, 60, and 90 days?",
            completed: false
          },
          {
            title: "Compare period-over-period results",
            description: "How do current metrics compare to previous months, quarters, and the same period last year?",
            completed: false
          },
          {
            title: "Analyze seasonal patterns",
            description: "What seasonal or cyclical patterns affect our performance and how should we prepare?",
            completed: false
          },
          {
            title: "Examine leading vs lagging indicators",
            description: "Which metrics predict future performance and which ones reflect past results?",
            completed: false
          }
        ]
      },
      {
        icon: "🎯",
        title: "Goal Setting & Benchmarking",
        criticalThinkingNotes: "Focus on PURPOSE and ASSUMPTIONS - Question our goal-setting approach and assumptions about achievable performance levels.",
        checklistItems: [
          {
            title: "Review current targets and goals",
            description: "Are our current performance targets realistic, challenging, and aligned with business objectives?",
            completed: false
          },
          {
            title: "Benchmark against industry standards",
            description: "How do our metrics compare to industry benchmarks and best-in-class performance?",
            completed: false
          },
          {
            title: "Set realistic improvement targets",
            description: "What specific, measurable improvements should we target for the next 30-90 days?",
            completed: false
          },
          {
            title: "Establish agent-level expectations",
            description: "What performance standards should individual agents be expected to meet?",
            completed: false
          }
        ]
      },
      {
        icon: "🔧",
        title: "Action Planning",
        criticalThinkingNotes: "Focus on IMPLICATIONS and POINT OF VIEW - Consider the consequences of different actions and how various stakeholders will be affected.",
        checklistItems: [
          {
            title: "Identify root causes of performance gaps",
            description: "What underlying factors are causing performance issues and how can we address them?",
            completed: false
          },
          {
            title: "Develop specific improvement initiatives",
            description: "What concrete actions will we take to improve key metrics and performance?",
            completed: false
          },
          {
            title: "Assign ownership and timelines",
            description: "Who is responsible for each improvement initiative and when will results be measured?",
            completed: false
          },
          {
            title: "Plan progress monitoring",
            description: "How frequently will we review progress and what reporting mechanisms will we use?",
            completed: false
          }
        ]
      }
    ]
  }
}

export function getSalesOperationsMeetingTemplate(): MeetingTemplate {
  return {
    meetingTitle: "Sales Operations & Process Optimization",
    meetingDate: new Date().toISOString().slice(0, 16),
    facilitator: "Sales Operations Manager",
    coreQuestion: "How can we optimize our sales processes, systems, and workflows to maximize efficiency and results?",
    meetingContext: "Effective sales operations are the backbone of a successful call center. We focus on process improvement, system optimization, compliance management, and workflow efficiency to support agent success and organizational goals.",
    sections: [
      {
        icon: "⚙️",
        title: "Process Efficiency Review",
        criticalThinkingNotes: "Focus on INFORMATION and CONCEPTS - Understand current processes objectively and identify inefficiencies or bottlenecks.",
        checklistItems: [
          {
            title: "Analyze lead flow and distribution",
            description: "How efficiently are leads being distributed to agents and what is the lead-to-contact time?",
            completed: false
          },
          {
            title: "Review appointment scheduling process",
            description: "What is our appointment booking efficiency and show rate, and how can we improve them?",
            completed: false
          },
          {
            title: "Examine application and underwriting workflow",
            description: "How quickly are applications processed and what causes delays in the underwriting process?",
            completed: false
          },
          {
            title: "Assess customer onboarding process",
            description: "How smooth is the transition from sale to policy issuance and first premium collection?",
            completed: false
          }
        ]
      },
      {
        icon: "💻",
        title: "Technology & Systems",
        criticalThinkingNotes: "Focus on PURPOSE and INTERPRETATION - Understanding how technology supports business objectives and what system data tells us.",
        checklistItems: [
          {
            title: "Evaluate CRM system utilization",
            description: "Are agents effectively using the CRM for lead management, notes, and follow-up activities?",
            completed: false
          },
          {
            title: "Review dialer and phone system performance",
            description: "What is our system uptime, call quality, and connectivity rate performance?",
            completed: false
          },
          {
            title: "Assess reporting and analytics tools",
            description: "Are managers and agents getting the data they need in a timely and actionable format?",
            completed: false
          },
          {
            title: "Examine integration efficiency",
            description: "How well do our various systems communicate and share data with each other?",
            completed: false
          }
        ]
      },
      {
        icon: "📋",
        title: "Compliance & Quality Assurance",
        criticalThinkingNotes: "Focus on ASSUMPTIONS and IMPLICATIONS - Question compliance processes and understand the consequences of quality issues.",
        checklistItems: [
          {
            title: "Review regulatory compliance procedures",
            description: "Are we following all state and federal regulations for final expense insurance sales?",
            completed: false
          },
          {
            title: "Audit call recording and monitoring",
            description: "Are we properly recording calls and conducting regular quality assurance reviews?",
            completed: false
          },
          {
            title: "Examine documentation requirements",
            description: "Are agents properly documenting customer interactions and maintaining required records?",
            completed: false
          },
          {
            title: "Assess training and certification tracking",
            description: "Are we tracking agent licensing, certifications, and continuing education requirements?",
            completed: false
          }
        ]
      },
      {
        icon: "🚀",
        title: "Optimization & Innovation",
        criticalThinkingNotes: "Focus on INFERENCES and POINT OF VIEW - Consider different approaches to improvement and their potential impact on various stakeholders.",
        checklistItems: [
          {
            title: "Identify automation opportunities",
            description: "What manual processes could be automated to improve efficiency and reduce errors?",
            completed: false
          },
          {
            title: "Explore new tools and technologies",
            description: "What emerging technologies or tools could enhance our sales operations?",
            completed: false
          },
          {
            title: "Plan process improvement initiatives",
            description: "What specific workflow improvements should we implement to increase productivity?",
            completed: false
          },
          {
            title: "Develop best practice documentation",
            description: "How can we capture and share operational best practices across the organization?",
            completed: false
          }
        ]
      }
    ]
  }
}

// Export all templates for easy access
export const finalExpenseTemplates = {
  product: getProductMeetingTemplate,
  coaching: getCoachingMeetingTemplate,
  manager: getManagerMeetingTemplate,
  metrics: getMetricsMeetingTemplate,
  salesOps: getSalesOperationsMeetingTemplate
} 