import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../components/SiteShell";
import { SubmissionStatusForm } from "./SubmissionStatusForm";

export const metadata: Metadata = { title: "Check submission status" };

export default function StatusPage() {
  return (
    <main>
      <PageIntro eyebrow="For submitting authors" title="Check your submission stage." description="Enter the reference code from your confirmation and the email you used to submit. This page shows only the high-level stage." />
      <section className="status-section"><div className="status-intro"><p className="eyebrow">Private status lookup</p><h2>The manuscript stays private.</h2><p>This page does not show your title, file, reviewer comments, or personal details. Decisions and revision requests arrive by email.</p><Link className="text-link" href="/review">Review timeline</Link></div><SubmissionStatusForm /></section>
    </main>
  );
}
