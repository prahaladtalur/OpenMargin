"use client";

import { FormEvent, useState } from "react";

type Revision = {
  id: string;
  versionNumber: number;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  editorNote: string | null;
  createdAt: string;
};

function formatDate(value: string) {
  const date = new Date(`${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatSize(value: number) {
  return value < 1024 * 1024 ? `${Math.max(1, Math.round(value / 1024))} KB` : `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function ManuscriptVersions({
  submissionId,
  originalFileName,
  originalCreatedAt,
  revisions,
}: {
  submissionId: string;
  originalFileName: string;
  originalCreatedAt: string;
  revisions: Revision[];
}) {
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  async function saveRevision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch(`/api/editor/submissions/${submissionId}/revisions`, { method: "POST", body: form });
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) {
        setState("error");
        setMessage(payload?.error ?? "Could not save this private revision.");
        return;
      }
      window.location.reload();
    } catch {
      setState("error");
      setMessage("Connection failed. The original submission was not changed.");
    }
  }

  return (
    <section className="editor-versions" aria-labelledby={`versions-${submissionId}`}>
      <div className="editor-versions-heading">
        <div><h3 id={`versions-${submissionId}`}>Manuscript versions</h3><p>Private files stay in the editorial workspace. Saving a revision does not change its status, publish it, or send a message.</p></div>
        <span>{revisions.length + 1} {revisions.length === 0 ? "file" : "versions"}</span>
      </div>
      <ol className="editor-version-list">
        <li className="editor-version-row">
          <div><span className="editor-version-number">Original submission</span><p>{originalFileName}</p></div>
          <span className="editor-version-date">{formatDate(originalCreatedAt)}</span>
        </li>
        {revisions.map((revision) => (
          <li className="editor-version-row" key={revision.id}>
            <div><span className="editor-version-number">Revision {revision.versionNumber}</span><p>{revision.fileName}{revision.editorNote && <small>{revision.editorNote}</small>}</p></div>
            <div className="editor-version-actions"><span className="editor-version-date">{formatDate(revision.createdAt)} · {formatSize(revision.sizeBytes)}</span><a href={`/api/editor/submissions/${submissionId}/revisions/${revision.id}`}>Download</a></div>
          </li>
        ))}
      </ol>
      <form className="editor-revision-form" onSubmit={saveRevision}>
        <label>Author-provided PDF or DOCX<input type="file" name="revisionFile" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required /></label>
        <label>Private note <span>Optional, up to 500 characters.</span><input name="editorNote" type="text" maxLength={500} placeholder="For example, revised copy sent by the author on Oct 12" /></label>
        <label className="editor-revision-confirm"><input type="checkbox" name="authorProvidedConfirmed" required /> I confirm this file came from the author and belongs to this submission.</label>
        {message && <p className="form-error" role="alert">{message}</p>}
        <button type="submit" className="editor-save" disabled={state === "saving"}>{state === "saving" ? "Saving private revision" : "Save private revision"}</button>
      </form>
    </section>
  );
}
