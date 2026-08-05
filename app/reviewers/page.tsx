import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../components/SiteShell";
import { ReviewerApplicationForm } from "./ReviewerApplicationForm";

export const metadata: Metadata = { title: "Review with us" };

const roles = [
  ["Student reviewers", "Read blinded manuscripts with a shared rubric and write comments an author can use."],
  ["Section editors", "Screen for fit, coordinate reviews, and make decisions with the editorial team."],
  ["Academic advisors", "Help with calibration, specialized questions, and difficult decisions without taking over student leadership."],
  ["Research-communication volunteers", "Support copyediting, citation checks, accessibility, and author resources."],
];

export default function ReviewersPage() {
  return (
    <main>
      <PageIntro
        eyebrow="Contribute to the journal"
        title="Help us read the work well."
        description="Open Margin needs reviewers, editors, and advisors who can give student authors clear, honest comments."
      />

      <section className="contributor-roles">
        <div><p className="eyebrow">Ways to contribute</p><h2>Different roles. One standard.</h2><p>We recruit for relevant experience and careful reading. Every contributor agrees to confidentiality, conflict disclosure, and fair comments.</p></div>
        <div className="role-list">{roles.map(([title, body], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div>
      </section>

      <section className="contributor-principles">
        <p className="eyebrow">Before an invitation</p>
        <div><h2>We show reviewers what the job involves.</h2><p>New reviewers start with the public rubric, sample reviews, and a calibration exercise. Editors assign work only when the field, capacity, and conflicts make sense. No contributor reviews work by a classmate, collaborator, relative, or mentee.</p><Link className="text-link" href="/review">Read the review process</Link></div>
      </section>

      <section className="submission-portal" id="apply">
        <div className="portal-heading"><p className="eyebrow">Reviewer and advisor application</p><h2>Tell us how you read.</h2><p>Applications stay private. We contact candidates whose experience fits the current need. Applicants under 18 need a guardian email.</p></div>
        <ReviewerApplicationForm />
      </section>
    </main>
  );
}
