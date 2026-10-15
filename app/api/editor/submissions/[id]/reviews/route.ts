import { and, desc, eq } from "drizzle-orm";
import { getEditorForApi } from "../../../../../../lib/editor-auth";
import { ensureSubmissionTable, getDb } from "../../../../../../db";
import { reviewerApplications, reviewAssignments, submissionRevisions, submissions } from "../../../../../../db/schema";
import { reviewerMatchesAuthor } from "../../../../../../lib/review-policy";
import { isReviewerEligibleForManuscriptAccess } from "../../../../../../lib/reviewer-eligibility.mjs";

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getEditorForApi()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id: submissionId } = await params;
  const payload = await request.json().catch(() => null) as { dueAt?: unknown; reviewerApplicationId?: unknown; manuscriptVersionId?: unknown } | null;
  const dueAt = clean(payload?.dueAt, 40);
  const reviewerApplicationId = clean(payload?.reviewerApplicationId, 80);
  const manuscriptVersionId = clean(payload?.manuscriptVersionId, 100);
  if (!reviewerApplicationId) return Response.json({ error: "Choose an active reviewer." }, { status: 400 });
  if (!manuscriptVersionId) return Response.json({ error: "Choose the exact manuscript version for this review." }, { status: 400 });

  try {
    await ensureSubmissionTable();
    const db = getDb();
    const [submission] = await db.select({ id: submissions.id, authorName: submissions.authorName, authorEmail: submissions.authorEmail }).from(submissions).where(eq(submissions.id, submissionId)).limit(1);
    if (!submission) return Response.json({ error: "Submission not found." }, { status: 404 });
    const [reviewer] = await db.select().from(reviewerApplications).where(and(
      eq(reviewerApplications.id, reviewerApplicationId),
      eq(reviewerApplications.status, "active"),
    )).limit(1);
    if (!isReviewerEligibleForManuscriptAccess(reviewer)) return Response.json({ error: "Choose an active reviewer with verified guardian approval when required." }, { status: 409 });
    if (reviewerMatchesAuthor({ name: reviewer.fullName, email: reviewer.email }, submission)) {
      return Response.json({ error: "An author cannot review their own submission." }, { status: 409 });
    }
    const [latestRevision] = await db.select({ id: submissionRevisions.id }).from(submissionRevisions)
      .where(eq(submissionRevisions.submissionId, submissionId))
      .orderBy(desc(submissionRevisions.versionNumber)).limit(1);
    const latestManuscriptVersionId = latestRevision?.id ?? "original";
    if (manuscriptVersionId !== latestManuscriptVersionId) {
      return Response.json({ error: "Create the assignment for the latest saved manuscript version." }, { status: 409 });
    }
    const id = `OMR-${crypto.randomUUID()}`;
    await db.insert(reviewAssignments).values({
      id,
      submissionId,
      manuscriptVersionId,
      reviewerName: reviewer.fullName,
      reviewerEmail: reviewer.email,
      reviewerApplicationId: reviewer.id,
      status: "draft",
      dueAt: dueAt || null,
    });
    return Response.json({ ok: true, id });
  } catch (error) {
    console.error("Review assignment creation failed", error);
    return Response.json({ error: "We could not save this assignment. Try again shortly." }, { status: 500 });
  }
}
