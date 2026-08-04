import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Editor access denied", robots: { index: false, follow: false } };

export default function EditorAccessDeniedPage() {
  return <main className="editor-denied"><p className="eyebrow">Private editorial workspace</p><h1>Use the editor password to continue.</h1><p>The submission desk is protected by a shared password.</p><Link className="button button-dark" href="/editor/login">Open editor sign in</Link></main>;
}
