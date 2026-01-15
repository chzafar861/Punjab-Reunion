import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const urlCache = new Map<string, { url: string; expiry: number }>();

function extractFilePath(photoUrl: string): string | null {
  try {
    const url = new URL(photoUrl);
    const pathMatch = url.pathname.match(/\/profile-photos\/(.+)$/);
    if (pathMatch) {
      return pathMatch[1];
    }
    return null;
  } catch {
    const pathMatch = photoUrl.match(/profile-photos\/([^?]+)/);
    return pathMatch ? pathMatch[1] : null;
  }
}

export function useSignedUrl(photoUrl: string | null | undefined): string | null {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!photoUrl) {
      setSignedUrl(null);
      return;
    }

    if (!photoUrl.includes("supabase") || !photoUrl.includes("profile-photos")) {
      setSignedUrl(photoUrl);
      return;
    }

    const filePath = extractFilePath(photoUrl);
    if (!filePath) {
      setSignedUrl(photoUrl);
      return;
    }

    const cacheKey = `profile-photos/${filePath}`;
    const cached = urlCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      setSignedUrl(cached.url);
      return;
    }

    const getSignedUrl = async () => {
      try {
        const { data, error } = await supabase.storage
          .from("profile-photos")
          .createSignedUrl(filePath, 3600);

        if (error) {
          console.warn("Could not create signed URL, using original:", error.message);
          setSignedUrl(photoUrl);
          return;
        }

        if (data?.signedUrl) {
          const expiry = Date.now() + 3500 * 1000;
          urlCache.set(cacheKey, { url: data.signedUrl, expiry });
          setSignedUrl(data.signedUrl);
        } else {
          setSignedUrl(photoUrl);
        }
      } catch (err) {
        console.warn("Error getting signed URL:", err);
        setSignedUrl(photoUrl);
      }
    };

    getSignedUrl();
  }, [photoUrl]);

  return signedUrl;
}
