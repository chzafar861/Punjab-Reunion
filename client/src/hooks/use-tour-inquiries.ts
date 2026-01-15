import { useMutation } from "@tanstack/react-query";
import { api, type TourInquiryInput } from "@shared/routes";
import { supabase } from "@/lib/supabase";

export function useCreateTourInquiry() {
  return useMutation({
    mutationFn: async (data: TourInquiryInput) => {
      const validated = api.tours.create.input.parse(data);
      
      const { data: result, error } = await supabase
        .from('tour_inquiries')
        .insert({
          name: validated.name,
          email: validated.email,
          phone: validated.phone,
          interest_areas: validated.interestAreas,
          travel_dates: validated.travelDates || null,
          group_size: validated.groupSize || null,
          message: validated.message || null,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(error.message || "Failed to submit tour inquiry");
      }
      
      return {
        id: result.id,
        name: result.name,
        email: result.email,
        phone: result.phone,
        interestAreas: result.interest_areas,
        travelDates: result.travel_dates,
        groupSize: result.group_size,
        message: result.message,
        createdAt: result.created_at,
      };
    },
  });
}
