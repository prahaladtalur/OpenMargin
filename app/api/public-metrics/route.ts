import { desc } from "drizzle-orm";
import { publishedArticles } from "../../../db/schema";
import { getDb } from "../../../db";

export const dynamic = "force-dynamic";

/**
 * Public-only operational metrics for an optional cloud portfolio dashboard.
 * Never add authors, emails, manuscript titles, reviewer data, or submissions
 * to this response.
 */
export async function GET() {
  const articles = await getDb()
    .select({ discipline: publishedArticles.discipline, publishedAt: publishedArticles.publishedAt })
    .from(publishedArticles)
    .orderBy(desc(publishedArticles.publishedAt));

  const publicDisciplines = [...new Set(articles.map((article) => article.discipline))].sort();

  return Response.json({
    generatedAt: new Date().toISOString(),
    publishedArticleCount: articles.length,
    publicDisciplines,
    latestPublishedAt: articles[0]?.publishedAt ?? null,
    reviewPolicy: {
      writtenReviewsPerEligibleManuscript: 2,
      decisionTarget: "six to eight weeks",
    },
  }, {
    headers: {
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
