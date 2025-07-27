export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_stats: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          role: string;
          department: string | null;
          team: string | null;
          license_states: string[] | null;
          hire_date: string | null;
          avatar: string | null;
          approval_status: string;
          approved_by: string | null;
          approved_at: string | null;
          rejection_reason: string | null;
          approval_notes: string | null;
          level: number;
          total_points: number;
          current_streak: number;
          longest_streak: number;
          join_date: string;
          last_active: string;
          stats: {
            objectives_created: number;
            objectives_completed: number;
            key_results_achieved: number;
            check_ins_completed: number;
            avg_confidence_level: number;
            avg_progress_rate: number;
            total_sessions: number;
            total_time_spent: number;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          role?: string;
          department?: string | null;
          team?: string | null;
          license_states?: string[] | null;
          hire_date?: string | null;
          avatar?: string | null;
          approval_status?: string;
          approved_by?: string | null;
          approved_at?: string | null;
          rejection_reason?: string | null;
          approval_notes?: string | null;
          level?: number;
          total_points?: number;
          current_streak?: number;
          longest_streak?: number;
          join_date?: string;
          last_active?: string;
          stats?: {
            objectives_created?: number;
            objectives_completed?: number;
            key_results_achieved?: number;
            check_ins_completed?: number;
            avg_confidence_level?: number;
            avg_progress_rate?: number;
            total_sessions?: number;
            total_time_spent?: number;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          role?: string;
          department?: string | null;
          team?: string | null;
          license_states?: string[] | null;
          hire_date?: string | null;
          avatar?: string | null;
          approval_status?: string;
          approved_by?: string | null;
          approved_at?: string | null;
          rejection_reason?: string | null;
          approval_notes?: string | null;
          level?: number;
          total_points?: number;
          current_streak?: number;
          longest_streak?: number;
          join_date?: string;
          last_active?: string;
          stats?: {
            objectives_created?: number;
            objectives_completed?: number;
            key_results_achieved?: number;
            check_ins_completed?: number;
            avg_confidence_level?: number;
            avg_progress_rate?: number;
            total_sessions?: number;
            total_time_spent?: number;
          };
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_approval_history: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          performed_by: string | null;
          reason: string | null;
          notes: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          performed_by?: string | null;
          reason?: string | null;
          notes?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          performed_by?: string | null;
          reason?: string | null;
          notes?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_approval_history_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_approval_history_performed_by_fkey";
            columns: ["performed_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          name: string;
          description: string;
          icon: string;
          category:
            | "objectives"
            | "key-results"
            | "check-ins"
            | "consistency"
            | "performance"
            | "collaboration";
          rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
          points: number;
          unlocked_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          name: string;
          description: string;
          icon: string;
          category:
            | "objectives"
            | "key-results"
            | "check-ins"
            | "consistency"
            | "performance"
            | "collaboration";
          rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
          points: number;
          unlocked_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          name?: string;
          description?: string;
          icon?: string;
          category?:
            | "objectives"
            | "key-results"
            | "check-ins"
            | "consistency"
            | "performance"
            | "collaboration";
          rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";
          points?: number;
          unlocked_date?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      objectives: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category:
            | "revenue"
            | "operational"
            | "customer"
            | "team"
            | "compliance"
            | "innovation";
          level: "company" | "team" | "individual";
          owner: string;
          quarter: string;
          year: number;
          aligned_to: string | null;
          confidence_level: number;
          status: "draft" | "active" | "completed" | "cancelled";
          created_date: string;
          last_updated: string;
          key_results: Json;
          check_ins: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          category:
            | "revenue"
            | "operational"
            | "customer"
            | "team"
            | "compliance"
            | "innovation";
          level: "company" | "team" | "individual";
          owner: string;
          quarter: string;
          year: number;
          aligned_to?: string | null;
          confidence_level: number;
          status?: "draft" | "active" | "completed" | "cancelled" | "archived";
          created_date?: string;
          last_updated?: string;
          key_results?: Json;
          check_ins?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          category?:
            | "revenue"
            | "operational"
            | "customer"
            | "team"
            | "compliance"
            | "innovation";
          level?: "company" | "team" | "individual";
          owner?: string;
          quarter?: string;
          year?: number;
          aligned_to?: string | null;
          confidence_level?: number;
          status?: "draft" | "active" | "completed" | "cancelled" | "archived";
          created_date?: string;
          last_updated?: string;
          key_results?: Json;
          check_ins?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "objectives_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      okr_cycles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          quarter: number;
          year: number;
          start_date: string;
          end_date: string;
          status: "planning" | "active" | "review" | "completed";
          cycle_theme: string | null;
          company_priorities: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          quarter: number;
          year: number;
          start_date: string;
          end_date: string;
          status?: "planning" | "active" | "review" | "completed";
          cycle_theme?: string | null;
          company_priorities?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          quarter?: number;
          year?: number;
          start_date?: string;
          end_date?: string;
          status?: "planning" | "active" | "review" | "completed";
          cycle_theme?: string | null;
          company_priorities?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "okr_cycles_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      meeting_templates: {
        Row: {
          id: string;
          user_id: string;
          meeting_title: string;
          meeting_date: string;
          facilitator: string;
          core_question: string;
          meeting_context: string;
          sections: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meeting_title: string;
          meeting_date: string;
          facilitator: string;
          core_question: string;
          meeting_context: string;
          sections: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meeting_title?: string;
          meeting_date?: string;
          facilitator?: string;
          core_question?: string;
          meeting_context?: string;
          sections?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meeting_templates_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          start_time: string;
          end_time: string | null;
          total_time_spent: number;
          activities: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id: string;
          start_time: string;
          end_time?: string | null;
          total_time_spent?: number;
          activities?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string;
          start_time?: string;
          end_time?: string | null;
          total_time_spent?: number;
          activities?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      game_events: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          type:
            | "achievement_unlocked"
            | "level_up"
            | "streak_milestone"
            | "objective_completed"
            | "milestone_reached";
          title: string;
          description: string;
          points: number;
          timestamp: string;
          data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          type:
            | "achievement_unlocked"
            | "level_up"
            | "streak_milestone"
            | "objective_completed"
            | "milestone_reached";
          title: string;
          description: string;
          points: number;
          timestamp: string;
          data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string;
          type?:
            | "achievement_unlocked"
            | "level_up"
            | "streak_milestone"
            | "objective_completed"
            | "milestone_reached";
          title?: string;
          description?: string;
          points?: number;
          timestamp?: string;
          data?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "game_events_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          theme: "light" | "dark" | "auto";
          notifications: {
            achievements: boolean;
            reminders: boolean;
            deadlines: boolean;
            weekly_summary: boolean;
          };
          gamification: {
            enabled: boolean;
            show_leaderboards: boolean;
            show_points: boolean;
            show_achievements: boolean;
          };
          default_view: "meetings" | "okr";
          auto_save: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: "light" | "dark" | "auto";
          notifications?: {
            achievements?: boolean;
            reminders?: boolean;
            deadlines?: boolean;
            weekly_summary?: boolean;
          };
          gamification?: {
            enabled?: boolean;
            show_leaderboards?: boolean;
            show_points?: boolean;
            show_achievements?: boolean;
          };
          default_view?: "meetings" | "okr";
          auto_save?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: "light" | "dark" | "auto";
          notifications?: {
            achievements?: boolean;
            reminders?: boolean;
            deadlines?: boolean;
            weekly_summary?: boolean;
          };
          gamification?: {
            enabled?: boolean;
            show_leaderboards?: boolean;
            show_points?: boolean;
            show_achievements?: boolean;
          };
          default_view?: "meetings" | "okr";
          auto_save?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
