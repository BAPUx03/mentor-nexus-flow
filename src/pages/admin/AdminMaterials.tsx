import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Check, X } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useAdminMaterials, usePendingPurchases, useMaterialMutations, MaterialCategory } from "@/hooks/useMaterials";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const categories: MaterialCategory[] = ["editing", "video", "graphics", "apps", "other"];

interface MaterialForm {
  title: string;
  description: string;
  category: MaterialCategory;
  external_link: string;
  thumbnail_url: string;
  is_paid: boolean;
  price: number;
  upi_id: string;
  qr_code_url: string;
  published: boolean;
}

// Fixed payment details
const FIXED_UPI_ID = "makwanabapu@fam";
const FIXED_QR_CODE_URL = "/images/payment-qr.jpg";

const defaultForm: MaterialForm = {
  title: "",
  description: "",
  category: "other",
  external_link: "",
  thumbnail_url: "",
  is_paid: false,
  price: 0,
  upi_id: FIXED_UPI_ID,
  qr_code_url: FIXED_QR_CODE_URL,
  published: false,
};

export default function AdminMaterials() {
  const { user } = useAuth();
  const { data: materials = [], isLoading } = useAdminMaterials();
  const { data: purchases = [] } = usePendingPurchases();
  const { createMaterial, updateMaterial, deleteMaterial, approvePurchase, rejectPurchase } = useMaterialMutations();

  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MaterialForm>(defaultForm);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const handleEdit = (material: any) => {
    setEditingId(material.id);
    setForm({
      title: material.title,
      description: material.description || "",
      category: material.category,
      external_link: material.external_link,
      thumbnail_url: material.thumbnail_url || "",
      is_paid: material.is_paid,
      price: material.price || 0,
      upi_id: material.upi_id || "",
      qr_code_url: material.qr_code_url || "",
      published: material.published,
    });
    setShowEditor(true);
  };

  const handleSave = () => {
    if (!user) return;
    
    if (editingId) {
      updateMaterial({ id: editingId, ...form });
    } else {
      createMaterial({ ...form, author_id: user.id });
    }
    setShowEditor(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  const handleApprove = (purchase: any) => {
    approvePurchase({
      purchaseId: purchase.id,
      userEmail: purchase.user?.email || "",
      materialTitle: purchase.material?.title || "",
      externalLink: purchase.material?.external_link || "",
    });
  };

  const handleReject = () => {
    if (!rejectingId) return;
    rejectPurchase({ purchaseId: rejectingId, reason: rejectReason });
    setRejectingId(null);
    setRejectReason("");
  };

  const pendingPurchases = purchases.filter(p => p.status === "pending");

  return (
    <AdminLayout title="Materials & Payments" description="Manage resources and verify payments">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => { setShowEditor(true); setEditingId(null); setForm(defaultForm); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </div>

        <Tabs defaultValue="materials">
          <TabsList>
            <TabsTrigger value="materials">Materials ({materials.length})</TabsTrigger>
            <TabsTrigger value="payments" className="relative">
              Pending Payments
              {pendingPurchases.length > 0 && (
                <Badge className="ml-2 bg-destructive text-destructive-foreground">
                  {pendingPurchases.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Materials Tab */}
          <TabsContent value="materials">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.title}</TableCell>
                      <TableCell className="capitalize">{material.category}</TableCell>
                      <TableCell>
                        {material.is_paid ? `₹${material.price}` : "Free"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={material.published ? "default" : "secondary"}>
                          {material.published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(material)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateMaterial({ id: material.id, published: !material.published })}
                        >
                          {material.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => deleteMaterial(material.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{purchase.user?.full_name || "Unknown"}</p>
                          <p className="text-sm text-muted-foreground">{purchase.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{purchase.material?.title}</TableCell>
                      <TableCell className="font-mono">{purchase.transaction_id}</TableCell>
                      <TableCell>{format(new Date(purchase.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            purchase.status === "approved" ? "default" :
                            purchase.status === "rejected" ? "destructive" : "secondary"
                          }
                        >
                          {purchase.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {purchase.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() => handleApprove(purchase)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive"
                              onClick={() => setRejectingId(purchase.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Material Editor Dialog */}
        <Dialog open={showEditor} onOpenChange={setShowEditor}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Material" : "Add Material"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Material title"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Material description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as MaterialCategory })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} className="capitalize">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>External Link</Label>
                  <Input
                    value={form.external_link}
                    onChange={(e) => setForm({ ...form, external_link: e.target.value })}
                    placeholder="https://drive.google.com/..."
                  />
                </div>
              </div>

              <ImageUpload
                value={form.thumbnail_url}
                onChange={(url) => setForm({ ...form, thumbnail_url: url })}
                label="Thumbnail Image"
                folder="materials"
              />

              <div className="flex items-center space-x-2">
                <Switch
                  checked={form.is_paid}
                  onCheckedChange={(checked) => setForm({ ...form, is_paid: checked })}
                />
                <Label>Paid Material</Label>
              </div>

              {form.is_paid && (
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>UPI ID</Label>
                    <Input
                      value={form.upi_id}
                      onChange={(e) => setForm({ ...form, upi_id: e.target.value })}
                      placeholder="yourname@upi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>QR Code</Label>
                    <div className="flex items-center gap-4">
                      <img 
                        src={form.qr_code_url} 
                        alt="Payment QR" 
                        className="w-24 h-24 object-contain border rounded-lg"
                      />
                      <span className="text-sm text-muted-foreground">Fixed QR code for all payments</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  checked={form.published}
                  onCheckedChange={(checked) => setForm({ ...form, published: checked })}
                />
                <Label>Published</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditor(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={!!rejectingId} onOpenChange={() => setRejectingId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label>Reason for rejection</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Invalid transaction ID, payment not received, etc."
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectingId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleReject}>Reject</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
