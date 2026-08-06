import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../components/SiteShell";

export const metadata: Metadata = { title: "Author toolkit" };

const checks = [
  ["Start with a question", "State a question or thesis that a reader can follow and challenge."],
  ["Show your sources", "Use one citation style or data record. Let readers find the evidence for each major claim."],
  ["Name the limits", "Say what your evidence can and cannot show."],
  ["Blind the manuscript", "Remove your name, school, acknowledgments, and file metadata before upload."],
  ["Disclose assistance", "Explain material help from AI tools, mentors, editors, translators, coders, or data analysts."],
  ["Invite revision", "Ask one careful reader where the argument is least clear. Then revise with a short plan."],
];

export default function ResourcesPage() {
  return (
    <main>
      <PageIntro eyebrow="Author toolkit" title="Make the paper easier to review." description="Use this free checklist before you upload. It is for student researchers, teachers, and program leaders." />
      <section className="toolkit-grid"><div><p className="eyebrow">A six-part self-check</p><h2>Before you upload.</h2><p>Use this list when the draft is complete. It works for classwork, capstones, research programs, and independent projects in the humanities, social sciences, and STEM.</p></div><ol>{checks.map(([title, body], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol></section>
      <section className="resource-cards"><article><p className="eyebrow">For authors</p><h2>Read the rubric first.</h2><p>These are the questions reviewers answer. Fix a gap before you send the paper.</p><Link className="text-link" href="/review">Read the rubric</Link></article><article><p className="eyebrow">For teachers and programs</p><h2>Let students choose.</h2><p>Share the checklist. Support revision. Let each student decide whether Open Margin fits.</p><Link className="text-link" href="/partners">Explore partnerships</Link></article><article><p className="eyebrow">For contributors</p><h2>Write a useful review.</h2><p>We need reviewers and advisors who write specific, private, and fair comments.</p><Link className="text-link" href="/reviewers">Review with us</Link></article></section>
      <section className="closing-callout"><p className="eyebrow">When the draft is ready</p><h2>Do one last check before you submit.</h2><p>Blind the file. Check the sources. Explain the limits. Make sure you are ready for another reader&apos;s comments.</p><div className="closing-actions"><Link className="button button-accent" href="/submit">Open the submission guide</Link><Link className="text-link light" href="/status">Check a submission status</Link></div></section>
    </main>
  );
}
