import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../components/SiteShell";
import { SubmissionStatusForm } from "./SubmissionStatusForm";

export const metadata: Metadata = { title: "Check submission status" };

export default function StatusPage() {
  return (
    <main>
      <PageIntro eyebrow="For submitting authors" title="Check the stage, not someone else’s work." description="Use the reference code from your submission confirmation and the email you used to submit. We share only the high-level editorial stage here." />
      <section className="status-section"><div className="status-intro"><p className="eyebrow">Private status lookup</p><h2>Your manuscript stays private.</h2><p>This page never shows your title, file, reviewer comments, or personal details. For a decision or revision request, use the editorial email thread.</p><Link className="text-link" href="/review">Review timeline</Link></div><SubmissionStatusForm /></section>
    </main>
  );
}
