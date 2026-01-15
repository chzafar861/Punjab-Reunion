import { useMutation } from "@tanstack/react-query";
import { api, type InquiryInput } from "@shared/routes";
import { supabase } from "@/lib/supabase";

export function useCreateInquiry() {
  return useMutation({
    mutationFn: async (data: InquiryInput) => {
      const validated = api.inquiries.create.input.parse(data);
      
      const { data: result, error } = await supabase
        .from('inquiries')
        .insert({
          name: validated.name,
          email: validated.email,
          phone: validated.phone || null,
          message: validated.message,
          profile_id: validated.profileId || null,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(error.message || "Failed to send inquiry");
      }
      
      return {
        id: result.id,
        name: result.name,
        email: result.email,
        phone: result.phone,
        message: result.message,
        profileId: result.profile_id,
        createdAt: result.created_at,
      };
    },
  });
}
