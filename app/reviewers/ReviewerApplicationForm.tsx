"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const roles = ["Student reviewer", "Section editor", "Academic advisor", "Copyeditor or research-communication volunteer"];

export function ReviewerApplicationForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isMinor, setIsMinor] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const response = await fetch("/api/reviewer-applications", { method: "POST", body: new FormData(event.currentTarget) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error ?? "We could not receive your application. Please try again.");
      return;
    }
    setStatus("success");
    setMessage(`Received. Your application reference is ${payload.reference}.`);
    event.currentTarget.reset();
    setIsMinor(false);
  }

  if (status === "success") {
    return <section className="submission-success" aria-live="polite"><p className="handwritten">application received</p><h2>Thank you for offering your time.</h2><p>{message}</p><p>We will review fit, capacity, and conflicts before inviting anyone into the review process.</p><button className="button button-dark" onClick={() => { setStatus("idle"); setMessage(""); }}>Submit another application</button></section>;
  }

  return (
    <form className="submission-form intake-form" onSubmit={submit}>
      <div className="honeypot" aria-hidden="true"><label>Leave this blank<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <fieldset>
        <legend><span>01</span> About you</legend>
        <div className="form-grid">
          <label>Full name<input name="fullName" required autoComplete="name" maxLength={120} /></label>
          <label>Email<input name="email" type="email" required autoComplete="email" maxLength={254} /></label>
          <label>Age band<select name="ageBand" required defaultValue="" onChange={(event) => setIsMinor(event.target.value === "14-17")}><option value="" disabled>Select one</option><option value="14-17">14–17</option><option value="18-19">18–19</option><option value="adult">20 or older</option></select></label>
          <label>Role you are exploring<select name="role" required defaultValue=""><option value="" disabled>Select one</option>{roles.map((role) => <option key={role}>{role}</option>)}</select></label>
          {isMinor && <label className="wide">Guardian email<input name="guardianEmail" type="email" required autoComplete="email" maxLength={254} /></label>}
        </div>
      </fieldset>

      <fieldset>
        <legend><span>02</span> Your perspective</legend>
        <div className="form-grid">
          <label className="wide">Fields you can speak to<textarea name="disciplines" required minLength={10} maxLength={280} rows={3} placeholder="For example: history, biology, mathematics, computer science, economics, research methods, or copyediting." /></label>
          <label className="wide">Relevant experience <small>(80 characters minimum)</small><textarea name="experience" required minLength={80} maxLength={1600} rows={5} placeholder="Share coursework, research, editing, mentoring, teaching, or lived experience that informs your application." /></label>
          <label className="wide">Availability<textarea name="availability" required minLength={10} maxLength={500} rows={3} placeholder="For example: one manuscript each month, weekdays after 4pm Pacific, or one workshop each term." /></label>
          <label className="wide">Why this role? <small>(80 characters minimum)</small><textarea name="statement" required minLength={80} maxLength={1600} rows={5} placeholder="Tell us how you would make another student’s work clearer, stronger, or more responsible." /></label>
        </div>
      </fieldset>

      <fieldset>
        <legend><span>03</span> Commitments</legend>
        <div className="declarations">
          <label><input type="checkbox" name="ethicsConfirmed" required /> I will keep manuscripts and editorial conversations confidential, disclose conflicts of interest, and offer specific, respectful feedback.</label>
          <label><input type="checkbox" name="privacyConfirmed" required /> I have read the <Link href="/policies#privacy">privacy policy</Link> and consent to Open Margin using this information to consider my application.</label>
          {isMinor && <label><input type="checkbox" name="guardianConfirmed" required /> I have my guardian’s permission to apply and to provide their email.</label>}
        </div>
      </fieldset>
      {status === "error" && <p className="form-error" role="alert">{message}</p>}
      <div className="form-submit"><p>Applying is free. An application is not an automatic appointment or a promise of a manuscript assignment.</p><button className="button button-dark" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Apply to contribute"}</button></div>
    </form>
  );
}
