import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface TutorialStep {
  id: string;
  tutorial_id: string;
  step_order: number;
  title: string;
  content: string;
  code_example: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tutorial {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  description: string | null;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimated_minutes: number;
  featured_image: string | null;
  tags: string[];
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  external_link: string | null;
  is_paid: boolean;
  price: number | null;
  upi_id: string | null;
  qr_code_url: string | null;
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  steps?: TutorialStep[];
}

export function useTutorials(options?: { published?: boolean; authorId?: string; difficulty?: string }) {
  return useQuery({
    queryKey: ["tutorials", options],
    queryFn: async () => {
      let query = supabase
        .from("tutorials")
        .select(`
          *,
          author:profiles!author_id(full_name, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (options?.published !== undefined) {
        query = query.eq("published", options.published);
      }
      if (options?.authorId) {
        query = query.eq("author_id", options.authorId);
      }
      if (options?.difficulty) {
        query = query.eq("difficulty", options.difficulty);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Tutorial[];
    },
  });
}

export function useTutorial(slug: string) {
  return useQuery({
    queryKey: ["tutorial", slug],
    queryFn: async () => {
      const { data: tutorial, error } = await supabase
        .from("tutorials")
        .select(`
          *,
          author:profiles!author_id(full_name, avatar_url)
        `)
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (!tutorial) return null;

      const { data: steps, error: stepsError } = await supabase
        .from("tutorial_steps")
        .select("*")
        .eq("tutorial_id", tutorial.id)
        .order("step_order", { ascending: true });

      if (stepsError) throw stepsError;

      return { ...tutorial, steps } as Tutorial;
    },
    enabled: !!slug,
  });
}

export function useTutorialMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const createTutorial = useMutation({
    mutationFn: async (tutorial: { title: string; slug: string; description?: string; difficulty: string; estimated_minutes: number; featured_image?: string; tags: string[]; published: boolean; external_link?: string; is_paid: boolean; price?: number; upi_id?: string; qr_code_url?: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tutorials")
        .insert({
          ...tutorial,
          author_id: user.id,
          published_at: tutorial.published ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutorials"] });
      toast({ title: "Tutorial created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create tutorial", description: error.message, variant: "destructive" });
    },
  });

  const updateTutorial = useMutation({
    mutationFn: async ({ id, ...tutorial }: Partial<Tutorial> & { id: string }) => {
      const updateData: Record<string, unknown> = { ...tutorial };
      delete updateData.steps;
      delete updateData.author;
      
      if (tutorial.published && !tutorial.published_at) {
        updateData.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("tutorials")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutorials"] });
      queryClient.invalidateQueries({ queryKey: ["tutorial"] });
      toast({ title: "Tutorial updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to update tutorial", description: error.message, variant: "destructive" });
    },
  });

  const deleteTutorial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tutorials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutorials"] });
      toast({ title: "Tutorial deleted" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete tutorial", description: error.message, variant: "destructive" });
    },
  });

  const upsertSteps = useMutation({
    mutationFn: async ({ tutorialId, steps }: { tutorialId: string; steps: Omit<TutorialStep, "id" | "created_at" | "updated_at">[] }) => {
      // Delete existing steps
      await supabase.from("tutorial_steps").delete().eq("tutorial_id", tutorialId);

      if (steps.length > 0) {
        const { error } = await supabase.from("tutorial_steps").insert(steps);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutorial"] });
      toast({ title: "Tutorial steps saved" });
    },
    onError: (error) => {
      toast({ title: "Failed to save steps", description: error.message, variant: "destructive" });
    },
  });

  return { createTutorial, updateTutorial, deleteTutorial, upsertSteps };
}
