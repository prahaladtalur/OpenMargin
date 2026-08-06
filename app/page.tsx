import Link from "next/link";
import { focusAreas, reviewSteps } from "./site";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="issue-kicker">Volume 01 · Autumn 2026</p>
          <h1>
            Student research,
            <span>read closely.</span>
          </h1>
          <p className="hero-deck">
            Open Margin is a free journal for research papers, essays, and
            projects by authors of any age. We publish work in the humanities,
            social sciences, and STEM. An editor reads each submission before
            we decide whether to review it.
          </p>
          <div className="hero-actions">
            <Link className="button button-dark" href="/submit">
              Submit a manuscript <span aria-hidden="true">→</span>
            </Link>
            <Link className="text-link" href="/review">
              See how review works
            </Link>
          </div>
        </div>
        <aside className="editor-note" aria-label="From the editors">
          <p className="handwritten">from the editors</p>
          <p>
            A publication should not be something a student can buy. We read
            the question and the evidence. We tell the author what could make
            the paper clearer.
          </p>
          <p className="note-signoff">Founding editorial team</p>
        </aside>
        <div className="hero-folio" aria-hidden="true">
          VOL. 01
        </div>
      </section>

      <section className="manifesto" aria-labelledby="manifesto-title">
        <p className="vertical-label">Our premise</p>
        <div className="manifesto-copy">
          <h2 id="manifesto-title">
            A paper improves in the margins.
          </h2>
          <p>
            Grades and résumés are not the whole point. Good comments show
            what works, what needs work, and what to try next.
          </p>
        </div>
        <dl className="manifesto-facts">
          <div><dt>$0</dt><dd>to submit or publish</dd></div>
          <div><dt>2×</dt><dd>reviewers per manuscript</dd></div>
          <div><dt>6 wk</dt><dd>target first decision</dd></div>
        </dl>
      </section>

      <section className="issue-preview">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Volume 01 · Pilot issue</p>
            <h2>Help us build Volume 01.</h2>
          </div>
          <Link className="text-link" href="/submit">See what fits <span aria-hidden="true">→</span></Link>
        </div>
        <div className="paper-list">
          {focusAreas.map((area, index) => (
            <article className="paper-row" key={area.field}>
              <p className="paper-number">{String(index + 1).padStart(2, "0")}</p>
              <div>
                <p className="paper-field">{area.field}</p>
                <h3>Send work with a clear question.</h3>
                <p className="paper-author">Pilot issue submissions are open</p>
              </div>
              <p className="paper-note">{area.note}</p>
              <span className="paper-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
        <p className="sample-disclaimer">
          The first issue has no published articles. We will list accepted work
          after review, revision, and author approval.
        </p>
      </section>

      <section className="review-preview">
        <div className="review-intro">
          <p className="eyebrow">After you submit</p>
          <h2>You can see how we decide.</h2>
          <p>
            Our standards are public. Reviewers use one rubric. Editors make the
            final decision and explain it in writing.
          </p>
          <Link className="button button-paper" href="/review">Read the complete process</Link>
        </div>
        <ol className="review-steps">
          {reviewSteps.slice(0, 3).map((step) => (
            <li key={step.number}>
              <span>{step.number}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
              <small>{step.timing}</small>
            </li>
          ))}
        </ol>
      </section>

      <section className="closing-callout">
        <p className="eyebrow">For the first issue</p>
        <h2>Send us the draft you want another reader to test.</h2>
        <p>
          We read original work from students of any age in history, literature,
          philosophy, economics, politics, sociology, anthropology, science,
          mathematics, computing, engineering, and related fields.
        </p>
        <div className="closing-actions">
          <Link className="button button-accent" href="/submit">Read the submission guide</Link>
          <Link className="text-link light" href="/partners">Partner with the journal</Link>
        </div>
      </section>
    </main>
  );
}
