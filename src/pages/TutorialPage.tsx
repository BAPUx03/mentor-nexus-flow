import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, User, ChevronRight, Bookmark, BookmarkCheck, CheckCircle2, ExternalLink, Lock, CreditCard, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CommentSection } from "@/components/comments/CommentSection";
import { cn } from "@/lib/utils";
import { useTutorial } from "@/hooks/useTutorials";
import { useSavedItems } from "@/hooks/useSavedItems";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const transactionIdSchema = z.string()
  .min(5, "Transaction ID must be at least 5 characters")
  .max(50, "Transaction ID must be less than 50 characters")
  .regex(/^[A-Z0-9]+$/i, "Transaction ID must be alphanumeric");

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-600 dark:text-green-400",
  intermediate: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  advanced: "bg-red-500/10 text-red-600 dark:text-red-400",
};

interface TutorialPurchase {
  id: string;
  user_id: string;
  tutorial_id: string;
  status: string;
  transaction_id: string;
}

export default function TutorialPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: tutorial, isLoading } = useTutorial(slug || "");
  const { user } = useAuth();
  const { saveItem, unsaveItem, isItemSaved } = useSavedItems();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [purchaseModal, setPurchaseModal] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchases, setPurchases] = useState<TutorialPurchase[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  const isSaved = tutorial ? isItemSaved(tutorial.id, "tutorial") : false;

  // Fetch user's tutorial purchases
  useEffect(() => {
    if (user && tutorial) {
      setLoadingPurchases(true);
      // Using type assertion since the table was just created and types not regenerated
      (supabase.from("tutorial_purchases" as any) as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("tutorial_id", tutorial.id)
        .then(({ data }: { data: TutorialPurchase[] | null }) => {
          setPurchases(data || []);
          setLoadingPurchases(false);
        });
    }
  }, [user, tutorial]);

  const isPurchased = purchases.some(p => p.status === "approved");
  const isPending = purchases.some(p => p.status === "pending");

  const handleSaveToggle = async () => {
    if (!tutorial) return;
    if (isSaved) {
      await unsaveItem(tutorial.id, "tutorial");
    } else {
      await saveItem(tutorial.id, "tutorial");
    }
  };

  const handleAccessLink = () => {
    if (!tutorial?.external_link) return;
    
    if (!tutorial.is_paid || isPurchased) {
      window.open(tutorial.external_link, "_blank");
    } else if (isPending) {
      toast({
        title: "Payment Pending",
        description: "Your payment is being reviewed. You'll get access once approved.",
      });
    } else {
      setPurchaseModal(true);
    }
  };

  const handlePurchase = async () => {
    if (!tutorial || !user) return;
    
    const trimmedId = transactionId.trim();
    const validation = transactionIdSchema.safeParse(trimmedId);
    
    if (!validation.success) {
      toast({
        title: "Invalid Transaction ID",
        description: validation.error.errors[0].message,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Using type assertion since the table was just created and types not regenerated
      const { error } = await (supabase.from("tutorial_purchases" as any) as any)
        .insert({
          user_id: user.id,
          tutorial_id: tutorial.id,
          transaction_id: validation.data,
          status: "pending"
        });

      if (error) throw error;

      toast({
        title: "Payment Submitted",
        description: "Your payment is being reviewed. You'll receive access once approved.",
      });
      setPurchaseModal(false);
      setTransactionId("");
      // Refresh purchases
      const { data } = await (supabase.from("tutorial_purchases" as any) as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("tutorial_id", tutorial.id);
      setPurchases((data as TutorialPurchase[]) || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
        </div>
      </Layout>
    );
  }

  if (!tutorial) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-heading font-bold mb-4">Tutorial not found</h1>
          <Button asChild>
            <Link to="/tutorials">Back to Tutorials</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const steps = tutorial.steps || [];
  const activeStep = steps[currentStep];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Back Link */}
        <Link
          to="/tutorials"
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tutorials
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Badge className={difficultyColors[tutorial.difficulty]}>
              {tutorial.difficulty}
            </Badge>
            <span className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              {tutorial.estimated_minutes} min
            </span>
            {steps.length > 0 && (
              <span className="text-sm text-muted-foreground">
                • {steps.length} steps
              </span>
            )}
            {tutorial.is_paid ? (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                ₹{tutorial.price}
              </Badge>
            ) : tutorial.external_link && (
              <Badge variant="outline" className="text-green-500 border-green-500">
                Free
              </Badge>
            )}
          </div>

          <h1 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            {tutorial.title}
          </h1>

          {tutorial.description && (
            <p className="text-xl text-muted-foreground mb-6">{tutorial.description}</p>
          )}

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={tutorial.author?.avatar_url || undefined} />
                <AvatarFallback>
                  {tutorial.author?.full_name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{tutorial.author?.full_name || "Anonymous"}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* External Link Button */}
              {tutorial.external_link && (
                <>
                  {!user && tutorial.is_paid ? (
                    <Button asChild variant="outline">
                      <Link to="/auth">Sign in to Purchase</Link>
                    </Button>
                  ) : isPurchased || !tutorial.is_paid ? (
                    <Button onClick={handleAccessLink} className="glow">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Access Resource
                    </Button>
                  ) : isPending ? (
                    <Button variant="secondary" disabled>
                      <Lock className="h-4 w-4 mr-2" />
                      Payment Pending
                    </Button>
                  ) : (
                    <Button onClick={handleAccessLink}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Purchase Access
                    </Button>
                  )}
                </>
              )}

              {user && (
                <Button variant="outline" onClick={handleSaveToggle}>
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="h-4 w-4 mr-2 text-primary" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </header>

        {steps.length > 0 ? (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Steps Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-base">Tutorial Steps</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1 p-2">
                    {steps.map((step, index) => (
                      <button
                        key={step.id}
                        onClick={() => setCurrentStep(index)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                          currentStep === index
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                        <span className="truncate">{step.title}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Step Content */}
            <div className="lg:col-span-3">
              {activeStep && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      Step {currentStep + 1} of {steps.length}
                    </div>
                    <CardTitle className="text-2xl">{activeStep.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="prose dark:prose-invert max-w-none">
                      {activeStep.content.split("\n").map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>

                    {activeStep.code_example && (
                      <div className="relative">
                        <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
                          <code className="text-sm font-mono">{activeStep.code_example}</code>
                        </pre>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between pt-6 border-t border-border">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(currentStep - 1)}
                        disabled={currentStep === 0}
                      >
                        Previous
                      </Button>
                      {currentStep < steps.length - 1 ? (
                        <Button onClick={() => setCurrentStep(currentStep + 1)}>
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      ) : (
                        <Button className="bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                This tutorial doesn't have any steps yet.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Comments Section */}
        <CommentSection contentType="tutorial" contentId={tutorial.id} />
      </div>

      {/* Purchase Modal */}
      <Dialog open={purchaseModal} onOpenChange={setPurchaseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase {tutorial.title}</DialogTitle>
            <DialogDescription>
              Complete the payment and enter your transaction ID for verification.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="text-center p-6 bg-muted rounded-lg">
              <p className="text-3xl font-bold text-primary mb-2">₹{tutorial.price}</p>
              
              {tutorial.upi_id && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Pay via UPI:</p>
                  <p className="font-mono text-lg bg-background px-4 py-2 rounded inline-block">
                    {tutorial.upi_id}
                  </p>
                </div>
              )}

              {tutorial.qr_code_url && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Or scan QR code:</p>
                  <img
                    src={tutorial.qr_code_url}
                    alt="Payment QR Code"
                    className="mx-auto w-48 h-48 rounded-lg border"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionId">Transaction ID / UTR Number</Label>
              <Input
                id="transactionId"
                placeholder="Enter your payment transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                After payment, enter your transaction ID. We'll verify and grant you access.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPurchaseModal(false)}>
              Cancel
            </Button>
            <Button onClick={handlePurchase} disabled={!transactionId.trim() || isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}