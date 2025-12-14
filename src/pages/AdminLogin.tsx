import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";

// Set this to false to hide signup option
const ALLOW_ADMIN_SIGNUP = false;

export default function AdminLogin() {
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Check if already logged in and has admin role
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!authLoading && user) {
        setCheckingRole(true);
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!error && data && (data.role === "admin" || data.role === "super_admin")) {
          navigate("/admin");
        }
        setCheckingRole(false);
      }
    };

    checkAdminAccess();
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp && !fullName) {
      toast({
        title: "Error",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Handle signup
        const { error } = await signUp(email, password, fullName);

        if (error) {
          toast({
            title: "Signup Failed",
            description: error.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        toast({
          title: "Account Created",
          description: "Please contact the administrator to get admin access.",
        });
        setIsSignUp(false);
        setLoading(false);
        return;
      }

      // Handle login
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // After successful login, check admin role
      const { data: { user: loggedInUser } } = await supabase.auth.getUser();
      
      if (loggedInUser) {
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", loggedInUser.id)
          .maybeSingle();

        if (roleError || !roleData || (roleData.role !== "admin" && roleData.role !== "super_admin")) {
          // Sign out if not admin
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "This account doesn't have admin privileges.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        toast({
          title: "Welcome Admin",
          description: "Redirecting to admin panel...",
        });
        navigate("/admin");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {isSignUp ? "Admin Registration" : "Admin Access"}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              {isSignUp ? "Create an admin account" : "Authorized personnel only"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-11"
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? "Creating Account..." : "Authenticating..."}
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  {isSignUp ? "Create Admin Account" : "Sign In as Admin"}
                </>
              )}
            </Button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          {ALLOW_ADMIN_SIGNUP && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isSignUp ? (
                  <>Already have an account? <span className="text-primary font-medium">Sign In</span></>
                ) : (
                  <>Need an account? <span className="text-primary font-medium">Sign Up</span></>
                )}
              </button>
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            This is a restricted area. Unauthorized access attempts are logged.
          </p>
        </div>
      </div>
    </div>
  );
}
