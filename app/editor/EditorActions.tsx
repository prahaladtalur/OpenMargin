"use client";

import { useState } from "react";

const statuses = ["received", "screening", "under-review", "revise", "declined", "accepted"];

export function EditorActions({ id, status }: { id: string; status: string }) {
  const [value, setValue] = useState(status);
  const [state, setState] = useState<"idle" | "saving" | "error" | "warning">("idle");
  const [message, setMessage] = useState("");

  async function save() {
    setState("saving");
    setMessage("");
    const response = await fetch(`/api/editor/submissions/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value }),
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

  return (
    <div className="editor-actions">
      <label>Editorial status
        <select value={value} onChange={(event) => setValue(event.target.value)}>
          {[...statuses, ...(status === "published" ? ["published"] : [])].map((option) => <option key={option} value={option}>{option.replaceAll("-", " ")}</option>)}
        </select>
      </label>
      <button type="button" className="editor-save" onClick={save} disabled={state === "saving"}>{state === "saving" ? "Saving" : "Save"}</button>
      {message && <p role="alert" className={state === "warning" ? "editor-warning" : undefined}>{message}</p>}
    </div>
  );
}
