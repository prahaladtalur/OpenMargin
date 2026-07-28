import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../components/SiteShell";

export const metadata: Metadata = { title: "Author toolkit" };

const checks = [
  ["Start with a question", "State a question or thesis that a reader can test, follow, or challenge."],
  ["Show your trail", "Use a consistent citation style and make it possible for a reader to locate the evidence behind every major claim."],
  ["Name the limits", "Explain what your evidence can and cannot establish. A limitation is part of a credible argument."],
  ["Blind the manuscript", "Remove your name, school, acknowledgments, and identifying file metadata before upload."],
  ["Disclose assistance", "Briefly explain material AI, mentor, editing, translation, coding, or data-analysis help."],
  ["Invite revision", "Before submitting, ask one careful reader where the argument is least clear and revise with a point-by-point plan."],
];

export default function ResourcesPage() {
  return (
    <main>
      <PageIntro eyebrow="Author toolkit" title="Prepare the paper you want someone to take seriously." description="A practical, free preparation guide for student researchers, teachers, and program leaders. It is not a shortcut to acceptance. It is a way to make the review more useful." />
      <section className="toolkit-grid"><div><p className="eyebrow">A six-part self-check</p><h2>Before you press submit.</h2><p>Use this checklist after a draft is complete. It is designed for serious humanities and social-science scholarship, whether the work began in a course, a capstone, a research program, or an independent project.</p></div><ol>{checks.map(([title, body], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol></section>
      <section className="resource-cards"><article><p className="eyebrow">For authors</p><h2>Use the public rubric.</h2><p>Read the six questions reviewers use before you submit. If you cannot answer one yet, that is useful revision information.</p><Link className="text-link" href="/review">Read the rubric</Link></article><article><p className="eyebrow">For teachers & programs</p><h2>Keep the choice with students.</h2><p>Share the guide, support revision, and let students decide whether the journal is a fit. Editorial decisions stay independent.</p><Link className="text-link" href="/partners">Explore partnerships</Link></article><article><p className="eyebrow">For contributors</p><h2>Learn to review with care.</h2><p>We recruit reviewers and advisors who can make feedback specific, confidential, and constructive.</p><Link className="text-link" href="/reviewers">Review with us</Link></article></section>
      <section className="closing-callout"><p className="eyebrow">Ready when the argument is</p><h2>A better first submission begins before the portal.</h2><p>When your work is blinded, sourced, honest about its limits, and ready for feedback, we are ready to read it.</p><div className="closing-actions"><Link className="button button-accent" href="/submit">Open the submission guide</Link><Link className="text-link light" href="/status">Check a submission status</Link></div></section>
    </main>
  );
}
