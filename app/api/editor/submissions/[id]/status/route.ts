import { and, desc, eq, inArray } from "drizzle-orm";
import { getEditorForApi } from "../../../../../../lib/editor-auth";
import { ensureSubmissionTable, getDb } from "../../../../../../db";
import { publishedArticles, reviewerApplications, reviewAssignments, submissionNotificationEvents, submissionRevisions, submissions } from "../../../../../../db/schema";
import { hasRequiredIndependentReview } from "../../../../../../lib/review-policy";
import { EditorialDecisionStatus } from "../../../../../../lib/notifications";
import { sendStatusNotifications } from "../../../../../../lib/submission-notifications";

const statuses = new Set(["received", "screening", "under-review", "revise", "declined", "accepted", "published"]);
const notificationStatuses = new Set<EditorialDecisionStatus>(["revise", "declined", "accepted", "published"]);

function isNotificationStatus(status: string): status is EditorialDecisionStatus {
  return notificationStatuses.has(status as EditorialDecisionStatus);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getEditorForApi()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const payload = await request.json().catch(() => null) as { status?: string; editorMessage?: string; noteOnly?: boolean } | null;
  if (!payload || (payload.noteOnly !== true && (!payload.status || !statuses.has(payload.status)))) return Response.json({ error: "Invalid editorial status" }, { status: 400 });
  if (payload.noteOnly === true && typeof payload.editorMessage !== "string") return Response.json({ error: "A note is required." }, { status: 400 });
  const editorMessage = typeof payload.editorMessage === "string" ? payload.editorMessage.trim().slice(0, 6000) : "";

  try {
    await ensureSubmissionTable();
    const db = getDb();
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id)).limit(1);
    if (!submission) return Response.json({ error: "Submission not found" }, { status: 404 });
    // A notes-only save must never transition status or retry notification events.
    if (payload.noteOnly === true) {
      const messageChanged = (submission.editorMessage ?? "") !== editorMessage;
      if (messageChanged) await db.update(submissions).set({ editorMessage: editorMessage || null }).where(eq(submissions.id, id));
      return Response.json({ ok: true, status: submission.status, editorMessageSaved: messageChanged, notificationSent: false });
    }
    if (!payload.status) return Response.json({ error: "Invalid editorial status" }, { status: 400 });
    if (payload.status === "published" && submission.status !== "published") {
      return Response.json({ error: "Use the Publish article form after author approval." }, { status: 409 });
    }
    if (payload.status === "accepted" && submission.status !== "accepted") {
      const [reviews, activeReviewers, latestRevision] = await Promise.all([
        db.select().from(reviewAssignments).where(eq(reviewAssignments.submissionId, id)),
        db.select({ id: reviewerApplications.id }).from(reviewerApplications).where(eq(reviewerApplications.status, "active")),
        db.select({ id: submissionRevisions.id }).from(submissionRevisions)
          .where(eq(submissionRevisions.submissionId, id)).orderBy(desc(submissionRevisions.versionNumber)).limit(1),
      ]);
      const activeReviewerIds = new Set(activeReviewers.map((reviewer) => reviewer.id));
      const manuscriptVersionId = latestRevision[0]?.id ?? "original";
      if (!hasRequiredIndependentReview(reviews, submission, activeReviewerIds, manuscriptVersionId)) {
        return Response.json({ error: "Acceptance requires one complete written review of the latest saved manuscript version. Save the report and confirm conflicts and confidentiality first." }, { status: 409 });
      }
    }

    const statusChanged = submission.status !== payload.status;
    const messageChanged = (submission.editorMessage ?? "") !== editorMessage;
    if (statusChanged || messageChanged) {
      await db.update(submissions).set({
        status: payload.status,
        editorMessage: editorMessage || null,
      }).where(eq(submissions.id, id));
    }

    if (!isNotificationStatus(payload.status)) {
      return Response.json({ ok: true, status: payload.status, editorMessageSaved: messageChanged, notificationSent: false });
    }

    if (!statusChanged) {
      const eventKeys = [`author:${payload.status}`, ...(payload.status === "published" ? ["editor:published"] : [])];
      const existingEvents = await db.select().from(submissionNotificationEvents).where(and(
        eq(submissionNotificationEvents.submissionId, id),
        inArray(submissionNotificationEvents.eventKey, eventKeys),
      )).limit(2);
      if (!existingEvents.some((event) => event.status !== "sent")) {
        return Response.json({ ok: true, status: payload.status, editorMessageSaved: messageChanged, notificationSent: false });
      }
    }

    const [article] = payload.status === "published"
      ? await db.select({ slug: publishedArticles.slug }).from(publishedArticles).where(eq(publishedArticles.submissionId, id)).limit(1)
      : [];
    const publicationPath = article ? `/articles/${article.slug}` : undefined;
    const pendingReasons = await sendStatusNotifications(db, {
      ...submission,
      status: payload.status,
      editorMessage: editorMessage || null,
    }, payload.status, publicationPath, { existingOnly: !statusChanged });
    if (pendingReasons.length > 0) {
      return Response.json({
        ok: false,
        status: payload.status,
        notificationPending: true,
        error: `Status saved, but an email could not be sent. Press Save again to retry. ${pendingReasons[0]}`,
      }, { status: 503 });
    }

    return Response.json({ ok: true, status: payload.status, notificationSent: true });
  } catch (error) {
    console.error("Editorial status update failed", error);
    return Response.json({ error: "We could not update this submission. Try again shortly." }, { status: 500 });
  }
}
