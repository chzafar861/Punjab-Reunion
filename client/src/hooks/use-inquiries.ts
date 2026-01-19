import { useMutation } from "@tanstack/react-query";
import { api, type InquiryInput } from "@shared/routes";
import { apiRequest } from "@/lib/queryClient";

export function useCreateInquiry() {
  return useMutation({
    mutationFn: async (data: InquiryInput) => {
      const validated = api.inquiries.create.input.parse(data);
      
      return apiRequest('/api/inquiries', {
        method: 'POST',
        body: JSON.stringify(validated),
      });
    },
  });
}
