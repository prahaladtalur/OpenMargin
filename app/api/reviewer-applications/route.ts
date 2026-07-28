import { ensureOperationsTables, getDb } from "../../../db";
import { reviewerApplications } from "../../../db/schema";
import { notifyEditorOfReviewerApplication } from "../../../lib/notifications";

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

    const fullName = value(form, "fullName", 120);
    const email = value(form, "email", 254).toLowerCase();
    const ageBand = value(form, "ageBand", 10);
    const guardianEmail = value(form, "guardianEmail", 254).toLowerCase();
    const role = value(form, "role", 80);
    const disciplines = value(form, "disciplines", 280);
    const experience = value(form, "experience", 1600);
    const availability = value(form, "availability", 500);
    const statement = value(form, "statement", 1600);

    if (!fullName || !/^\S+@\S+\.\S+$/.test(email)) return invalid("Enter a valid name and email address.");
    if (!["14-17", "18-19", "adult"].includes(ageBand)) return invalid("Select an age band.");
    if (ageBand === "14-17" && !/^\S+@\S+\.\S+$/.test(guardianEmail)) return invalid("Applicants ages 14–17 need to provide a guardian email.");
    if (!role || !disciplines || experience.length < 80 || !availability || statement.length < 80) return invalid("Tell us about your interests, experience, availability, and motivation.");
    if (form.get("ethicsConfirmed") !== "on" || form.get("privacyConfirmed") !== "on") return invalid("Confirm the ethics and privacy declarations.");
    if (ageBand === "14-17" && form.get("guardianConfirmed") !== "on") return invalid("Guardian permission is required for applicants ages 14–17.");

    const id = `RV-${new Date().getUTCFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    await ensureOperationsTables();
    await getDb().insert(reviewerApplications).values({
      id,
      fullName,
      email,
      ageBand,
      guardianEmail: ageBand === "14-17" ? guardianEmail : null,
      role,
      disciplines,
      experience,
      availability,
      statement,
      ethicsConfirmed: true,
      privacyConfirmed: true,
      status: "received",
    });

    await notifyEditorOfReviewerApplication({ id, fullName, role, disciplines });
    return Response.json({ reference: id }, { status: 201 });
  } catch (error) {
    console.error("Reviewer application intake failed", error);
    return Response.json({ error: "We could not receive your application. Please try again shortly." }, { status: 500 });
  }
}
