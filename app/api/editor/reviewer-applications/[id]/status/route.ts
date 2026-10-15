import { eq } from "drizzle-orm";
import { ensureOperationsTables, getDb } from "../../../../../../db";
import { reviewerApplications } from "../../../../../../db/schema";
import { getEditorForApi } from "../../../../../../lib/editor-auth";

const statuses = new Set(["received", "screening", "interview", "invited", "active", "declined"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getEditorForApi()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const payload = await request.json().catch(() => null) as { status?: string; guardianApprovalVerified?: boolean; guardianApprovalEvidence?: string } | null;
  if (!payload?.status || !statuses.has(payload.status)) return Response.json({ error: "Invalid application status" }, { status: 400 });
  await ensureOperationsTables();
  const db = getDb();
  const [application] = await db.select().from(reviewerApplications).where(eq(reviewerApplications.id, id)).limit(1);
  if (!application) return Response.json({ error: "Reviewer application not found." }, { status: 404 });
  const isMinor = application.ageBand === "minor" || application.ageBand === "14-17" || application.ageBand === "under-18";
  const evidence = typeof payload.guardianApprovalEvidence === "string" ? payload.guardianApprovalEvidence.trim().slice(0, 400) : "";
  const guardianApprovalEvidence = isMinor
    ? payload.guardianApprovalVerified === true ? evidence || application.guardianApprovalEvidence
      : payload.guardianApprovalVerified === false ? null : application.guardianApprovalEvidence
    : null;
  const guardianApprovalAt = isMinor
    ? payload.guardianApprovalVerified === true ? application.guardianApprovalAt ?? new Date().toISOString()
      : payload.guardianApprovalVerified === false ? null : application.guardianApprovalAt
    : null;
  if (isMinor && payload.guardianApprovalVerified === true && (!guardianApprovalEvidence || guardianApprovalEvidence.length < 12)) {
    return Response.json({ error: "Record where and when guardian approval was verified." }, { status: 400 });
  }
  if (isMinor && payload.status === "active" && (!guardianApprovalAt || !guardianApprovalEvidence)) {
    return Response.json({ error: "Verify and record guardian approval before activating a reviewer under 18." }, { status: 409 });
  }
  await db.update(reviewerApplications).set({ status: payload.status, guardianApprovalAt, guardianApprovalEvidence }).where(eq(reviewerApplications.id, id));
  return Response.json({ ok: true, status: payload.status });
}
