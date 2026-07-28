import { eq } from "drizzle-orm";
import { ensureOperationsTables, getDb } from "../../../../../../db";
import { reviewerApplications } from "../../../../../../db/schema";
import { getEditorForApi } from "../../../../../../lib/editor-auth";

const statuses = new Set(["received", "screening", "interview", "invited", "active", "declined"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getEditorForApi()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const payload = await request.json().catch(() => null) as { status?: string } | null;
  if (!payload?.status || !statuses.has(payload.status)) return Response.json({ error: "Invalid application status" }, { status: 400 });
  await ensureOperationsTables();
  await getDb().update(reviewerApplications).set({ status: payload.status }).where(eq(reviewerApplications.id, id));
  return Response.json({ ok: true, status: payload.status });
}
