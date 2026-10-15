export const MAX_REVISION_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_REVISION_REQUEST_BYTES = MAX_REVISION_FILE_BYTES + 64 * 1024;
const DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export class RevisionIntakeError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "RevisionIntakeError";
    this.status = status;
  }
}

export async function readBoundedRevisionForm(request) {
  const lengthHeader = request.headers.get("content-length");
  if (lengthHeader !== null) {
    if (!/^\d+$/.test(lengthHeader)) throw new RevisionIntakeError("Invalid request size.", 400);
    if (Number(lengthHeader) > MAX_REVISION_REQUEST_BYTES) {
      throw new RevisionIntakeError("Use a PDF or DOCX file no larger than 10 MB.", 413);
    }
  }

  const reader = request.body?.getReader();
  if (!reader) throw new RevisionIntakeError("Choose a PDF or DOCX revision.", 400);
  const chunks = [];
  let byteCount = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteCount += value.byteLength;
      if (byteCount > MAX_REVISION_REQUEST_BYTES) {
        await reader.cancel();
        throw new RevisionIntakeError("Use a PDF or DOCX file no larger than 10 MB.", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(byteCount);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const headers = new Headers(request.headers);
  headers.delete("content-length");
  headers.delete("transfer-encoding");
  return new Request(request.url, { method: "POST", headers, body }).formData();
}

function hasDocxPackageStructure(bytes) {
  const eocdSignature = [0x50, 0x4b, 0x05, 0x06];
  const centralSignature = [0x50, 0x4b, 0x01, 0x02];
  const localSignature = [0x50, 0x4b, 0x03, 0x04];
  const minEocdOffset = Math.max(0, bytes.length - 22 - 0xffff);
  let eocdOffset = -1;
  for (let offset = bytes.length - 22; offset >= minEocdOffset; offset -= 1) {
    if (eocdSignature.every((value, index) => bytes[offset + index] === value)) {
      eocdOffset = offset;
      break;
    }
  }
  if (eocdOffset < 0 || eocdOffset + 22 > bytes.length) return false;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const entryCount = view.getUint16(eocdOffset + 10, true);
  const centralSize = view.getUint32(eocdOffset + 12, true);
  const centralOffset = view.getUint32(eocdOffset + 16, true);
  if (entryCount === 0 || centralOffset + centralSize > eocdOffset || centralOffset > bytes.length) return false;

  const names = new Set();
  let cursor = centralOffset;
  for (let index = 0; index < entryCount; index += 1) {
    if (cursor + 46 > bytes.length || !centralSignature.every((value, at) => bytes[cursor + at] === value)) return false;
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localOffset = view.getUint32(cursor + 42, true);
    const end = cursor + 46 + nameLength + extraLength + commentLength;
    if (end > bytes.length || localOffset + 4 > bytes.length
      || !localSignature.every((value, at) => bytes[localOffset + at] === value)) return false;
    names.add(new TextDecoder().decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength)));
    cursor = end;
  }
  return cursor <= centralOffset + centralSize
    && names.has("[Content_Types].xml")
    && names.has("word/document.xml");
}

export async function validateRevisionFile(file) {
  if (!(file instanceof File) || file.size === 0) {
    throw new RevisionIntakeError("Choose a PDF or DOCX revision.", 400);
  }
  if (file.size > MAX_REVISION_FILE_BYTES) {
    throw new RevisionIntakeError("Use a PDF or DOCX file no larger than 10 MB.", 413);
  }

  const extension = file.name.match(/\.(pdf|docx)$/i)?.[1]?.toLowerCase();
  const contentType = extension === "pdf" ? "application/pdf" : extension === "docx" ? DOCX_TYPE : null;
  if (!contentType || (file.type && file.type !== contentType && file.type !== "application/octet-stream")) {
    throw new RevisionIntakeError("Use a PDF or DOCX file with a matching file type.", 400);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const isPdf = contentType === "application/pdf"
    && new TextDecoder().decode(bytes.subarray(0, 5)) === "%PDF-";
  const isDocx = contentType === DOCX_TYPE && hasDocxPackageStructure(bytes);
  if (!isPdf && !isDocx) {
    throw new RevisionIntakeError("This file does not have a valid PDF or DOCX signature.", 400);
  }

  return { contentType };
}

export function safeRevisionFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-180) || "revision";
}

export function isRevisionVersionConflict(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("submission_revisions_submission_version_idx")) return true;
  return /unique|constraint/i.test(message)
    && message.includes("submission_revisions.submission_id")
    && message.includes("submission_revisions.version_number");
}
