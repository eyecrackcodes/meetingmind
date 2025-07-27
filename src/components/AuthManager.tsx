import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";
import {
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  AlertCircle,
  RefreshCw,
  Mail,
  Lock,
  User,
  Building,
  Users as UsersIcon,
  Calendar,
  LogOut,
} from "lucide-react";
import {
  UserProfile,
  UserApprovalRequest,
  UserApprovalAction,
  ApprovalHistory,
} from "@/types";
import { supabase } from "@/lib/supabase";

interface AuthManagerProps {
  currentUser: any;
  userProfile: UserProfile | null;
  onAuthStateChange: (user: any) => void;
  onProfileUpdate: (profile: UserProfile) => void;
}

type AuthView =
  | "login"
  | "signup"
  | "pending"
  | "approved"
  | "admin"
  | "profile";

interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  username: string;
  department: string;
  team: string;
  requestedRole: "agent" | "team_lead" | "manager";
}

interface LoginData {
  email: string;
  password: string;
}

export function AuthManager({
  currentUser,
  userProfile,
  onAuthStateChange,
  onProfileUpdate: _onProfileUpdate,
}: AuthManagerProps) {
  const [currentView, setCurrentView] = useState<AuthView>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<UserApprovalRequest[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([]);

  const [signupData, setSignupData] = useState<SignupData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    username: "",
    department: "",
    team: "",
    requestedRole: "agent",
  });

  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });

  // Check auth state and determine view
  useEffect(() => {
    if (!currentUser) {
      setCurrentView("login");
    } else if (!userProfile) {
      setCurrentView("pending");
    } else {
      switch (userProfile.approvalStatus) {
        case "pending":
          setCurrentView("pending");
          break;
        case "approved":
          setCurrentView(userProfile.role === "admin" ? "admin" : "approved");
          break;
        case "rejected":
        case "suspended":
          setCurrentView("pending");
          break;
        default:
          setCurrentView("pending");
      }
    }
  }, [currentUser, userProfile]);

  // Load admin data
  useEffect(() => {
    if (currentView === "admin" && userProfile?.role === "admin") {
      loadPendingUsers();
      loadApprovalHistory();
    }
  }, [currentView, userProfile?.role]);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const validateSignupData = () => {
    if (!signupData.email || !validateEmail(signupData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!signupData.password || signupData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!signupData.firstName || !signupData.lastName) {
      setError("First and last name are required");
      return false;
    }
    if (!signupData.username) {
      setError("Username is required");
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    clearMessages();
    if (!validateSignupData()) return;

    setLoading(true);
    try {
      // Sign up with Supabase Auth
      const { data, error: signupError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            username: signupData.username,
            first_name: signupData.firstName,
            last_name: signupData.lastName,
            department: signupData.department,
            team: signupData.team,
            requested_role: signupData.requestedRole,
          },
        },
      });

      if (signupError) throw signupError;

      if (data.user) {
        setSuccess(
          "Account created successfully! Please check your email to verify your account, then wait for admin approval."
        );
        onAuthStateChange(data.user);
        setCurrentView("pending");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    clearMessages();
    if (!loginData.email || !loginData.password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: loginData.email,
          password: loginData.password,
        });

      if (loginError) throw loginError;

      if (data.user) {
        onAuthStateChange(data.user);
        setSuccess("Logged in successfully!");
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      onAuthStateChange(null);
      setCurrentView("login");
      clearMessages();
    } catch (err: any) {
      setError("Failed to log out");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("user_stats")
        .select(
          `
          user_id,
          email,
          username,
          first_name,
          last_name,
          department,
          team,
          role,
          approval_status,
          created_at
        `
        )
        .eq("approval_status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const requests: UserApprovalRequest[] = data.map((user) => ({
        id: user.user_id,
        userId: user.user_id,
        email: user.email || "",
        username: user.username,
        firstName: user.first_name || undefined,
        lastName: user.last_name || undefined,
        department: user.department || undefined,
        team: user.team || undefined,
        requestedRole: user.role as any,
        submittedAt: user.created_at,
        status: user.approval_status as any,
      }));

      setPendingUsers(requests);
    } catch (err: any) {
      setError("Failed to load pending users");
    }
  };

  const loadApprovalHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("user_approval_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      const history: ApprovalHistory[] = data.map((record) => ({
        id: record.id,
        userId: record.user_id,
        action: record.action as any,
        performedBy: record.performed_by || undefined,
        reason: record.reason || undefined,
        notes: record.notes || undefined,
        metadata: record.metadata as any,
        createdAt: record.created_at,
      }));

      setApprovalHistory(history);
    } catch (err: any) {
      setError("Failed to load approval history");
    }
  };

  const handleUserApproval = async (action: UserApprovalAction) => {
    clearMessages();
    setLoading(true);

    try {
      const updates: any = {
        approval_status:
          action.action === "approve"
            ? "approved"
            : action.action === "reject"
            ? "rejected"
            : action.action,
        approved_by: currentUser?.id,
        approval_notes: action.notes,
      };

      if (action.action === "reject") {
        updates.rejection_reason = action.reason;
      }

      if (action.newRole && action.action === "approve") {
        updates.role = action.newRole;
      }

      const { error } = await supabase
        .from("user_stats")
        .update(updates)
        .eq("user_id", action.userId);

      if (error) throw error;

      setSuccess(`User ${action.action}d successfully`);
      loadPendingUsers();
      loadApprovalHistory();
    } catch (err: any) {
      setError(`Failed to ${action.action} user`);
    } finally {
      setLoading(false);
    }
  };

  const renderLogin = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
          <LogIn className="h-6 w-6" />
          Welcome Back
        </CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Sign in to your MeetingMind account
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {success}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="your@email.com"
              className="pl-10"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              className="pl-10 pr-10"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Button onClick={handleLogin} disabled={loading} className="w-full">
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <LogIn className="h-4 w-4 mr-2" />
          )}
          Sign In
        </Button>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setCurrentView("signup")}
            className="text-sm"
          >
            Don't have an account? Sign up
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderSignup = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
          <UserPlus className="h-6 w-6" />
          Request Account
        </CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Create your account and wait for admin approval
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">First Name</label>
            <Input
              placeholder="John"
              value={signupData.firstName}
              onChange={(e) =>
                setSignupData({ ...signupData, firstName: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Last Name</label>
            <Input
              placeholder="Doe"
              value={signupData.lastName}
              onChange={(e) =>
                setSignupData({ ...signupData, lastName: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Username</label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="johndoe"
              className="pl-10"
              value={signupData.username}
              onChange={(e) =>
                setSignupData({ ...signupData, username: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="john.doe@company.com"
              className="pl-10"
              value={signupData.email}
              onChange={(e) =>
                setSignupData({ ...signupData, email: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Sales"
                className="pl-10"
                value={signupData.department}
                onChange={(e) =>
                  setSignupData({ ...signupData, department: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Team</label>
            <div className="relative">
              <UsersIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Team Alpha"
                className="pl-10"
                value={signupData.team}
                onChange={(e) =>
                  setSignupData({ ...signupData, team: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Requested Role</label>
          <select
            className="w-full p-2 border border-input rounded-md bg-background"
            value={signupData.requestedRole}
            onChange={(e) =>
              setSignupData({
                ...signupData,
                requestedRole: e.target.value as any,
              })
            }
          >
            <option value="agent">Agent</option>
            <option value="team_lead">Team Lead</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Choose a strong password"
              className="pl-10 pr-10"
              value={signupData.password}
              onChange={(e) =>
                setSignupData({ ...signupData, password: e.target.value })
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Confirm your password"
              className="pl-10"
              value={signupData.confirmPassword}
              onChange={(e) =>
                setSignupData({
                  ...signupData,
                  confirmPassword: e.target.value,
                })
              }
            />
          </div>
        </div>

        <Button onClick={handleSignup} disabled={loading} className="w-full">
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <UserPlus className="h-4 w-4 mr-2" />
          )}
          Request Account
        </Button>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setCurrentView("login")}
            className="text-sm"
          >
            Already have an account? Sign in
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderPending = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
          <Clock className="h-6 w-6 text-yellow-500" />
          Approval Pending
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-4">
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-300"
          >
            Waiting for Approval
          </Badge>

          {userProfile?.approvalStatus === "rejected" ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your account request was rejected.
              </p>
              {userProfile.rejectionReason && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  <strong>Reason:</strong> {userProfile.rejectionReason}
                </div>
              )}
            </div>
          ) : userProfile?.approvalStatus === "suspended" ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your account has been suspended.
              </p>
              {userProfile.rejectionReason && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  <strong>Reason:</strong> {userProfile.rejectionReason}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your account request is being reviewed by an administrator. You
              will receive an email notification once your account is approved.
            </p>
          )}

          <div className="pt-4 border-t">
            <Button variant="outline" onClick={handleLogout} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderApproved = () => (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-2 text-green-600">
        <CheckCircle className="h-6 w-6" />
        <h2 className="text-xl font-semibold">Access Approved!</h2>
      </div>
      <p className="text-muted-foreground">
        Welcome to MeetingMind! You now have full access to the application.
      </p>
      <Button onClick={() => setCurrentView("profile")}>View My Profile</Button>
    </div>
  );

  const renderAdmin = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          User Management
        </h2>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Pending Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Approvals ({pendingUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No pending user requests
            </p>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">
                        {user.firstName} {user.lastName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {user.email} • @{user.username}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {user.requestedRole.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Department:</strong> {user.department || "N/A"}
                    </div>
                    <div>
                      <strong>Team:</strong> {user.team || "N/A"}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleUserApproval({
                          userId: user.userId,
                          action: "approve",
                          newRole: user.requestedRole,
                          notes: "Approved by admin",
                        })
                      }
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        handleUserApproval({
                          userId: user.userId,
                          action: "reject",
                          reason: "Access denied",
                          notes: "Rejected by admin",
                        })
                      }
                      disabled={loading}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Approval History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvalHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No recent activity
            </p>
          ) : (
            <div className="space-y-3">
              {approvalHistory.slice(0, 10).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-medium">User {record.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      record.action === "approved"
                        ? "default"
                        : record.action === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {record.action}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderProfile = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <User className="h-6 w-6" />
          My Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {userProfile && (
          <div className="space-y-3">
            <div className="text-center">
              <h3 className="font-semibold">
                {userProfile.firstName} {userProfile.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                @{userProfile.username}
              </p>
              <Badge className="mt-2">
                {userProfile.role.replace("_", " ")}
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <strong>Email:</strong> {userProfile.email}
              </div>
              <div>
                <strong>Department:</strong> {userProfile.department || "N/A"}
              </div>
              <div>
                <strong>Team:</strong> {userProfile.team || "N/A"}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <Badge
                  variant={
                    userProfile.approvalStatus === "approved"
                      ? "default"
                      : "secondary"
                  }
                >
                  {userProfile.approvalStatus}
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              {userProfile.role === "admin" && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentView("admin")}
                  className="w-full"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Panel
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Main render logic
  switch (currentView) {
    case "login":
      return renderLogin();
    case "signup":
      return renderSignup();
    case "pending":
      return renderPending();
    case "approved":
      return renderApproved();
    case "admin":
      return renderAdmin();
    case "profile":
      return renderProfile();
    default:
      return renderLogin();
  }
}
