import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/contexts/AuthContext";

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-90" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20 text-primary-foreground font-heading font-bold text-xl">
              DL
            </div>
            <span className="font-heading font-bold text-2xl text-primary-foreground">
              DevLearn
            </span>
          </div>
          <h1 className="font-heading text-4xl xl:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
            Level up your
            <br />
            development skills
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Join thousands of developers learning through tutorials, code
            examples, and a supportive community.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div>
              <p className="text-3xl font-bold text-primary-foreground">10K+</p>
              <p className="text-sm text-primary-foreground/70">Learners</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">500+</p>
              <p className="text-sm text-primary-foreground/70">Tutorials</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-foreground">50+</p>
              <p className="text-sm text-primary-foreground/70">APIs</p>
            </div>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary-foreground/10 rounded-full blur-3xl" />
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading font-bold">
              DL
            </div>
            <span className="font-heading font-semibold text-xl text-foreground">
              DevLearn
            </span>
          </div>
          <div className="text-center mb-8">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Welcome
            </h2>
            <p className="text-muted-foreground mt-2">
              Sign in to your account or create a new one
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
