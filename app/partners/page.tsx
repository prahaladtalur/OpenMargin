import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../components/SiteShell";
import { PartnerInquiryForm } from "./PartnerInquiryForm";

export const metadata: Metadata = { title: "Partner with Open Margin" };

const additions = [
  ["Research programs", "A voluntary research-communication pathway for eligible student work after a project, paper, or capstone."],
  ["Schools & teachers", "A clear manuscript-readiness checklist, public rubric, and a free place to send strong humanities and social-science work."],
  ["Youth organizations", "A way to connect serious student writing with feedback, revision habits, and an open-access audience."],
];

export default function PartnersPage() {
  return (
    <main>
      <PageIntro
        eyebrow="For programs, schools & organizations"
        title="A next step after the research project."
        description="Open Margin can complement youth research and learning programs with a free, independent path for eligible scholarship to be revised, reviewed, and potentially published."
      />

      <section className="partner-model">
        <div><p className="eyebrow">The partnership model</p><h2>Your program builds the work. We help students carry it further.</h2></div>
        <div className="partner-model-copy"><p>We are designed to be an optional layer, not a replacement for teaching, mentoring, research supervision, or a final showcase. Students submit directly, editorial decisions stay independent, and publication is never promised.</p><p>Our current scope is humanities and social sciences. The strongest fit is research that asks careful questions about history, literature, economics, politics, society, technology, education, ethics, or culture.</p></div>
      </section>

      <section className="partner-additions">
        <p className="eyebrow">What Open Margin can add</p>
        <div>{additions.map(([title, body], index) => <article key={title}><p>{String(index + 1).padStart(2, "0")}</p><h2>{title}</h2><p>{body}</p></article>)}</div>
      </section>

      <section className="partner-guardrails">
        <div><p className="eyebrow">Non-negotiables</p><h2>Credibility comes from separation.</h2></div>
        <ul><li>No referral is required and no student receives priority because of a program affiliation.</li><li>There are no submission or publication fees, and no outcome is guaranteed.</li><li>Students submit their own work and decide whether to participate.</li><li>We do not exchange student data outside an agreed, consent-based workflow.</li><li>Editors apply the same scope, review, and integrity standards to every manuscript.</li></ul>
      </section>

      <section className="partner-pathway">
        <p className="eyebrow">A small pilot, done responsibly</p>
        <ol><li><span>01</span><div><h2>Choose a fitting cohort</h2><p>Start with a small group whose work fits the journal’s current scope.</p></div></li><li><span>02</span><div><h2>Prepare, do not pre-select</h2><p>Offer the public author toolkit and let interested students decide whether to submit.</p></div></li><li><span>03</span><div><h2>Keep the review independent</h2><p>Students use the same direct portal, timeline, and editorial standards as everyone else.</p></div></li><li><span>04</span><div><h2>Learn from the pilot</h2><p>Discuss aggregate lessons about readiness and feedback without sharing private manuscript information.</p></div></li></ol>
        <Link className="button button-paper" href="/resources">See the author toolkit</Link>
      </section>

      <section className="submission-portal" id="inquire">
        <div className="portal-heading"><p className="eyebrow">Partner inquiry</p><h2>Start with a conversation.</h2><p>Tell us about your students, the work they make, and the next step you are considering. We will respond only if the opportunity fits our scope and capacity.</p></div>
        <PartnerInquiryForm />
      </section>
    </main>
  );
}
