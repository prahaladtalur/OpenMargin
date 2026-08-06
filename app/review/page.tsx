import type { Metadata } from "next";
import { PageIntro } from "../components/SiteShell";
import { reviewSteps } from "../site";

export const metadata: Metadata = {
  title: "Review process",
  description: "See how Open Margin checks, reviews, and decides on each student research paper.",
};

const rubric = [
  ["Question or thesis", "Is the main question clear and focused?"],
  ["Context and contribution", "Does the paper explain what other people have said?"],
  ["Method or argument", "Is the method or argument clear?"],
  ["Evidence and analysis", "Do the sources or data support the conclusion?"],
  ["Clarity", "Can a careful reader follow the paper?"],
  ["Integrity", "Does the paper explain limits, conflicts, consent, and source use?"],
];

export default function ReviewPage() {
  return (
    <main>
      <PageIntro
        eyebrow="Review process"
        title="A clear process for every paper."
        description="You submit once. An editor checks fit. Two reviewers read the paper. You receive a written decision and comments. Our target is a decision within six to eight weeks."
      />

      <section className="review-summary" aria-label="Review promises">
        <article>
          <p className="eyebrow">What you receive</p>
          <h2>Two written reviews and a decision letter.</h2>
          <p>We tell you what is working, what needs work, and what to try next.</p>
        </article>
        <article>
          <p className="eyebrow">What we do not promise</p>
          <h2>Acceptance or a fixed date.</h2>
          <p>We do not sell publication. Our six to eight week timeline is a target. A complex paper or a specialist review can take longer.</p>
        </article>
      </section>

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
            Reviewers score each area from 1 to 5 and explain the score. These
            six questions stay the same for every paper.
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
          <article><h3>Revise and resubmit</h3><p>The paper needs important changes before we can accept it.</p></article>
          <article><h3>Accept with changes</h3><p>The paper is sound. It needs focused revisions and copyediting.</p></article>
          <article><h3>Decline</h3><p>The paper is out of scope or has issues that this review cannot resolve. We aim to include useful comments.</p></article>
        </div>
      </section>

      <aside className="ethics-note">
        <p className="handwritten">when we have to say no</p>
        <h2>We step away when we cannot be fair.</h2>
        <p>
          Editors and reviewers do not handle work by classmates, close
          collaborators, relatives, mentors, or anyone else whose relationship
          could affect the decision. A specialist or academic advisor helps
          when a paper exceeds the team&apos;s expertise.
        </p>
      </aside>
    </main>
  );
}
