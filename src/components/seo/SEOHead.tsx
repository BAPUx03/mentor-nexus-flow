import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  publishedTime?: string;
  author?: string;
  keywords?: string[];
}

export const SEOHead = ({
  title,
  description,
  canonicalUrl,
  ogImage = "https://bapux03.github.io/mentor-nexus-flow/og-image.png",
  ogType = "website",
  publishedTime,
  author,
  keywords,
}: SEOHeadProps) => {
  const siteTitle = "MentorNexus - Developer Learning Platform";
  const fullTitle = title === "Home" ? siteTitle : `${title} | MentorNexus`;
  const baseUrl = "https://bapux03.github.io/mentor-nexus-flow";
  const fullCanonicalUrl = canonicalUrl ? `${baseUrl}${canonicalUrl}` : baseUrl;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const updateMeta = (property: string, content: string, isName = false) => {
      const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        if (isName) {
          element.setAttribute("name", property);
        } else {
          element.setAttribute("property", property);
        }
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Helper to update or create link tag
    const updateLink = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", rel);
        document.head.appendChild(element);
      }
      element.setAttribute("href", href);
    };

    // Basic meta tags
    updateMeta("description", description, true);
    if (keywords && keywords.length > 0) {
      updateMeta("keywords", keywords.join(", "), true);
    }
    if (author) {
      updateMeta("author", author, true);
    }

    // OpenGraph tags
    updateMeta("og:title", fullTitle);
    updateMeta("og:description", description);
    updateMeta("og:type", ogType);
    updateMeta("og:url", fullCanonicalUrl);
    updateMeta("og:image", ogImage);
    updateMeta("og:site_name", "MentorNexus");

    // Twitter Card tags
    updateMeta("twitter:card", "summary_large_image", true);
    updateMeta("twitter:title", fullTitle, true);
    updateMeta("twitter:description", description, true);
    updateMeta("twitter:image", ogImage, true);

    // Article specific
    if (ogType === "article" && publishedTime) {
      updateMeta("article:published_time", publishedTime);
    }
    if (author) {
      updateMeta("article:author", author);
    }

    // Canonical URL
    updateLink("canonical", fullCanonicalUrl);

    return () => {
      // Cleanup is not needed as we're just updating existing tags
    };
  }, [fullTitle, description, fullCanonicalUrl, ogImage, ogType, publishedTime, author, keywords]);

  return null;
};
