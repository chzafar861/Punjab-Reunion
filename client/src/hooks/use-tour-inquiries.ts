import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { api, type TourInquiryInput } from "@shared/routes";
import type { tourInquiries } from "@shared/schema";

type TourInquiryResponse = typeof tourInquiries.$inferSelect;

export function useCreateTourInquiry() {
  return useMutation<TourInquiryResponse, Error, TourInquiryInput>({
    mutationFn: async (data) => {
      const res = await apiRequest("POST", api.tours.create.path, data);
      return res.json();
    },
  });
}
