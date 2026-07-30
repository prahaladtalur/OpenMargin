import { NextResponse } from "next/server";
import { editorCookieOptions, EDITOR_SESSION_COOKIE, safeReturnPath } from "../../../../lib/editor-auth";

export async function GET(request: Request) {
  const returnTo = safeReturnPath(new URL(request.url).searchParams.get("return_to"));
  const response = NextResponse.redirect(new URL(returnTo, request.url));
  response.cookies.set(EDITOR_SESSION_COOKIE, "", { ...editorCookieOptions(), maxAge: 0 });
  return response;
}
