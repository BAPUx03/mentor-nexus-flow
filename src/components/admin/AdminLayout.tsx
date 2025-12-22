import { ReactNode, useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  Code2, 
  Users, 
  Settings,
  ChevronLeft,
  Menu,
  X,
  BarChart3,
  MessageCircle,
  Package,
  Shield,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Blog Posts", href: "/admin/blogs", icon: FileText },
  { name: "Tutorials", href: "/admin/tutorials", icon: BookOpen },
  { name: "Tutorial Purchases", href: "/admin/tutorial-purchases", icon: CreditCard },
  { name: "Code Snippets", href: "/admin/snippets", icon: Code2 },
  { name: "Materials", href: "/admin/materials", icon: Package },
  { name: "Material Purchases", href: "/admin/material-purchases", icon: CreditCard },
  { name: "Community", href: "/admin/community", icon: MessageCircle },
  { name: "Users", href: "/admin/users", icon: Users, adminOnly: true },
];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isSuperAdmin, loading: roleLoading } = useUserRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const isActive = (href: string) => {
    if (href === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(href);
  };

  const NavLinks = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      {navigation.map((item) => {
        // Hide admin-only items for non-admin users
        if (item.adminOnly && !isAdmin && !isSuperAdmin) {
          return null;
        }

        const active = isActive(item.href);

        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border hidden lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading font-bold text-sm">
              DL
            </div>
            <span className="font-heading font-semibold text-lg text-foreground">
              Admin
            </span>
          </Link>
          {(isAdmin || isSuperAdmin) && (
            <Shield className="h-4 w-4 text-orange-500 ml-auto" />
          )}
        </div>

        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-1">
            <NavLinks />
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link to="/dashboard">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to App
            </Link>
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 h-14 bg-card border-b border-border flex items-center px-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <span className="font-heading font-semibold">Admin Panel</span>
        <Link to="/dashboard" className="ml-auto">
          <ChevronLeft className="h-5 w-5" />
        </Link>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-14 z-30 bg-background">
          <ScrollArea className="h-full p-4">
            <nav className="space-y-1">
              <NavLinks onItemClick={() => setMobileMenuOpen(false)} />
            </nav>
            <div className="mt-6 pt-4 border-t border-border">
              <Button variant="outline" asChild className="w-full">
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to App
                </Link>
              </Button>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:pl-64">
        {/* Page Header */}
        <div className="border-b border-border bg-card">
          <div className="px-4 md:px-6 py-4 md:py-6">
            <h1 className="text-xl md:text-2xl font-heading font-bold text-foreground">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
