import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: string;
}

const BASE_TITLE = "47DaPunjab";
const BASE_URL = "https://47dapunjab.com";
const DEFAULT_OG_IMAGE = "/og-cover.png";
const DEFAULT_KEYWORDS = "Punjab heritage, 1947 partition, ancestry tracing, Sikh genealogy, ancestral village Pakistan";

function buildUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}

export function useSEO({
  title,
  description,
  keywords,
  canonicalPath = "/",
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
}: SEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | ${BASE_TITLE}`;
    const fullUrl = buildUrl(canonicalPath);
    const fullImageUrl = buildUrl(ogImage);

    document.title = fullTitle;

    const updateMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (meta) {
        meta.content = content;
      } else {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    const updateCanonical = (url: string) => {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (canonical) {
        canonical.href = url;
      } else {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        canonical.href = url;
        document.head.appendChild(canonical);
      }
    };

    updateMeta("description", description);
    updateMeta("keywords", keywords || DEFAULT_KEYWORDS);

    updateMeta("og:title", fullTitle, true);
    updateMeta("og:description", description, true);
    updateMeta("og:url", fullUrl, true);
    updateMeta("og:image", fullImageUrl, true);
    updateMeta("og:type", ogType, true);

    updateMeta("twitter:title", fullTitle);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", fullImageUrl);
    updateMeta("twitter:url", fullUrl);

    updateCanonical(fullUrl);
  }, [title, description, keywords, canonicalPath, ogImage, ogType]);
}
