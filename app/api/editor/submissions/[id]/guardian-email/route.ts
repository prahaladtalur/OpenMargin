import { and, eq } from "drizzle-orm";
import { ensureSubmissionTable, getDb } from "../../../../../../db";
import { submissionNotificationEvents, submissions } from "../../../../../../db/schema";
import { getEditorForApi } from "../../../../../../lib/editor-auth";
import { notifyGuardianOfSubmission } from "../../../../../../lib/notifications";

function isEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getEditorForApi()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const payload = await request.json().catch(() => null) as { guardianEmail?: unknown } | null;
    const guardianEmail = typeof payload?.guardianEmail === "string" ? payload.guardianEmail.trim().toLowerCase() : "";
    if (!isEmail(guardianEmail)) return Response.json({ error: "Enter a valid guardian email address." }, { status: 400 });

    await ensureSubmissionTable();
    const db = getDb();
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id)).limit(1);
    if (!submission) return Response.json({ error: "Submission not found." }, { status: 404 });
    if (!(["minor", "14-17", "under-18"].includes(submission.ageBand))) return Response.json({ error: "This submission does not indicate a minor author." }, { status: 409 });

    const previousEmail = submission.guardianEmail;
    await db.update(submissions).set({ guardianEmail, guardianEmailUpdatedAt: new Date().toISOString() }).where(eq(submissions.id, id));
    const eventKey = "guardian-email-corrected";
    await db.insert(submissionNotificationEvents).values({
      id: `OMN-${crypto.randomUUID()}`,
      submissionId: id,
      eventKey,
      status: "pending",
      lastError: previousEmail ? `Previous guardian address: ${previousEmail}` : null,
    }).onConflictDoNothing();
    const [event] = await db.select().from(submissionNotificationEvents).where(and(eq(submissionNotificationEvents.submissionId, id), eq(submissionNotificationEvents.eventKey, eventKey))).limit(1);
    const notification = await notifyGuardianOfSubmission({ id: submission.id, manuscriptTitle: submission.manuscriptTitle, authorName: submission.authorName }, guardianEmail);
    if (event) {
      await db.update(submissionNotificationEvents).set({ status: notification.sent ? "sent" : "failed", lastError: notification.sent ? (previousEmail ? `Previous guardian address: ${previousEmail}` : null) : notification.reason ?? "The notification could not be sent.", sentAt: notification.sent ? new Date().toISOString() : null }).where(eq(submissionNotificationEvents.id, event.id));
    }
    return Response.json({ ok: true, notificationSent: notification.sent, notificationMessage: notification.sent ? null : notification.reason ?? "The notification could not be sent." });
  } catch (error) {
    console.error("Guardian email correction failed", error);
    return Response.json({ error: "We could not update the guardian email." }, { status: 500 });
  }
}
