import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { EditorActions } from "./EditorActions";
import { ManuscriptVersions } from "./ManuscriptVersions";
import { PublishArticleForm } from "./PublishArticleForm";
import { ReviewAssignments } from "./ReviewAssignments";
import { ensureSubmissionTable, getDb } from "../../db";
import { publicationReleaseApprovals, publishedArticles, reviewerApplications, reviewAssignments, submissionRevisions, submissions } from "../../db/schema";
import { editorSignOutPath, emailNotificationsConfigured, requireEditor } from "../../lib/editor-auth";
import { publishableCalls } from "../site";
import { hasRequiredIndependentReview, reviewerMatchesAuthor } from "../../lib/review-policy";
import { isReviewerEligibleForManuscriptAccess } from "../../lib/reviewer-eligibility.mjs";
import { hashPublicVersion } from "../../lib/publication-approval.mjs";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Private editor" };

function formatDate(value: string) {
  const date = new Date(`${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default async function EditorPage() {
  await requireEditor("/editor");
  await ensureSubmissionTable();
  const db = getDb();
  const rows = await db.select().from(submissions).orderBy(desc(submissions.createdAt)).limit(100);
  const revisions = await db.select().from(submissionRevisions).orderBy(desc(submissionRevisions.versionNumber));
  const releaseApprovals = await db.select().from(publicationReleaseApprovals).orderBy(desc(publicationReleaseApprovals.recordedAt));
  const articles = await db.select().from(publishedArticles);
  const reviews = await db.select().from(reviewAssignments).orderBy(desc(reviewAssignments.createdAt));
  const activeReviewerRecords = await db.select({ id: reviewerApplications.id, fullName: reviewerApplications.fullName, email: reviewerApplications.email, status: reviewerApplications.status, ageBand: reviewerApplications.ageBand, guardianApprovalAt: reviewerApplications.guardianApprovalAt, guardianApprovalEvidence: reviewerApplications.guardianApprovalEvidence })
    .from(reviewerApplications)
    .where(eq(reviewerApplications.status, "active"));
  const activeReviewers = activeReviewerRecords.filter(isReviewerEligibleForManuscriptAccess);
  const activeReviewerIds = new Set(activeReviewers.map((reviewer) => reviewer.id));
  const emailConfigured = emailNotificationsConfigured();
  const calls = publishableCalls();
  const reviewsBySubmission = new Map<string, typeof reviews>();
  for (const review of reviews) {
    const current = reviewsBySubmission.get(review.submissionId) ?? [];
    current.push(review);
    reviewsBySubmission.set(review.submissionId, current);
  }
  const revisionsBySubmission = new Map<string, typeof revisions>();
  for (const revision of revisions) {
    const current = revisionsBySubmission.get(revision.submissionId) ?? [];
    current.push(revision);
    revisionsBySubmission.set(revision.submissionId, current);
  }
  const releaseApprovalsBySubmission = new Map<string, typeof releaseApprovals>();
  for (const approval of releaseApprovals) {
    const current = releaseApprovalsBySubmission.get(approval.submissionId) ?? [];
    current.push(approval);
    releaseApprovalsBySubmission.set(approval.submissionId, current);
  }
  const publicRecordWarnings = [] as string[];
  for (const article of articles) {
    const submission = rows.find((row) => row.id === article.submissionId);
    const latestVersionId = (revisionsBySubmission.get(article.submissionId) ?? [])[0]?.id ?? "original";
    const reviewComplete = submission && article.manuscriptVersionId === latestVersionId && hasRequiredIndependentReview(reviewsBySubmission.get(article.submissionId) ?? [], submission, activeReviewerIds, latestVersionId);
    const warnings = [] as string[];
    if (!submission) warnings.push("backing submission is missing");
    else if (submission.status !== "published") warnings.push(`backing status is ${submission.status}`);
    if (!article.manuscriptVersionId) warnings.push("public article is not linked to an exact manuscript version");
    if (!reviewComplete) warnings.push("missing a complete written review of the latest saved manuscript version (one required)");
    const currentHash = await hashPublicVersion(article);
    const approvals = releaseApprovalsBySubmission.get(article.submissionId) ?? [];
    if (!approvals.some((approval) => approval.publicVersionHash === currentHash)) {
      warnings.push(approvals.length === 0 ? "no recorded approval for the current public version" : "current public version does not match its recorded approval");
    }
    if (warnings.length > 0) publicRecordWarnings.push(`${article.title}: ${warnings.join("; ")}`);
  }

  return (
    <main className="editor-page">
      <header className="editor-header">
        <div><p className="eyebrow">Private editorial workspace</p><h1>Submission desk</h1><p>Editor session protected by a password.</p></div>
        <div className="editor-header-actions"><Link href="/editor/marketing" className="editor-link">Marketing desk</Link><Link href="/editor/recruitment" className="editor-link">Recruitment desk</Link><Link href="/" className="editor-link">View public site</Link><Link href={editorSignOutPath("/")} className="editor-link">Sign out</Link></div>
      </header>
      <section className={`editor-notice ${emailConfigured ? "configured" : ""}`}>
        <p><strong>Email alerts:</strong> {emailConfigured ? "New submissions and publication alerts go to the editorial inbox. Decision and publication messages go to authors." : "Not active. The dashboard still stores submissions securely. Connect an email sender to receive alerts."}</p>
      </section>
      <section className={`editor-notice ${publicRecordWarnings.length === 0 ? "configured" : ""}`}>
        <p><strong>Public record audit:</strong> Confirm one complete written review, a final edit, and author or guardian approval for every public article before widening outreach. Acceptance and publication require the saved review.</p>
        {publicRecordWarnings.length > 0 && <ul>{publicRecordWarnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
      </section>
      <section className="editor-summary" aria-label="Submission summary">
        <div><span>{rows.length}</span><p>Submissions</p></div>
        <div><span>{rows.filter((row) => row.status === "received").length}</span><p>New</p></div>
        <div><span>{rows.filter((row) => row.status === "under-review").length}</span><p>Under review</p></div>
        <div><span>{reviews.filter((review) => review.status === "submitted").length}</span><p>Reviews submitted</p></div>
      </section>
      {calls.length > 0 && <section className="editor-list" aria-label="Call submission counts"><div className="editor-list-heading"><p className="eyebrow">Calls for papers</p><p>Submission counts are private to the editorial team.</p></div><div className="editor-data-grid editor-data-grid-three">{calls.map((call) => <div key={call.slug}><h3>{call.title}</h3><p>{rows.filter((row) => row.callSlug === call.slug).length} submissions</p></div>)}</div></section>}
      <section className="editor-list">
        <div className="editor-list-heading"><p className="eyebrow">Private records</p><p>Files and contact details are visible only to authorized editors.</p></div>
        {rows.length === 0 ? <div className="editor-empty"><h2>No submissions yet.</h2><p>New submissions will appear here when the portal receives them.</p></div> : rows.map((row) => (
          <article className="editor-card" key={row.id}>
            <div className="editor-card-heading"><div><p className="editor-reference">{row.id}</p><h2>{row.manuscriptTitle}</h2><p className="editor-meta">{row.discipline} · {row.wordCount.toLocaleString()} words · received {formatDate(row.createdAt)}</p></div><div className="editor-file-actions">{(row.manuscriptContentType === "application/pdf" || /\.pdf$/i.test(row.manuscriptFilename)) && <a className="button button-dark" href={`/api/editor/submissions/${row.id}/manuscript`} target="_blank" rel="noreferrer">Open PDF</a>}<a className="editor-link" href={`/api/editor/submissions/${row.id}/manuscript?download=1`}>Download manuscript</a></div></div>
            <div className="editor-data-grid"><div><h3>Author</h3><p>{row.authorName}<br /><a href={`mailto:${row.authorEmail}`}>{row.authorEmail}</a></p></div><div><h3>Guardian</h3><p>{row.guardianEmail ? <a href={`mailto:${row.guardianEmail}`}>{row.guardianEmail}</a> : "Not supplied"}</p></div><div><h3>School or region</h3><p>{row.schoolOrOrganization ?? "Not supplied"}<br />{row.countryOrRegion ?? "Not supplied"}</p></div><div><h3>Campaign</h3><p>{row.campaignSource ? `${row.campaignSource}${row.campaignName ? ` · ${row.campaignName}` : ""}` : "Direct or not tagged"}<br />{row.landingPath ?? ""}</p></div></div>
            <div className="editor-abstract"><h3>Abstract</h3><p>{row.abstract}</p><h3>AI disclosure</h3><p>{row.aiDisclosure}</p></div>
            <ManuscriptVersions submissionId={row.id} originalFileName={row.manuscriptFilename} originalCreatedAt={row.createdAt} revisions={revisionsBySubmission.get(row.id) ?? []} />
            <EditorActions id={row.id} status={row.status} editorMessage={row.editorMessage} ageBand={row.ageBand} guardianEmail={row.guardianEmail} />
            <ReviewAssignments submissionId={row.id} assignments={reviewsBySubmission.get(row.id) ?? []} reviewers={activeReviewers.filter((reviewer) => !reviewerMatchesAuthor({ name: reviewer.fullName, email: reviewer.email }, row))} manuscriptVersions={[{ id: "original", label: `Original submission · ${row.manuscriptFilename}` }, ...(revisionsBySubmission.get(row.id) ?? []).map((revision) => ({ id: revision.id, label: `Revision ${revision.versionNumber} · ${revision.fileName}` }))]} latestManuscriptVersionId={(revisionsBySubmission.get(row.id) ?? [])[0]?.id ?? "original"} />
            {(releaseApprovalsBySubmission.get(row.id) ?? []).length > 0 && <details className="editor-release-history"><summary>Recorded public-release approvals ({releaseApprovalsBySubmission.get(row.id)?.length ?? 0})</summary>{releaseApprovalsBySubmission.get(row.id)?.map((approval) => <div key={approval.id}><p><strong>{approval.authorAgeStatus === "under-18" ? "Under 18, guardian approval recorded" : "18 or older"}</strong> · {formatDate(approval.recordedAt)}</p><p>Age check: {approval.ageStatusEvidence}</p><p>Author approval: {approval.authorApprovalEvidence}</p>{approval.guardianApprovalEvidence && <p>Guardian approval: {approval.guardianApprovalEvidence}</p>}<small>Approved version: {approval.publicVersionHash.slice(0, 16)}…</small></div>)}</details>}
            {(row.status === "accepted" || row.status === "published") && (() => {
              const article = articles.find((item) => item.submissionId === row.id);
              const manuscriptVersions = [
                { id: "original", label: `Original submission · ${row.manuscriptFilename}` },
                ...(revisionsBySubmission.get(row.id) ?? []).map((revision) => ({ id: revision.id, label: `Revision ${revision.versionNumber} · ${revision.fileName}` })),
              ];
              const latestManuscriptVersionId = (revisionsBySubmission.get(row.id) ?? [])[0]?.id ?? "original";
              const storedAgeBand = row.ageBand.trim().toLowerCase();
              const knownMinor = ["minor", "under-18", "14-17", "under-18-years"].includes(storedAgeBand) || row.guardianConfirmed || Boolean(row.guardianEmail);
              const knownAdult = ["adult", "18+", "18-or-older"].includes(storedAgeBand);
              return <PublishArticleForm id={row.id} status={row.status} manuscriptVersions={manuscriptVersions.filter((version) => version.id === latestManuscriptVersionId)} initialManuscriptVersionId={article?.manuscriptVersionId ?? latestManuscriptVersionId} initial={{
                title: article?.title ?? row.manuscriptTitle,
                authorName: article?.authorName ?? row.authorName,
                discipline: article?.discipline ?? row.discipline,
                abstract: article?.abstract ?? row.abstract,
                abstractNative: article?.abstractNative ?? row.abstractNative,
                abstractNativeLanguage: article?.abstractNativeLanguage ?? row.abstractNativeLanguage,
                submissionType: article?.submissionType ?? row.submissionType,
                dataSourceUrl: article?.dataSourceUrl ?? row.dataSourceUrl,
                codeUrl: article?.codeUrl ?? row.codeUrl,
                body: article?.body ?? "",
                issue: article?.issue ?? "Volume 01",
                slug: article?.slug,
              }} initialAgeStatus={knownMinor ? "under-18" : knownAdult ? "adult" : ""} />;
            })()}
          </article>
        ))}
      </section>
    </main>
  );
}
