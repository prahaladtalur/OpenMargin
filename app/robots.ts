import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/editor", "/api/", "/status"] }],
    sitemap: "https://openmargin.org/sitemap.xml",
  };
}
