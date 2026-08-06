import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../components/SiteShell";
import { PartnerInquiryForm } from "./PartnerInquiryForm";

export const metadata: Metadata = { title: "Partner with Open Margin" };

const additions = [
  ["Research programs", "A place for eligible student work after a project, paper, or capstone."],
  ["Schools and teachers", "A readiness checklist, a public rubric, and a free route for work in the humanities, social sciences, and STEM."],
  ["Youth organizations", "A way to connect student writing with an editorial read, revision, and a public audience."],
];

export default function PartnersPage() {
  return (
    <main>
      <PageIntro
        eyebrow="For programs, schools and organizations"
        title="Give students somewhere to send the work."
        description="Open Margin gives research and learning programs a free, independent route for eligible work to receive feedback and consideration for publication."
      />

      <section className="partner-model">
        <div><p className="eyebrow">The partnership model</p><h2>You teach and mentor. We read the work.</h2></div>
        <div className="partner-model-copy"><p>Open Margin is optional. It does not replace teaching, mentoring, research supervision, or a final presentation. Students submit directly. Editors make independent decisions. We do not promise publication.</p><p>Open Margin is one option. Students can consider it with other journals or public venues. If the same work is under consideration elsewhere, they should tell us before they submit.</p><p>We read work about history, literature, economics, politics, society, technology, education, ethics, culture, science, mathematics, computing, and engineering. Specialized STEM work depends on a suitable reviewer.</p></div>
      </section>

      <section className="partner-additions">
        <p className="eyebrow">What Open Margin can add</p>
        <div>{additions.map(([title, body], index) => <article key={title}><p>{String(index + 1).padStart(2, "0")}</p><h2>{title}</h2><p>{body}</p></article>)}</div>
      </section>

      <section className="partner-guardrails">
        <div><p className="eyebrow">Non-negotiables</p><h2>Keep the review independent.</h2></div>
        <ul><li>No referral is required. A program affiliation does not give a student priority.</li><li>There are no submission or publication fees. We do not guarantee an outcome.</li><li>Students submit their own work. They decide whether to take part.</li><li>We do not exchange student data outside an agreed process with clear consent.</li><li>Editors use the same scope, review, and integrity standards for every manuscript.</li></ul>
      </section>

      <section className="partner-pathway">
        <p className="eyebrow">Run a small pilot</p>
        <ol><li><span>01</span><div><h2>Choose a fitting group</h2><p>Start with students whose work fits the journal&apos;s current scope.</p></div></li><li><span>02</span><div><h2>Share the checklist</h2><p>Give students the public toolkit. Let them decide whether to submit.</p></div></li><li><span>03</span><div><h2>Keep the review separate</h2><p>Students use the same portal, timeline, and standards as every other author.</p></div></li><li><span>04</span><div><h2>Discuss the pattern</h2><p>Discuss readiness and feedback in summary form. Do not share private manuscript information.</p></div></li></ol>
        <Link className="button button-paper" href="/resources">See the author toolkit</Link>
      </section>

      <section className="submission-portal" id="inquire">
        <div className="portal-heading"><p className="eyebrow">Partner inquiry</p><h2>Tell us about your program.</h2><p>Tell us who you work with, which subjects matter, and what students make. We will reply if the idea fits our scope and capacity.</p></div>
        <PartnerInquiryForm />
      </section>
    </main>
  );
}
