import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { ensureSubmissionTable, getDb } from "../../db";
import { publishedArticles } from "../../db/schema";
import { PageIntro } from "../components/SiteShell";
import { publicUpdates } from "../site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Updates",
  description: "A factual record of what Open Margin has published, changed, and is testing next.",
};

export default async function UpdatesPage() {
  await ensureSubmissionTable();
  const articles = await getDb()
    .select({ slug: publishedArticles.slug, title: publishedArticles.title, publishedAt: publishedArticles.publishedAt })
    .from(publishedArticles)
    .orderBy(desc(publishedArticles.publishedAt));

  const latest = articles[0];

  return (
    <main>
      <PageIntro
        eyebrow="Public updates"
        title="A small record of the work behind the journal."
        description="This page separates what is live from what we are still building. We add an update when a public part of the journal changes."
      />

      <section className="updates-snapshot" aria-labelledby="updates-snapshot-title">
        <div>
          <p className="eyebrow">Current snapshot</p>
          <h2 id="updates-snapshot-title">A current snapshot of publication and capacity.</h2>
          <p>
            Volume 01 currently lists {articles.length} published {articles.length === 1 ? "article" : "articles"}. We will add work after the full review process, author approval, and final copyediting.
          </p>
          <div className="updates-actions">
            <Link className="button button-dark" href="/issue">Read the issue</Link>
            <Link className="text-link" href="/reviewers">Apply to contribute</Link>
          </div>
        </div>
        <dl className="updates-facts">
          <div><dt>Cost</dt><dd>$0 to submit or publish</dd></div>
          <div><dt>Review target</dt><dd>Six to eight weeks</dd></div>
          <div><dt>Current public record</dt><dd>{latest ? <Link href={`/articles/${latest.slug}`}>{latest.title}</Link> : "No article published yet"}</dd></div>
        </dl>
      </section>

      <section className="updates-timeline" aria-labelledby="updates-timeline-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">What changed</p>
            <h2 id="updates-timeline-title">The pilot, in plain language.</h2>
          </div>
        </div>
        <div className="updates-list">
          {publicUpdates.map((update, index) => (
            <article key={update.title}>
              <div className="updates-list-meta"><span>{String(index + 1).padStart(2, "0")}</span><p>{update.period}</p></div>
              <div>
                <p className="eyebrow">{update.label}</p>
                <h3>{update.title}</h3>
                <p>{update.body}</p>
                <Link className="text-link" href={update.href}>{update.link} <span aria-hidden="true">↗</span></Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="updates-next" aria-labelledby="updates-next-title">
        <div>
          <p className="eyebrow">Next evidence</p>
          <h2 id="updates-next-title">The next milestone is a complete review cycle.</h2>
        </div>
        <ol>
          <li><span>01</span><p>Confirm two qualified reviewers and one backup for the paper&apos;s field.</p></li>
          <li><span>02</span><p>Run the fit check, two written reviews, and an editor decision.</p></li>
          <li><span>03</span><p>Publish only the final version that the author approves.</p></li>
        </ol>
      </section>

      <section className="updates-guardrails" aria-labelledby="updates-guardrails-title">
        <div>
          <p className="eyebrow">What we will not claim</p>
          <h2 id="updates-guardrails-title">Evidence before reputation.</h2>
        </div>
        <ul>
          <li>Open Margin does not guarantee acceptance, admissions value, or a fixed decision date.</li>
          <li>Open Margin is not currently indexed in Scopus. An ISSN and indexing review come later, after a stable publication record.</li>
          <li>Partner referrals do not give a manuscript priority and do not send student data to the journal.</li>
        </ul>
      </section>

      <section className="closing-callout">
        <p className="eyebrow">Read before you send</p>
        <h2>See the process, then decide if it fits.</h2>
        <p>Authors, reviewers, and programs can read the same public rules before they take part.</p>
        <div className="closing-actions">
          <Link className="button button-accent" href="/review">Read the review process</Link>
          <Link className="text-link light" href="/policies">Read the policies</Link>
        </div>
      </section>
    </main>
  );
}
