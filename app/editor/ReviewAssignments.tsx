"use client";

import { FormEvent, useState } from "react";

type Assignment = {
  id: string;
  reviewerName: string;
  reviewerEmail: string;
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

const statuses = ["invited", "accepted", "in-progress", "submitted", "declined", "withdrawn"];
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
  return value.replaceAll("-", " ");
}

function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const [status, setStatus] = useState(assignment.status);
  const [dueAt, setDueAt] = useState(assignment.dueAt ?? "");
  const [conflictConfirmed, setConflictConfirmed] = useState(assignment.conflictConfirmed);
  const [confidentialityConfirmed, setConfidentialityConfirmed] = useState(assignment.confidentialityConfirmed);
  const [recommendation, setRecommendation] = useState(assignment.recommendation ?? "");
  const [comments, setComments] = useState(assignment.comments ?? "");
  const [scoresValue, setScoresValue] = useState<Record<(typeof scores)[number], string>>(() => Object.fromEntries(scores.map((key) => [key, assignment[key]?.toString() ?? ""])) as Record<(typeof scores)[number], string>);
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

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

export function ReviewAssignments({ submissionId, assignments }: { submissionId: string; assignments: Assignment[] }) {
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  async function addAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");
    const response = await fetch(`/api/editor/submissions/${submissionId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewerName, reviewerEmail, dueAt }),
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
      {assignments.length > 0 && <div className="review-assignment-list">{assignments.map((assignment) => <AssignmentCard key={assignment.id} assignment={assignment} />)}</div>}
      <form className="review-add-form" onSubmit={addAssignment}>
        <p className="eyebrow">Add reviewer</p>
        <div className="review-add-fields"><label>Name<input required value={reviewerName} onChange={(event) => setReviewerName(event.target.value)} maxLength={180} /></label><label>Email<input required type="email" value={reviewerEmail} onChange={(event) => setReviewerEmail(event.target.value)} maxLength={240} /></label><label>Due date<input type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></label></div>
        {message && <p className="form-error" role="alert">{message}</p>}
        <button className="button button-paper" type="submit" disabled={state === "saving"}>{state === "saving" ? "Adding" : "Add assignment"}</button>
      </form>
    </section>
  );
}
