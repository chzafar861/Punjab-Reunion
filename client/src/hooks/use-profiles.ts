import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ProfileInput } from "@shared/routes";

export function useProfiles(search?: string, district?: string) {
  const queryKey = [api.profiles.list.path, search, district].filter(Boolean);
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = new URL(api.profiles.list.path, window.location.origin);
      if (search) url.searchParams.set("search", search);
      if (district) url.searchParams.set("district", district);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch profiles");
      return api.profiles.list.responses[200].parse(await res.json());
    },
  });
}

export function useProfile(id: number) {
  return useQuery({
    queryKey: [api.profiles.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.profiles.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.profiles.get.responses[200].parse(await res.json());
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ProfileInput) => {
      // Validate with Zod schema from routes/schema
      const validated = api.profiles.create.input.parse(data);
      
      const res = await fetch(api.profiles.create.path, {
        method: api.profiles.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.profiles.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create profile");
      }
      
      return api.profiles.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.list.path] });
    },
  });
}
