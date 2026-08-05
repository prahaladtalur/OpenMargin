import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../components/SiteShell";

export const metadata: Metadata = { title: "Author toolkit" };

const checks = [
  ["Start with a question", "State a question or thesis that a reader can follow and challenge."],
  ["Show your trail", "Use one citation style or data record. Let readers find the evidence behind each major claim."],
  ["Name the limits", "Say what your evidence can and cannot show. Limits make an argument more credible."],
  ["Blind the manuscript", "Remove your name, school, acknowledgments, and identifying file metadata before upload."],
  ["Disclose assistance", "Explain any material help from AI tools, mentors, editors, translators, coders, or data analysts."],
  ["Invite revision", "Ask one careful reader where the argument is least clear, then revise with a point-by-point plan."],
];

export default function ResourcesPage() {
  return (
    <main>
      <PageIntro eyebrow="Author toolkit" title="Make the paper easier to review." description="A free checklist for student researchers, teachers, and program leaders. Use it to find weak spots before you upload." />
      <section className="toolkit-grid"><div><p className="eyebrow">A six-part self-check</p><h2>Before you upload.</h2><p>Run through this list once the draft is complete. It works for work from a class, capstone, research program, or independent project in the humanities, social sciences, or STEM.</p></div><ol>{checks.map(([title, body], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol></section>
      <section className="resource-cards"><article><p className="eyebrow">For authors</p><h2>Read the rubric first.</h2><p>These are the questions reviewers answer. If one exposes a gap, fix it before you send the paper.</p><Link className="text-link" href="/review">Read the rubric</Link></article><article><p className="eyebrow">For teachers and programs</p><h2>Let students choose.</h2><p>Share the checklist, support revision, and let each student decide whether Open Margin fits. Editors stay independent.</p><Link className="text-link" href="/partners">Explore partnerships</Link></article><article><p className="eyebrow">For contributors</p><h2>Write a useful review.</h2><p>We recruit reviewers and advisors who can write specific, private, and fair comments.</p><Link className="text-link" href="/reviewers">Review with us</Link></article></section>
      <section className="closing-callout"><p className="eyebrow">When the draft is ready</p><h2>Do one last check before you submit.</h2><p>Blind the file, check the sources, explain the limits, and make sure you are ready to hear what another reader sees.</p><div className="closing-actions"><Link className="button button-accent" href="/submit">Open the submission guide</Link><Link className="text-link light" href="/status">Check a submission status</Link></div></section>
    </main>
  );
}
