import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AuthUser {
  id: string;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  emailVerified: boolean | null;
  profileImageUrl: string | null;
}

async function fetchUser(): Promise<AuthUser | null> {
  // Try custom auth first
  const customResponse = await fetch("/api/auth/me", {
    credentials: "include",
  });

  if (customResponse.ok) {
    return customResponse.json();
  }

  // Fall back to Replit auth
  const replitResponse = await fetch("/api/auth/user", {
    credentials: "include",
  });

  if (replitResponse.status === 401) {
    return null;
  }

  if (!replitResponse.ok) {
    return null;
  }

  const replitUser = await replitResponse.json();
  return {
    id: replitUser.id,
    email: replitUser.email,
    username: null,
    firstName: replitUser.firstName,
    lastName: replitUser.lastName,
    emailVerified: true,
    profileImageUrl: replitUser.profileImageUrl,
  };
}

async function logout(): Promise<void> {
  // Try custom logout first
  try {
    await fetch("/api/auth/custom-logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (e) {
    // Ignore errors
  }
  // Then do Replit logout
  window.location.href = "/api/logout";
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
