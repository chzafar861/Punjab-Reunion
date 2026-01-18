import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useEffect } from "react";

export interface AuthUser {
  id: string;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  emailVerified: boolean | null;
  profileImageUrl: string | null;
  role?: string;
  canSubmitProfiles?: boolean;
  canManageProducts?: boolean;
}

async function fetchUser(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured) {
    return null;
  }
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }

    const user = session.user;
    const metadata = user.user_metadata || {};

    const baseUser: AuthUser = {
      id: user.id,
      email: user.email || null,
      username: metadata.username || null,
      firstName: metadata.first_name || metadata.firstName || null,
      lastName: metadata.last_name || metadata.lastName || null,
      emailVerified: user.email_confirmed_at ? true : false,
      profileImageUrl: metadata.avatar_url || metadata.profileImageUrl || null,
    };

    // Try to fetch role from API
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (response.ok) {
        const apiUser = await response.json();
        return {
          ...baseUser,
          role: apiUser.role,
          canSubmitProfiles: apiUser.canSubmitProfiles,
          canManageProducts: apiUser.canManageProducts,
        };
      }
    } catch {
      // Ignore API errors, return base user
    }

    return baseUser;
  } catch (err) {
    console.warn("Failed to fetch user:", err);
    return null;
  }
}

async function logout(): Promise<void> {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, refetch } = useQuery<AuthUser | null>({
    queryKey: ["supabase-auth"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        queryClient.setQueryData(["supabase-auth"], {
          id: session.user.id,
          email: session.user.email || null,
          username: metadata.username || null,
          firstName: metadata.first_name || metadata.firstName || null,
          lastName: metadata.last_name || metadata.lastName || null,
          emailVerified: session.user.email_confirmed_at ? true : false,
          profileImageUrl: metadata.avatar_url || metadata.profileImageUrl || null,
        });
      } else {
        queryClient.setQueryData(["supabase-auth"], null);
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["supabase-auth"], null);
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    refetch,
  };
}
