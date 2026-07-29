import Link from "next/link";
import { focusAreas, reviewSteps } from "./site";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="issue-kicker">Pilot issue · Autumn 2026</p>
          <h1>
            Serious work deserves
            <span>serious attention.</span>
          </h1>
          <p className="hero-deck">
            A free, open-access journal where secondary-school researchers in
            the humanities, social sciences, and STEM receive rigorous review
            and feedback worth keeping.
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
            Publication should not be something a student can buy. We care
            about the question you asked, the evidence you found, and whether
            our comments help you think more precisely.
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
            The margin is where a paper <em>becomes better.</em>
          </h2>
          <p>
            Most student journals optimize for the final line on a résumé.
            Open Margin is built around the part that comes before it: careful
            reading, honest questions, revision, and exchange across schools.
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
            <h2>Make the first table of contents real.</h2>
          </div>
          <Link className="text-link" href="/submit">See what fits <span aria-hidden="true">→</span></Link>
        </div>
        <div className="paper-list">
          {focusAreas.map((area, index) => (
            <article className="paper-row" key={area.field}>
              <p className="paper-number">{String(index + 1).padStart(2, "0")}</p>
              <div>
                <p className="paper-field">{area.field}</p>
                <h3>Work that gives a careful reader somewhere to go.</h3>
                <p className="paper-author">Pilot issue accepting submissions</p>
              </div>
              <p className="paper-note">{area.note}</p>
              <span className="paper-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
        <p className="sample-disclaimer">
          The pilot issue has no published articles yet. We will list accepted
          work only after the full editorial process is complete.
        </p>
      </section>

      <section className="review-preview">
        <div className="review-intro">
          <p className="eyebrow">No black box</p>
          <h2>A review process you can see.</h2>
          <p>
            Every author sees the same standards before submitting. Every
            reviewer is trained on the same rubric. Editors, not reviewers, own
            the final decision.
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
        <h2>Bring us the paper you kept thinking about.</h2>
        <p>
          We welcome original work from students ages 14–19 in history,
          literature, philosophy, economics, politics, sociology, anthropology,
          science, mathematics, computing, engineering, and related fields.
        </p>
        <div className="closing-actions">
          <Link className="button button-accent" href="/submit">Read the submission guide</Link>
          <Link className="text-link light" href="/partners">Partner with the journal</Link>
        </div>
      </section>
    </main>
  );
}
