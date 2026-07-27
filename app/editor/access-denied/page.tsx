import Link from "next/link";

export default function EditorAccessDeniedPage() {
  return <main className="editor-denied"><p className="eyebrow">Private editorial workspace</p><h1>This account is not on the editor list.</h1><p>Ask the journal administrator to add the email address you use with ChatGPT.</p><Link className="button button-dark" href="/">Return to the journal</Link></main>;
}
