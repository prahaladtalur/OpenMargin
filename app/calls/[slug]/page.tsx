import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publishableCalls } from "../../site";

export const dynamic = "force-static";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(value));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const call = publishableCalls().find((item) => item.slug === slug);
  return call ? { title: call.title, description: call.standfirst } : { title: "Call not found" };
}

export default async function CallPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const call = publishableCalls().find((item) => item.slug === slug);
  if (!call) notFound();

  return (
    <main>
      <article className="article-page">
        <header className="article-header">
          <p className="eyebrow">Call for papers · {formatDate(call.closesAt)}</p>
          <h1>{call.title}</h1>
          <p className="article-byline">Edited by {call.editorName}, {call.editorRole}</p>
        </header>
        <section className="article-body">
          <aside className="article-aside"><p>{call.standfirst}</p><p><strong>Open:</strong> {formatDate(call.opensAt)}<br /><strong>Close:</strong> {formatDate(call.closesAt)}</p><Link className="button button-dark" href={`/submit?call=${encodeURIComponent(call.slug)}`}>Submit to this call</Link></aside>
          <div className="article-text">{call.scope.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </section>
      </article>
    </main>
  );
}
