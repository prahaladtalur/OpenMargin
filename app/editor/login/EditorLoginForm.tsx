"use client";

import { FormEvent, useState } from "react";

export function EditorLoginForm({ returnTo }: { returnTo: string }) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const response = await fetch("/api/editor/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, returnTo }),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error ?? "We could not sign you in. Please try again.");
      return;
    }

    window.location.assign(payload.returnTo ?? returnTo);
  }

  return (
    <form className="editor-login-form" onSubmit={submit}>
      <label>
        Editor password
        <input
          autoComplete="current-password"
          autoFocus
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>
      {status === "error" && <p className="form-error" role="alert">{message}</p>}
      <button className="button button-dark" disabled={status === "sending"}>
        {status === "sending" ? "Opening desk…" : "Open submission desk"}
      </button>
    </form>
  );
}
