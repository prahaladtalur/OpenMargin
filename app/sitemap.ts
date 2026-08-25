import type { MetadataRoute } from "next";
import { ensureSubmissionTable, getDb } from "../db";
import { publishedArticles } from "../db/schema";

export const dynamic = "force-dynamic";

const origin = "https://openmargin.org";
const publicRoutes = ["/", "/issue", "/about", "/review", "/guide", "/resources", "/policies", "/reviewers", "/partners", "/share", "/submit", "/transparency"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseEntries = publicRoutes.map((path) => ({ url: `${origin}${path}`, changeFrequency: "weekly" as const, priority: path === "/" ? 1 : 0.6 }));
  try {
    await ensureSubmissionTable();
    const articles = await getDb().select({ slug: publishedArticles.slug, publishedAt: publishedArticles.publishedAt }).from(publishedArticles);
    return [...baseEntries, ...articles.map((article) => ({ url: `${origin}/articles/${article.slug}`, lastModified: new Date(article.publishedAt), changeFrequency: "monthly" as const, priority: 0.7 }))];
  } catch {
    return baseEntries;
  }
}
