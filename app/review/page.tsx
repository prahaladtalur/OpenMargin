import type { Metadata } from "next";
import { PageIntro } from "../components/SiteShell";
import { reviewSteps } from "../site";

export const metadata: Metadata = { title: "Review process" };

const rubric = [
  ["Question or thesis", "Is it clear, focused, and genuinely arguable or answerable?"],
  ["Context & contribution", "Does the paper understand existing work and explain what it adds?"],
  ["Method or argument", "Is the approach appropriate, transparent, and logically sound?"],
  ["Evidence & analysis", "Do the sources or data support the conclusions being made?"],
  ["Clarity", "Can a careful reader follow the structure, terms, and reasoning?"],
  ["Integrity", "Are limitations, conflicts, consent, and source use handled honestly?"],
];

export default function ReviewPage() {
  return (
    <main>
      <PageIntro
        eyebrow="Review process"
        title="Useful feedback is the point."
        description="Our review process is double-blind, rubric-based, and designed to make promising scholarship more precise, not to manufacture prestige."
      />

      <section className="process-section">
        <p className="vertical-label">From draft to issue</p>
        <ol className="process-list">
          {reviewSteps.map((step) => (
            <li key={step.number}>
              <p className="process-number">{step.number}</p>
              <div><h2>{step.title}</h2><p>{step.body}</p></div>
              <p className="process-time">{step.timing}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rubric-section">
        <div className="rubric-intro">
          <p className="eyebrow">The shared rubric</p>
          <h2>Six questions behind every review.</h2>
          <p>
            Reviewers score each area from 1–5 and must explain every score.
            Discipline-specific guidance supplements this shared core.
          </p>
        </div>
        <div className="rubric-list">
          {rubric.map(([title, body], index) => (
            <article key={title}>
              <span>{index + 1}</span>
              <div><h3>{title}</h3><p>{body}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="decision-grid">
        <div>
          <p className="eyebrow">Possible decisions</p>
          <h2>Reviewers recommend. Editors decide.</h2>
        </div>
        <div className="decision-cards">
          <article><h3>Revise & resubmit</h3><p>The idea is promising, but important changes are needed before acceptance.</p></article>
          <article><h3>Accept with changes</h3><p>The paper is sound; focused revisions and copyediting remain.</p></article>
          <article><h3>Decline</h3><p>The work is out of scope or has issues that cannot be resolved in a normal review cycle.</p></article>
        </div>
      </section>

      <aside className="ethics-note">
        <p className="handwritten">a necessary boundary</p>
        <h2>We do not review work we cannot assess responsibly.</h2>
        <p>
          Editors and reviewers recuse themselves from papers by classmates,
          collaborators, relatives, or anyone they have mentored. A specialist
          or academic advisor is asked to help when a paper exceeds the
          editorial team’s expertise.
        </p>
      </aside>
    </main>
  );
}
