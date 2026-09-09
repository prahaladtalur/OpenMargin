import { eq } from "drizzle-orm";
import { getEditorForApi } from "../../../../../../lib/editor-auth";
import { ensureSubmissionTable, getDb } from "../../../../../../db";
import { publishedArticles, submissions } from "../../../../../../db/schema";
import { sendStatusNotifications } from "../../../../../../lib/submission-notifications";

function value(payload: Record<string, unknown>, key: string, maxLength: number) {
  return typeof payload[key] === "string" ? payload[key].trim().slice(0, maxLength) : "";
}

function slugBase(valueToSlug: string) {
  return valueToSlug
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "article";
}

function submissionSlug(id: string) {
  return id.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function paragraphs(body: string) {
  return body.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean).length;
}

function isHttpsUrl(valueToCheck: string) {
  try {
    return new URL(valueToCheck).protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await getEditorForApi()) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const payload = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!payload) return Response.json({ error: "Enter the publication details." }, { status: 400 });

    const title = value(payload, "title", 240);
    const authorName = value(payload, "authorName", 180);
    const discipline = value(payload, "discipline", 120);
    const abstract = value(payload, "abstract", 2400);
    const abstractNativeLanguageInput = value(payload, "abstractNativeLanguage", 60);
    const abstractNativeInput = value(payload, "abstractNative", 1800);
    const dataSourceUrlInput = value(payload, "dataSourceUrl", 2000);
    const codeUrlInput = value(payload, "codeUrl", 2000);
    const body = value(payload, "body", 120000);
    const issue = value(payload, "issue", 80) || "Volume 01";
    const approvalConfirmed = payload.authorApprovalConfirmed === true;

    if (!title || !authorName || !discipline || abstract.length < 80 || body.length < 240 || paragraphs(body) < 1) {
      return Response.json({ error: "Add a title, public author name, discipline, abstract, and article text." }, { status: 400 });
    }
    if (!approvalConfirmed) {
      return Response.json({ error: "Confirm that the author or guardian approved this final version for public release." }, { status: 400 });
    }

    await ensureSubmissionTable();
    const db = getDb();
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id)).limit(1);
    if (!submission) return Response.json({ error: "Submission not found" }, { status: 404 });
    if (submission.status !== "accepted" && submission.status !== "published") {
      return Response.json({ error: "Only an accepted submission can be published." }, { status: 409 });
    }

    const abstractNativeLanguage = abstractNativeLanguageInput || submission.abstractNativeLanguage || "";
    const abstractNative = abstractNativeInput || submission.abstractNative || "";
    const submissionType = submission.submissionType || "article";
    const dataSourceUrl = dataSourceUrlInput || submission.dataSourceUrl || "";
    const codeUrl = codeUrlInput || submission.codeUrl || "";
    if (Boolean(abstractNativeLanguage) !== Boolean(abstractNative)) {
      return Response.json({ error: "Please give both the language and the abstract text, or leave both blank." }, { status: 400 });
    }
    if (abstractNativeLanguage && (abstractNativeLanguage.length < 2 || abstractNativeLanguage.length > 60)) {
      return Response.json({ error: "Enter a language name between 2 and 60 characters." }, { status: 400 });
    }
    if (abstractNative && (abstractNative.length < 300 || abstractNative.length > 1800)) {
      return Response.json({ error: "The second abstract must be between 300 and 1,800 characters." }, { status: 400 });
    }
    if (submissionType === "research-note" && !dataSourceUrl) {
      return Response.json({ error: "Research notes need a link to the dataset you used." }, { status: 400 });
    }
    if ((dataSourceUrl && !isHttpsUrl(dataSourceUrl)) || (codeUrl && !isHttpsUrl(codeUrl))) {
      return Response.json({ error: "Please give a full https link." }, { status: 400 });
    }

    const [existing] = await db.select().from(publishedArticles).where(eq(publishedArticles.submissionId, id)).limit(1);
    const slug = existing?.slug ?? `${slugBase(title)}-${submissionSlug(id)}`;
    const publishedAt = existing?.publishedAt ?? new Date().toISOString();
    const article = {
      id: existing?.id ?? `OMA-${crypto.randomUUID()}`,
      submissionId: id,
      slug,
      title,
      authorName,
      discipline,
      abstract,
      abstractNative: abstractNative || null,
      abstractNativeLanguage: abstractNativeLanguage || null,
      submissionType,
      dataSourceUrl: dataSourceUrl || null,
      codeUrl: codeUrl || null,
      body,
      issue,
      publishedAt,
    };

    if (existing) {
      await db.update(publishedArticles).set(article).where(eq(publishedArticles.id, existing.id));
    } else {
      await db.insert(publishedArticles).values(article);
    }
    if (submission.status !== "published") {
      await db.update(submissions).set({ status: "published" }).where(eq(submissions.id, id));
    }

    const publicationPath = `/articles/${slug}`;
    const pendingReasons = await sendStatusNotifications(db, { ...submission, status: "published" }, "published", publicationPath);
    return Response.json({
      ok: true,
      publicPath: publicationPath,
      updated: Boolean(existing),
      notificationPending: pendingReasons.length > 0,
      notificationMessage: pendingReasons.length > 0 ? pendingReasons[0] : null,
    }, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("Publication failed", error);
    return Response.json({ error: "We could not publish this article. Try again shortly." }, { status: 500 });
  }
}
