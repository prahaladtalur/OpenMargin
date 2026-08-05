import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../components/SiteShell";

export const metadata: Metadata = { title: "Author toolkit" };

const checks = [
  ["Start with a question", "State a question or thesis that a reader can test, follow, or challenge."],
  ["Show your trail", "Use a consistent citation style or data record and make it possible for a reader to locate the evidence behind every major claim."],
  ["Name the limits", "Explain what your evidence can and cannot establish. A limitation is part of a credible argument."],
  ["Blind the manuscript", "Remove your name, school, acknowledgments, and identifying file metadata before upload."],
  ["Disclose assistance", "Briefly explain material AI, mentor, editing, translation, coding, or data-analysis help."],
  ["Invite revision", "Before submitting, ask one careful reader where the argument is least clear and revise with a point-by-point plan."],
];

export default function ResourcesPage() {
  return (
    <main>
      <PageIntro eyebrow="Author toolkit" title="Make the paper easier to review." description="A free checklist for student researchers, teachers, and program leaders. Use it to find the weak spots before you upload." />
      <section className="toolkit-grid"><div><p className="eyebrow">A six-part self-check</p><h2>Before you upload.</h2><p>Run through this list once the draft is complete. It works for humanities, social-science, and STEM work from a class, capstone, research program, or independent project.</p></div><ol>{checks.map(([title, body], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol></section>
      <section className="resource-cards"><article><p className="eyebrow">For authors</p><h2>Read the rubric first.</h2><p>These are the six questions reviewers answer. If one exposes a gap, revise before you send the paper.</p><Link className="text-link" href="/review">Read the rubric</Link></article><article><p className="eyebrow">For teachers & programs</p><h2>Let students choose.</h2><p>Share the checklist, support revision, and let each student decide whether Open Margin fits. Editorial decisions stay independent.</p><Link className="text-link" href="/partners">Explore partnerships</Link></article><article><p className="eyebrow">For contributors</p><h2>Learn to write a useful review.</h2><p>We recruit reviewers and advisors who can make comments specific, confidential, and fair.</p><Link className="text-link" href="/reviewers">Review with us</Link></article></section>
      <section className="closing-callout"><p className="eyebrow">When the draft is ready</p><h2>Do the last check before the portal.</h2><p>Blind the file, check the sources, explain the limits, and make sure you are ready to hear what another reader sees.</p><div className="closing-actions"><Link className="button button-accent" href="/submit">Open the submission guide</Link><Link className="text-link light" href="/status">Check a submission status</Link></div></section>
    </main>
  );
}
