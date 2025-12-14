import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Video, Image, Palette, Smartphone, Package, Lock, ExternalLink, CreditCard, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMaterials, useUserPurchases, useMaterialMutations, MaterialCategory, Material, fetchMaterialPaymentDetails } from "@/hooks/useMaterials";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Validation schema for transaction ID
const transactionIdSchema = z.string()
  .min(5, "Transaction ID must be at least 5 characters")
  .max(50, "Transaction ID must be less than 50 characters")
  .regex(/^[A-Z0-9]+$/i, "Transaction ID must be alphanumeric");
const categoryIcons: Record<MaterialCategory, React.ReactNode> = {
  editing: <Palette className="h-5 w-5" />,
  video: <Video className="h-5 w-5" />,
  graphics: <Image className="h-5 w-5" />,
  apps: <Smartphone className="h-5 w-5" />,
  other: <Package className="h-5 w-5" />,
};

const categoryLabels: Record<MaterialCategory, string> = {
  editing: "Editing Tools",
  video: "Video Resources",
  graphics: "Graphics Design",
  apps: "Apps & Software",
  other: "Other Resources",
};

export default function Materials() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | "all">("all");
  const [purchaseModal, setPurchaseModal] = useState<Material | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [paymentDetails, setPaymentDetails] = useState<{ upi_id: string | null; qr_code_url: string | null } | null>(null);
  const [loadingPaymentDetails, setLoadingPaymentDetails] = useState(false);

  // Fetch payment details only when purchase modal opens
  useEffect(() => {
    if (purchaseModal && user) {
      setLoadingPaymentDetails(true);
      fetchMaterialPaymentDetails(purchaseModal.id)
        .then(details => {
          setPaymentDetails(details);
        })
        .finally(() => {
          setLoadingPaymentDetails(false);
        });
    } else {
      setPaymentDetails(null);
    }
  }, [purchaseModal, user]);

  const { data: materials = [], isLoading } = useMaterials(selectedCategory === "all" ? undefined : selectedCategory);
  const { data: purchases = [] } = useUserPurchases();
  const { submitPurchase, isSubmitting } = useMaterialMutations();

  const isPurchased = (materialId: string) => {
    return purchases.some(p => p.material_id === materialId && p.status === "approved");
  };

  const isPending = (materialId: string) => {
    return purchases.some(p => p.material_id === materialId && p.status === "pending");
  };

  const { toast } = useToast();

  const handlePurchase = () => {
    if (!purchaseModal) return;
    
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
    
    submitPurchase({ materialId: purchaseModal.id, transactionId: validation.data });
    setPurchaseModal(null);
    setTransactionId("");
  };

  const handleAccessMaterial = (material: Material) => {
    if (!material.is_paid || isPurchased(material.id)) {
      window.open(material.external_link, "_blank");
    } else if (isPending(material.id)) {
      // Already pending
    } else {
      setPurchaseModal(material);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl lg:text-5xl font-heading font-bold mb-4">
            <span className="text-gradient">Materials & Resources</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Premium and free resources for editing, video production, graphics design, and more.
          </p>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as MaterialCategory | "all")} className="mb-8">
          <TabsList className="flex flex-wrap justify-center gap-2 bg-transparent h-auto p-0">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6"
            >
              All Resources
            </TabsTrigger>
            {(Object.keys(categoryLabels) as MaterialCategory[]).map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-6 flex items-center gap-2"
              >
                {categoryIcons[cat]}
                {categoryLabels[cat]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Materials Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading materials...</div>
        ) : materials.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No materials available in this category yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material, index) => (
              <Card 
                key={material.id} 
                className="glass border-border/50 card-hover overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {material.thumbnail_url && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={material.thumbnail_url}
                      alt={material.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {categoryIcons[material.category as MaterialCategory]}
                      {categoryLabels[material.category as MaterialCategory]}
                    </Badge>
                    {material.is_paid ? (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                        ₹{material.price}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-500 border-green-500">
                        Free
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{material.title}</CardTitle>
                  {material.description && (
                    <CardDescription className="line-clamp-2">{material.description}</CardDescription>
                  )}
                </CardHeader>
                <CardFooter>
                  {!user && material.is_paid ? (
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/auth">Sign in to Purchase</Link>
                    </Button>
                  ) : isPurchased(material.id) || !material.is_paid ? (
                    <Button className="w-full glow" onClick={() => handleAccessMaterial(material)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Access Resource
                    </Button>
                  ) : isPending(material.id) ? (
                    <Button variant="secondary" className="w-full" disabled>
                      <Lock className="h-4 w-4 mr-2" />
                      Payment Pending Approval
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => setPurchaseModal(material)}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Purchase Now
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Purchase Modal */}
        <Dialog open={!!purchaseModal} onOpenChange={() => setPurchaseModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Purchase {purchaseModal?.title}</DialogTitle>
              <DialogDescription>
                Complete the payment and enter your transaction ID for verification.
              </DialogDescription>
            </DialogHeader>

            {purchaseModal && (
              <div className="space-y-6">
                <div className="text-center p-6 bg-muted rounded-lg">
                  <p className="text-3xl font-bold text-primary mb-2">₹{purchaseModal.price}</p>
                  
                  {loadingPaymentDetails ? (
                    <div className="mt-4 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Loading payment details...</span>
                    </div>
                  ) : (
                    <>
                      {paymentDetails?.upi_id && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground mb-2">Pay via UPI:</p>
                          <p className="font-mono text-lg bg-background px-4 py-2 rounded inline-block">
                            {paymentDetails.upi_id}
                          </p>
                        </div>
                      )}

                      {paymentDetails?.qr_code_url && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground mb-2">Or scan QR code:</p>
                          <img
                            src={paymentDetails.qr_code_url}
                            alt="Payment QR Code"
                            className="mx-auto w-48 h-48 rounded-lg border"
                          />
                        </div>
                      )}
                    </>
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
                    After payment, enter your transaction ID. We'll verify and send you the access link via email.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setPurchaseModal(null)}>
                Cancel
              </Button>
              <Button onClick={handlePurchase} disabled={!transactionId.trim() || isSubmitting}>
                Submit Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
