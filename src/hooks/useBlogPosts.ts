import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface BlogPost {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  tags: string[];
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useBlogPosts(options?: { published?: boolean; authorId?: string }) {
  return useQuery({
    queryKey: ["blog-posts", options],
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
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

      const { data, error } = await query;
      if (error) throw error;
      return data as BlogPost[];
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          *,
          author:profiles!author_id(full_name, avatar_url)
        `)
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data as BlogPost | null;
    },
    enabled: !!slug,
  });
}

export function useBlogPostMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const createPost = useMutation({
    mutationFn: async (post: Omit<BlogPost, "id" | "author_id" | "created_at" | "updated_at" | "author" | "published_at" | "excerpt" | "featured_image"> & { excerpt?: string; featured_image?: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("blog_posts")
        .insert({
          ...post,
          author_id: user.id,
          published_at: post.published ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast({ title: "Blog post created successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to create blog post", description: error.message, variant: "destructive" });
    },
  });

  const updatePost = useMutation({
    mutationFn: async ({ id, ...post }: Partial<BlogPost> & { id: string }) => {
      const updateData: Record<string, unknown> = { ...post };
      if (post.published && !post.published_at) {
        updateData.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("blog_posts")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-post"] });
      toast({ title: "Blog post updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Failed to update blog post", description: error.message, variant: "destructive" });
    },
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast({ title: "Blog post deleted" });
    },
    onError: (error) => {
      toast({ title: "Failed to delete blog post", description: error.message, variant: "destructive" });
    },
  });

  return { createPost, updatePost, deletePost };
}
