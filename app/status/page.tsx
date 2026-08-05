import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../components/SiteShell";
import { SubmissionStatusForm } from "./SubmissionStatusForm";

export const metadata: Metadata = { title: "Check submission status" };

export default function StatusPage() {
  return (
    <main>
      <PageIntro eyebrow="For submitting authors" title="Check your submission stage." description="Enter the reference code from your confirmation and the email used to submit. We show only the high-level editorial stage here." />
      <section className="status-section"><div className="status-intro"><p className="eyebrow">Private status lookup</p><h2>The manuscript stays private.</h2><p>This page never shows your title, file, reviewer comments, or personal details. Decisions and revision requests arrive in the editorial email thread.</p><Link className="text-link" href="/review">Review timeline</Link></div><SubmissionStatusForm /></section>
    </main>
  );
}
