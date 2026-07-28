import { ensureSubmissionTable, getDb, getManuscriptBucket } from "../../../db";
import { submissions } from "../../../db/schema";
import { notifyEditorOfSubmission } from "../../../lib/notifications";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const supportedTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const supportedExtensions = /\.(pdf|docx)$/i;

function value(form: FormData, key: string, maxLength: number) {
  const entry = form.get(key);
  return typeof entry === "string" ? entry.trim().slice(0, maxLength) : "";
}

function safeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-180) || "manuscript";
}

function invalid(error: string) {
  return Response.json({ error }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    if (value(form, "website", 200)) return Response.json({ reference: "received" }, { status: 201 });

    const authorName = value(form, "authorName", 120);
    const authorEmail = value(form, "authorEmail", 254).toLowerCase();
    const ageBand = value(form, "ageBand", 10);
    const guardianEmail = value(form, "guardianEmail", 254).toLowerCase();
    const manuscriptTitle = value(form, "manuscriptTitle", 240);
    const discipline = value(form, "discipline", 100);
    const abstract = value(form, "abstract", 1800);
    const originNote = value(form, "originNote", 1000);
    const aiDisclosure = value(form, "aiDisclosure", 1000);
    const wordCount = Number.parseInt(value(form, "wordCount", 8), 10);
    const manuscript = form.get("manuscript");

    if (!authorName || !/^\S+@\S+\.\S+$/.test(authorEmail)) return invalid("Enter a valid name and email address.");
    if (ageBand !== "14-17" && ageBand !== "18-19") return invalid("Submissions are limited to authors ages 14–19.");
    if (ageBand === "14-17" && !/^\S+@\S+\.\S+$/.test(guardianEmail)) return invalid("Authors ages 14–17 need to provide a guardian email.");
    if (!manuscriptTitle || !discipline || abstract.length < 300 || !originNote || !aiDisclosure) return invalid("Complete every manuscript field before submitting.");
    if (!Number.isInteger(wordCount) || wordCount < 2500 || wordCount > 8000) return invalid("Enter a word count between 2,500 and 8,000.");
    if (!(manuscript instanceof File) || !manuscript.size) return invalid("Attach a manuscript file.");
    if (manuscript.size > MAX_FILE_BYTES || (!supportedTypes.has(manuscript.type) && !supportedExtensions.test(manuscript.name))) return invalid("Use a PDF or DOCX manuscript no larger than 10 MB.");
    if (form.get("originalWorkConfirmed") !== "on" || form.get("privacyConfirmed") !== "on") return invalid("Confirm the originality and privacy declarations.");
    if (ageBand === "14-17" && form.get("guardianConfirmed") !== "on") return invalid("Guardian permission is required for authors ages 14–17.");

    const id = `OM-${new Date().getUTCFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const filename = safeFilename(manuscript.name);
    const key = `submissions/${id}/${filename}`;
    await ensureSubmissionTable();
    const bucket = getManuscriptBucket();
    await bucket.put(key, manuscript.stream(), {
      httpMetadata: { contentType: manuscript.type || "application/octet-stream" },
      customMetadata: { submissionId: id, originalFilename: filename },
    });

    try {
      await getDb().insert(submissions).values({
        id,
        authorName,
        authorEmail,
        ageBand,
        guardianEmail: ageBand === "14-17" ? guardianEmail : null,
        schoolOrOrganization: value(form, "schoolOrOrganization", 160) || null,
        countryOrRegion: value(form, "countryOrRegion", 100) || null,
        manuscriptTitle,
        discipline,
        abstract,
        wordCount,
        originNote,
        aiDisclosure,
        manuscriptKey: key,
        manuscriptFilename: filename,
        manuscriptContentType: manuscript.type || "application/octet-stream",
        originalWorkConfirmed: true,
        privacyConfirmed: true,
        guardianConfirmed: ageBand === "14-17",
      });
    } catch (error) {
      await bucket.delete(key);
      throw error;
    }

    await notifyEditorOfSubmission({ id, authorName, manuscriptTitle, discipline, ageBand });

    return Response.json({ reference: id }, { status: 201 });
  } catch (error) {
    console.error("Submission intake failed", error);
    return Response.json({ error: "We could not receive your submission. Please try again shortly." }, { status: 500 });
  }
}
