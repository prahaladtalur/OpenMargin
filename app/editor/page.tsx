import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { chatGPTSignOutPath } from "../chatgpt-auth";
import { EditorActions } from "./EditorActions";
import { ensureSubmissionTable, getDb } from "../../db";
import { submissions } from "../../db/schema";
import { emailNotificationsConfigured, requireEditor } from "../../lib/editor-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Private editor" };

function formatDate(value: string) {
  const date = new Date(`${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function EditorPage() {
  const user = await requireEditor("/editor");
  await ensureSubmissionTable();
  const rows = await getDb().select().from(submissions).orderBy(desc(submissions.createdAt)).limit(100);
  const emailConfigured = emailNotificationsConfigured();

  return (
    <main className="editor-page">
      <header className="editor-header">
        <div><p className="eyebrow">Private editorial workspace</p><h1>Submission desk</h1><p>Signed in as {user.email}</p></div>
        <div className="editor-header-actions"><Link href="/editor/recruitment" className="editor-link">Recruitment desk</Link><Link href="/" className="editor-link">View public site</Link><Link href={chatGPTSignOutPath("/")} className="editor-link">Sign out</Link></div>
      </header>
      <section className={`editor-notice ${emailConfigured ? "configured" : ""}`}>
        <p><strong>Email alerts:</strong> {emailConfigured ? "New submissions are sent to the configured editorial inbox." : "Not active yet. The dashboard stores submissions securely; connect an email sender to receive alerts."}</p>
      </section>
      <section className="editor-summary" aria-label="Submission summary">
        <div><span>{rows.length}</span><p>Submissions shown</p></div>
        <div><span>{rows.filter((row) => row.status === "received").length}</span><p>New</p></div>
        <div><span>{rows.filter((row) => row.status === "under-review").length}</span><p>Under review</p></div>
      </section>
      <section className="editor-list">
        <div className="editor-list-heading"><p className="eyebrow">Private records</p><p>Files and contact details are visible only to authorized editors.</p></div>
        {rows.length === 0 ? <div className="editor-empty"><h2>No submissions yet.</h2><p>New submissions will appear here as soon as the portal receives them.</p></div> : rows.map((row) => (
          <article className="editor-card" key={row.id}>
            <div className="editor-card-heading"><div><p className="editor-reference">{row.id}</p><h2>{row.manuscriptTitle}</h2><p className="editor-meta">{row.discipline} · {row.wordCount.toLocaleString()} words · received {formatDate(row.createdAt)}</p></div><a className="button button-dark" href={`/api/editor/submissions/${row.id}/manuscript`}>Download manuscript</a></div>
            <div className="editor-data-grid"><div><h3>Author</h3><p>{row.authorName}<br /><a href={`mailto:${row.authorEmail}`}>{row.authorEmail}</a></p></div><div><h3>Guardian</h3><p>{row.guardianEmail ? <a href={`mailto:${row.guardianEmail}`}>{row.guardianEmail}</a> : "Not supplied"}</p></div><div><h3>School / region</h3><p>{row.schoolOrOrganization ?? "Not supplied"}<br />{row.countryOrRegion ?? "Not supplied"}</p></div><div><h3>Origin</h3><p>{row.originNote}</p></div></div>
            <div className="editor-abstract"><h3>Abstract</h3><p>{row.abstract}</p><h3>AI disclosure</h3><p>{row.aiDisclosure}</p></div>
            <EditorActions id={row.id} status={row.status} />
          </article>
        ))}
      </section>
    </main>
  );
}
