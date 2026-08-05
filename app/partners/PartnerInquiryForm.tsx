"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const paths = ["Exploratory conversation", "Small opt-in pilot", "Author-readiness workshop", "Reviewer or advisor pathway", "Classroom or program resources"];

export function PartnerInquiryForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const response = await fetch("/api/partner-inquiries", { method: "POST", body: new FormData(event.currentTarget) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error ?? "We could not receive your inquiry. Try again.");
      return;
    }
    setStatus("success");
    setMessage(`Received. Your inquiry reference is ${payload.reference}. Save it for future emails.`);
    event.currentTarget.reset();
  }

  if (status === "success") {
    return <section className="submission-success" aria-live="polite"><p className="handwritten">inquiry received</p><h2>We got your note.</h2><p>{message}</p><p>We will check whether the idea fits our scope and current capacity, then follow up.</p><button className="button button-dark" onClick={() => { setStatus("idle"); setMessage(""); }}>Send another inquiry</button></section>;
  }

  return (
    <form className="submission-form intake-form" onSubmit={submit}>
      <div className="honeypot" aria-hidden="true"><label>Leave this blank<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <fieldset>
        <legend><span>01</span> Organization and contact</legend>
        <div className="form-grid">
          <label>Organization<input name="organizationName" required maxLength={180} /></label>
          <label>Organization type<select name="organizationType" required defaultValue=""><option value="" disabled>Select one</option><option>School or district</option><option>Research or enrichment program</option><option>Youth organization</option><option>Library, museum, or community institution</option><option>Other</option></select></label>
          <label>Contact name<input name="contactName" required autoComplete="name" maxLength={120} /></label>
          <label>Contact email<input name="contactEmail" required type="email" autoComplete="email" maxLength={254} /></label>
          <label className="wide">Role or team <small>(optional)</small><input name="contactRole" maxLength={120} placeholder="For example: program director, teacher, partnerships, or student leadership." /></label>
        </div>
      </fieldset>

      <fieldset>
        <legend><span>02</span> What you are considering</legend>
        <div className="form-grid">
          <label className="wide">Your students or program<textarea name="focus" required minLength={20} maxLength={1000} rows={4} placeholder="Who do you work with? What do students make? Which subjects matter here?" /></label>
          <label>Approximate cohort size <small>(optional)</small><input name="cohortSize" maxLength={80} placeholder="For example: 20 students per term" /></label>
          <label>Best next step<select name="requestedPath" required defaultValue=""><option value="" disabled>Select one</option>{paths.map((path) => <option key={path}>{path}</option>)}</select></label>
          <label className="wide">What would success look like? <small>(80 characters minimum)</small><textarea name="goals" required minLength={80} maxLength={1800} rows={6} placeholder="Tell us what you want students or your program to gain, plus any timing or limits we should know." /></label>
        </div>
      </fieldset>

      <fieldset>
        <legend><span>03</span> Data and independence</legend>
        <div className="declarations">
          <label><input type="checkbox" name="privacyConfirmed" required /> I understand that any collaboration must keep participation voluntary, use direct student submission or clear consent, and leave editorial decisions independent.</label>
          <p className="privacy-copy">I have read the <Link href="/policies#privacy">privacy policy</Link> and consent to Open Margin using this information to reply.</p>
        </div>
      </fieldset>
      {status === "error" && <p className="form-error" role="alert">{message}</p>}
      <div className="form-submit"><p>There is no fee to explore a partnership. We do not sell publication or promise outcomes. We do not share student information without clear consent.</p><button className="button button-dark" disabled={status === "sending"}>{status === "sending" ? "Sending" : "Start a conversation"}</button></div>
    </form>
  );
}
