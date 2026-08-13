import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { ensureSubmissionTable, getDb } from "../../db";
import { publishedArticles } from "../../db/schema";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pilot issue" };

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export default async function IssuePage() {
  await ensureSubmissionTable();
  const articles = await getDb().select().from(publishedArticles).orderBy(desc(publishedArticles.publishedAt));

  return (
    <main>
      <section className="issue-cover">
        <div className="issue-cover-meta">
          <p>Volume 01</p><p>Autumn 2026</p>
        </div>
        <div>
          <p className="eyebrow">Pilot issue</p>
          <h1>{articles.length > 0 ? "Volume 01 is open." : "Volume 01 is in progress."}</h1>
          <p>
            {articles.length > 0 ? "Read the accepted work below. We will add more articles after review, revision, and author approval." : "We will add articles after review, revision, and author approval."}
          </p>
        </div>
        <p className="issue-cover-number" aria-hidden="true">01</p>
      </section>

      <section className="issue-contents">
        <div className="contents-label">
          <p className="eyebrow">Contents</p>
          <p>Research articles</p>
        </div>
        <div className="contents-list">
          {articles.length === 0 ? (
            <article><p className="paper-number">01</p><div><p className="paper-field">Pilot issue</p><h2>Articles will appear after acceptance.</h2><p className="paper-author">We list work after the review cycle ends.</p></div><p className="paper-note">Submissions open</p></article>
          ) : articles.map((article, index) => (
            <article key={article.id}>
              <p className="paper-number">{String(index + 1).padStart(2, "0")}</p>
              <div><p className="paper-field">{article.discipline}</p><h2><Link href={`/articles/${article.slug}`}>{article.title}</Link></h2><p className="paper-author">{article.authorName} · published {formatDate(article.publishedAt)}</p></div>
              <p className="paper-note">Read article</p>
            </article>
          ))}
        </div>
      </section>

      <section className="issue-empty">
        <p className="handwritten">send the next paper</p>
        <h2>The first issue has room.</h2>
        <p>
          Send a question, the evidence behind it, and a draft you can revise.
        </p>
        <Link className="button button-dark" href="/submit">Prepare a submission</Link>
      </section>
    </main>
  );
}
