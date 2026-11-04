import { registrationRepository } from "./registration.repository.js";

const allowedTypes = new Set(["Member", "Cadet", "Volunteer", "Intern & Alumni Member"]);

export function parseRegistrationApplication(body) {
  if (!allowedTypes.has(body.type)) return { error: "Choose a valid registration type." };
  let source;
  try { source = JSON.parse(body.data || "{}"); }
  catch { return { error: "Registration details are invalid." }; }
  if (!source || typeof source !== "object" || Array.isArray(source)) return { error: "Registration details are invalid." };
  const data = Object.fromEntries(Object.entries(source)
    .filter(([key, value]) => !/(?:income)/i.test(key) && (typeof value === "string" || (Array.isArray(value) && value.every((entry) => typeof entry === "string"))))
    .map(([key, value]) => [key, (Array.isArray(value) ? value.join(", ") : value).slice(0, 5000)]));
  return { value: { type: body.type, data } };
}

export async function createRegistrationApplication(payload, attachments) {
  const item = await registrationRepository.createApplication({ ...payload, attachments });
  const messages = {
    Member: "✓ Payment verified successfully. Your Member registration has been submitted to the Administrator Portal for verification and approval.",
    Cadet: "✓ Cadet enrollment form submitted successfully.",
    Volunteer: "✓ Volunteer registration submitted successfully.",
    "Intern & Alumni Member": "✓ Internship application submitted successfully.",
  };
  return { registrationId: item.registrationId, status: item.status, message: messages[payload.type] };
}
