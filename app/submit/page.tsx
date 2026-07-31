import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../components/SiteShell";
import { standards } from "../site";
import { SubmissionForm } from "./SubmissionForm";

export const metadata: Metadata = { title: "Submit work" };

const checklist = [
  "A blinded paper or project report",
  "A 300–1,800 character abstract",
  "A clear list of sources or references",
  "A short note on where the work came from",
  "Parent or guardian approval for authors under 18",
];

export default function SubmitPage() {
  return (
    <main>
      <PageIntro
        eyebrow="Submission guide"
        title="Send us your work."
        description="We read student research, essays, and projects across the humanities, social sciences, and STEM. It is free to submit."
      />

      <section className="eligibility-grid">
        <div>
          <p className="eyebrow">What we publish</p>
          <h2>Research worth reading.</h2>
        </div>
        <div className="eligibility-copy">
          <p>
            We accept papers, essays, science-fair research, lab reports, and
            design projects. History, literature, economics, biology, physics,
            math, computer science, engineering, and more all fit here.
          </p>
          <p>
            Class work, independent projects, mentored research, and previously
            graded work are all welcome. The work must be your own.
          </p>
          <p>
            Anyone can submit. If an author is under 18, a parent or guardian
            must approve the submission. For specialized STEM work, we review
            only when we have the right subject expertise.
          </p>
        </div>
      </section>

      <section className="standards-section">
        <p className="eyebrow">What we look for</p>
        <div className="standards-grid">
          <h2>A clear question, good evidence, honest limits.</h2>
          <ul>
            {standards.map((standard) => <li key={standard}>{standard}</li>)}
          </ul>
        </div>
      </section>

      <section className="submission-specs" id="checklist">
        <div className="specs-main">
          <p className="eyebrow">Manuscript checklist</p>
          <h2>Have these ready.</h2>
          <ol>
            {checklist.map((item, index) => (
              <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>
            ))}
          </ol>
        </div>
        <aside className="spec-card">
          <p className="eyebrow">At a glance</p>
          <dl>
            <div><dt>Length</dt><dd>2,500–8,000 words</dd></div>
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
          <h2>Upload your work.</h2>
          <p>Keep a copy for yourself. Your file is private and only shared with the editors and advisors reviewing it.</p>
        </div>
        <SubmissionForm />
      </section>
      <section className="portal-callout"><div><p className="eyebrow">Already submitted?</p><h2>Check the stage privately.</h2><p>Use your reference code and original submission email to view a high-level editorial status without exposing your manuscript.</p></div><Link className="button button-paper" href="/status">Check submission status</Link></section>
    </main>
  );
}
