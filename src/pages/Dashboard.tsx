import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Code, Zap, MessageSquare, Bookmark, TrendingUp } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  full_name: string | null;
  interests: string[] | null;
  skill_level: string | null;
  onboarding_completed: boolean;
}

const quickLinks = [
  {
    title: "Browse Tutorials",
    description: "Step-by-step learning paths",
    href: "/tutorials",
    icon: BookOpen,
    color: "text-primary",
  },
  {
    title: "Code Library",
    description: "Ready-to-use code snippets",
    href: "/code-library",
    icon: Code,
    color: "text-accent",
  },
  {
    title: "API Marketplace",
    description: "Test and integrate APIs",
    href: "/apis",
    icon: Zap,
    color: "text-warning",
  },
  {
    title: "Community Chat",
    description: "Connect with other learners",
    href: "/community",
    icon: MessageSquare,
    color: "text-success",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name, interests, skill_level, onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const userName =
    profile?.full_name || user?.user_metadata?.full_name || "Developer";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl md:text-3xl font-semibold text-foreground">
            {getGreeting()}, {userName}! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Ready to continue your learning journey?
          </p>
        </div>

        {/* Onboarding Prompt */}
        {profile && !profile.onboarding_completed && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-foreground">
                  Complete your profile setup
                </p>
                <p className="text-sm text-muted-foreground">
                  Help us personalize your learning experience
                </p>
              </div>
              <Button asChild size="sm">
                <Link to="/onboarding">Complete Setup</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <Card className="h-full hover:shadow-medium transition-shadow cursor-pointer group">
                <CardHeader className="pb-2">
                  <link.icon
                    className={`h-8 w-8 ${link.color} group-hover:scale-110 transition-transform`}
                  />
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Continue Learning */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Continue Learning
              </CardTitle>
              <CardDescription>
                Pick up where you left off
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tutorials in progress yet.</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/tutorials">Browse tutorials</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Saved Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-primary" />
                Saved Items
              </CardTitle>
              <CardDescription>Your bookmarked content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Bookmark className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No saved items yet.</p>
                <p className="text-xs mt-1">
                  Bookmark tutorials, blogs, or code snippets to access them
                  here.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interests Section */}
        {profile?.interests && profile.interests.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Your Interests</CardTitle>
              <CardDescription>
                Content recommendations based on your preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium"
                  >
                    {interest.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
