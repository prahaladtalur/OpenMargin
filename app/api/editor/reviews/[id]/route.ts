import { eq } from "drizzle-orm";
import { getEditorForApi } from "../../../../../lib/editor-auth";
import { ensureSubmissionTable, getDb } from "../../../../../db";
import { reviewAssignments } from "../../../../../db/schema";

const statuses = new Set(["invited", "accepted", "in-progress", "submitted", "declined", "withdrawn"]);
const recommendations = new Set(["strong-revise", "revise", "accept-with-changes", "accept", "decline"]);
const scoreKeys = ["questionScore", "contextScore", "methodScore", "evidenceScore", "clarityScore", "integrityScore"] as const;

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function score(value: unknown) {
  if (value === "" || value === null || typeof value === "undefined") return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 5 ? number : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getEditorForApi()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
  const status = clean(payload?.status, 40);
  if (!statuses.has(status)) return Response.json({ error: "Invalid review status." }, { status: 400 });
  const recommendation = clean(payload?.recommendation, 40);
  if (recommendation && !recommendations.has(recommendation)) return Response.json({ error: "Invalid review recommendation." }, { status: 400 });
  const scores = Object.fromEntries(scoreKeys.map((key) => [key, score(payload?.[key])])) as Record<(typeof scoreKeys)[number], number | null>;
  const comments = clean(payload?.comments, 12000);
  const conflictConfirmed = payload?.conflictConfirmed === true;
  const confidentialityConfirmed = payload?.confidentialityConfirmed === true;
  if (status === "submitted" && (!conflictConfirmed || !confidentialityConfirmed || scoreKeys.some((key) => scores[key] === null) || !recommendation || comments.length < 80)) {
    return Response.json({ error: "A submitted review needs both confirmations, six scores, a recommendation, and at least 80 characters of comments." }, { status: 400 });
  }

  try {
    await ensureSubmissionTable();
    const db = getDb();
    const [assignment] = await db.select().from(reviewAssignments).where(eq(reviewAssignments.id, id)).limit(1);
    if (!assignment) return Response.json({ error: "Review assignment not found." }, { status: 404 });
    await db.update(reviewAssignments).set({
      status,
      dueAt: clean(payload?.dueAt, 40) || null,
      conflictConfirmed,
      confidentialityConfirmed,
      ...scores,
      recommendation: recommendation || null,
      comments: comments || null,
      submittedAt: status === "submitted" ? new Date().toISOString() : assignment.submittedAt,
    }).where(eq(reviewAssignments.id, id));
    return Response.json({ ok: true, status });
  } catch (error) {
    console.error("Review assignment update failed", error);
    return Response.json({ error: "We could not save this review. Try again shortly." }, { status: 500 });
  }
}
