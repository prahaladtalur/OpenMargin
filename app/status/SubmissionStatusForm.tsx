"use client";

import { FormEvent, useState } from "react";

type Result = { label: string; detail: string; createdAt: string };

export function SubmissionStatusForm() {
  const [state, setState] = useState<"idle" | "checking" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("checking");
    setMessage("");
    setResult(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/submission-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: form.get("reference"), email: form.get("email") }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setState("error");
      setMessage(payload.error ?? "We could not retrieve the status. Try again.");
      return;
    }
    setResult(payload);
    setState("success");
  }

  return (
    <form className="submission-form status-form" onSubmit={submit}>
      <div className="form-grid"><label>Submission reference<input name="reference" required maxLength={50} placeholder="OM-2026-XXXXXXXX" autoCapitalize="characters" /></label><label>Email used for submission<input name="email" type="email" required autoComplete="email" maxLength={254} /></label></div>
      {state === "error" && <p className="form-error" role="alert">{message}</p>}
      {result && <section className="status-result" aria-live="polite"><p className="eyebrow">Current stage</p><h2>{result.label}</h2><p>{result.detail}</p></section>}
      <div className="form-submit"><p>For privacy, we show a status only when the reference code and submission email match.</p><button className="button button-dark" disabled={state === "checking"}>{state === "checking" ? "Checking" : "Check status"}</button></div>
    </form>
  );
}
