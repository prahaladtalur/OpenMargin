"use client";

import { useState } from "react";

const options = {
  reviewer: ["received", "screening", "interview", "invited", "active", "declined"],
  partner: ["received", "discovery", "pilot-design", "active", "closed"],
} as const;

type Kind = keyof typeof options;

export function RecruitmentActions({ id, kind, status, ageBand, guardianApprovalAt, guardianApprovalEvidence }: { id: string; kind: Kind; status: string; ageBand?: string; guardianApprovalAt?: string | null; guardianApprovalEvidence?: string | null }) {
  const [value, setValue] = useState(status);
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [guardianApprovalVerified, setGuardianApprovalVerified] = useState(Boolean(guardianApprovalAt));
  const [approvalEvidence, setApprovalEvidence] = useState(guardianApprovalEvidence ?? "");
  const [errorMessage, setErrorMessage] = useState("Could not update this status.");
  const isMinorReviewer = kind === "reviewer" && (ageBand === "minor" || ageBand === "14-17" || ageBand === "under-18");

  async function save() {
    setState("saving");
    const route = kind === "reviewer" ? "reviewer-applications" : "partner-inquiries";
    const response = await fetch(`/api/editor/${route}/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: value, ...(isMinorReviewer ? { guardianApprovalVerified, guardianApprovalEvidence: approvalEvidence } : {}) }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      setErrorMessage(payload?.error ?? "Could not update this status.");
      setState("error");
      return;
    }
    setState("idle");
    window.location.reload();
  }

  return <div className="editor-actions">{isMinorReviewer && <><label><input type="checkbox" checked={guardianApprovalVerified} onChange={(event) => setGuardianApprovalVerified(event.target.checked)} /> Guardian approval verified outside this application</label>{guardianApprovalVerified && <label>Verification note <small>(source and date, no sensitive details)</small><input value={approvalEvidence} onChange={(event) => setApprovalEvidence(event.target.value)} maxLength={400} placeholder="For example: guardian email received, Oct 13, 2026" /></label>}{!guardianApprovalVerified && <p>Do not activate or assign this reviewer until guardian approval is verified.</p>}</>}<label>Pipeline status<select value={value} onChange={(event) => setValue(event.target.value)}>{options[kind].map((option) => <option key={option} value={option}>{option.replace("-", " ")}</option>)}</select></label><button type="button" className="editor-save" onClick={save} disabled={state === "saving"}>{state === "saving" ? "Saving" : "Save"}</button>{state === "error" && <p role="alert">{errorMessage}</p>}</div>;
}
