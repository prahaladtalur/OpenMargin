import { env } from "cloudflare:workers";
import { getChatGPTUser, requireChatGPTUser, type ChatGPTUser } from "../app/chatgpt-auth";
import { redirect } from "next/navigation";

function allowedEditorEmails() {
  return new Set(
    (env.EDITOR_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isEditor(user: ChatGPTUser | null) {
  return Boolean(user && allowedEditorEmails().has(user.email.toLowerCase()));
}

export async function requireEditor(returnTo: string) {
  const user = await requireChatGPTUser(returnTo);
  if (!isEditor(user)) redirect("/editor/access-denied");
  return user;
}

export async function getEditorForApi() {
  const user = await getChatGPTUser();
  return isEditor(user) ? user : null;
}

export function emailNotificationsConfigured() {
  return Boolean(env.RESEND_API_KEY && env.RESEND_FROM && env.NOTIFICATION_EMAIL);
}
