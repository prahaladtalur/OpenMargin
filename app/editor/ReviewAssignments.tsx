"use client";

import { FormEvent, useState } from "react";

type Assignment = {
  id: string;
  reviewerName: string;
  reviewerEmail: string;
  manuscriptVersionId: string | null;
  status: string;
  dueAt: string | null;
  conflictConfirmed: boolean;
  confidentialityConfirmed: boolean;
  questionScore: number | null;
  contextScore: number | null;
  methodScore: number | null;
  evidenceScore: number | null;
  clarityScore: number | null;
  integrityScore: number | null;
  recommendation: string | null;
  comments: string | null;
  submittedAt: string | null;
};

type ReviewerOption = { id: string; fullName: string; email: string };
type ManuscriptVersion = { id: string; label: string };

const statuses = ["draft", "invited", "accepted", "in-progress", "submitted", "declined", "withdrawn"];
const scores = ["questionScore", "contextScore", "methodScore", "evidenceScore", "clarityScore", "integrityScore"] as const;
const scoreLabels: Record<(typeof scores)[number], string> = {
  questionScore: "Question",
  contextScore: "Context",
  methodScore: "Method",
  evidenceScore: "Evidence",
  clarityScore: "Clarity",
  integrityScore: "Integrity",
};
const recommendations = ["strong-revise", "revise", "accept-with-changes", "accept", "decline"];

function label(value: string) {
  if (value === "draft") return "draft (not sent)";
  return value.replaceAll("-", " ");
}

