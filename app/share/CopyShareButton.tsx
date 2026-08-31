"use client";

import { useState } from "react";

export function CopyShareButton({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      window.setTimeout(() => setState("idle"), 1800);
    } catch {
      setState("error");
    }
  }

  return (
    <div className="share-copy-actions">
      <button className="button button-paper" type="button" onClick={copy}>
        {state === "copied" ? "Copied" : "Copy message"}
      </button>
      {state === "error" && <span role="status">Copy failed. Select the message to copy it.</span>}
    </div>
  );
}
