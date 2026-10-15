import { desc, eq, max } from "drizzle-orm";
import { getEditorForApi } from "../../../../../../lib/editor-auth";
import { ensureSubmissionTable, getDb, getManuscriptBucket } from "../../../../../../db";
import { submissionRevisions, submissions } from "../../../../../../db/schema";
import { isRevisionVersionConflict, RevisionIntakeError, readBoundedRevisionForm, safeRevisionFilename, validateRevisionFile } from "../../../../../../lib/private-revisions.mjs";

function invalid(error: string, status = 400) {
  return Response.json({ error }, { status });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getEditorForApi()) return invalid("Unauthorized", 401);
  const { id: submissionId } = await params;

  try {
    await ensureSubmissionTable();
    const db = getDb();
    const [submission] = await db.select({ id: submissions.id }).from(submissions)
      .where(eq(submissions.id, submissionId)).limit(1);
    if (!submission) return invalid("Submission not found.", 404);

    const versions = await db.select({
      id: submissionRevisions.id,
      versionNumber: submissionRevisions.versionNumber,
      fileName: submissionRevisions.fileName,
      contentType: submissionRevisions.contentType,
      sizeBytes: submissionRevisions.sizeBytes,
      editorNote: submissionRevisions.editorNote,
      createdAt: submissionRevisions.createdAt,
    }).from(submissionRevisions)
      .where(eq(submissionRevisions.submissionId, submissionId))
      .orderBy(desc(submissionRevisions.versionNumber));
    return Response.json({ revisions: versions }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Private revision list failed", error);
    return invalid("We could not load this revision history.", 500);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getEditorForApi()) return invalid("Unauthorized", 401);
  const { id: submissionId } = await params;

  try {
    const form = await readBoundedRevisionForm(request);
    const file = form.get("revisionFile");
    const editorNote = form.get("editorNote");
    const authorProvidedConfirmed = form.get("authorProvidedConfirmed") === "on";

    if (!(file instanceof File)) return invalid("Choose a PDF or DOCX revision.");
    const { contentType: expectedType } = await validateRevisionFile(file);
    if (!authorProvidedConfirmed) return invalid("Confirm that this author-provided file belongs to this submission.");
    if (typeof editorNote !== "string" || editorNote.length > 500) {
      return invalid("Keep the private note to 500 characters or less.");
    }

    await ensureSubmissionTable();
    const db = getDb();
    const [submission] = await db.select({ id: submissions.id }).from(submissions)
      .where(eq(submissions.id, submissionId)).limit(1);
    if (!submission) return invalid("Submission not found.", 404);

    const [current] = await db.select({ latestVersion: max(submissionRevisions.versionNumber) })
      .from(submissionRevisions).where(eq(submissionRevisions.submissionId, submissionId));
    const versionNumber = (current?.latestVersion ?? 1) + 1;
    const id = `SR-${crypto.randomUUID()}`;
    const fileName = safeRevisionFilename(file.name);
    const objectKey = `submissions/${submissionId}/revisions/${crypto.randomUUID()}_${fileName}`;
    const bucket = getManuscriptBucket();

    await bucket.put(objectKey, file.stream(), {
      httpMetadata: { contentType: expectedType },
      customMetadata: { submissionId, revisionId: id, versionNumber: String(versionNumber) },
    });
    try {
      await db.insert(submissionRevisions).values({
        id,
        submissionId,
        versionNumber,
        fileName,
        contentType: expectedType,
        sizeBytes: file.size,
        objectKey,
        editorNote: editorNote.trim() || null,
      });
    } catch (error) {
      try {
        await bucket.delete(objectKey);
      } catch (cleanupError) {
        console.error("Orphaned revision cleanup failed", cleanupError);
      }
      if (isRevisionVersionConflict(error)) {
        return invalid("Another revision was saved at the same time. Refresh the page and try again.", 409);
      }
      throw error;
    }

    return Response.json({ ok: true, revision: { id, versionNumber, fileName, contentType: expectedType, sizeBytes: file.size } }, { status: 201 });
  } catch (error) {
    if (error instanceof RevisionIntakeError) return invalid(error.message, error.status);
    console.error("Private revision intake failed", error);
    return invalid("We could not save this revision. The original submission was not changed.", 500);
  }
}
