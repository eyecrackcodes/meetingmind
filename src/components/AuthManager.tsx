import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  UserPlus,
  Shield,
  Users,
  Settings,
  Crown,
  Star,
  Building,
  MapPin,
  Calendar,
  Phone,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  supabase,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getCurrentUser,
} from "@/lib/supabase";
import { UserProfile, Team, TeamMember } from "@/types";

interface AuthManagerProps {
  currentUser: any;
  userProfile: UserProfile | null;
  onAuthStateChange: (user: any, profile: UserProfile | null) => void;
  onProfileUpdate: (profile: UserProfile) => void;
}

export function AuthManager({
  currentUser,
  userProfile,
  onAuthStateChange,
  onProfileUpdate,
}: AuthManagerProps) {
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "profile">(
    "signin"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Auth form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Profile form state
  const [profileForm, setProfileForm] = useState<Partial<UserProfile>>({
    username: "",
    firstName: "",
    lastName: "",
    role: "agent",
    department: "",
    team: "",
    licenseStates: [],
    hireDate: "",
    avatar: "",
  });

  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        username: userProfile.username,
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        role: userProfile.role,
        department: userProfile.department || "",
        team: userProfile.team || "",
        licenseStates: userProfile.licenseStates || [],
        hireDate: userProfile.hireDate || "",
        avatar: userProfile.avatar || "",
      });
    }
  }, [userProfile]);

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const profile = await loadUserProfile(session.user.id);
        onAuthStateChange(session.user, profile);
      } else if (event === "SIGNED_OUT") {
        onAuthStateChange(null, null);
      }
    });

    return () => subscription.unsubscribe();
  }, [onAuthStateChange]);

  const loadUserProfile = async (
    userId: string
  ): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from("user_stats")
        .select(
          `
          *,
          user_preferences(*)
        `
        )
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error loading user profile:", error);
        return null;
      }

      // Transform database data to UserProfile format
      return {
        id: data.id,
        email: currentUser?.email || "",
        username: data.username,
        firstName: data.username.split("_")[0] || "User",
        lastName: data.username.split("_")[1] || "",
        role: "agent",
        department: "Sales",
        team: "Team A",
        licenseStates: [],
        hireDate: data.join_date,
        avatar: "",
        preferences: {
          theme: "auto",
          notifications: {
            achievements: true,
            reminders: true,
            deadlines: true,
            weekly_summary: true,
          },
          gamification: {
            enabled: true,
            showLeaderboards: true,
            showPoints: true,
            showAchievements: true,
          },
          defaultView: "meetings",
          autoSave: true,
        },
        stats: {
          level: data.level,
          totalPoints: data.total_points,
          currentStreak: data.current_streak,
          longestStreak: data.longest_streak,
          joinDate: data.join_date,
          lastActive: data.last_active,
          achievements: [],
          stats: {
            objectivesCreated: data.stats?.objectives_created || 0,
            objectivesCompleted: data.stats?.objectives_completed || 0,
            keyResultsAchieved: data.stats?.key_results_achieved || 0,
            checkInsCompleted: data.stats?.check_ins_completed || 0,
            avgConfidenceLevel: data.stats?.avg_confidence_level || 0,
            avgProgressRate: data.stats?.avg_progress_rate || 0,
            totalSessions: data.stats?.total_sessions || 0,
            totalTimeSpent: data.stats?.total_time_spent || 0,
          },
        },
      } as UserProfile;
    } catch (error) {
      console.error("Error loading user profile:", error);
      return null;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const user = await signInWithEmail(email, password);
      if (user) {
        setSuccess("Successfully signed in!");
        const profile = await loadUserProfile(user.id);
        onAuthStateChange(user, profile);
      } else {
        setError("Invalid email or password");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const user = await signUpWithEmail(email, password, {
        username: profileForm.username || email.split("@")[0],
        role: profileForm.role,
        department: profileForm.department,
      });

      if (user) {
        setSuccess(
          "Account created! Please check your email for verification."
        );
        setAuthMode("signin");
      } else {
        setError("Failed to create account");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      setSuccess("Successfully signed out");
      onAuthStateChange(null, null);
    } catch (error) {
      setError("Failed to sign out");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile) return;

    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabase
        .from("user_stats")
        .update({
          username: profileForm.username,
          first_name: profileForm.firstName,
          last_name: profileForm.lastName,
          role: profileForm.role,
          department: profileForm.department,
          team: profileForm.team,
          license_states: profileForm.licenseStates,
          hire_date: profileForm.hireDate,
          avatar: profileForm.avatar,
        })
        .eq("user_id", currentUser.id);

      if (error) {
        throw error;
      }

      const updatedProfile = {
        ...userProfile,
        ...profileForm,
      } as UserProfile;

      onProfileUpdate(updatedProfile);
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "team_lead":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4" />;
      case "manager":
        return <Star className="h-4 w-4" />;
      case "team_lead":
        return <Users className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const usStates = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
  ];

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        {/* Auth Mode Toggle */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setAuthMode("signin")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              authMode === "signin"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setAuthMode("signup")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              authMode === "signup"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Sign Up
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {authMode === "signin" ? (
                <LogIn className="h-5 w-5" />
              ) : (
                <UserPlus className="h-5 w-5" />
              )}
              {authMode === "signin" ? "Sign In" : "Create Account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={authMode === "signin" ? handleSignIn : handleSignUp}
              className="space-y-4"
            >
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up) */}
              {authMode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Additional Fields for Sign Up */}
              {authMode === "signup" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <Input
                      value={profileForm.username}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      placeholder="Choose a username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      value={profileForm.role}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          role: e.target.value as any,
                        }))
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="agent">Agent</option>
                      <option value="team_lead">Team Lead</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <Input
                      value={profileForm.department}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }))
                      }
                      placeholder="e.g., Sales, Operations, Customer Service"
                    />
                  </div>
                </>
              )}

              {/* Error/Success Messages */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  {success}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    {authMode === "signin"
                      ? "Signing In..."
                      : "Creating Account..."}
                  </>
                ) : (
                  <>
                    {authMode === "signin" ? (
                      <LogIn className="h-4 w-4" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    {authMode === "signin" ? "Sign In" : "Create Account"}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is signed in - show profile management
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            User Profile
          </h2>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        <Button
          onClick={handleSignOut}
          variant="outline"
          className="flex items-center gap-2 text-red-600 hover:text-red-700"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1"
            >
              {isEditing ? (
                <X className="h-4 w-4" />
              ) : (
                <Edit className="h-4 w-4" />
              )}
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <Input
                    value={profileForm.username}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    placeholder="Username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    value={currentUser.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <Input
                    value={profileForm.firstName}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    placeholder="First Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <Input
                    value={profileForm.lastName}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    placeholder="Last Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={profileForm.role}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        role: e.target.value as any,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="agent">Agent</option>
                    <option value="team_lead">Team Lead</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <Input
                    value={profileForm.department}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                    placeholder="Department"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team
                  </label>
                  <Input
                    value={profileForm.team}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        team: e.target.value,
                      }))
                    }
                    placeholder="Team Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hire Date
                  </label>
                  <Input
                    type="date"
                    value={profileForm.hireDate}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        hireDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Licensed States
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {usStates.map((state) => (
                    <label key={state} className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={profileForm.licenseStates?.includes(state)}
                        onChange={(e) => {
                          const states = profileForm.licenseStates || [];
                          if (e.target.checked) {
                            setProfileForm((prev) => ({
                              ...prev,
                              licenseStates: [...states, state],
                            }));
                          } else {
                            setProfileForm((prev) => ({
                              ...prev,
                              licenseStates: states.filter((s) => s !== state),
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-xs">{state}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  {success}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Username
                    </label>
                    <p className="text-lg">{userProfile?.username}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-lg">{currentUser.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Full Name
                    </label>
                    <p className="text-lg">
                      {userProfile?.firstName} {userProfile?.lastName}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Role
                    </label>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={getRoleBadgeColor(
                          userProfile?.role || "agent"
                        )}
                      >
                        {getRoleIcon(userProfile?.role || "agent")}
                        {userProfile?.role || "agent"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Department
                    </label>
                    <p className="text-lg flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {userProfile?.department || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Team
                    </label>
                    <p className="text-lg flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {userProfile?.team || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Hire Date
                    </label>
                    <p className="text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {userProfile?.hireDate
                        ? new Date(userProfile.hireDate).toLocaleDateString()
                        : "Not specified"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Licensed States
                    </label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {userProfile?.licenseStates?.length ? (
                        userProfile.licenseStates.map((state) => (
                          <Badge
                            key={state}
                            variant="outline"
                            className="text-xs"
                          >
                            {state}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500">
                          No licenses specified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
