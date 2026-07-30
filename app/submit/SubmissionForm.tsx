"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const disciplines = [
  "History",
  "Literature",
  "Philosophy",
  "Economics",
  "Political science",
  "Sociology",
  "Anthropology",
  "Biology & life sciences",
  "Chemistry",
  "Physics & astronomy",
  "Earth & environmental science",
  "Mathematics & statistics",
  "Computer science",
  "Engineering & design",
  "Other humanities or social science",
  "Other STEM field",
];

export function SubmissionForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [requiresGuardian, setRequiresGuardian] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const response = await fetch("/api/submissions", { method: "POST", body: new FormData(event.currentTarget) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error ?? "We could not receive your submission. Please try again.");
      return;
    }
    setStatus("success");
    setMessage(`Received. Your reference code is ${payload.reference}. Save it for any editorial correspondence.`);
    event.currentTarget.reset();
    setRequiresGuardian(false);
  }

  if (status === "success") {
    return <section className="submission-success" aria-live="polite"><p className="handwritten">submission received</p><h2>Thank you for trusting us with your work.</h2><p>{message}</p><p>An editor will email you after the initial screen, normally within seven days. You can also check the high-level stage using your reference code.</p><div className="success-actions"><Link className="button button-dark" href="/status">Check submission status</Link><button className="button button-paper" onClick={() => { setStatus("idle"); setMessage(""); }}>Start another submission</button></div></section>;
  }

  return (
    <form className="submission-form" onSubmit={submit} encType="multipart/form-data">
      <div className="honeypot" aria-hidden="true"><label>Leave this blank<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <fieldset>
        <legend><span>01</span> About you</legend>
        <div className="form-grid">
          <label>Full name<input name="authorName" required autoComplete="name" maxLength={120} /></label>
          <label>Contact email<input name="authorEmail" type="email" required autoComplete="email" maxLength={254} /></label>
          <label>School or organization <small>(optional)</small><input name="schoolOrOrganization" maxLength={160} /></label>
          <label>Country or region <small>(optional)</small><input name="countryOrRegion" maxLength={100} /></label>
          <label className="wide"><input name="guardianConfirmed" type="checkbox" onChange={(event) => setRequiresGuardian(event.target.checked)} /> The author is under 18 and has a parent or guardian&apos;s approval to submit. If the author is under 13, a parent or guardian must complete this form using their own contact email.</label>
          {requiresGuardian && <label className="wide">Parent or guardian email<input name="guardianEmail" type="email" required autoComplete="email" maxLength={254} /></label>}
        </div>
      </fieldset>

      <fieldset>
        <legend><span>02</span> About the manuscript</legend>
        <div className="form-grid">
          <label className="wide">Manuscript title<input name="manuscriptTitle" required maxLength={240} /></label>
          <label>Primary discipline<select name="discipline" required defaultValue=""><option value="" disabled>Select one</option>{disciplines.map((discipline) => <option key={discipline}>{discipline}</option>)}</select></label>
          <label>Approximate word count<input name="wordCount" type="number" min="2500" max="8000" required /></label>
          <label className="wide">Abstract <small>(300–1,800 characters)</small><textarea name="abstract" required minLength={300} maxLength={1800} rows={7} /></label>
          <label className="wide">Where did this project begin?<textarea name="originNote" required maxLength={1000} rows={4} placeholder="For example: AP Research project, science-fair study, lab or design project, independent study, or mentored research." /></label>
          <label className="wide">AI-use disclosure<input name="aiDisclosure" required maxLength={1000} placeholder="State ‘No material AI use’ or briefly describe the tools and how you used them." /></label>
        </div>
      </fieldset>

      <fieldset>
        <legend><span>03</span> Upload & declarations</legend>
        <label className="file-field">Blinded manuscript file <small>PDF or DOCX · 10 MB maximum · remove your name, school, and acknowledgments</small><input name="manuscript" type="file" accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx" required /></label>
        <div className="declarations">
          <label><input type="checkbox" name="originalWorkConfirmed" required /> I confirm that this is original work, that all sources are cited, and that every listed author approves this submission.</label>
          <label><input type="checkbox" name="privacyConfirmed" required /> I have read the <Link href="/policies#privacy">privacy and guardian-contact policy</Link> and consent to editorial use of the information and manuscript submitted here.</label>
        </div>
      </fieldset>
      {status === "error" && <p className="form-error" role="alert">{message}</p>}
      <div className="form-submit"><p>Submitting is free. A manuscript enters review only after it passes the initial editorial screen.</p><button className="button button-dark" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Submit manuscript"}</button></div>
    </form>
  );
}
