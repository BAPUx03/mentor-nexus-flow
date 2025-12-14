import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface CodeSnippet {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  code: string;
  language: string;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useCodeSnippets(options?: { published?: boolean; authorId?: string; language?: string }) {
  return useQuery({
    queryKey: ["code-snippets", options],
    queryFn: async () => {
      let query = supabase
        .from("code_snippets")
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
      if (options?.language) {
        query = query.eq("language", options.language);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CodeSnippet[];
    },
  });
}

export function useCodeSnippet(id: string) {
  return useQuery({
    queryKey: ["code-snippet", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("code_snippets")
        .select(`
          *,
          author:profiles!author_id(full_name, avatar_url)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as CodeSnippet | null;
    },
    enabled: !!id,
  });
}

export function useCodeSnippetMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const createSnippet = useMutation({
    mutationFn: async (snippet: Omit<CodeSnippet, "id" | "author_id" | "created_at" | "updated_at" | "author">) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("code_snippets")
        .insert({
          ...snippet,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["code-snippets"] });
      toast({ title: "Code snippet created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create snippet", description: error.message, variant: "destructive" });
    },
  });

  const updateSnippet = useMutation({
    mutationFn: async ({ id, ...snippet }: Partial<CodeSnippet> & { id: string }) => {
      const updateData = { ...snippet };
      delete updateData.author;

      const { data, error } = await supabase
        .from("code_snippets")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["code-snippets"] });
      queryClient.invalidateQueries({ queryKey: ["code-snippet"] });
      toast({ title: "Code snippet updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to update snippet", description: error.message, variant: "destructive" });
    },
  });

  const deleteSnippet = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("code_snippets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["code-snippets"] });
      toast({ title: "Code snippet deleted" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete snippet", description: error.message, variant: "destructive" });
    },
  });

  return { createSnippet, updateSnippet, deleteSnippet };
}
