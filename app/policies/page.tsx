import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../components/SiteShell";

export const metadata: Metadata = { title: "Editorial policies" };

const policies = [
  {
    id: "scope",
    title: "Scope and eligibility",
    body: [
      "Open Margin considers original research articles and substantial scholarly essays by authors of any age. We publish work in the humanities, social sciences, and STEM. Fields include history, literature, philosophy, economics, politics, sociology, anthropology, biology, chemistry, physics, environmental science, mathematics, computer science, engineering, and related fields.",
      "We review specialized STEM work only when an editor can assign the needed subject expertise. STEM authors must describe methods, data sources, limits, safety practices, and relevant approvals. The description must support a responsible review.",
      "We welcome independent work and work from a class, capstone, or mentor. Authors must state where the paper started and what each contributor did. Open Margin is nonexclusive. We may consider work that is under review elsewhere if the author tells us before submission.",
    ],
  },
  {
    id: "authorship",
    title: "Authorship, originality and sources",
    body: [
      "Each listed author must make a meaningful intellectual contribution and approve the submission. The submitting author confirms that the work is their own. The author must cite quotations and ideas from others and obtain permission to reproduce copyrighted material.",
      "Plagiarism, invented sources or data, undisclosed copying, and purchased or ghostwritten work can cause rejection or retraction. Editors may use reasonable screening tools. Editors may ask for notes, source files, or explanations.",
    ],
  },
  {
    id: "review",
    title: "Peer review, conflicts and appeals",
    body: [
      "We use double-blind review when practical. Authors and reviewers do not receive each other's names. Two trained student reviewers normally assess each manuscript with a published rubric. Editors make the final decision. An academic advisor may help with specialized or disputed work.",
      "Reviewers and editors must step away from work by classmates, close collaborators, relatives, mentors, or anyone whose relationship could affect judgment. Reviews and manuscripts are confidential. Do not share them outside the editorial process.",
      "Authors may appeal only for a serious process error, an undisclosed conflict, or a serious factual misunderstanding. Disagreement with a scholarly judgment is not enough. Send a short appeal within 30 days. An uninvolved editor or advisor will review it.",
    ],
  },
  {
    id: "research-ethics",
    title: "Research ethics, safety and people",
    body: [
      "Authors must follow the rules of their school, research program, and any institution that oversaw the work. For work with interviews, surveys, observations, sensitive personal information, or vulnerable participants, tell us how you handled consent, anonymity, and data security.",
      "We will not publish research that exposes a participant's identity or private information without clear, documented permission. If a study needed institutional, school, or mentor review, authors must state that review or explain why it did not apply. Editors may decline work when participant protections are unclear.",
      "For STEM work, authors must describe methods, data handling, safety practices, and relevant approvals or supervision accurately. We may decline work when we cannot assess safety, research ethics, reproducibility, or specialist review needs.",
    ],
  },
  {
    id: "ai",
    title: "Generative AI disclosure",
    body: [
      "Authors are responsible for every claim, citation, analysis, and sentence in a manuscript. Do not list a generative AI tool as an author. Do not use it to invent sources, evidence, quotations, analysis, or participant data.",
      "Authors must disclose material AI help with drafting, editing, translation, coding, data analysis, image generation, or research support. Routine spellcheck and grammar suggestions do not need a detailed log. Authors must still check the result. Editors may request prompts, outputs, or more detail to assess integrity.",
    ],
  },
  {
    id: "copyright",
    title: "Copyright and open access",
    body: [
      "Authors retain copyright. If we accept an article, the author grants Open Margin a nonexclusive right to publish, preserve, and display the final version online. We plan to use the Creative Commons Attribution 4.0 International license (CC BY 4.0) for accepted articles. An editor may agree in writing to a different arrangement before publication.",
      "Authors must tell us about third-party material that may need permission. Open access does not remove the author's duty to respect copyright, privacy, confidentiality, or research participant commitments.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy, minors and guardian contact",
    body: [
      "We collect only the information needed to evaluate a submission. This includes author and contact information, a parent or guardian contact when supplied for a younger author, school or organization when supplied, manuscript information, declarations, and the manuscript file. Reviewer applications and partner inquiries collect only the contact and fit information needed to consider a voluntary role or conversation. We use this information for editorial administration. We do not use it for advertising, profiling, or sale.",
      "Authorized editors and advisors can see submission records and files when they need them for review. Authorized editors can see reviewer and partner records when they need them for recruitment or operations. We may send a short intake notice to an authorized editor inbox. It will not include manuscript files. We do not publish an author's home address, phone number, or guardian contact. Authors under 18 need parent or guardian approval and a contact email. For authors under 13, a parent or guardian must complete the form with their own contact email. Before publication, we will contact the guardian to confirm publication consent.",
      "A parent, guardian, author, reviewer applicant, or partner contact may ask to review, correct, or delete their data through the partner and contact inquiry form. We delete declined submissions and related files within 12 months. We may keep them longer to resolve an integrity concern or meet a legal obligation. Accepted work remains in the public record after publication.",
    ],
  },
  {
    id: "corrections",
    title: "Corrections, retractions and the publication record",
    body: [
      "If a published article contains an important error, authors and readers should notify the editors. We may publish a correction, editor's note, or retraction after we review the evidence. A retracted article remains marked as retracted. We remove it only when needed to protect a person's safety or privacy.",
      "We welcome good-faith discussion after publication. We will evaluate concerns about an article, reviewer conduct, authorship, or editorial process fairly and confidentially where possible.",
    ],
  },
];

export default function PoliciesPage() {
  return (
    <main>
      <PageIntro
        eyebrow="Editorial policies · Updated July 29, 2026"
        title="How we handle submissions."
        description="These policies explain how we receive, review, publish, correct, and protect submitted work."
      />

      <section className="policy-layout">
        <aside className="policy-toc" aria-label="Policy sections">
          <p className="eyebrow">On this page</p>
          {policies.map((policy, index) => <a href={`#${policy.id}`} key={policy.id}>{String(index + 1).padStart(2, "0")} {policy.title}</a>)}
        </aside>
        <div className="policy-content">
          <p className="policy-lead">We apply these policies to every submission. We post material changes here. Ask before submitting if a rule is unclear.</p>
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
        <p>These editorial policies draw on <a href="https://publicationethics.org/core-practices" target="_blank" rel="noreferrer">COPE&apos;s Core Practices</a>, the <a href="https://publicationethics.org/files/Ethical_Guidelines_For_Peer_Reviewers.pdf" target="_blank" rel="noreferrer">COPE reviewer guidelines</a>, the <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0 license</a>, and the <a href="https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions" target="_blank" rel="noreferrer">FTC&apos;s COPPA guidance</a>. They are operational policies, not legal advice.</p>
        <Link className="button button-dark" href="/submit">Read the submission guide</Link>
      </section>
    </main>
  );
}
