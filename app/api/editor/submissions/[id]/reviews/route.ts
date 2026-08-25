import { eq } from "drizzle-orm";
import { getEditorForApi } from "../../../../../../lib/editor-auth";
import { ensureSubmissionTable, getDb } from "../../../../../../db";
import { reviewAssignments, submissions } from "../../../../../../db/schema";

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getEditorForApi()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id: submissionId } = await params;
  const payload = await request.json().catch(() => null) as { reviewerName?: unknown; reviewerEmail?: unknown; dueAt?: unknown; reviewerApplicationId?: unknown } | null;
  const reviewerName = clean(payload?.reviewerName, 180);
  const reviewerEmail = clean(payload?.reviewerEmail, 240);
  const dueAt = clean(payload?.dueAt, 40);
  const reviewerApplicationId = clean(payload?.reviewerApplicationId, 80);
  if (reviewerName.length < 2) return Response.json({ error: "Enter the reviewer's name." }, { status: 400 });
  if (!isEmail(reviewerEmail)) return Response.json({ error: "Enter a valid reviewer email." }, { status: 400 });

  try {
    await ensureSubmissionTable();
    const db = getDb();
    const [submission] = await db.select({ id: submissions.id }).from(submissions).where(eq(submissions.id, submissionId)).limit(1);
    if (!submission) return Response.json({ error: "Submission not found." }, { status: 404 });
    const id = `OMR-${crypto.randomUUID()}`;
    await db.insert(reviewAssignments).values({
      id,
      submissionId,
      reviewerName,
      reviewerEmail,
      reviewerApplicationId: reviewerApplicationId || null,
      dueAt: dueAt || null,
    });
    return Response.json({ ok: true, id });
  } catch (error) {
    console.error("Review assignment creation failed", error);
    return Response.json({ error: "We could not save this assignment. Try again shortly." }, { status: 500 });
  }
}
