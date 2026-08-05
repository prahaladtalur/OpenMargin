import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../components/SiteShell";
import { PartnerInquiryForm } from "./PartnerInquiryForm";

export const metadata: Metadata = { title: "Partner with Open Margin" };

const additions = [
  ["Research programs", "A place for eligible student work after a project, paper, or capstone."],
  ["Schools & teachers", "A readiness checklist, a public rubric, and a free route for humanities, social-science, and STEM work."],
  ["Youth organizations", "A way to connect student writing with an editorial read, revision, and a public audience."],
];

export default function PartnersPage() {
  return (
    <main>
      <PageIntro
        eyebrow="For programs, schools & organizations"
        title="Give students somewhere to send the work."
        description="Open Margin gives youth research and learning programs a free, independent route for eligible work to be revised, reviewed, and considered for publication."
      />

      <section className="partner-model">
        <div><p className="eyebrow">The partnership model</p><h2>You teach and mentor. We provide an independent read.</h2></div>
        <div className="partner-model-copy"><p>Open Margin is optional. It does not replace teaching, mentoring, research supervision, or a final showcase. Students submit directly, editorial decisions stay independent, and publication is never promised.</p><p>We read work about history, literature, economics, politics, society, technology, education, ethics, culture, science, mathematics, computing, and engineering. Specialized STEM work depends on having the right reviewer.</p></div>
      </section>

      <section className="partner-additions">
        <p className="eyebrow">What Open Margin can add</p>
        <div>{additions.map(([title, body], index) => <article key={title}><p>{String(index + 1).padStart(2, "0")}</p><h2>{title}</h2><p>{body}</p></article>)}</div>
      </section>

      <section className="partner-guardrails">
        <div><p className="eyebrow">Non-negotiables</p><h2>Independence matters.</h2></div>
        <ul><li>No referral is required and no student receives priority because of a program affiliation.</li><li>There are no submission or publication fees, and no outcome is guaranteed.</li><li>Students submit their own work and decide whether to participate.</li><li>We do not exchange student data outside an agreed, consent-based workflow.</li><li>Editors apply the same scope, review, and integrity standards to every manuscript.</li></ul>
      </section>

      <section className="partner-pathway">
        <p className="eyebrow">Run a small pilot</p>
        <ol><li><span>01</span><div><h2>Choose a fitting group</h2><p>Start with students whose work fits the journal’s current scope.</p></div></li><li><span>02</span><div><h2>Share the checklist</h2><p>Give students the public toolkit and let them decide whether to submit.</p></div></li><li><span>03</span><div><h2>Keep the review separate</h2><p>Students use the same portal, timeline, and standards as every other author.</p></div></li><li><span>04</span><div><h2>Discuss the pattern</h2><p>Talk about readiness and feedback in aggregate, without sharing private manuscript information.</p></div></li></ol>
        <Link className="button button-paper" href="/resources">See the author toolkit</Link>
      </section>

      <section className="submission-portal" id="inquire">
        <div className="portal-heading"><p className="eyebrow">Partner inquiry</p><h2>Tell us what you run.</h2><p>Share the age range, subject areas, and kind of work your students produce. We will reply if the idea fits our scope and capacity.</p></div>
        <PartnerInquiryForm />
      </section>
    </main>
  );
}
