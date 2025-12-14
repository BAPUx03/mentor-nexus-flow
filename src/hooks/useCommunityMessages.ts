import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface CommunityMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const useCommunityMessages = () => {
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ["community-messages"],
    queryFn: async () => {
      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("community_messages")
        .select("id, user_id, message, created_at")
        .order("created_at", { ascending: true })
        .limit(100);

      if (messagesError) throw messagesError;
      if (!messagesData || messagesData.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(messagesData.map((m) => m.user_id))];

      // Fetch profiles for those users
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      // Map profiles by user ID
      const profilesMap = new Map(
        profilesData?.map((p) => [p.id, { full_name: p.full_name, avatar_url: p.avatar_url }]) || []
      );

      // Combine messages with profiles
      return messagesData.map((msg) => ({
        ...msg,
        profile: profilesMap.get(msg.user_id) || null,
      })) as CommunityMessage[];
    },
  });

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("community-chat")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "community_messages",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["community-messages"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { messages, isLoading };
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, message }: { userId: string; message: string }) => {
      const { data, error } = await supabase
        .from("community_messages")
        .insert({
          user_id: userId,
          message,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-messages"] });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("community_messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-messages"] });
    },
  });
};
