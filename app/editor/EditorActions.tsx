"use client";

import { useState } from "react";

const statuses = ["received", "screening", "under-review", "revise", "declined", "accepted"];

export function EditorActions({ id, status }: { id: string; status: string }) {
  const [value, setValue] = useState(status);
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");

  async function save() {
    setState("saving");
    const response = await fetch(`/api/editor/submissions/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
    if (!response.ok) {
      setState("error");
      return;
    }
    setState("idle");
    window.location.reload();
  }

  return (
    <div className="editor-actions">
      <label>Editorial status
        <select value={value} onChange={(event) => setValue(event.target.value)}>
          {statuses.map((option) => <option key={option} value={option}>{option.replace("-", " ")}</option>)}
        </select>
      </label>
      <button type="button" className="editor-save" onClick={save} disabled={state === "saving"}>{state === "saving" ? "Saving" : "Save"}</button>
      {state === "error" && <p role="alert">Could not update this status.</p>}
    </div>
  );
}
