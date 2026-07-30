import Link from "next/link";
import { redirect } from "next/navigation";
import { EditorLoginForm } from "./EditorLoginForm";
import { getEditorForApi, safeReturnPath } from "../../../lib/editor-auth";

export const dynamic = "force-dynamic";

export default async function EditorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string | string[] }>;
}) {
  const { return_to: requestedReturnTo } = await searchParams;
  const returnTo = safeReturnPath(Array.isArray(requestedReturnTo) ? requestedReturnTo[0] : requestedReturnTo);

  if (await getEditorForApi()) redirect(returnTo);

  return (
    <main className="editor-denied">
      <p className="eyebrow">Private editorial workspace</p>
      <h1>Open the submission desk.</h1>
      <p>Enter the editor password to view submissions, reviewer applications, and partner inquiries.</p>
      <EditorLoginForm returnTo={returnTo} />
      <Link className="text-link" href="/">Return to the journal</Link>
    </main>
  );
}
