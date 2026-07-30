import { env } from "cloudflare:workers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const EDITOR_SESSION_COOKIE = "open_margin_editor_session";

const SESSION_LIFETIME_SECONDS = 60 * 60 * 12;
const encoder = new TextEncoder();

function safeReturnPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/editor";

  try {
    const url = new URL(value, "https://editor.local");
    if (url.origin !== "https://editor.local" || url.pathname.startsWith("/editor/login")) return "/editor";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/editor";
  }
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function equalBytes(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function digest(value: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

async function sessionSignature(payload: string) {
  const sessionSecret = env.EDITOR_SESSION_SECRET;
  if (!sessionSecret) return null;
  const key = await crypto.subtle.importKey("raw", encoder.encode(sessionSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

export function editorSignInPath(returnTo = "/editor") {
  return `/editor/login?return_to=${encodeURIComponent(safeReturnPath(returnTo))}`;
}

export function editorSignOutPath(returnTo = "/") {
  return `/api/editor/logout?return_to=${encodeURIComponent(safeReturnPath(returnTo))}`;
}

export function editorCookieOptions() {
  return {
    httpOnly: true,
    maxAge: SESSION_LIFETIME_SECONDS,
    path: "/",
    sameSite: "lax" as const,
    secure: true,
  };
}

export async function editorPasswordMatches(candidate: string) {
  const configuredPassword = env.EDITOR_PASSWORD;
  if (!configuredPassword || !candidate) return false;
  const [candidateHash, configuredHash] = await Promise.all([digest(candidate), digest(configuredPassword)]);
  return equalBytes(candidateHash, configuredHash);
}

export async function createEditorSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_LIFETIME_SECONDS;
  const payload = `v1.${expiresAt}.${crypto.randomUUID()}`;
  const signature = await sessionSignature(payload);
  if (!signature) return null;
  return `${payload}.${signature}`;
}

export async function hasEditorSession() {
  const session = (await cookies()).get(EDITOR_SESSION_COOKIE)?.value;
  if (!session) return false;

  const [version, expiresAt, nonce, signature] = session.split(".");
  if (version !== "v1" || !expiresAt || !nonce || !signature || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;

  const expectedSignature = await sessionSignature(`${version}.${expiresAt}.${nonce}`);
  if (!expectedSignature) return false;
  return equalBytes(encoder.encode(signature), encoder.encode(expectedSignature));
}

export async function requireEditor(returnTo: string) {
  if (!(await hasEditorSession())) redirect(editorSignInPath(returnTo));
}

export async function getEditorForApi() {
  return hasEditorSession();
}

export function emailNotificationsConfigured() {
  return Boolean(env.RESEND_API_KEY && env.RESEND_FROM && env.NOTIFICATION_EMAIL);
}

export { safeReturnPath };
