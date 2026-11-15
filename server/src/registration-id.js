import { User, Cadet, Internship, RegistrationApplication } from "./models.js";

const categoryPrefixMap = {
  Member: "MEM",
  Members: "MEM",
  "Register Member": "MEM",
  Cadet: "CAD",
  Cadets: "CAD",
  "Register Cadets": "CAD",
  Volunteer: "VOL",
  Volunteers: "VOL",
  "Register Volunteers": "VOL",
  "Intern & Alumni": "INT",
  "Intern & Alumni Member": "INT",
  "Intern & Alumni Members": "INT",
  "Register Intern & Alumni Members": "INT",
  Internship: "INT",
};

export function getCategoryPrefix(category) {
  if (!category) return "MEM";
  for (const [key, prefix] of Object.entries(categoryPrefixMap)) {
    if (category.toLowerCase() === key.toLowerCase()) return prefix;
  }
  if (/cadet/i.test(category)) return "CAD";
  if (/volunteer/i.test(category)) return "VOL";
  if (/intern|alumni/i.test(category)) return "INT";
  return "MEM";
}

/**
 * Generates the next unique sequential Registration ID for the given category in the current year.
 * Examples: AGNI-MEM-2026-0001, AGNI-CAD-2026-0001, AGNI-VOL-2026-0001, AGNI-INT-2026-0001.
 */
export async function getNextRegistrationId(category) {
  const prefix = getCategoryPrefix(category);
  const year = new Date().getFullYear();
  const pattern = new RegExp(`^AGNI-${prefix}-${year}-(\\d+)$`, "i");

  const [users, cadets, internships, applications] = await Promise.all([
    User.find({ $or: [{ memberId: pattern }, { registrationNumber: pattern }] }).select("memberId registrationNumber").lean(),
    Cadet.find({ $or: [{ registrationId: pattern }, { registrationNumber: pattern }] }).select("registrationId registrationNumber").lean(),
    Internship.find({ $or: [{ registrationId: pattern }, { registrationNumber: pattern }] }).select("registrationId registrationNumber").lean(),
    RegistrationApplication.find({ $or: [{ registrationId: pattern }, { registrationNumber: pattern }] }).select("registrationId registrationNumber").lean(),
  ]);

  let maxNum = 0;
  const check = (idStr) => {
    if (!idStr) return;
    const match = String(idStr).trim().match(pattern);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  };

  users.forEach((u) => { check(u.memberId); check(u.registrationNumber); });
  cadets.forEach((c) => { check(c.registrationId); check(c.registrationNumber); });
  internships.forEach((i) => { check(i.registrationId); check(i.registrationNumber); });
  applications.forEach((a) => { check(a.registrationId); check(a.registrationNumber); });

  const nextNum = maxNum + 1;
  return `AGNI-${prefix}-${year}-${String(nextNum).padStart(4, "0")}`;
}

