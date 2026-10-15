import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "../../components/SiteShell";
import { campaignFromSearchParams, withCampaign } from "../../../lib/campaign";

type SearchParams = Record<string, string | string[] | undefined>;

type SubmissionPath = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  introTitle: string;
  intro: string[];
  checklist: string[];
  steps: { title: string; body: string }[];
  faq: readonly [string, string][];
};

const submissionPaths: Record<string, SubmissionPath> = {
  "student-research": {
    slug: "student-research",
    eyebrow: "For student research papers",
    title: "Where can I publish a student research paper?",
    description: "A free, transparent journal option for original student research in the humanities, social sciences, and STEM. Check the scope and review process before submitting.",
    introTitle: "A finished paper deserves a careful next reader.",
    intro: [
      "If you finished a research paper through school, a summer program, independent study, or mentorship, Open Margin is one optional venue to compare. We accept original work by authors of any age in the humanities, social sciences, and STEM.",
      "Open Margin is an early-stage, student-led journal. Its public pilot records are unreviewed and are not a completed publication track record. For an eligible manuscript, an editor checks fit, one reviewer writes comments, and an editor sends a written decision. Publication is not guaranteed.",
      "Before uploading, check your school's or program's rules about simultaneous submission, consent, privacy, guardian approval, and public sharing. Students submit directly and decide whether this journal fits their work.",
    ],
    checklist: [
      "Turn the project into a standalone paper with a clear question, thesis, or research goal",
      "Show the sources, data, method, or observations that support the conclusion",
      "Remove your name, school, acknowledgments, and identifying file metadata for double-blind review",
      "Add an abstract, references, work-origin note, and AI assistance disclosure",
      "Confirm permission to share the work and obtain guardian approval when required",
    ],
    steps: [
      { title: "Compare the process", body: "Read the public scope, rubric, policies, and current public-record note before choosing a venue." },
      { title: "Prepare a readable file", body: "Articles are 2,500 to 8,000 words in PDF or DOCX. Remove identifying details before you upload." },
      { title: "Submit only when ready", body: "Use the same portal as every author. An editor checks fit before the review stage." },
    ],
    faq: [
      ["Who can submit student research?", "Authors of any age can submit original work in the humanities, social sciences, and STEM. Under-18 authors need parent or guardian approval."],
      ["What kinds of student papers may fit?", "School research papers, independent studies, mentored projects, capstones, essays, science-fair studies, and research notes may fit when the work is original, shareable, and ready for an independent reader."],
      ["Is Open Margin's publication record complete?", "No. The current public pilot records are unreviewed. Review, final editing, author approval, and readable-file checks are still in progress. Do not treat them as completed publications."],
    ],
  },
  "ap-research": {
    slug: "ap-research",
    eyebrow: "For AP, IB and school research",
    title: "Where can I publish an AP Research or IB Extended Essay?",
    description: "A free, independent route for a finished AP Research project, IB Extended Essay, or similar school research paper. Check the fit before submitting.",
    introTitle: "A school paper can become a manuscript.",
    intro: [
      "Open Margin accepts original work by authors of any age. An AP Research project, IB Extended Essay, capstone, or similar school paper may fit if it can be prepared as a standalone manuscript with a clear question, traceable sources or data, and an honest account of its limits.",
      "Publication is optional and does not replace a school requirement, assessment, competition, or mentor relationship. Students choose whether to submit. Open Margin does not promise acceptance, admissions value, or a fixed outcome.",
      "Before uploading, check your school or program rules about simultaneous submission, privacy, permissions, and public sharing. Under-18 authors need parent or guardian approval.",
    ],
    checklist: [
      "Turn the project into a standalone paper a reader can understand without the assignment sheet",
      "Remove your name, school, acknowledgments, and identifying file metadata for double-blind review",
      "Keep an abstract of 300 to 1,800 characters and a reference list",
      "Describe the work's origin and disclose material help from AI tools, mentors, or editors",
      "Confirm that public sharing is allowed and obtain guardian approval when required",
    ],
    steps: [
      { title: "Read the rubric", body: "Review the public questions about the thesis, context, method, evidence, clarity, and integrity." },
      { title: "Check the file", body: "Articles are 2,500 to 8,000 words in PDF or DOCX. Blind the manuscript before you upload it." },
      { title: "Submit by choice", body: "Use the same portal as every author. An editor checks fit before the review stage." },
    ],
    faq: [
      ["Can an AP Research paper fit?", "Yes, an original AP Research paper may fit when it meets the public scope and manuscript requirements. Publication is separate from the AP assessment."],
      ["What about an IB Extended Essay?", "An original Extended Essay may be considered when it is prepared as a standalone manuscript and public sharing is allowed by the student and school."],
      ["Does Open Margin guarantee publication?", "No. An editor checks fit, one reviewer writes comments for eligible work, and an editor sends a written decision."],
    ],
  },
  "research-note": {
    slug: "research-note",
    eyebrow: "For public-data projects",
    title: "Submit a research note built from public data.",
    description: "A short, free route for a student research note using a dataset anyone can download, with a clear method, evidence, and limits.",
    introTitle: "One question. One public dataset. A careful explanation.",
    intro: [
      "A research note is a short paper of 1,500 to 3,000 words that answers one question using data anyone can download. Census and household survey microdata, government statistics portals, and published replication files can all be starting points.",
      "You do not need a lab to make a useful contribution. You do need to name the source, explain how you used it, show what the evidence supports, and say what it cannot show. A code link is welcome but optional; a dataset link is required.",
      "Open Margin is one optional venue. Specialized STEM work depends on a suitable subject reviewer, and no paper is guaranteed publication.",
    ],
    checklist: [
      "Keep the note between 1,500 and 3,000 words",
      "Link to the public dataset or source files used in the analysis",
      "Explain the question, variables, method, results, and limits in plain language",
      "Add a code or reproducibility link if one exists, but do not include private data",
      "Include an abstract, references, origin note, and AI assistance disclosure",
    ],
    steps: [
      { title: "Choose a narrow question", body: "A focused question is easier to test, explain, and challenge than a broad topic." },
      { title: "Make the evidence traceable", body: "Give readers a path to the public data and describe decisions that affect the result." },
      { title: "Use the research-note form", body: "Select Research note, add the dataset link, and upload a blinded PDF or DOCX." },
    ],
    faq: [
      ["What is a research note?", "It is a 1,500 to 3,000 word paper that answers one question with data anyone can download. The submission form asks for the dataset link."],
      ["Do I need to share code?", "No. A code link is optional, but the paper should still explain the method well enough for a reader to understand the analysis."],
      ["Can a science or engineering project use this path?", "It can if the work fits the research-note definition and a suitable reviewer is available. Lab reports and longer studies can use the Article option instead."],
    ],
  },
  "class-project": {
    slug: "class-project",
    eyebrow: "For class, capstone and science-fair work",
    title: "Can a class or capstone project be submitted?",
    description: "Classwork, science-fair studies, lab reports, and design projects can be eligible when the work is original, shareable, and ready for an independent reader.",
    introTitle: "The assignment can be the beginning, not the boundary.",
    intro: [
      "Open Margin accepts original papers, essays, science-fair studies, lab reports, and design projects by authors of any age. Classwork, independent projects, mentored research, and graded work may fit when the work is yours and the manuscript can be read on its own.",
      "Do not upload private interview data, images, school records, or someone else's work without permission. Remove identifying details from the blinded file, and check whether your teacher, school, or program has rules about public release.",
      "A teacher or mentor can help you revise and can share the public checklist, but students submit directly and decide whether this journal is right for them.",
    ],
    checklist: [
      "Rewrite the assignment prompt into a question, thesis, or design goal",
      "Show the sources, observations, measurements, or evidence behind the conclusion",
      "Remove names and school identifiers from the manuscript and file metadata",
      "Get permission for interviews, images, datasets, or other material involving people",
      "Add the work origin, AI assistance disclosure, references, and guardian approval when required",
    ],
    steps: [
      { title: "Ask what the paper is trying to show", body: "A clear question or thesis gives reviewers something specific to evaluate." },
      { title: "Check permissions and privacy", body: "Keep personal information out of the file unless you have a lawful, ethical reason and permission to share it." },
      { title: "Invite the next reader", body: "Use the free author toolkit, read the review process, and submit only when you are ready for comments." },
    ],
    faq: [
      ["Can graded work be submitted?", "Yes, classwork and graded work may fit when it is original, the author can share it, and it meets the public manuscript requirements."],
      ["Can a teacher submit for a student?", "No. Students submit their own work. A teacher or mentor can share the public information and support revision without sending student names or papers outside the form."],
      ["What does review mean here?", "An editor checks fit, then one reviewer writes comments for eligible work. An editor sends a decision letter; publication is not guaranteed."],
    ],
  },
};

type SubmissionPathPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<SearchParams>;
};

export function generateStaticParams() {
  return Object.keys(submissionPaths).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: SubmissionPathPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = submissionPaths[slug];
  if (!page) return { title: "Submission path" };
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/submit/${page.slug}` },
    openGraph: { title: page.title, description: page.description, type: "website" },
  };
}

export default async function SubmissionPathPage({ params, searchParams }: SubmissionPathPageProps) {
  const { slug } = await params;
  const page = submissionPaths[slug];
  if (!page) notFound();

  const campaign = campaignFromSearchParams((await searchParams) ?? {}, `/submit/${page.slug}`);
  const submitHref = withCampaign("/submit", campaign);
  const shareHref = withCampaign("/share", campaign);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: page.faq.map(([question, answer]) => ({
              "@type": "Question",
              name: question,
              acceptedAnswer: { "@type": "Answer", text: answer },
            })),
          }).replace(/</g, "\\u003c"),
        }}
      />
      <PageIntro eyebrow={page.eyebrow} title={page.title} description={page.description} />

      <section className="eligibility-grid">
        <div>
          <p className="eyebrow">Is this your work?</p>
          <h2>{page.introTitle}</h2>
        </div>
        <div className="eligibility-copy">
          {page.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <div className="closing-actions">
            <Link className="button button-dark" href={submitHref}>Open submission portal</Link>
            <Link className="text-link" href="/review">Read the review rubric</Link>
          </div>
        </div>
      </section>

      <section className="standards-section">
        <p className="eyebrow">Ready-to-submit check</p>
        <div className="standards-grid">
          <h2>Make the paper easy to read and fair to review.</h2>
          <ul>{page.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      <section className="guide-options">
        <div className="section-heading">
          <div><p className="eyebrow">A practical sequence</p><h2>Three moves before upload.</h2></div>
        </div>
        <div className="guide-option-grid">
          {page.steps.map((step, index) => (
            <article className="guide-option" key={step.title}>
              <p className="eyebrow">{String(index + 1).padStart(2, "0")}</p>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-faq" aria-labelledby="submission-path-faq-title">
        <div><p className="eyebrow">Quick answers</p><h2 id="submission-path-faq-title">Before you choose.</h2></div>
        <div className="guide-faq-list">
          {page.faq.map(([question, answer]) => <article key={question}><h3>{question}</h3><p>{answer}</p></article>)}
        </div>
      </section>

      <section className="closing-callout">
        <p className="eyebrow">Your next step</p>
        <h2>Read the process, then decide.</h2>
        <p>Open Margin is free to submit and keeps the same public scope, rubric, and safeguards for every author. There is no fee and no guarantee of publication.</p>
        <div className="closing-actions">
          <Link className="button button-accent" href={submitHref}>Submit a manuscript</Link>
          <Link className="text-link light" href="/resources">Open the author toolkit</Link>
          <Link className="text-link light" href={shareHref}>Share this path</Link>
        </div>
      </section>
    </main>
  );
}
