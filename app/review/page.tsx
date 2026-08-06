import type { Metadata } from "next";
import { PageIntro } from "../components/SiteShell";
import { reviewSteps } from "../site";

export const metadata: Metadata = { title: "Review process" };

const rubric = [
  ["Question or thesis", "Is the question clear, focused, and answerable?"],
  ["Context and contribution", "Does the paper explain earlier work and its contribution?"],
  ["Method or argument", "Is the method or argument clear and sound?"],
  ["Evidence and analysis", "Do the sources or data support the conclusion?"],
  ["Clarity", "Can a careful reader follow the terms and reasoning?"],
  ["Integrity", "Does the paper state limits, conflicts, consent, and source use?"],
];

export default function ReviewPage() {
  return (
    <main>
      <PageIntro
        eyebrow="Review process"
        title="What happens after you submit."
        description="The process is double-blind when practical. It uses one public rubric. An editor makes the final decision. The goal is a stronger paper, not a line on a résumé."
      />

      <section className="process-section">
        <p className="vertical-label">From draft to decision</p>
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
          <h2>The questions reviewers answer.</h2>
          <p>
            Reviewers score each area from 1 to 5 and explain the score. A
            field guide can add detail. These six questions stay the same.
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
          <h2>Reviewers advise. Editors decide.</h2>
        </div>
        <div className="decision-cards">
          <article><h3>Revise and resubmit</h3><p>The paper needs important changes before acceptance.</p></article>
          <article><h3>Accept with changes</h3><p>The paper is sound. Focused revisions and copyediting remain.</p></article>
          <article><h3>Decline</h3><p>The work is out of scope or has issues that a normal review cannot resolve.</p></article>
        </div>
      </section>

      <aside className="ethics-note">
        <p className="handwritten">when we have to say no</p>
        <h2>We do not accept work we cannot assess fairly.</h2>
        <p>
          Editors and reviewers step away from work by classmates,
          collaborators, relatives, or people they have mentored. A specialist
          or academic advisor helps when a paper exceeds the team&apos;s expertise.
        </p>
      </aside>
    </main>
  );
}
