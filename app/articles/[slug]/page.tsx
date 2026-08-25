import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ensureSubmissionTable, getDb } from "../../../db";
import { publishedArticles } from "../../../db/schema";

export const dynamic = "force-dynamic";

async function getArticle(slug: string) {
  await ensureSubmissionTable();
  const [article] = await getDb().select().from(publishedArticles).where(eq(publishedArticles.slug, slug)).limit(1);
  return article;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(date);
}

function bodyParagraphs(body: string) {
  return body.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.title,
    description: article.abstract,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: { title: article.title, description: article.abstract, type: "article", publishedTime: article.publishedAt, authors: [article.authorName] },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();
  const publicUrl = `https://openmargin.org/articles/${article.slug}`;
  const citation = `${article.authorName}. (${new Date(article.publishedAt).getFullYear()}). ${article.title}. Open Margin, ${article.issue}. ${publicUrl}`;

  return (
    <main>
      <article className="article-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ScholarlyArticle",
          headline: article.title,
          abstract: article.abstract,
          author: { "@type": "Person", name: article.authorName },
          datePublished: article.publishedAt,
          isPartOf: { "@type": "PublicationIssue", name: article.issue, isPartOf: { "@type": "Periodical", name: "Open Margin", url: "https://openmargin.org" } },
          url: publicUrl,
          isAccessibleForFree: true,
          inLanguage: "en",
        }) }} />
        <header className="article-header">
          <div className="article-header-meta"><span>{article.issue}</span><span>{formatDate(article.publishedAt)}</span></div>
          <p className="eyebrow">{article.discipline}</p>
          <h1>{article.title}</h1>
          <p className="article-byline">{article.authorName}</p>
        </header>
        <section className="article-body">
          <aside className="article-aside"><p className="eyebrow">Abstract</p><p>{article.abstract}</p><p className="article-citation-label">Suggested citation</p><p className="article-citation">{citation}</p><Link className="text-link" href="/issue">Back to the issue</Link></aside>
          <div className="article-text">{bodyParagraphs(article.body).map((paragraph, index) => <p key={`${article.id}-${index}`}>{paragraph}</p>)}</div>
        </section>
      </article>
    </main>
  );
}
