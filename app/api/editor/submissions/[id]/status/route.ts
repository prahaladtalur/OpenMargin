import { eq } from "drizzle-orm";
import { getEditorForApi } from "../../../../../../lib/editor-auth";
import { ensureSubmissionTable, getDb } from "../../../../../../db";
import { submissions } from "../../../../../../db/schema";

const statuses = new Set(["received", "screening", "under-review", "revise", "declined", "accepted"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getEditorForApi()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const payload = await request.json().catch(() => null) as { status?: string } | null;
  if (!payload?.status || !statuses.has(payload.status)) return Response.json({ error: "Invalid editorial status" }, { status: 400 });
  await ensureSubmissionTable();
  await getDb().update(submissions).set({ status: payload.status }).where(eq(submissions.id, id));
  return Response.json({ ok: true, status: payload.status });
}
