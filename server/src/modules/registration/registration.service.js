import { registrationRepository } from "./registration.repository.js";

const allowedTypes = new Set(["Member", "Cadet", "Volunteer", "Intern & Alumni Member"]);

export function normalizeRegistrationType(type) {
  if (!type) return null;
  const t = String(type).trim();
  if (allowedTypes.has(t)) return t;
  if (/^intern/i.test(t) || /^alumni/i.test(t)) return "Intern & Alumni Member";
  if (/^member/i.test(t)) return "Member";
  if (/^cadet/i.test(t)) return "Cadet";
  if (/^volunteer/i.test(t)) return "Volunteer";
  return null;
}

export function parseRegistrationApplication(body) {
  const type = normalizeRegistrationType(body.type);
  if (!type) return { error: "Choose a valid registration type." };
  let source;
  try { source = JSON.parse(body.data || "{}"); }
  catch { return { error: "Registration details are invalid." }; }
  if (!source || typeof source !== "object" || Array.isArray(source)) return { error: "Registration details are invalid." };
  const data = Object.fromEntries(Object.entries(source)
    .filter(([key, value]) => !/(?:aadhaar|aadhar|pan|income|bankaccount|ifsc)/i.test(key) && (typeof value === "string" || (Array.isArray(value) && value.every((entry) => typeof entry === "string"))))
    .map(([key, value]) => [key, (Array.isArray(value) ? value.join(", ") : value).slice(0, 5000)]));
  return { value: { type, data } };
}

export async function createRegistrationApplication(payload, attachments) {
  const item = await registrationRepository.createApplication({ ...payload, attachments });
  const messages = {
    Member: "Your Member Registration form is submitted successfully!\n\nThank You for Your Support!\n\nYour kindness and generosity help us create a better tomorrow.",
    Cadet: "Your Cadet Enrollment form is submitted successfully!\n\nThank You for Your Support!\n\nYour kindness and generosity help us create a better tomorrow.",
    Volunteer: "Your Volunteer Registration form is submitted successfully!\n\nThank You for Your Support!\n\nYour kindness and generosity help us create a better tomorrow.",
    "Intern & Alumni Member": "Your Internship & Alumni Application form is submitted successfully!\n\nThank You for Your Support!\n\nYour kindness and generosity help us create a better tomorrow.",
  };
  return { registrationId: item.registrationId, status: item.status, message: messages[payload.type] };
}
