import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../components/SiteShell";
import { standards } from "../site";
import { SubmissionForm } from "./SubmissionForm";

export const metadata: Metadata = { title: "Submit work" };

const checklist = [
  "A blinded paper or project report",
  "A 300 to 1,800 character abstract",
  "A clear list of sources or references",
  "A short note on where the work came from",
  "Parent or guardian approval for authors under 18",
];

export default function SubmitPage() {
  return (
    <main>
      <PageIntro
        eyebrow="Submission guide"
        title="Send your paper or project."
        description="We read student research, essays, and projects in the humanities, social sciences, and STEM. There is no submission fee."
      />

      <section className="eligibility-grid">
        <div>
          <p className="eyebrow">What we publish</p>
          <h2>What fits here.</h2>
        </div>
        <div className="eligibility-copy">
          <p>
            We accept papers, essays, science fair studies, lab reports, and
            design projects. Work in history, literature, economics, biology,
            physics, mathematics, computing, engineering, and related fields
            can fit.
          </p>
          <p>
            Classwork, independent projects, mentored research, and graded work
            are eligible. The work must be your own.
          </p>
          <p>
            Anyone can submit. Authors under 18 need parent or guardian
            approval. For specialized STEM work, we accept papers only when a
            suitable subject reviewer is available.
          </p>
          <p>
            Open Margin is one option among others. If the same work is under
            consideration elsewhere, tell us before submitting.
          </p>
        </div>
      </section>

      <section className="standards-section">
        <p className="eyebrow">What we look for</p>
        <div className="standards-grid">
          <h2>Start with a question. Show how you know.</h2>
          <ul>
            {standards.map((standard) => <li key={standard}>{standard}</li>)}
          </ul>
        </div>
      </section>

      <section className="submission-specs" id="checklist">
        <div className="specs-main">
          <p className="eyebrow">Manuscript checklist</p>
          <h2>Before you upload.</h2>
          <ol>
            {checklist.map((item, index) => (
              <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>
            ))}
          </ol>
        </div>
        <aside className="spec-card">
          <p className="eyebrow">At a glance</p>
          <dl>
            <div><dt>Length</dt><dd>2,500 to 8,000 words</dd></div>
            <div><dt>Format</dt><dd>PDF or DOCX</dd></div>
            <div><dt>Review</dt><dd>Double-blind</dd></div>
            <div><dt>Cost</dt><dd>Always $0</dd></div>
            <div><dt>License</dt><dd>Author retains copyright</dd></div>
          </dl>
        </aside>
      </section>

      <section className="submission-portal" id="portal">
        <div className="portal-heading">
          <p className="eyebrow">Pilot submission portal</p>
          <h2>Send the file.</h2>
          <p>Keep a copy. Only the editors and advisors assigned to the review can see it.</p>
        </div>
        <SubmissionForm />
      </section>
      <section className="portal-callout"><div><p className="eyebrow">Already sent something?</p><h2>Check your status.</h2><p>Use your reference code and original submission email to see the current stage. Your manuscript stays private.</p></div><Link className="button button-paper" href="/status">Check submission status</Link></section>
    </main>
  );
}
