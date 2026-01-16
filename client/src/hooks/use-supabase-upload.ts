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

export function extractFilePathFromUrl(photoUrl: string, bucket: string = "profile-photos"): string | null {
  if (!photoUrl) return null;
  try {
    const url = new URL(photoUrl);
    const regex = new RegExp(`/${bucket}/(.+)$`);
    const match = url.pathname.match(regex);
    if (match) return match[1];
    const storageMatch = photoUrl.match(new RegExp(`${bucket}/([^?]+)`));
    return storageMatch ? storageMatch[1] : null;
  } catch {
    const match = photoUrl.match(new RegExp(`${bucket}/([^?]+)`));
    return match ? match[1] : null;
  }
}

export function useSupabaseUpload(options: UseSupabaseUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const deleteFile = useCallback(
    async (photoUrl: string): Promise<boolean> => {
      setIsDeleting(true);
      setError(null);

      try {
        const filePath = extractFilePathFromUrl(photoUrl, bucket);
        if (!filePath) {
          throw new Error("Could not extract file path from URL");
        }

        const { error: deleteError } = await supabase.storage
          .from(bucket)
          .remove([filePath]);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Delete failed");
        setError(error);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [bucket]
  );

  return {
    uploadFile,
    deleteFile,
    isUploading,
    isDeleting,
    error,
    progress,
  };
}
