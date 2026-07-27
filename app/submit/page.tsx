import type { Metadata } from "next";
import { PageIntro } from "../components/SiteShell";
import { standards } from "../site";
import { SubmissionForm } from "./SubmissionForm";

export const metadata: Metadata = { title: "Submit work" };

const checklist = [
  "Manuscript with author names and identifying details removed",
  "150–250 word abstract and 4–6 keywords",
  "Works cited or references in a consistent style",
  "A brief note explaining the paper’s origin and your contribution",
  "Guardian permission to publish if you are under 18",
];

export default function SubmitPage() {
  return (
    <main>
      <PageIntro
        eyebrow="Submission guide"
        title="Send the work, not a sales pitch."
        description="Pilot submissions are now open. The form below collects only what editors need to screen, review, and responsibly publish a manuscript."
      />

      <section className="eligibility-grid">
        <div>
          <p className="eyebrow">What we publish</p>
          <h2>Original research and argument from students ages 14–19.</h2>
        </div>
        <div className="eligibility-copy">
          <p>
            We consider research articles and substantial scholarly essays in
            history, literature, philosophy, economics, politics, sociology,
            anthropology, and closely related fields.
          </p>
          <p>
            Classroom, AP Research, IB Extended Essay, History Day, independent,
            and mentored projects are welcome. Submitting previously graded
            work is fine; submitting work written by someone else is not.
          </p>
        </div>
      </section>

      <section className="standards-section">
        <p className="eyebrow">Before you submit</p>
        <div className="standards-grid">
          <h2>We are looking for:</h2>
          <ul>
            {standards.map((standard) => <li key={standard}>{standard}</li>)}
          </ul>
        </div>
      </section>

      <section className="submission-specs" id="checklist">
        <div className="specs-main">
          <p className="eyebrow">Manuscript checklist</p>
          <h2>Prepare these five things.</h2>
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
            <div><dt>Format</dt><dd>.docx or Google Doc</dd></div>
            <div><dt>Review</dt><dd>Double-blind</dd></div>
            <div><dt>Cost</dt><dd>Always $0</dd></div>
            <div><dt>License</dt><dd>Author retains copyright</dd></div>
          </dl>
        </aside>
      </section>

      <section className="submission-portal" id="portal">
        <div className="portal-heading">
          <p className="eyebrow">Pilot submission portal</p>
          <h2>Ready when your manuscript is.</h2>
          <p>Save a copy of your manuscript before submitting. The file is stored privately and is visible only to the editors and advisors who need it for the review process.</p>
        </div>
        <SubmissionForm />
      </section>
    </main>
  );
}
