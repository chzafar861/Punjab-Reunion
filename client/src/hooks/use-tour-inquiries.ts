import { useMutation } from "@tanstack/react-query";
import { api, type TourInquiryInput } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";

export function useCreateTourInquiry() {
  return useMutation({
    mutationFn: async (data: TourInquiryInput) => {
      const validated = api.tours.create.input.parse(data);
      
      return apiRequest('/api/tour-inquiries', {
        method: 'POST',
        body: JSON.stringify(validated),
      });
    },
  });
}
