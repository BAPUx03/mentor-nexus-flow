import { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Clock, CheckCircle2, XCircle, Loader2, Package, BookOpen } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserPurchases } from "@/hooks/useMaterials";
import { useUserTutorialPurchases } from "@/hooks/useTutorials";
import { format } from "date-fns";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    variant: "secondary" as const,
    color: "text-yellow-500",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    variant: "default" as const,
    color: "text-green-500",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    variant: "destructive" as const,
    color: "text-destructive",
  },
};

export default function MyPurchases() {
  const [activeTab, setActiveTab] = useState("all");
  const { data: materialPurchases = [], isLoading: loadingMaterials } = useUserPurchases();
  const { data: tutorialPurchases = [], isLoading: loadingTutorials } = useUserTutorialPurchases();

  const isLoading = loadingMaterials || loadingTutorials;

  // Combine and sort all purchases
  const allPurchases = [
    ...materialPurchases.map(p => ({ ...p, type: "material" as const, title: p.material?.title, link: p.material?.external_link })),
    ...tutorialPurchases.map(p => ({ ...p, type: "tutorial" as const, title: p.tutorial?.title, link: p.tutorial?.external_link })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filteredPurchases = activeTab === "all" 
    ? allPurchases 
    : allPurchases.filter(p => p.type === activeTab);

  const approvedCount = allPurchases.filter(p => p.status === "approved").length;
  const pendingCount = allPurchases.filter(p => p.status === "pending").length;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-heading font-bold mb-2">
            <span className="text-gradient">My Purchases</span>
          </h1>
          <p className="text-muted-foreground">
            View and access your purchased materials and tutorials.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Purchases</p>
              <p className="text-2xl font-bold">{allPurchases.length}</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-green-500">{approvedCount}</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Materials</p>
              <p className="text-2xl font-bold">{materialPurchases.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All ({allPurchases.length})</TabsTrigger>
            <TabsTrigger value="tutorial">
              <BookOpen className="h-4 w-4 mr-1" />
              Tutorials ({tutorialPurchases.length})
            </TabsTrigger>
            <TabsTrigger value="material">
              <Package className="h-4 w-4 mr-1" />
              Materials ({materialPurchases.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Purchases List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : filteredPurchases.length === 0 ? (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
              <p className="text-muted-foreground mb-4">
                Browse our materials and tutorials to get started.
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild variant="outline">
                  <Link to="/materials">Browse Materials</Link>
                </Button>
                <Button asChild>
                  <Link to="/tutorials">Browse Tutorials</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPurchases.map((purchase, index) => {
              const status = statusConfig[purchase.status as keyof typeof statusConfig];
              const StatusIcon = status.icon;

              return (
                <Card 
                  key={purchase.id} 
                  className="glass card-hover animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {purchase.type === "tutorial" ? (
                            <BookOpen className="h-4 w-4 text-primary" />
                          ) : (
                            <Package className="h-4 w-4 text-primary" />
                          )}
                          <Badge variant="outline" className="capitalize">
                            {purchase.type}
                          </Badge>
                          <Badge variant={status.variant}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold">{purchase.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Purchased on {format(new Date(purchase.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Transaction ID: <span className="font-mono">{purchase.transaction_id}</span>
                        </p>
                        {purchase.status === "rejected" && purchase.admin_notes && (
                          <p className="text-sm text-destructive mt-2">
                            Reason: {purchase.admin_notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {purchase.status === "approved" && purchase.link ? (
                          <Button onClick={() => window.open(purchase.link, "_blank")}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Access Resource
                          </Button>
                        ) : purchase.status === "pending" ? (
                          <Button variant="secondary" disabled>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Awaiting Approval
                          </Button>
                        ) : purchase.status === "rejected" ? (
                          <Button variant="outline" asChild>
                            <Link to={purchase.type === "tutorial" ? "/tutorials" : "/materials"}>
                              Try Again
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
