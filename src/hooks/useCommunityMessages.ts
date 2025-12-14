import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface CommunityMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  reactions?: Reaction[];
}

interface BlockedUser {
  id: string;
  user_id: string;
  blocked_by: string;
  reason: string | null;
  created_at: string;
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
      const messageIds = messagesData.map((m) => m.id);

      // Fetch profiles for those users
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      // Fetch reactions for messages
      const { data: reactionsData } = await supabase
        .from("message_reactions")
        .select("id, message_id, user_id, emoji")
        .in("message_id", messageIds);

      // Map profiles by user ID
      const profilesMap = new Map(
        profilesData?.map((p) => [p.id, { full_name: p.full_name, avatar_url: p.avatar_url }]) || []
      );

      // Group reactions by message
      const reactionsMap = new Map<string, Reaction[]>();
      reactionsData?.forEach((r) => {
        const existing = reactionsMap.get(r.message_id) || [];
        const emojiReaction = existing.find((e) => e.emoji === r.emoji);
        if (emojiReaction) {
          emojiReaction.count++;
          emojiReaction.users.push(r.user_id);
        } else {
          existing.push({ emoji: r.emoji, count: 1, users: [r.user_id] });
        }
        reactionsMap.set(r.message_id, existing);
      });

      // Combine messages with profiles and reactions
      return messagesData.map((msg) => ({
        ...msg,
        profile: profilesMap.get(msg.user_id) || null,
        reactions: reactionsMap.get(msg.id) || [],
      })) as CommunityMessage[];
    },
  });

  // Set up realtime subscription for messages and reactions
  useEffect(() => {
    const messagesChannel = supabase
      .channel("community-chat-messages")
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

    const reactionsChannel = supabase
      .channel("community-chat-reactions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["community-messages"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(reactionsChannel);
    };
  }, [queryClient]);

  return { messages, isLoading };
};

export const useBlockedUsers = () => {
  return useQuery({
    queryKey: ["blocked-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_blocked_users")
        .select("*");

      if (error) throw error;
      return data as BlockedUser[];
    },
  });
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

export const useToggleReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, userId, emoji }: { messageId: string; userId: string; emoji: string }) => {
      // Check if reaction exists
      const { data: existing } = await supabase
        .from("message_reactions")
        .select("id")
        .eq("message_id", messageId)
        .eq("user_id", userId)
        .eq("emoji", emoji)
        .maybeSingle();

      if (existing) {
        // Remove reaction
        const { error } = await supabase
          .from("message_reactions")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase
          .from("message_reactions")
          .insert({
            message_id: messageId,
            user_id: userId,
            emoji,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-messages"] });
    },
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, blockedBy, reason }: { userId: string; blockedBy: string; reason?: string }) => {
      const { error } = await supabase
        .from("chat_blocked_users")
        .insert({
          user_id: userId,
          blocked_by: blockedBy,
          reason: reason || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
    },
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("chat_blocked_users")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
    },
  });
};
