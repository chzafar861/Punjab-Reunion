import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ProfileInput } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";

export function useProfiles(search?: string, district?: string) {
  const queryKey = ['/api/profiles', search, district].filter(Boolean);
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (district) params.set('district', district);
      
      const url = `/api/profiles${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, { credentials: 'include' });
      
      if (!response.ok) {
        throw new Error("Failed to fetch profiles");
      }
      
      return response.json();
    },
  });
}

export function useProfile(id: number) {
  return useQuery({
    queryKey: ['/api/profiles', id],
    queryFn: async () => {
      const response = await fetch(`/api/profiles/${id}`, { credentials: 'include' });
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch profile");
      }
      
      return response.json();
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ProfileInput) => {
      const validated = api.profiles.create.input.parse(data);
      
      const response = await apiRequest('POST', '/api/profiles', validated);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-profiles'] });
    },
  });
}
