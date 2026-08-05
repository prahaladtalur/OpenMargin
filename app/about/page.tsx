import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../components/SiteShell";

export const metadata: Metadata = { title: "About" };

const commitments = [
  ["No fees", "There are no submission, publication, membership, or expedited-review fees."],
  ["Comments should help", "A decision matters, but the notes should still help when the author starts the next draft."],
  ["Students run it", "Student editors shape the journal. Academic advisors help with difficult decisions, calibration, and work outside the team's expertise."],
  ["Rules in the open", "Our rubric, policies, timelines, and annual editorial statistics stay on the site."],
];

export default function AboutPage() {
  return (
    <main>
      <PageIntro
        eyebrow="About the journal"
        title="A student journal built around revision."
        description="Open Margin is a student-led, open-access journal for research by authors of any age in the humanities, social sciences, and STEM."
      />

      <section className="story-grid">
        <div className="story-lead">
          <p className="drop-cap">
            {"Ask, \"Will this get accepted?\" Then ask, \"What would make the argument harder to dismiss?\""}
          </p>
        </div>
        <div className="story-body">
          <p>
            Open Margin is a volunteer-run project founded in Washington. It
            gives students a place to send research from a class, independent
            study, capstone, or mentorship and receive a serious editorial read.
          </p>
          <p>
            We publish work in the humanities, social sciences, and STEM. We
            accept specialized STEM papers only when a suitable editor or
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
          <h2>A journal needs more than one person.</h2>
          <p>
            We will publish names once the founding team and advisory roles are
            confirmed. Affiliations describe expertise, not institutional
            endorsement.
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
            "Research involving people",
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
