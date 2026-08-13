"use client";

import { FormEvent, useState } from "react";

type ArticleDraft = {
  title: string;
  authorName: string;
  discipline: string;
  abstract: string;
  body: string;
  issue: string;
  slug?: string;
};

type PublishArticleFormProps = {
  id: string;
  status: string;
  initial: ArticleDraft;
};

export function PublishArticleForm({ id, status, initial }: PublishArticleFormProps) {
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");
  const [publicPath, setPublicPath] = useState(initial.slug ? `/articles/${initial.slug}` : "");

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/editor/submissions/${id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        authorName: form.get("authorName"),
        discipline: form.get("discipline"),
        abstract: form.get("abstract"),
        body: form.get("body"),
        issue: form.get("issue"),
        authorApprovalConfirmed: form.get("authorApprovalConfirmed") === "on",
      }),
    });
    const payload = await response.json().catch(() => null) as { error?: string; publicPath?: string; notificationPending?: boolean; notificationMessage?: string | null } | null;
    if (!response.ok) {
      setState("error");
      setMessage(payload?.error ?? "Could not publish this article.");
      return;
    }

    setState("idle");
    if (payload?.publicPath) setPublicPath(payload.publicPath);
    setMessage(payload?.notificationPending ? `Published. Email notice needs attention: ${payload.notificationMessage ?? "try Save again."}` : "Published. The public article is ready.");
    window.setTimeout(() => window.location.reload(), 700);
  }

  return (
    <form className="publish-form" onSubmit={publish}>
      <div className="publish-form-heading"><div><p className="eyebrow">{status === "published" ? "Published article" : "Final publication"}</p><h3>{status === "published" ? "Update the public article." : "Prepare the public article."}</h3></div>{publicPath && <a className="editor-link" href={publicPath} target="_blank" rel="noreferrer">Open public page</a>}</div>
      <p className="publish-form-note">Only enter the final, author-approved version. The manuscript file and contact details stay private.</p>
      <div className="publish-fields">
        <label>Public title<input name="title" required maxLength={240} defaultValue={initial.title} /></label>
        <label>Public author name<input name="authorName" required maxLength={180} defaultValue={initial.authorName} /><small>Use the byline the author approved. You can use a pseudonym.</small></label>
        <label>Discipline<input name="discipline" required maxLength={120} defaultValue={initial.discipline} /></label>
        <label>Issue<input name="issue" required maxLength={80} defaultValue={initial.issue || "Volume 01"} /></label>
        <label className="publish-wide">Abstract<small>At least 80 characters.</small><textarea name="abstract" required minLength={80} maxLength={2400} rows={5} defaultValue={initial.abstract} /></label>
        <label className="publish-wide">Article text<small>Use a blank line between paragraphs. The page shows plain text only.</small><textarea name="body" required minLength={240} maxLength={120000} rows={16} defaultValue={initial.body} placeholder="Paste the final, author-approved article here." /></label>
      </div>
      <label className="publish-approval"><input type="checkbox" name="authorApprovalConfirmed" required /> I confirmed that the author, or a parent or guardian when required, approved this final version for public release.</label>
      {message && <p className={state === "error" ? "form-error" : "publish-success"} role="alert">{message}{publicPath && state !== "error" && <> <a href={publicPath} target="_blank" rel="noreferrer">Open article</a>.</>}</p>}
      <div className="publish-actions"><p>Publishing creates a public article page and adds the article to the issue.</p><button className="editor-save" disabled={state === "saving"}>{state === "saving" ? "Publishing" : status === "published" ? "Save public article" : "Publish article"}</button></div>
    </form>
  );
}
