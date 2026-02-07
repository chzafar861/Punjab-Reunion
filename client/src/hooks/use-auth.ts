import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  try {
    const response = await fetch("/api/auth/user", {
      credentials: "include",
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error("Failed to fetch user");
    }
    
    const user = await response.json();
    if (!user) return null;
    
    try {
      const meResponse = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (meResponse.ok) {
        const meData = await meResponse.json();
        return {
          id: user.id,
          email: user.email || null,
          username: user.email?.split('@')[0] || user.firstName || null,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          emailVerified: true,
          profileImageUrl: user.profileImageUrl || null,
          role: meData.role || "member",
          canSubmitProfiles: meData.canSubmitProfiles || false,
          canManageProducts: meData.canManageProducts || false,
        };
      }
    } catch {
    }
    
    return {
      id: user.id,
      email: user.email || null,
      username: user.email?.split('@')[0] || user.firstName || null,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      emailVerified: true,
      profileImageUrl: user.profileImageUrl || null,
      role: "member",
      canSubmitProfiles: false,
      canManageProducts: false,
    };
  } catch (err) {
    console.warn("Failed to fetch user:", err);
    return null;
  }
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, isFetched, refetch } = useQuery<AuthUser | null>({
    queryKey: ["auth-user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await fetch("/api/auth/local-logout", { method: "POST", credentials: "include" });
      } catch {}
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth-user"], null);
      queryClient.clear();
    },
  });

  const authReady = isFetched;

  return {
    user,
    isLoading,
    authReady,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    refetch,
  };
}
