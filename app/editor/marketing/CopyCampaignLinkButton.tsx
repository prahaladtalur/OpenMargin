"use client";

import { useState } from "react";

export function CopyCampaignLinkButton({ url }: { url: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      window.setTimeout(() => setState("idle"), 1800);
    } catch {
      setState("error");
    }
  }

  return (
    <>
      <button className="button button-paper" type="button" onClick={copy}>
        {state === "copied" ? "Copied" : "Copy link"}
      </button>
      {state === "error" && <span className="copy-status" role="status">Copy failed. Select the link to copy it.</span>}
    </>
  );
}
