import { ensureOperationsTables, getDb } from "../../../db";
import { partnerInquiries } from "../../../db/schema";
import { notifyEditorOfPartnerInquiry } from "../../../lib/notifications";

function value(form: FormData, key: string, maxLength: number) {
  const entry = form.get(key);
  return typeof entry === "string" ? entry.trim().slice(0, maxLength) : "";
}

function invalid(error: string) {
  return Response.json({ error }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    if (value(form, "website", 200)) return Response.json({ reference: "received" }, { status: 201 });

    const organizationName = value(form, "organizationName", 180);
    const contactName = value(form, "contactName", 120);
    const contactEmail = value(form, "contactEmail", 254).toLowerCase();
    const contactRole = value(form, "contactRole", 120);
    const organizationType = value(form, "organizationType", 100);
    const focus = value(form, "focus", 1000);
    const cohortSize = value(form, "cohortSize", 80);
    const goals = value(form, "goals", 1800);
    const requestedPath = value(form, "requestedPath", 100);

    if (!organizationName || !contactName || !/^\S+@\S+\.\S+$/.test(contactEmail)) return invalid("Enter an organization, contact name, and valid email address.");
    if (!organizationType || !focus || goals.length < 80 || !requestedPath) return invalid("Tell us about your program and what you want to explore.");
    if (form.get("privacyConfirmed") !== "on") return invalid("Confirm the privacy checkbox.");

    const id = `PT-${new Date().getUTCFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    await ensureOperationsTables();
    await getDb().insert(partnerInquiries).values({
      id,
      organizationName,
      contactName,
      contactEmail,
      contactRole: contactRole || null,
      organizationType,
      focus,
      cohortSize: cohortSize || null,
      goals,
      requestedPath,
      privacyConfirmed: true,
      status: "received",
    });

    await notifyEditorOfPartnerInquiry({ id, organizationName, contactName, organizationType, requestedPath });
    return Response.json({ reference: id }, { status: 201 });
  } catch (error) {
    console.error("Partner inquiry intake failed", error);
    return Response.json({ error: "We could not receive your inquiry. Try again shortly." }, { status: 500 });
  }
}
