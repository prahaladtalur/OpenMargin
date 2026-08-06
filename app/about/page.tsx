import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../components/SiteShell";

export const metadata: Metadata = { title: "About" };

const commitments = [
  ["No fees", "There is no submission, publication, membership, or fast-review fee."],
  ["Comments should help", "A decision matters. The notes should help the author write the next draft."],
  ["Students run it", "Student editors run the journal. Academic advisors help with hard decisions, calibration, and work outside the team's expertise."],
  ["Rules in the open", "Our rubric, policies, timelines, and yearly statistics stay on the site."],
];

export default function AboutPage() {
  return (
    <main>
      <PageIntro
        eyebrow="About the journal"
        title="A student journal built around revision."
        description="Open Margin is a student-led, open-access journal for research by authors of any age. We publish work in the humanities, social sciences, and STEM."
      />

      <section className="story-grid">
        <div className="story-lead">
          <p className="drop-cap">
            {"Ask, \"Will this be accepted?\" Then ask, \"What would make this argument stronger?\""}
          </p>
        </div>
        <div className="story-body">
          <p>
            Open Margin is a volunteer-run project in Washington. Students can
            send work from a class, independent study, capstone, or mentorship.
            They receive an editorial read.
          </p>
          <p>
            We publish work in the humanities, social sciences, and STEM. We
            review specialized STEM papers only when a suitable editor or
            advisor is available.
          </p>
        </div>
      </section>

      <section className="commitments">
        <p className="eyebrow">Editorial commitments</p>
        <div className="commitment-grid">
          {commitments.map(([title, body], index) => (
            <article key={title}>
              <p className="commitment-number">{String(index + 1).padStart(2, "0")}</p>
              <h2>{title}</h2>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="masthead" id="masthead">
        <div>
          <p className="eyebrow">Pilot masthead</p>
          <h2>More than one person runs a journal.</h2>
          <p>
            We will publish names after we confirm the founding team and
            advisors. Affiliations show expertise. They do not show
            institutional endorsement.
          </p>
        </div>
        <dl>
          <div><dt>Editor in chief</dt><dd>Founding appointment open</dd></div>
          <div><dt>Managing editor</dt><dd>Founding appointment open</dd></div>
          <div><dt>Section editors</dt><dd>Humanities · Social science · STEM</dd></div>
          <div><dt>Academic advisors</dt><dd>Recruitment in progress</dd></div>
        </dl>
      </section>

      <section className="policy-index" id="policies">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The rules are public</p>
            <h2>Editorial policies</h2>
          </div>
        </div>
        <div className="policy-list">
          {[
            "Authorship and originality",
            "Peer review, conflicts and appeals",
            "Research with people",
            "Corrections and retractions",
            "Copyright and licensing",
            "Privacy and guardian consent",
            "Use of generative AI",
          ].map((policy) => (
            <Link href="/policies" key={policy}><span>{policy}</span><small>Read policy</small></Link>
          ))}
        </div>
      </section>
    </main>
  );
}
