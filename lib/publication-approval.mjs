const PUBLIC_VERSION_FIELDS = [
  "title",
  "authorName",
  "discipline",
  "abstract",
  "abstractNative",
  "abstractNativeLanguage",
  "submissionType",
  "dataSourceUrl",
  "codeUrl",
  "body",
  "issue",
  "manuscriptVersionId",
];

export async function hashPublicVersion(article) {
  const canonical = Object.fromEntries(PUBLIC_VERSION_FIELDS.map((field) => [field, article[field] ?? null]));
  const bytes = new TextEncoder().encode(JSON.stringify(canonical));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function isKnownMinorSubmission(submission) {
  const ageBand = String(submission?.ageBand ?? "").trim().toLowerCase();
  return ["minor", "under-18", "14-17", "under-18-years"].includes(ageBand)
    || submission?.guardianConfirmed === true
    || Boolean(submission?.guardianEmail);
}

export function hasEvidenceNote(value) {
  return typeof value === "string" && value.trim().length >= 8 && value.trim().length <= 500;
}
