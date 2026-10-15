import { and, eq } from "drizzle-orm";
import { getEditorForApi } from "../../../../../../../lib/editor-auth";
import { ensureSubmissionTable, getDb, getManuscriptBucket } from "../../../../../../../db";
import { submissionRevisions, submissions } from "../../../../../../../db/schema";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; revisionId: string }> }) {
  if (!await getEditorForApi()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id: submissionId, revisionId } = await params;

  try {
    await ensureSubmissionTable();
    const db = getDb();
    const [revision] = await db.select().from(submissionRevisions).where(and(
      eq(submissionRevisions.id, revisionId),
      eq(submissionRevisions.submissionId, submissionId),
    )).limit(1);
    if (!revision) return Response.json({ error: "Revision not found." }, { status: 404 });
    const [submission] = await db.select({ id: submissions.id }).from(submissions)
      .where(eq(submissions.id, submissionId)).limit(1);
    if (!submission) return Response.json({ error: "Submission not found." }, { status: 404 });

    const object = await getManuscriptBucket().get(revision.objectKey);
    if (!object) return Response.json({ error: "Revision file not found." }, { status: 404 });
    return new Response(object.body, {
      headers: {
        "Content-Type": revision.contentType,
        "Content-Disposition": `attachment; filename="${revision.fileName.replace(/["\\\r\n]/g, "_")}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Private revision download failed", error);
    return Response.json({ error: "We could not open this revision." }, { status: 500 });
  }
}
