import { useState, useCallback } from "react";

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
  
  // Handle Replit Object Storage paths
  if (photoUrl.startsWith("/objects/")) {
    return photoUrl;
  }
  
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

  const uploadFile = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        setProgress(10);

        // Request presigned URL from Replit object storage
        const requestResponse = await fetch("/api/uploads/request-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            size: file.size,
            contentType: file.type,
          }),
          credentials: "include",
        });

        if (!requestResponse.ok) {
          const errData = await requestResponse.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to get upload URL");
        }

        const { uploadURL, objectPath } = await requestResponse.json();

        setProgress(30);

        // Upload file to presigned URL
        const uploadResponse = await fetch(uploadURL, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload file to storage");
        }

        setProgress(80);

        const response: UploadResponse = {
          publicUrl: objectPath,
          path: objectPath,
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
    [options]
  );

  const deleteFile = useCallback(
    async (photoUrl: string): Promise<boolean> => {
      setIsDeleting(true);
      setError(null);

      try {
        // For Replit object storage, we don't have a delete endpoint yet
        // Just return true to not block the flow
        if (photoUrl.startsWith("/objects/")) {
          console.log("Object storage file deletion not implemented:", photoUrl);
          return true;
        }

        // For legacy Supabase URLs, just log and return true
        console.log("Legacy file deletion skipped:", photoUrl);
        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Delete failed");
        setError(error);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    []
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
