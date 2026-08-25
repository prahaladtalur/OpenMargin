import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { ensureSubmissionTable, getDb } from "../../db";
import { publishedArticles } from "../../db/schema";
import { PageIntro } from "../components/SiteShell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Public record",
  description: "Public issue, process, and independence information for Open Margin.",
};

function formatDate(value: string | undefined) {
  if (!value) return "No article published yet";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(date);
}

export default async function TransparencyPage() {
  await ensureSubmissionTable();
  const articles = await getDb().select().from(publishedArticles).orderBy(desc(publishedArticles.publishedAt));
  const latest = articles[0];
  const disciplines = [...new Set(articles.map((article) => article.discipline))];

  return (
    <main>
      <PageIntro
        eyebrow="Public record"
        title="Show the work behind the promise."
        description="Open Margin publishes the information authors and partners need to judge the journal for themselves. We do not publish private submission or reviewer data."
      />

      <section className="transparency-summary" aria-labelledby="transparency-summary-title">
        <div className="section-heading"><div><p className="eyebrow">Current snapshot</p><h2 id="transparency-summary-title">Volume 01, in public.</h2></div><p className="transparency-updated">Updated from the publication record</p></div>
        <div className="transparency-stat-grid">
          <article><span>{articles.length}</span><p>Published articles</p></article>
          <article><span>$0</span><p>Submission or publication fee</p></article>
          <article><span>2×</span><p>Written reviews per eligible manuscript</p></article>
          <article><span>{disciplines.length || "Open"}</span><p>{disciplines.length ? "Published fields" : "Fields currently open"}</p></article>
        </div>
      </section>

      <section className="transparency-grid">
        <div>
          <p className="eyebrow">Publication record</p>
          <h2>{latest ? "The latest article is available to read." : "The first article is still in progress."}</h2>
          <p>{latest ? `The most recent article was published on ${formatDate(latest.publishedAt)}. We add work only after review, revision, and author approval.` : "We will list an article only after the review cycle ends and the author approves the final version."}</p>
          {latest && <Link className="text-link" href={`/articles/${latest.slug}`}>Read the latest article <span aria-hidden="true">↗</span></Link>}
        </div>
        <dl className="transparency-details">
          <div><dt>Issue</dt><dd>Volume 01 · Autumn 2026</dd></div>
          <div><dt>Last publication</dt><dd>{formatDate(latest?.publishedAt)}</dd></div>
          <div><dt>Author rights</dt><dd>Authors retain copyright</dd></div>
          <div><dt>Review model</dt><dd>Double-blind when practical</dd></div>
        </dl>
      </section>

      <section className="transparency-guardrails">
        <div><p className="eyebrow">What we protect</p><h2>Trust is part of the publication record.</h2></div>
        <ul>
          <li>Editors make decisions independently. A program connection does not give a submission priority.</li>
          <li>We do not sell publication, priority review, access to student data, or a guaranteed result.</li>
          <li>We keep manuscript files, reviewer identities, contact details, and decision records private.</li>
          <li>We publish corrections or retractions when a serious problem affects the public record.</li>
        </ul>
      </section>

      <section className="transparency-next">
        <p className="eyebrow">Read the operating documents</p>
        <div><Link className="button button-dark" href="/policies">Editorial policies</Link><Link className="button button-paper" href="/review">Review process</Link><Link className="button button-paper" href="/about#masthead">Masthead and advisors</Link></div>
      </section>
    </main>
  );
}
