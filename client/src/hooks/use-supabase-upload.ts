import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface UploadResponse {
  publicUrl: string;
  path: string;
  fileName: string;
}

interface UseSupabaseUploadOptions {
  bucket?: string;
  folder?: string;
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: Error) => void;
}

export function useSupabaseUpload(options: UseSupabaseUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const bucket = options.bucket || "profile-photos";
  const folder = options.folder || "uploads";

  const uploadFile = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        const fileExt = file.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        setProgress(30);

        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        setProgress(80);

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        const response: UploadResponse = {
          publicUrl: urlData.publicUrl,
          path: data.path,
          fileName: file.name,
        };

        setProgress(100);
        options.onSuccess?.(response);
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Upload failed");
        setError(error);
        options.onError?.(error);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [bucket, folder, options]
  );

  return {
    uploadFile,
    isUploading,
    error,
    progress,
  };
}
