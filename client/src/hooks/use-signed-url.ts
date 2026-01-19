import { useState, useEffect } from "react";

export function useSignedUrl(photoUrl: string | null | undefined): string | null {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!photoUrl) {
      setSignedUrl(null);
      return;
    }

    // Handle Replit Object Storage paths (start with /objects/ or contain /objects/)
    // These don't need signing - they're served directly by our backend
    if (photoUrl.startsWith("/objects/") || photoUrl.includes("/objects/")) {
      setSignedUrl(photoUrl);
      return;
    }

    // Handle external URLs - use as-is
    if (photoUrl.startsWith("http")) {
      setSignedUrl(photoUrl);
      return;
    }

    // Default: use the URL as-is
    setSignedUrl(photoUrl);
  }, [photoUrl]);

  return signedUrl;
}
