import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ProfileInput } from "@shared/routes";
import { supabase } from "@/lib/supabase";

function mapProfileFromDb(row: any) {
  return {
    id: row.id,
    fullName: row.full_name,
    villageName: row.village_name,
    district: row.district,
    yearLeft: row.year_left,
    currentLocation: row.current_location,
    story: row.story,
    photoUrl: row.photo_url,
    email: row.email,
    phone: row.phone,
    userId: row.user_id,
    createdAt: row.created_at,
  };
}

export function useProfiles(search?: string, district?: string) {
  const queryKey = ['/api/profiles', search, district].filter(Boolean);
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,village_name.ilike.%${search}%,district.ilike.%${search}%`);
      }
      
      if (district) {
        query = query.eq('district', district);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Supabase fetch error:', error);
        throw new Error("Failed to fetch profiles");
      }
      
      return (data || []).map(mapProfileFromDb);
    },
  });
}

export function useProfile(id: number) {
  return useQuery({
    queryKey: ['/api/profiles', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error('Supabase fetch error:', error);
        throw new Error("Failed to fetch profile");
      }
      
      return data ? mapProfileFromDb(data) : null;
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ProfileInput) => {
      const validated = api.profiles.create.input.parse(data);
      
      const { data: result, error } = await supabase
        .from('profiles')
        .insert({
          full_name: validated.fullName,
          village_name: validated.villageName,
          district: validated.district,
          year_left: validated.yearLeft,
          current_location: validated.currentLocation,
          story: validated.story,
          photo_url: validated.photoUrl || null,
          email: validated.email || null,
          phone: validated.phone || null,
          user_id: null,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(error.message || "Failed to create profile");
      }
      
      return mapProfileFromDb(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
    },
  });
}
