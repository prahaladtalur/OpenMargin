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
          <h1>Questions worth following.</h1>
          <p>
            The first issue is being assembled. Accepted articles will appear
            here only after review, revision, and author approval are complete.
          </p>
        </div>
        <p className="issue-cover-number" aria-hidden="true">01</p>
      </section>

      <section className="issue-contents">
        <div className="contents-label">
          <p className="eyebrow">Contents</p>
          <p>Research articles</p>
        </div>
        <div className="contents-list"><article><p className="paper-number">01</p><div><p className="paper-field">Pilot issue</p><h2>Contents will be published after the review cycle.</h2><p className="paper-author">No articles are listed before acceptance.</p></div><p className="paper-note">Open submissions</p></article></div>
      </section>

      <section className="issue-empty">
          <p className="handwritten">this issue is still open</p>
          <h2>The first title here could be yours.</h2>
        <p>
          We are looking for careful questions, clear evidence, and authors
          willing to revise.
        </p>
        <Link className="button button-dark" href="/submit">Prepare a submission</Link>
      </section>
    </main>
  );
}
