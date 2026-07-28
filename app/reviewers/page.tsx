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
        title="Make the margin a real place to learn."
        description="Open Margin needs careful readers, thoughtful editors, and advisors who want student scholarship to receive honest attention."
      />

      <section className="contributor-roles">
        <div><p className="eyebrow">Ways to contribute</p><h2>Different experience. Shared standard.</h2><p>We recruit for fit and care, not a prestige signal. Every contributor agrees to confidentiality, conflict disclosure, and constructive feedback.</p></div>
        <div className="role-list">{roles.map(([title, body], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div>
      </section>

      <section className="contributor-principles">
        <p className="eyebrow">Before an invitation</p>
        <div><h2>We train for the work we actually ask people to do.</h2><p>New reviewers begin with the public rubric, sample reviews, and a calibration exercise. Editors assign work only when fields, capacity, and conflicts make sense. No contributor reviews work by a classmate, collaborator, relative, or mentee.</p><Link className="text-link" href="/review">Read the review process</Link></div>
      </section>

      <section className="submission-portal" id="apply">
        <div className="portal-heading"><p className="eyebrow">Reviewer and advisor application</p><h2>Start with the way you read.</h2><p>We keep applications private and contact only candidates we want to speak with. For applicants under 18, a guardian email is required.</p></div>
        <ReviewerApplicationForm />
      </section>
    </main>
  );
}
