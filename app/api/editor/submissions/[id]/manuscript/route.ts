import { eq } from "drizzle-orm";
import { getEditorForApi } from "../../../../../../lib/editor-auth";
import { ensureSubmissionTable, getDb, getManuscriptBucket } from "../../../../../../db";
import { submissions } from "../../../../../../db/schema";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getEditorForApi()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await ensureSubmissionTable();
  const [submission] = await getDb().select().from(submissions).where(eq(submissions.id, id)).limit(1);
  if (!submission) return Response.json({ error: "Not found" }, { status: 404 });
  const object = await getManuscriptBucket().get(submission.manuscriptKey);
  if (!object) return Response.json({ error: "Manuscript file not found" }, { status: 404 });
  const headers = new Headers({
    "Content-Type": submission.manuscriptContentType,
    "Content-Disposition": `attachment; filename="${submission.manuscriptFilename.replace(/"/g, "")}"`,
    "Cache-Control": "private, no-store",
  });
  return new Response(object.body, { headers });
}
