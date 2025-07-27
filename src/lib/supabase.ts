import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Supabase configuration
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://bqgvqxlqecfgmhwgitts.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxZ3ZxeGxxZWNmZ21od2dpdHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NTI0OTksImV4cCI6MjA2OTIyODQ5OX0.whj16FT-G8uvo-9xiUVHToLeSJPawi8K1URZW-Wy8II";

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Service role client for admin operations (use carefully)
const supabaseServiceKey =
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxZ3ZxeGxxZWNmZ21od2dpdHRzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY1MjQ5OSwiZXhwIjoyMDY5MjI4NDk5fQ.Stsq9OoGigStgyuaAbZx3PI4R3yuxshGFBty4fukZLY";

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Authentication helpers
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.error("Error getting current user:", error);
    return null;
  }
  return user;
};

export const signInAnonymously = async () => {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error("Error signing in anonymously:", error);
    return null;
  }
  return data.user;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.error("Error signing in with email:", error);
    return null;
  }
  return data.user;
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  metadata?: any
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  if (error) {
    console.error("Error signing up:", error);
    return null;
  }
  return data.user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error signing out:", error);
    return false;
  }
  return true;
};

// Database helpers
export const enableRLS = async (tableName: string) => {
  const { error } = await supabaseAdmin.rpc("enable_rls", {
    table_name: tableName,
  });
  if (error) {
    console.error(`Error enabling RLS for ${tableName}:`, error);
  }
  return !error;
};

// Real-time subscriptions
export const subscribeToUserData = (
  userId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel("user-data-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "user_stats",
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "objectives",
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "achievements",
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

// Connection status
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("healthcheck")
      .select("*")
      .limit(1);
    return !error;
  } catch (error) {
    console.error("Supabase connection error:", error);
    return false;
  }
};

// Initialize connection and auth state
export const initializeSupabase = async () => {
  try {
    // Check if user is already authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      // Sign in anonymously for first-time users
      await signInAnonymously();
    }

    return true;
  } catch (error) {
    console.error("Error initializing Supabase:", error);
    return false;
  }
};
