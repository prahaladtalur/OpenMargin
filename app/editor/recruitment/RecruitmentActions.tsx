"use client";

import { useState } from "react";

const options = {
  reviewer: ["received", "screening", "interview", "invited", "active", "declined"],
  partner: ["received", "discovery", "pilot-design", "active", "closed"],
} as const;

type Kind = keyof typeof options;

export function RecruitmentActions({ id, kind, status }: { id: string; kind: Kind; status: string }) {
  const [value, setValue] = useState(status);
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");

  async function save() {
    setState("saving");
    const route = kind === "reviewer" ? "reviewer-applications" : "partner-inquiries";
    const response = await fetch(`/api/editor/${route}/${id}/status`, {
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

  return <div className="editor-actions"><label>Pipeline status<select value={value} onChange={(event) => setValue(event.target.value)}>{options[kind].map((option) => <option key={option} value={option}>{option.replace("-", " ")}</option>)}</select></label><button type="button" className="editor-save" onClick={save} disabled={state === "saving"}>{state === "saving" ? "Saving…" : "Save"}</button>{state === "error" && <p role="alert">Could not update this status.</p>}</div>;
}
