import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Pilot issue" };

export default function IssuePage() {
  return (
    <main>
      <section className="issue-cover">
        <div className="issue-cover-meta">
          <p>Volume 01</p><p>Autumn 2026</p>
        </div>
        <div>
          <p className="eyebrow">Pilot issue</p>
          <h1>Volume 01 is in progress.</h1>
          <p>
            We will add articles after review, revision, and author approval.
          </p>
        </div>
        <p className="issue-cover-number" aria-hidden="true">01</p>
      </section>

      <section className="issue-contents">
        <div className="contents-label">
          <p className="eyebrow">Contents</p>
          <p>Research articles</p>
        </div>
        <div className="contents-list"><article><p className="paper-number">01</p><div><p className="paper-field">Pilot issue</p><h2>Articles will appear after acceptance.</h2><p className="paper-author">We list work after the review cycle ends.</p></div><p className="paper-note">Submissions open</p></article></div>
      </section>

      <section className="issue-empty">
          <p className="handwritten">send the first paper</p>
          <h2>The first issue has room.</h2>
        <p>
          Send a question, the evidence behind it, and a draft you can revise.
        </p>
        <Link className="button button-dark" href="/submit">Prepare a submission</Link>
      </section>
    </main>
  );
}
