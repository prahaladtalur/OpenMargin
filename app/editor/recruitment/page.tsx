import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { ensureOperationsTables, getDb } from "../../../db";
import { partnerInquiries, reviewerApplications } from "../../../db/schema";
import { requireEditor } from "../../../lib/editor-auth";
import { RecruitmentActions } from "./RecruitmentActions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Recruitment desk" };

function formatDate(value: string) {
  const date = new Date(`${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export default async function RecruitmentPage() {
  await requireEditor("/editor/recruitment");
  await ensureOperationsTables();
  const [reviewers, partners] = await Promise.all([
    getDb().select().from(reviewerApplications).orderBy(desc(reviewerApplications.createdAt)).limit(100),
    getDb().select().from(partnerInquiries).orderBy(desc(partnerInquiries.createdAt)).limit(100),
  ]);

  return (
    <main className="editor-page">
      <header className="editor-header"><div><p className="eyebrow">Private editorial workspace</p><h1>Recruitment desk</h1><p>Reviewer applications and program inquiries remain private to authorized editors.</p></div><div className="editor-header-actions"><Link href="/editor" className="editor-link">Submission desk</Link><Link href="/" className="editor-link">View public site</Link></div></header>
      <section className="editor-summary" aria-label="Recruitment summary"><div><span>{reviewers.length}</span><p>Reviewer applications</p></div><div><span>{partners.length}</span><p>Partner inquiries</p></div><div><span>{reviewers.filter((row) => row.status === "received").length + partners.filter((row) => row.status === "received").length}</span><p>New items</p></div></section>
      <section className="editor-list"><div className="editor-list-heading"><p className="eyebrow">Reviewer & advisor applications</p><p>Never assign a manuscript until expertise, capacity, and conflicts are clear.</p></div>{reviewers.length === 0 ? <div className="editor-empty"><h2>No applications yet.</h2><p>New reviewer and advisor applications will appear here.</p></div> : reviewers.map((row) => <article className="editor-card" key={row.id}><div className="editor-card-heading"><div><p className="editor-reference">{row.id}</p><h2>{row.fullName}</h2><p className="editor-meta">{row.role} · received {formatDate(row.createdAt)}</p></div><a className="editor-link" href={`mailto:${row.email}`}>Email applicant</a></div><div className="editor-data-grid editor-data-grid-three"><div><h3>Age band</h3><p>{row.ageBand}</p></div><div><h3>Guardian</h3><p>{row.guardianEmail ? <a href={`mailto:${row.guardianEmail}`}>{row.guardianEmail}</a> : "Not required"}</p></div><div><h3>Fields</h3><p>{row.disciplines}</p></div></div><div className="editor-abstract"><h3>Experience</h3><p>{row.experience}</p><h3>Availability</h3><p>{row.availability}</p><h3>Motivation</h3><p>{row.statement}</p></div><RecruitmentActions id={row.id} kind="reviewer" status={row.status} /></article>)}</section>
      <section className="editor-list"><div className="editor-list-heading"><p className="eyebrow">Partner inquiries</p><p>Keep participation opt-in and editorial decisions separate from program relationships.</p></div>{partners.length === 0 ? <div className="editor-empty"><h2>No inquiries yet.</h2><p>New conversations with schools, programs, and organizations will appear here.</p></div> : partners.map((row) => <article className="editor-card" key={row.id}><div className="editor-card-heading"><div><p className="editor-reference">{row.id}</p><h2>{row.organizationName}</h2><p className="editor-meta">{row.organizationType} · received {formatDate(row.createdAt)}</p></div><a className="editor-link" href={`mailto:${row.contactEmail}`}>Email contact</a></div><div className="editor-data-grid editor-data-grid-three"><div><h3>Contact</h3><p>{row.contactName}<br />{row.contactRole ?? "Role not supplied"}</p></div><div><h3>Interested in</h3><p>{row.requestedPath}</p></div><div><h3>Cohort size</h3><p>{row.cohortSize ?? "Not supplied"}</p></div></div><div className="editor-abstract"><h3>Program & students</h3><p>{row.focus}</p><h3>What success looks like</h3><p>{row.goals}</p></div><RecruitmentActions id={row.id} kind="partner" status={row.status} /></article>)}</section>
    </main>
  );
}
