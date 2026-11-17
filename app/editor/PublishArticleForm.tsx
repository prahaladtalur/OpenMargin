"use client";

import { FormEvent, useState } from "react";

type ArticleDraft = {
  title: string;
  authorName: string;
  discipline: string;
  abstract: string;
  abstractNative?: string | null;
  abstractNativeLanguage?: string | null;
  submissionType?: string;
  dataSourceUrl?: string | null;
  codeUrl?: string | null;
  body: string;
  issue: string;
  slug?: string;
};

type PublishArticleFormProps = {
  id: string;
  status: string;
  hasPublicationConsent: boolean;
  publicationConsentEvidence?: string | null;
  publicationAgeStatus?: string | null;
  publicationAgeEvidence?: string | null;
  guardianPublicationConsentAt?: string | null;
  guardianPublicationConsentEvidence?: string | null;
  initial: ArticleDraft;
};

export function PublishArticleForm({ id, status, hasPublicationConsent, publicationConsentEvidence, publicationAgeStatus, publicationAgeEvidence, guardianPublicationConsentAt, guardianPublicationConsentEvidence, initial }: PublishArticleFormProps) {
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
        abstractNativeLanguage: form.get("abstractNativeLanguage"),
        abstractNative: form.get("abstractNative"),
        dataSourceUrl: form.get("dataSourceUrl"),
        codeUrl: form.get("codeUrl"),
        body: form.get("body"),
        issue: form.get("issue"),
        publicReleaseConsentConfirmed: form.get("publicReleaseConsentConfirmed") === "on",
        publicReleaseConsentEvidence: form.get("publicReleaseConsentEvidence"),
        authorAgeStatus: form.get("authorAgeStatus"),
        ageStatusEvidence: form.get("ageStatusEvidence"),
        guardianPublicationConsentConfirmed: form.get("guardianPublicationConsentConfirmed") === "on",
        guardianPublicationConsentEvidence: form.get("guardianPublicationConsentEvidence"),
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
      <p className="publish-form-note">Prepare the accepted paper for publication. The submitted manuscript file and contact details stay private.</p>
      <div className="publish-fields">
        <label>Public title<input name="title" required maxLength={240} defaultValue={initial.title} /></label>
        <label>Public author name<input name="authorName" required maxLength={180} defaultValue={initial.authorName} /><small>Use the byline the author approved. You can use a pseudonym.</small></label>
        <label>Discipline<input name="discipline" required maxLength={120} defaultValue={initial.discipline} /></label>
        <label>Issue<input name="issue" required maxLength={80} defaultValue={initial.issue || "Volume 01"} /></label>
        <label className="publish-wide">Abstract<small>At least 80 characters.</small><textarea name="abstract" required minLength={80} maxLength={2400} rows={5} defaultValue={initial.abstract} /></label>
        <label>Abstract language <small>(optional)</small><input name="abstractNativeLanguage" maxLength={60} minLength={2} defaultValue={initial.abstractNativeLanguage ?? ""} /></label>
        <label className="publish-wide">Additional abstract <small>(optional)</small><textarea name="abstractNative" minLength={300} maxLength={1800} rows={5} defaultValue={initial.abstractNative ?? ""} /></label>
        {initial.submissionType === "research-note" && <>
          <label className="publish-wide">Dataset link<input name="dataSourceUrl" type="url" required defaultValue={initial.dataSourceUrl ?? ""} /></label>
          <label className="publish-wide">Code link <small>(optional)</small><input name="codeUrl" type="url" defaultValue={initial.codeUrl ?? ""} /></label>
        </>}
        <label className="publish-wide">Article text<small>Use a blank line between paragraphs. The page shows plain text only.</small><textarea name="body" required minLength={240} maxLength={120000} rows={16} defaultValue={initial.body} placeholder="Paste the accepted article here." /></label>
      </div>
      {hasPublicationConsent ? <p className="publish-form-note">General publication permission is on file: {publicationConsentEvidence || "recorded at submission"}. It applies to the accepted paper and is not tied to one exact manuscript version.</p> : <>
        <label className="publish-wide">General author publication permission source and date<small>This older submission&apos;s original terms required separate permission. Record brief evidence that the author authorized publication if accepted. Do not paste email text or personal details.</small><textarea name="publicReleaseConsentEvidence" required minLength={8} maxLength={500} rows={3} placeholder="For example: author confirmed general publication permission by email on Nov 16" /></label>
        <label className="publish-approval"><input type="checkbox" name="publicReleaseConsentConfirmed" required /> I reviewed the permission evidence and confirm it authorizes publication of the accepted work generally, not only one exact copy.</label>
      </>}
      <div className="publish-fields">
        <label>Author age at publication<select name="authorAgeStatus" required defaultValue={publicationAgeStatus ?? ""}><option value="" disabled>Select confirmed age group</option><option value="adult">18 or older</option><option value="under-18">Under 18</option></select><small>Do not enter a birth date. Add only a brief source and date note below.</small></label>
        <label>Age confirmation source and date<input name="ageStatusEvidence" required minLength={4} maxLength={300} defaultValue={publicationAgeEvidence ?? ""} placeholder="For example: author confirmed adult status on Nov 16" /></label>
        <label className="publish-wide">Guardian publication permission evidence<small>Required for authors under 18. Confirm permission was obtained and the guardian contact is on file. Do not paste email text or personal details.</small><textarea name="guardianPublicationConsentEvidence" maxLength={500} rows={2} defaultValue={guardianPublicationConsentEvidence ?? ""} placeholder="For example: guardian confirmed publication permission on Nov 16" /></label>
        <label className="publish-approval"><input type="checkbox" name="guardianPublicationConsentConfirmed" defaultChecked={Boolean(guardianPublicationConsentAt && guardianPublicationConsentEvidence)} /> I verified separate parent or guardian permission for public publication when required.</label>
      </div>
      {message && <p className={state === "error" ? "form-error" : "publish-success"} role="alert">{message}{publicPath && state !== "error" && <> <a href={publicPath} target="_blank" rel="noreferrer">Open article</a>.</>}</p>}
      <div className="publish-actions"><p>Publishing creates a public article page and adds the article to the issue.</p><button className="editor-save" disabled={state === "saving"}>{state === "saving" ? "Publishing" : status === "published" ? "Save public article" : "Publish article"}</button></div>
    </form>
  );
}
