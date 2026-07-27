import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../components/SiteShell";

export const metadata: Metadata = { title: "About" };

const commitments = [
  ["Free means free", "There are no submission, publication, membership, or expedited-review fees."],
  ["Review is developmental", "A decision matters, but the comments behind it should help an author long after the review ends."],
  ["Students lead", "Student editors shape the journal. Academic advisors support calibration, difficult decisions, and work outside the team’s expertise."],
  ["Standards are public", "Our rubrics, policies, timelines, and annual editorial statistics belong in the open."],
];

export default function AboutPage() {
  return (
    <main>
      <PageIntro
        eyebrow="About the journal"
        title="A place to take young researchers seriously."
        description="Open Margin is a student-led, open-access journal for secondary-school scholarship in the humanities and social sciences."
      />

      <section className="story-grid">
        <div className="story-lead">
          <p className="drop-cap">
            Too many student publications begin with the question, “How do we
            get this accepted?” We begin somewhere else: “What would make this
            argument stronger?”
          </p>
        </div>
        <div className="story-body">
          <p>
            Open Margin was founded in Washington as an unincorporated,
            volunteer-led project. It exists for students who have completed
            serious independent, classroom, capstone, or mentored research and
            want an editorial process that respects the work.
          </p>
          <p>
            Our initial scope is deliberately narrow. We publish work in the
            humanities and social sciences because a small journal should only
            accept fields it can review responsibly. We will expand only when
            the right editorial expertise exists.
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
          <h2>Built to outlast one founder.</h2>
          <p>
            Names will be published here after the founding team and advisory
            roles are confirmed. Affiliations identify expertise only; they do
            not imply institutional endorsement.
          </p>
        </div>
        <dl>
          <div><dt>Editor in chief</dt><dd>Founding appointment open</dd></div>
          <div><dt>Managing editor</dt><dd>Founding appointment open</dd></div>
          <div><dt>Section editors</dt><dd>History · Social science · Literature</dd></div>
          <div><dt>Academic advisors</dt><dd>Recruitment in progress</dd></div>
        </dl>
      </section>

      <section className="policy-index" id="policies">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Public by default</p>
            <h2>Editorial policies</h2>
          </div>
        </div>
        <div className="policy-list">
          {[
            "Authorship & originality",
            "Peer review, conflicts & appeals",
            "Research involving people",
            "Corrections & retractions",
            "Copyright & licensing",
            "Privacy & guardian consent",
            "Use of generative AI",
          ].map((policy) => (
            <Link href="/policies" key={policy}><span>{policy}</span><small>Read policy</small></Link>
          ))}
        </div>
      </section>
    </main>
  );
}
