import type { Metadata } from "next";
import Link from "next/link";
import { samplePapers } from "../site";

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
            The first issue is being assembled. The entries below are
            illustrative working titles, included to show how published work
            will be presented.
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
          {samplePapers.map((paper, index) => (
            <article key={paper.title}>
              <p className="paper-number">{String(index + 1).padStart(2, "0")}</p>
              <div>
                <p className="paper-field">{paper.field}</p>
                <h2>{paper.title}</h2>
                <p className="paper-author">{paper.author}</p>
              </div>
              <p className="paper-note">{paper.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="issue-empty">
        <p className="handwritten">this issue is still open</p>
        <h2>The next title here could be yours.</h2>
        <p>
          We are looking for careful questions, clear evidence, and authors
          willing to revise.
        </p>
        <Link className="button button-dark" href="/submit">Prepare a submission</Link>
      </section>
    </main>
  );
}
