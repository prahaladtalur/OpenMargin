import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../components/SiteShell";
import { campaignFromSearchParams, withCampaign } from "../../lib/campaign";

export const metadata: Metadata = {
  title: "Where can I publish a student research paper?",
  description: "A practical guide to journals, competitions, conferences, repositories, mentorship programs, and other places for student research.",
  alternates: { canonical: "/guide" },
};

const options = [
  {
    title: "Your school or mentor",
    bestFor: "Best for an early draft and first feedback.",
    body: "Ask a teacher, mentor, or classmate to mark unclear parts and check your sources. This is usually free. Ask before you share private data or work from a class.",
    label: "Start here when you need comments",
  },
  {
    title: "A competition or conference",
    bestFor: "Best for presenting work to an audience.",
    body: "Check the deadline, age rules, topic rules, and required format. You may present a poster or abstract instead of a full paper. A prize is not the same as peer review.",
    label: "Good for a deadline or presentation",
  },
  {
    title: "A student or youth journal",
    bestFor: "Best for editorial review and a public article.",
    body: "Read the scope and review policy. Check how many people read the paper, whether there are fees, and who keeps the copyright. Look for a real archive of past work.",
    label: "Compare the review before you submit",
  },
  {
    title: "A research mentorship program",
    bestFor: "Best when you need help before submission.",
    body: "Some programs charge a fee. Ask who owns the work, whether publication is optional, and whether the program promises a decision or only guidance. A mentor can help without controlling your paper.",
    label: "Useful when the project needs support",
  },
  {
    title: "An open repository",
    bestFor: "Best for public access and a timestamp.",
    body: "Repositories can make a paper easy to find, but they often do not provide peer review. Check permanence, privacy, school rules, and whether you can update or remove the file.",
    label: "Choose this when a public record is the goal",
  },
  {
    title: "Open Margin",
    bestFor: "One free option for a careful review.",
    body: "Open Margin is a student-led journal project. Authors of any age can submit in the humanities, social sciences, and STEM. We charge no submission or publication fee, ask two reviewers for written comments, and target a decision within six to eight weeks. We do not guarantee acceptance.",
    label: "This journal",
  },
];

const questions = [
  "What is the real review process?",
  "How many readers review the paper?",
  "Is there a fee to submit or publish?",
  "Who keeps copyright?",
  "Is publication guaranteed?",
  "What happens to my name and personal information?",
  "Can I submit class or program work?",
];

const faq = [
  ["Is Open Margin free?", "Yes. Open Margin has no submission or publication fee."],
  ["Who can submit?", "Authors of any age can submit original work in the humanities, social sciences, and STEM."],
  ["Does Open Margin guarantee publication?", "No. An editor checks fit, two reviewers write comments, and an editor sends a decision."],
  ["How long does a decision take?", "The target is six to eight weeks after the fit check. Timing can change when reviewer availability changes."],
  ["Can I submit the same paper elsewhere?", "Check each venue's simultaneous-submission rule. Tell Open Margin if the same work is under exclusive review elsewhere."],
] as const;

const steps = [
  ["Choose your goal", "Decide if you want feedback, a competition, a public record, or a formal publication."],
  ["Read the rules", "Check scope, deadlines, fees, copyright, privacy, and simultaneous-submission rules."],
  ["Protect the people in the work", "Remove private information and get permission before you share interviews, images, or data."],
  ["Keep your own copy", "Save the submitted file, the rules, and the confirmation email in one place."],
];

type GuidePageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function GuidePage({ searchParams }: GuidePageProps) {
  const campaign = campaignFromSearchParams((await searchParams) ?? {}, "/guide");
  const submitHref = withCampaign("/submit", campaign);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map(([question, answer]) => ({
              "@type": "Question",
              name: question,
              acceptedAnswer: { "@type": "Answer", text: answer },
            })),
          }).replace(/</g, "\\u003c"),
        }}
      />
      <PageIntro
        eyebrow="Free guide"
        title="Where can I publish a student research paper?"
        description="There is no single best place. Start with what you want: feedback, a competition, a public record, or a formal publication."
      />

      <section className="guide-intro">
        <div>
          <p className="eyebrow">Start with the goal</p>
          <h2>Pick the place that fits the work.</h2>
        </div>
        <div className="guide-intro-copy">
          <p>“Publish” can mean several things. A teacher can help you improve a draft. A competition can give you a deadline and an audience. A journal can give you an editorial decision and a public article. A repository can make the paper easy to find.</p>
          <p>Before you submit, ask what the reader will do, what you will pay, and what happens to your paper after you click send.</p>
        </div>
      </section>

      <section className="guide-options">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Six common paths</p>
            <h2>Compare your options.</h2>
          </div>
        </div>
        <div className="guide-option-grid">
          {options.map((option) => (
            <article className="guide-option" key={option.title}>
              <p className="eyebrow">{option.bestFor}</p>
              <h3>{option.title}</h3>
              <p>{option.body}</p>
              <p>{option.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-questions">
        <div>
          <p className="eyebrow">Before you send</p>
          <h2>Ask these questions.</h2>
        </div>
        <ul className="guide-question-list">
          {questions.map((question) => <li key={question}>{question}</li>)}
        </ul>
      </section>

      <section className="guide-faq" aria-labelledby="guide-faq-title">
        <div>
          <p className="eyebrow">Quick answers</p>
          <h2 id="guide-faq-title">Before you choose.</h2>
        </div>
        <div className="guide-faq-list">
          {faq.map(([question, answer]) => (
            <article key={question}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-steps">
        <div>
          <p className="eyebrow">A simple plan</p>
          <h2>Choose, check, then submit.</h2>
        </div>
        <ol className="guide-step-list">
          {steps.map(([title, body], index) => (
            <li key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h3>{title}</h3><p>{body}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="closing-callout">
        <p className="eyebrow">If Open Margin fits</p>
        <h2>Read the process before you send the paper.</h2>
        <p>See what reviewers read, what decisions mean, and what happens after a submission.</p>
        <div className="closing-actions">
          <Link className="button button-accent" href="/review">Read the review process</Link>
          <Link className="text-link light" href={submitHref}>Open the submission guide</Link>
        </div>
      </section>
    </main>
  );
}
