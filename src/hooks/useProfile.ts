import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  skills: string[] | null;
  skill_level: string | null;
  interests: string[] | null;
  learning_goals: string[] | null;
  onboarding_completed: boolean | null;
  created_at: string;
  updated_at: string;
}

export function useProfile(userId?: string) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;
  const isOwnProfile = !userId || userId === user?.id;

  const fetchProfile = useCallback(async () => {
    if (!targetUserId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Use profiles table for own profile (has email), public_profiles view for others
    if (isOwnProfile && user) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", targetUserId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        setProfile(data);
      }
    } else {
      // For viewing other users' profiles, use public_profiles (no email exposed)
      const { data, error } = await supabase
        .from("public_profiles" as any)
        .select("*")
        .eq("id", targetUserId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching public profile:", error);
      } else if (data) {
        // Cast to Profile type with email as null for public profiles
        const publicData = data as unknown as Omit<Profile, 'email'>;
        setProfile({ ...publicData, email: null });
      } else {
        setProfile(null);
      }
    }
    setLoading(false);
  }, [targetUserId, isOwnProfile, user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      toast.error("Please sign in to update your profile");
      return false;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
      return false;
    }

    toast.success("Profile updated successfully");
    fetchProfile();
    return true;
  };

  const uploadAvatar = async (file: File) => {
    if (!user) {
      toast.error("Please sign in to upload an avatar");
      return null;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error("Error uploading avatar:", uploadError);
      toast.error("Failed to upload avatar");
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const avatarUrl = urlData.publicUrl;

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating avatar URL:", updateError);
      toast.error("Failed to update profile with new avatar");
      return null;
    }

    toast.success("Avatar uploaded successfully");
    fetchProfile();
    return avatarUrl;
  };

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile,
  };
}
