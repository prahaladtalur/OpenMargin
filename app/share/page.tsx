import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../components/SiteShell";
import { campaignFromSearchParams, withCampaign } from "../../lib/campaign";

export const metadata: Metadata = {
  title: "Share Open Margin",
  description: "A short, accurate message for teachers, mentors, and research programs to share with students.",
};

const shareText = `Open Margin is a free, independent journal for research by authors of any age. It accepts work in the humanities, social sciences, and STEM.

Students submit directly. An editor checks fit, two reviewers write comments, and the journal targets a decision in six to eight weeks. There is no fee and no guarantee of acceptance.

Learn more: https://openmargin.org/guide
Submit work: https://openmargin.org/submit`;

type SharePageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function SharePage({ searchParams }: SharePageProps) {
  const campaign = campaignFromSearchParams((await searchParams) ?? {}, "/share");
  const submitHref = withCampaign("/submit", campaign);

  return (
    <main>
      <PageIntro
        eyebrow="Share Open Margin"
        title="A simple next step after a research project."
        description="Use this page if you mentor students or run a research program. Share the option only when it fits, and let each student decide."
      />

      <section className="share-copy-section">
        <div>
          <p className="eyebrow">Copy and send</p>
          <h2>A short description you can forward.</h2>
          <p>Keep the message intact so students see the same process, cost, and limits that we publish on the site.</p>
        </div>
        <pre className="share-copy">{shareText}</pre>
      </section>

      <section className="share-steps">
        <p className="eyebrow">What happens next</p>
        <div>
          <article><span>01</span><h2>They read the fit.</h2><p>Students can compare Open Margin with journals, competitions, mentors, and repositories.</p><Link className="text-link" href="/guide">Read the publishing guide</Link></article>
          <article><span>02</span><h2>They choose.</h2><p>There is no referral requirement, priority, or data exchange. Students submit only if they want to.</p><Link className="text-link" href={submitHref}>Open the submission page</Link></article>
          <article><span>03</span><h2>We review independently.</h2><p>Every paper uses the same public scope, rubric, and decision process.</p><Link className="text-link" href="/review">See the review process</Link></article>
        </div>
      </section>

      <section className="share-guardrails">
        <div><p className="eyebrow">For programs and mentors</p><h2>Share the option, not a promise.</h2></div>
        <ul>
          <li>Do not describe Open Margin as a guaranteed publication or admissions result.</li>
          <li>Do not send student names, papers, or contact details to us outside the submission process.</li>
          <li>Do not ask a student to submit work that is already under exclusive review elsewhere.</li>
          <li>Use the same public process for every author, including students from partner programs.</li>
        </ul>
        <Link className="button button-dark" href="/partners">Discuss a program pilot</Link>
      </section>
    </main>
  );
}
