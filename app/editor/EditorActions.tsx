"use client";

import { useState } from "react";

const statuses = ["received", "screening", "under-review", "revise", "declined", "accepted"];

export function EditorActions({ id, status, editorMessage, ageBand, guardianEmail }: { id: string; status: string; editorMessage: string | null; ageBand: string; guardianEmail: string | null }) {
  const [value, setValue] = useState(status);
  const [messageValue, setMessageValue] = useState(editorMessage ?? "");
  const [state, setState] = useState<"idle" | "saving" | "error" | "warning">("idle");
  const [message, setMessage] = useState("");
  const [guardianValue, setGuardianValue] = useState(guardianEmail ?? "");
  const [guardianState, setGuardianState] = useState<"idle" | "saving" | "error">("idle");
  const [guardianMessage, setGuardianMessage] = useState("");

  async function save() {
    setState("saving");
    setMessage("");
    const response = await fetch(`/api/editor/submissions/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value, editorMessage: messageValue }),
    });
    const payload = await response.json().catch(() => null) as { error?: string; notificationPending?: boolean } | null;
    if (!response.ok) {
      setState(payload?.notificationPending ? "warning" : "error");
      setMessage(payload?.error ?? "Could not update this status.");
      return;
    }
    setState("idle");
    window.location.reload();
  }

  async function saveGuardianEmail() {
    setGuardianState("saving");
    setGuardianMessage("");
    const response = await fetch(`/api/editor/submissions/${id}/guardian-email`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guardianEmail: guardianValue }),
    });
    const payload = await response.json().catch(() => null) as { error?: string; notificationMessage?: string } | null;
    if (!response.ok) {
      setGuardianState("error");
      setGuardianMessage(payload?.error ?? "Could not update the guardian email.");
      return;
    }
    setGuardianState("idle");
    setGuardianMessage(payload?.notificationMessage ?? "Guardian email updated and notification sent.");
  }

  return (
    <div className="editor-actions">
      <div className="editor-action-fields">
        <label>Editorial status
          <select value={value} onChange={(event) => setValue(event.target.value)}>
            {[...statuses, ...(status === "published" ? ["published"] : [])].map((option) => <option key={option} value={option}>{option.replaceAll("-", " ")}</option>)}
          </select>
        </label>
        <label className="editor-message-field">Decision letter note <span>(sent to the author for decision statuses)</span>
          <textarea value={messageValue} onChange={(event) => setMessageValue(event.target.value)} maxLength={6000} rows={5} placeholder="Explain the decision, requested revision, or next step. Keep this specific and respectful." />
        </label>
      </div>
      <button type="button" className="editor-save" onClick={save} disabled={state === "saving"}>{state === "saving" ? "Saving" : "Save status and note"}</button>
      {message && <p role="alert" className={state === "warning" ? "editor-warning" : undefined}>{message}</p>}
      {["minor", "14-17", "under-18"].includes(ageBand) && <div className="guardian-email-editor"><label>Guardian email<input type="email" value={guardianValue} onChange={(event) => setGuardianValue(event.target.value)} maxLength={254} /></label><button type="button" className="editor-save" onClick={saveGuardianEmail} disabled={guardianState === "saving"}>{guardianState === "saving" ? "Saving" : "Update guardian email"}</button>{guardianMessage && <p role="alert" className={guardianState === "error" ? "form-error" : undefined}>{guardianMessage}</p>}</div>}
    </div>
  );
}
