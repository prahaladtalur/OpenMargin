import { and, eq } from "drizzle-orm";
import { getEditorForApi } from "../../../../../../lib/editor-auth";
import { ensureSubmissionTable, getDb } from "../../../../../../db";
import { submissionNotificationEvents, submissions } from "../../../../../../db/schema";
import {
  EditorialDecisionStatus,
  notifyAuthorOfDecision,
  notifyEditorOfPublication,
} from "../../../../../../lib/notifications";

const statuses = new Set(["received", "screening", "under-review", "revise", "declined", "accepted", "published"]);
const notificationStatuses = new Set<EditorialDecisionStatus>(["revise", "declined", "accepted", "published"]);

type Database = ReturnType<typeof getDb>;
type Submission = typeof submissions.$inferSelect;

function isNotificationStatus(status: string): status is EditorialDecisionStatus {
  return notificationStatuses.has(status as EditorialDecisionStatus);
}

async function getOrCreateNotificationEvent(db: Database, submissionId: string, eventKey: string) {
  await db.insert(submissionNotificationEvents).values({
    id: `OMN-${crypto.randomUUID()}`,
    submissionId,
    eventKey,
  }).onConflictDoNothing();

  const [event] = await db
    .select()
    .from(submissionNotificationEvents)
    .where(and(eq(submissionNotificationEvents.submissionId, submissionId), eq(submissionNotificationEvents.eventKey, eventKey)))
    .limit(1);
  return event;
}

async function sendStatusNotifications(db: Database, submission: Submission, status: EditorialDecisionStatus) {
  const messages = [
    {
      key: `author:${status}`,
      send: () => notifyAuthorOfDecision(submission, status),
    },
  ];

  if (status === "published") {
    messages.push({
      key: "editor:published",
      send: () => notifyEditorOfPublication(submission),
    });
  }

  const pendingReasons: string[] = [];
  for (const message of messages) {
    const event = await getOrCreateNotificationEvent(db, submission.id, message.key);
    if (!event || event.status === "sent") continue;

    const result = await message.send();
    if (result.sent) {
      await db.update(submissionNotificationEvents)
        .set({ status: "sent", lastError: null, sentAt: new Date().toISOString() })
        .where(eq(submissionNotificationEvents.id, event.id));
    } else {
      const reason = result.reason ?? "The email could not be sent.";
      pendingReasons.push(reason);
      await db.update(submissionNotificationEvents)
        .set({ status: "failed", lastError: reason })
        .where(eq(submissionNotificationEvents.id, event.id));
    }
  }

  return pendingReasons;
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

    if (submission.status !== payload.status) {
      await db.update(submissions).set({ status: payload.status }).where(eq(submissions.id, id));
    }

    if (!isNotificationStatus(payload.status)) {
      return Response.json({ ok: true, status: payload.status, notificationSent: false });
    }

    const pendingReasons = await sendStatusNotifications(db, { ...submission, status: payload.status }, payload.status);
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
