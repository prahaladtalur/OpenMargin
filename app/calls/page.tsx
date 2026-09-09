import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "../components/SiteShell";
import { publishableCalls } from "../site";

export const metadata: Metadata = { title: "Calls for papers" };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(value));
}

export default function CallsPage() {
  const calls = publishableCalls();
  if (calls.length === 0) notFound();

  return (
    <main>
      <PageIntro eyebrow="Calls for papers" title="Questions worth building a paper around." description="Open calls have a clear scope, dates, and a named editor." />
      <section className="editor-list public-call-list">
        {calls.map((call) => <article className="editor-card" key={call.slug}>
          <p className="eyebrow">Open through {formatDate(call.closesAt)}</p>
          <h2>{call.title}</h2>
          <p>{call.standfirst}</p>
          <Link className="text-link" href={`/calls/${call.slug}`}>Read the call</Link>
        </article>)}
      </section>
    </main>
  );
}
