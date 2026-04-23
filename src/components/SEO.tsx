import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
}

const DEFAULT_IMAGE = "https://lovable.dev/opengraph-image-p98pqg.png";
const SITE_NAME = "Viaje com Sofia";

function upsertMeta(attr: "name" | "property", key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function SEO({
  title,
  description,
  image = DEFAULT_IMAGE,
  type = "website",
  noIndex = false,
}: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noIndex ? "noindex,nofollow" : "index,follow");

    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:image", image);
    upsertMeta("property", "og:site_name", SITE_NAME);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);

    const url = `${window.location.origin}${location.pathname}`;
    upsertCanonical(url);
    upsertMeta("property", "og:url", url);
  }, [title, description, image, type, noIndex, location.pathname]);

  return null;
}
