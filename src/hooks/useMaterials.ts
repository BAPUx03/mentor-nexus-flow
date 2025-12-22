import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type MaterialCategory = "editing" | "video" | "graphics" | "apps" | "other";

export interface Material {
  id: string;
  title: string;
  description: string | null;
  category: MaterialCategory;
  external_link: string;
  thumbnail_url: string | null;
  is_paid: boolean;
  price: number;
  upi_id: string | null;  // Only available when user initiates purchase
  qr_code_url: string | null;  // Only available when user initiates purchase
  author_id: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

// Fetch payment details for a specific material (only when needed for purchase)
export async function fetchMaterialPaymentDetails(materialId: string): Promise<{ upi_id: string | null; qr_code_url: string | null } | null> {
  const { data, error } = await supabase
    .from("materials")
    .select("upi_id, qr_code_url")
    .eq("id", materialId)
    .single();
  
  if (error) {
    console.error("Error fetching payment details:", error);
    return null;
  }
  return data;
}

export interface MaterialPurchase {
  id: string;
  user_id: string;
  material_id: string;
  transaction_id: string;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
  material?: Material;
  user?: {
    id: string;
    full_name: string | null;
    email: string | null;
  };
}

// Public fields that can be shown to all users (excludes payment info)
const PUBLIC_MATERIAL_FIELDS = "id, title, description, category, external_link, thumbnail_url, is_paid, price, author_id, published, created_at, updated_at";

export function useMaterials(category?: MaterialCategory) {
  return useQuery({
    queryKey: ["materials", category],
    queryFn: async () => {
      // Only select public fields, exclude payment info (upi_id, qr_code_url)
      let query = supabase
        .from("materials")
        .select(PUBLIC_MATERIAL_FIELDS)
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      // Cast with null values for excluded fields
      return (data as any[]).map(m => ({
        ...m,
        upi_id: null,
        qr_code_url: null,
      })) as Material[];
    },
  });
}

export function useAdminMaterials() {
  return useQuery({
    queryKey: ["admin-materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Material[];
    },
  });
}

export function useUserPurchases() {
  return useQuery({
    queryKey: ["user-purchases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("material_purchases")
        .select(`
          *,
          material:materials(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MaterialPurchase[];
    },
  });
}

export function usePendingPurchases() {
  return useQuery({
    queryKey: ["pending-purchases"],
    queryFn: async () => {
      const { data: purchasesData, error } = await supabase
        .from("material_purchases")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch materials and profiles separately
      const materialIds = [...new Set(purchasesData.map(p => p.material_id))];
      const userIds = [...new Set(purchasesData.map(p => p.user_id))];

      const [{ data: materials }, { data: profiles }] = await Promise.all([
        supabase.from("materials").select("*").in("id", materialIds),
        supabase.from("profiles").select("id, full_name, email").in("id", userIds),
      ]);

      const materialMap = new Map(materials?.map(m => [m.id, m]) || []);
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return purchasesData.map(p => ({
        ...p,
        status: p.status as "pending" | "approved" | "rejected",
        material: materialMap.get(p.material_id),
        user: profileMap.get(p.user_id),
      })) as MaterialPurchase[];
    },
  });
}

export function useMaterialMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMaterial = useMutation({
    mutationFn: async (material: Omit<Material, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase.from("materials").insert(material);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-materials"] });
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      toast({ title: "Material created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMaterial = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Material> & { id: string }) => {
      const { error } = await supabase.from("materials").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-materials"] });
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      toast({ title: "Material updated successfully" });
    },
  });

  const deleteMaterial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("materials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-materials"] });
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      toast({ title: "Material deleted" });
    },
  });

  const submitPurchase = useMutation({
    mutationFn: async ({ materialId, transactionId, materialTitle, userName, userEmail, amount }: { 
      materialId: string; 
      transactionId: string;
      materialTitle?: string;
      userName?: string;
      userEmail?: string;
      amount?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("material_purchases").insert({
        user_id: user.id,
        material_id: materialId,
        transaction_id: transactionId,
      });
      if (error) throw error;

      // Send Telegram notification
      try {
        await supabase.functions.invoke("notify-telegram-purchase", {
          body: {
            purchaseType: "material",
            tutorialTitle: materialTitle || "Unknown Material",
            userName: userName || "Unknown",
            userEmail: userEmail || user.email || "Unknown",
            transactionId,
            amount: amount || 0,
          },
        });
      } catch (telegramError) {
        console.error("Failed to send Telegram notification:", telegramError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-purchases"] });
      toast({ 
        title: "Payment submitted", 
        description: "Your payment is being verified. You'll receive an email once approved." 
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const approvePurchase = useMutation({
    mutationFn: async ({ purchaseId, userEmail, materialTitle, externalLink }: { purchaseId: string; userEmail: string; materialTitle: string; externalLink?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update purchase status
      const { error: updateError } = await supabase
        .from("material_purchases")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: user.id,
        })
        .eq("id", purchaseId);

      if (updateError) throw updateError;

      // Send approval email via edge function
      const { error: emailError } = await supabase.functions.invoke("send-approval-email", {
        body: { email: userEmail, materialTitle, externalLink },
      });

      if (emailError) {
        console.error("Email error:", emailError);
        // Don't throw - purchase is still approved
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-purchases"] });
      queryClient.invalidateQueries({ queryKey: ["user-purchases"] });
      toast({ title: "Purchase approved", description: "Email sent to user with access link." });
    },
  });

  const rejectPurchase = useMutation({
    mutationFn: async ({ purchaseId, reason }: { purchaseId: string; reason: string }) => {
      const { error } = await supabase
        .from("material_purchases")
        .update({
          status: "rejected",
          admin_notes: reason,
        })
        .eq("id", purchaseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-purchases"] });
      toast({ title: "Purchase rejected" });
    },
  });

  return {
    createMaterial: createMaterial.mutate,
    updateMaterial: updateMaterial.mutate,
    deleteMaterial: deleteMaterial.mutate,
    submitPurchase: submitPurchase.mutate,
    approvePurchase: approvePurchase.mutate,
    rejectPurchase: rejectPurchase.mutate,
    isSubmitting: submitPurchase.isPending,
  };
}
