import { useState } from "react";
import { Check, X, ExternalLink, Send } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePendingPurchases, useMaterialMutations } from "@/hooks/useMaterials";

export default function AdminMaterialPurchases() {
  const { data: purchases = [], isLoading } = usePendingPurchases();
  const { approvePurchase, rejectPurchase } = useMaterialMutations();
  const [selectedPurchase, setSelectedPurchase] = useState<any | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    approved: "bg-green-500/10 text-green-600 dark:text-green-400",
    rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  const pendingCount = purchases.filter((p) => p.status === "pending").length;

  const handleApprove = (purchase: any) => {
    approvePurchase({
      purchaseId: purchase.id,
      userEmail: purchase.user?.email || "",
      materialTitle: purchase.material?.title || "",
      externalLink: purchase.material?.external_link || "",
    });
    setSelectedPurchase(null);
    setAdminNotes("");
  };

  const handleReject = () => {
    if (!selectedPurchase) return;
    rejectPurchase({ purchaseId: selectedPurchase.id, reason: adminNotes });
    setSelectedPurchase(null);
    setRejectDialogOpen(false);
    setAdminNotes("");
  };

  return (
    <AdminLayout title="Material Purchases" description="Manage and approve material purchases">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-3xl text-yellow-500">{pendingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Approved</CardDescription>
              <CardTitle className="text-3xl text-green-500">
                {purchases.filter((p) => p.status === "approved").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Rejected</CardDescription>
              <CardTitle className="text-3xl text-red-500">
                {purchases.filter((p) => p.status === "rejected").length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Purchases Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : purchases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No purchases yet</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{purchase.user?.full_name || "Unknown"}</div>
                          <div className="text-xs text-muted-foreground">{purchase.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {purchase.material?.title || "Unknown"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{purchase.transaction_id}</TableCell>
                      <TableCell>₹{purchase.material?.price || 0}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[purchase.status]}>{purchase.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {purchase.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() => {
                                setSelectedPurchase(purchase);
                                setAdminNotes("");
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              onClick={() => {
                                setSelectedPurchase(purchase);
                                setRejectDialogOpen(true);
                                setAdminNotes("");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {purchase.status === "approved" && purchase.material?.external_link && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(purchase.material?.external_link, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Approve Dialog */}
      <Dialog open={!!selectedPurchase && !rejectDialogOpen} onOpenChange={() => setSelectedPurchase(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Purchase</DialogTitle>
            <DialogDescription>
              Approve this purchase for "{selectedPurchase?.material?.title}"?
              The user will receive an email with access to the resource.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm">
              <p><strong>User:</strong> {selectedPurchase?.user?.full_name}</p>
              <p><strong>Email:</strong> {selectedPurchase?.user?.email}</p>
              <p><strong>Transaction ID:</strong> {selectedPurchase?.transaction_id}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPurchase(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedPurchase && handleApprove(selectedPurchase)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Approve & Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Purchase</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this purchase?
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection (optional)"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
