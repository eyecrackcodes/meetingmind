import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error("Missing VITE_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_ANON_KEY environment variable");
}

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
export const supabaseAdmin = supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

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
  if (!supabaseAdmin) {
    console.warn("Admin client not available - service role key not provided");
    return false;
  }

  // RLS is enabled in schema creation - no need to enable programmatically
  console.log(`RLS policies configured for ${tableName} in database schema`);
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
      .from("user_stats")
      .select("id")
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
    // Validate connection first
    const isConnected = await checkConnection();
    if (!isConnected) {
      console.error(
        "Failed to connect to Supabase. Please check your configuration."
      );
      return false;
    }

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
