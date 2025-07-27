# MeetingMind - Final Expense Insurance Critical Thinking & OKR Platform

A comprehensive platform for final expense insurance call centers featuring AI-powered meeting templates, OKR management, and gamification to optimize sales performance and team engagement.

## 🚀 Quick Start

### 1. Environment Setup

**IMPORTANT**: You must create a `.env.local` file with your Supabase credentials before running the application.

See [`ENVIRONMENT_SETUP.md`](./ENVIRONMENT_SETUP.md) for detailed instructions and credentials.

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor → New Query
3. Copy and paste the contents of `database-schema.sql`
4. Run the query to create all tables and policies

### 4. Start Development Server

```bash
npm run dev
```

## 🌟 Features

### Critical Thinking Framework

- **Socratic Method Integration**: Question-driven meeting structures
- **Evidence-Based Decision Making**: Systematic approach to insurance sales
- **AI-Powered Templates**: Generate meeting agendas using OpenAI
- **Interactive Checklists**: Track progress and ensure completeness

### OKR Management (Based on "Measure What Matters")

- **Company/Team/Individual Objectives**: Multi-level goal alignment
- **Key Results Tracking**: Measurable outcomes with confidence levels
- **Quarterly Cycles**: Structured planning and review periods
- **Final Expense Templates**: Pre-built OKRs for insurance teams

### Gamification System

- **17 Achievements**: From "Getting Started" to "Dedication Legend"
- **10 Level Progression**: Bronze Rookie to Platinum Legend
- **Real-time Notifications**: Achievement unlocks and level-ups
- **Streak Tracking**: Maintain consistency with daily check-ins
- **Performance Analytics**: Detailed stats and progress tracking

### Enterprise Database Integration

- **Supabase PostgreSQL**: Enterprise-grade data persistence
- **Real-time Sync**: Data updates across all devices instantly
- **Row Level Security**: User data protection and isolation
- **Anonymous Authentication**: Seamless onboarding without friction
- **Cross-device Access**: Access your data from anywhere

## 🏗️ Technical Architecture

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive design
- **shadcn/ui** components for consistent UI
- **Lucide React** for icons

### Backend & Database

- **Supabase** for database and authentication
- **PostgreSQL** with custom types and triggers
- **Real-time subscriptions** for live updates
- **Row Level Security (RLS)** for data protection

### AI Integration

- **OpenAI GPT-4/3.5-turbo** for template generation
- **Fallback model support** for reliability
- **Custom prompts** for final expense industry

## 📊 For Final Expense Teams

### Sales Agents

- 📱 **Mobile-first design** for field work
- 🎯 **Personal OKRs** aligned with team goals
- 🏆 **Achievement system** for motivation
- 📈 **Progress tracking** for self-improvement

### Team Leaders

- 👥 **Team visibility** into individual progress
- 📊 **Analytics dashboard** for performance insights
- 🎯 **Goal alignment** across all team members
- 💡 **Meeting templates** for effective one-on-ones

### Call Center Managers

- 📈 **Company-wide OKR tracking**
- 🚀 **Gamification metrics** for engagement
- 📊 **Real-time dashboards** for decision making
- 🔄 **Cross-training materials** through meeting templates

## 🔒 Security & Privacy

- **Environment Variables**: All credentials secured in `.env.local`
- **Row Level Security**: Database-level user isolation
- **Anonymous Authentication**: No personal data required
- **HTTPS**: Secure communication with Supabase
- **Git Guardian Compatible**: No hardcoded credentials

## 📦 Deployment

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

### Environment Variables Required

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Public anonymous key
- `VITE_SUPABASE_SERVICE_ROLE_KEY`: Private service role key (optional)
- `VITE_OPENAI_API_KEY`: OpenAI API key (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the existing code patterns
4. Ensure all TypeScript types are properly defined
5. Test with the gamification system
6. Submit a pull request

## 📄 License

This project is designed specifically for final expense insurance teams and includes industry-specific templates and workflows.

## 🆘 Support

- **Environment Setup**: See `ENVIRONMENT_SETUP.md`
- **Database Schema**: Check `database-schema.sql`
- **Type Definitions**: Review `src/types/`

Built with ❤️ for final expense insurance teams to achieve their sales objectives through better meetings and goal management.
