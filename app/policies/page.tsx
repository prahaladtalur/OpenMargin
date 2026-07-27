import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../components/SiteShell";

export const metadata: Metadata = { title: "Editorial policies" };

const policies = [
  {
    id: "scope",
    title: "Scope & eligibility",
    body: [
      "Open Margin considers original research articles and substantial scholarly essays by students ages 14–19. Our initial scope is humanities and social sciences: history, literature, philosophy, economics, politics, sociology, anthropology, and related fields.",
      "We welcome independent work and work developed in class, through a capstone, or with a mentor. Authors must disclose the paper’s origin and each contributor’s role. Work submitted simultaneously to another journal may be considered only if the author tells us first.",
    ],
  },
  {
    id: "authorship",
    title: "Authorship, originality & sources",
    body: [
      "Every listed author must have made a meaningful intellectual contribution and must approve the submission. Submitting authors confirm that the work is their own, that quotations and ideas from others are cited, and that they have permission to reproduce any copyrighted material.",
      "Plagiarism, fabricated sources or data, undisclosed substantial copying, and purchased or ghostwritten work are grounds for rejection or retraction. Editors may use reasonable screening tools and may ask authors for notes, source files, or clarifications.",
    ],
  },
  {
    id: "review",
    title: "Peer review, conflicts & appeals",
    body: [
      "We use double-blind review whenever practical: authors and reviewers do not receive one another’s names. Two trained student reviewers normally assess a manuscript with a published rubric. Editors make the final decision and may seek academic-advisor input for specialized or disputed work.",
      "Reviewers and editors must recuse themselves from work by classmates, close collaborators, relatives, mentors, or anyone whose relationship could reasonably affect judgment. Reviews and manuscripts are confidential and may not be shared outside the editorial process.",
      "Authors may appeal a decision only for a material procedural error, undisclosed conflict, or serious factual misunderstanding, not simply disagreement with a scholarly judgment. Send a concise appeal within 30 days; an uninvolved editor or advisor will review it.",
    ],
  },
  {
    id: "research-ethics",
    title: "Research involving people",
    body: [
      "Authors are responsible for following the rules of their school, research program, and any institution that oversaw the work. For work involving interviews, surveys, observations, sensitive personal information, or vulnerable participants, tell us how consent, anonymity, and data security were handled.",
      "We will not publish research that exposes a participant’s identity or private information without clear, documented permission. When a study needed institutional, school, or mentor review, authors must disclose that review or explain why it did not apply. Editors may decline work when participant protections are unclear.",
    ],
  },
  {
    id: "ai",
    title: "Generative AI disclosure",
    body: [
      "Authors remain responsible for every claim, citation, analysis, and sentence in a submitted manuscript. Generative AI tools may not be listed as authors and may not be used to invent sources, evidence, quotations, analysis, or participant data.",
      "Authors must disclose any material AI assistance used in drafting, editing, translation, coding, data analysis, image generation, or research support. Routine spellcheck or grammar suggestions do not need a detailed log, but authors must still verify the result. Editors may request prompts, outputs, or a fuller explanation where necessary to assess integrity.",
    ],
  },
  {
    id: "copyright",
    title: "Copyright & open access",
    body: [
      "Authors retain copyright. If an article is accepted, authors grant Open Margin a nonexclusive right to publish, preserve, and display the final version online. We plan to publish accepted articles under the Creative Commons Attribution 4.0 International license (CC BY 4.0), unless an editor agrees in writing to a different arrangement before publication.",
      "Authors must tell us about third-party material that may need permission. Open access does not eliminate an author’s responsibility to respect copyright, privacy, confidentiality, or research-participant commitments.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy, minors & guardian contact",
    body: [
      "We collect only the information needed to evaluate a submission: contact information, age band, guardian contact for authors ages 14–17, school or organization if supplied, manuscript information, declarations, and the manuscript file. This information is used for editorial administration, not advertising, profiling, or sale.",
      "Submission records and files are private to authorized editors and advisors who need them for the review process. We do not publish an author’s home address, phone number, or guardian contact. Authors under 18 must provide a guardian email and confirm they have permission to submit; before publication, we will contact the guardian to confirm publication consent.",
      "Open Margin does not accept submissions from children under 14. A parent, guardian, or author may ask to review, correct, or delete submission data by contacting the editors. We delete declined submissions and related files within 12 months, unless a longer period is needed to resolve an integrity concern or legal obligation. Accepted work remains in the public record after publication.",
    ],
  },
  {
    id: "corrections",
    title: "Corrections, retractions & publication record",
    body: [
      "If a published article contains an important error, authors and readers should notify the editors. We may publish a correction, editor’s note, or retraction after reviewing the evidence. A retracted article will remain identified as retracted rather than quietly disappearing, except where removal is required to protect a person’s safety or privacy.",
      "We welcome good-faith post-publication discussion. Concerns about an article, reviewer conduct, authorship, or editorial process will be evaluated fairly and confidentially where possible.",
    ],
  },
];

export default function PoliciesPage() {
  return (
    <main>
      <PageIntro
        eyebrow="Editorial policies · Updated July 27, 2026"
        title="Clear standards. No hidden rules."
        description="These policies describe how Open Margin receives, reviews, publishes, corrects, and protects student work. They are written for authors, guardians, reviewers, and readers."
      />

      <section className="policy-layout">
        <aside className="policy-toc" aria-label="Policy sections">
          <p className="eyebrow">On this page</p>
          {policies.map((policy, index) => <a href={`#${policy.id}`} key={policy.id}>{String(index + 1).padStart(2, "0")} {policy.title}</a>)}
        </aside>
        <div className="policy-content">
          <p className="policy-lead">Policies will be applied consistently, and we will announce material changes on this page. Questions about a policy should be raised before submission whenever possible.</p>
          {policies.map((policy, index) => (
            <section id={policy.id} key={policy.id} className="policy-section">
              <p className="policy-number">{String(index + 1).padStart(2, "0")}</p>
              <div><h2>{policy.title}</h2>{policy.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
            </section>
          ))}
        </div>
      </section>

      <section className="policy-sources">
        <p className="eyebrow">Standards we follow</p>
        <p>These editorial policies are informed by <a href="https://publicationethics.org/core-practices" target="_blank" rel="noreferrer">COPE’s Core Practices</a>, the <a href="https://publicationethics.org/files/Ethical_Guidelines_For_Peer_Reviewers.pdf" target="_blank" rel="noreferrer">COPE reviewer guidelines</a>, the <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0 license</a>, and the <a href="https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions" target="_blank" rel="noreferrer">FTC’s COPPA guidance</a>. They are operational policies, not legal advice.</p>
        <Link className="button button-dark" href="/submit">Read the submission guide</Link>
      </section>
    </main>
  );
}