function AssignmentCard({ assignment, manuscriptVersions }: { assignment: Assignment; manuscriptVersions: ManuscriptVersion[] }) {
  const [status, setStatus] = useState(assignment.status);
  const [dueAt, setDueAt] = useState(assignment.dueAt ?? "");
  const [conflictConfirmed, setConflictConfirmed] = useState(assignment.conflictConfirmed);
  const [confidentialityConfirmed, setConfidentialityConfirmed] = useState(assignment.confidentialityConfirmed);
  const [recommendation, setRecommendation] = useState(assignment.recommendation ?? "");
  const [comments, setComments] = useState(assignment.comments ?? "");
  const [scoresValue, setScoresValue] = useState<Record<(typeof scores)[number], string>>(() => Object.fromEntries(scores.map((key) => [key, assignment[key]?.toString() ?? ""])) as Record<(typeof scores)[number], string>);
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");
  const manuscriptVersionLabel = manuscriptVersions.find((version) => version.id === assignment.manuscriptVersionId)?.label;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");
    const response = await fetch(`/api/editor/reviews/${assignment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        dueAt,
        conflictConfirmed,
        confidentialityConfirmed,
        recommendation,
        comments,
        ...scoresValue,
      }),
    });
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    if (!response.ok) {
      setState("error");
      setMessage(payload?.error ?? "Could not save this review.");
      return;
    }
    window.location.reload();
  }

  return (
    <form className="review-assignment-card" onSubmit={save}>
      <div className="review-assignment-heading">
        <div><h4>{assignment.reviewerName}</h4><p>{assignment.reviewerEmail}</p></div>
        {assignment.submittedAt && <span className="review-submitted">Report saved</span>}
      </div>
      <p className="review-source-version">Manuscript version: {manuscriptVersionLabel ?? "Not linked (legacy record)"}</p>
      <div className="review-assignment-controls">
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((option) => <option key={option} value={option}>{label(option)}</option>)}</select></label>
        <label>Due date<input type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></label>
      </div>
      <div className="review-score-grid">
        {scores.map((key) => <label key={key}>{scoreLabels[key]}<select value={scoresValue[key]} onChange={(event) => setScoresValue((current) => ({ ...current, [key]: event.target.value }))}><option value="">Not scored</option>{[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select></label>)}
      </div>
      <label>Recommendation<select value={recommendation} onChange={(event) => setRecommendation(event.target.value)}><option value="">Not set</option>{recommendations.map((option) => <option key={option} value={option}>{label(option)}</option>)}</select></label>
      <label>Reviewer comments<textarea value={comments} onChange={(event) => setComments(event.target.value)} maxLength={12000} rows={6} placeholder="Write comments the author can use. A submitted report needs at least 80 characters." /></label>
      <div className="review-confirmations">
        <label><input type="checkbox" checked={conflictConfirmed} onChange={(event) => setConflictConfirmed(event.target.checked)} /> I checked for conflicts.</label>
        <label><input type="checkbox" checked={confidentialityConfirmed} onChange={(event) => setConfidentialityConfirmed(event.target.checked)} /> I will keep the manuscript and review private.</label>
      </div>
      {message && <p className="form-error" role="alert">{message}</p>}
      <button className="editor-save" type="submit" disabled={state === "saving"}>{state === "saving" ? "Saving" : "Save review record"}</button>
    </form>
  );
}

export function ReviewAssignments({ submissionId, assignments, reviewers, manuscriptVersions, latestManuscriptVersionId }: { submissionId: string; assignments: Assignment[]; reviewers: ReviewerOption[]; manuscriptVersions: ManuscriptVersion[]; latestManuscriptVersionId: string }) {
  const [reviewerApplicationId, setReviewerApplicationId] = useState("");
  const [manuscriptVersionId, setManuscriptVersionId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  async function addAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");
    if (!reviewerApplicationId) {
      setState("error");
      setMessage("Choose an active reviewer first.");
      return;
    }
    if (!manuscriptVersionId) {
      setState("error");
      setMessage("Choose the exact manuscript version for this private draft.");
      return;
    }
    const response = await fetch(`/api/editor/submissions/${submissionId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewerApplicationId, manuscriptVersionId, dueAt }),
    });
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    if (!response.ok) {
      setState("error");
      setMessage(payload?.error ?? "Could not add this reviewer.");
      return;
    }
    window.location.reload();
  }

  return (
    <section className="review-assignments" aria-labelledby={`reviews-${submissionId}`}>
      <div className="review-assignments-heading"><div><h3 id={`reviews-${submissionId}`}>Review records</h3><p>Keep assignments, conflicts, and written reports private to the editorial team.</p></div><span>{assignments.filter((assignment) => assignment.status === "submitted").length} submitted</span></div>
      {assignments.length > 0 && <div className="review-assignment-list">{assignments.map((assignment) => <AssignmentCard key={assignment.id} assignment={assignment} manuscriptVersions={manuscriptVersions} />)}</div>}
      <form className="review-add-form" onSubmit={addAssignment}>
        <p className="eyebrow">Add reviewer</p>
        <p>This saves a private draft only. It does not contact the reviewer or share the manuscript. Select the exact file to review. Before you invite anyone, confirm subject fit, conflicts, confidentiality, author permission to share this version, and a due date.</p>
        <div className="review-add-fields"><label>Active reviewer<select required value={reviewerApplicationId} onChange={(event) => setReviewerApplicationId(event.target.value)}><option value="">Choose a reviewer</option>{reviewers.map((reviewer) => <option key={reviewer.id} value={reviewer.id}>{reviewer.fullName} · {reviewer.email}</option>)}</select></label><label>Manuscript version<select required value={manuscriptVersionId} onChange={(event) => setManuscriptVersionId(event.target.value)}><option value="">Choose exact version</option>{manuscriptVersions.filter((version) => version.id === latestManuscriptVersionId).map((version) => <option key={version.id} value={version.id}>{version.label}</option>)}</select><small>New assignments can only use the latest saved file.</small></label><label>Due date<input type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></label></div>
        {reviewers.length === 0 && <p>No active reviewers are available for assignment.</p>}
        {message && <p className="form-error" role="alert">{message}</p>}
        <button className="button button-paper" type="submit" disabled={state === "saving" || reviewers.length === 0}>{state === "saving" ? "Adding" : "Add assignment"}</button>
      </form>
    </section>
  );
}
