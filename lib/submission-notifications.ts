import { and, eq } from "drizzle-orm";
import { getDb } from "../db";
import { submissionNotificationEvents, submissions } from "../db/schema";
import {
  EditorialDecisionStatus,
  notifyAuthorOfDecision,
  notifyEditorOfPublication,
} from "./notifications";

type Database = ReturnType<typeof getDb>;
type Submission = typeof submissions.$inferSelect;

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

export async function sendStatusNotifications(
  db: Database,
  submission: Submission,
  status: EditorialDecisionStatus,
  publicationPath?: string,
  options: { existingOnly?: boolean } = {},
) {
  let authorNoticeAccepted: boolean | null = null;
  const messages = [
    {
      key: `author:${status}`,
      send: () => notifyAuthorOfDecision(submission, status, publicationPath),
    },
  ];

  if (status === "published") {
    messages.push({
      key: "editor:published",
      send: () => notifyEditorOfPublication(submission, publicationPath, authorNoticeAccepted),
    });
  }

  const pendingReasons: string[] = [];
  for (const message of messages) {
    const [existingEvent] = options.existingOnly
      ? await db.select().from(submissionNotificationEvents).where(and(
        eq(submissionNotificationEvents.submissionId, submission.id),
        eq(submissionNotificationEvents.eventKey, message.key),
      )).limit(1)
      : [];
    const event = options.existingOnly
      ? existingEvent
      : await getOrCreateNotificationEvent(db, submission.id, message.key);
    if (message.key === `author:${status}` && event) {
      authorNoticeAccepted = event.status === "sent";
    }
    if (!event || event.status === "sent") continue;

    const result = await message.send();
    if (result.sent) {
      if (message.key === `author:${status}`) authorNoticeAccepted = true;
      await db.update(submissionNotificationEvents)
        .set({ status: "sent", lastError: null, sentAt: new Date().toISOString() })
        .where(eq(submissionNotificationEvents.id, event.id));
    } else {
      if (message.key === `author:${status}`) authorNoticeAccepted = false;
      const reason = result.reason ?? "The email could not be sent.";
      pendingReasons.push(reason);
      await db.update(submissionNotificationEvents)
        .set({ status: "failed", lastError: reason })
        .where(eq(submissionNotificationEvents.id, event.id));
    }
  }

  return pendingReasons;
}
