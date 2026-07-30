import { NextResponse } from "next/server";
import { createEditorSession, editorCookieOptions, editorPasswordMatches, safeReturnPath, EDITOR_SESSION_COOKIE } from "../../../../lib/editor-auth";

export async function POST(request: Request) {
  let body: { password?: unknown; returnTo?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Enter the editor password." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!(await editorPasswordMatches(password))) {
    return Response.json({ error: "That password is not correct." }, { status: 401 });
  }

  const session = await createEditorSession();
  if (!session) {
    return Response.json({ error: "Password access is not configured yet. Please try again shortly." }, { status: 503 });
  }

  const returnTo = safeReturnPath(typeof body.returnTo === "string" ? body.returnTo : undefined);
  const response = NextResponse.json({ returnTo });
  response.cookies.set(EDITOR_SESSION_COOKIE, session, editorCookieOptions());
  return response;
}
