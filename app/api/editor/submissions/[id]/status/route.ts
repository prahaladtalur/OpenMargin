import { eq } from "drizzle-orm";
import { getEditorForApi } from "../../../../../../lib/editor-auth";
import { ensureSubmissionTable, getDb } from "../../../../../../db";
import { publishedArticles, submissions } from "../../../../../../db/schema";
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
  const payload = await request.json().catch(() => null) as { status?: string } | null;
  if (!payload?.status || !statuses.has(payload.status)) return Response.json({ error: "Invalid editorial status" }, { status: 400 });

  try {
    await ensureSubmissionTable();
    const db = getDb();
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id)).limit(1);
    if (!submission) return Response.json({ error: "Submission not found" }, { status: 404 });
    if (payload.status === "published" && submission.status !== "published") {
      return Response.json({ error: "Use the Publish article form after author approval." }, { status: 409 });
    }

    if (submission.status !== payload.status) {
      await db.update(submissions).set({ status: payload.status }).where(eq(submissions.id, id));
    }

    if (!isNotificationStatus(payload.status)) {
      return Response.json({ ok: true, status: payload.status, notificationSent: false });
    }

    const [article] = payload.status === "published"
      ? await db.select({ slug: publishedArticles.slug }).from(publishedArticles).where(eq(publishedArticles.submissionId, id)).limit(1)
      : [];
    const publicationPath = article ? `/articles/${article.slug}` : undefined;
    const pendingReasons = await sendStatusNotifications(db, { ...submission, status: payload.status }, payload.status, publicationPath);
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
