import { z } from "zod";
const s = (max = 200) => z.string().trim().min(1, "Required").max(max);
const email = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((v) => v.toLowerCase());
const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date")
  .refine((v) => {
    const d = new Date(v + "T00:00:00Z");
    return !Number.isNaN(+d) && d.toISOString().slice(0, 10) === v;
  }, "Use a valid date");
const optionalDate = z.union([date, z.literal("")]).optional();
const consent = z
  .union([z.literal(true), z.literal("true")])
  .transform(() => true);
export const password = z
  .string()
  .min(10)
  .max(72)
  .regex(/[A-Z]/)
  .regex(/[a-z]/)
  .regex(/[0-9]/)
  .refine(
    (v) => Buffer.byteLength(v, "utf8") <= 72,
    "Password must fit within 72 bytes",
  );
export const registerSchema = z
  .object({
    registrationType: z.enum([
      "Register Member",
      "Register Cadets",
      "Register Volunteers",
      "Register Intern & Alumni Members",
    ]).default("Register Member"),
    registrationDetails: z.record(z.string().max(80), z.string().max(3000)).optional(),
    fullName: s(100),
    username: s(40)
      .regex(/^[a-zA-Z0-9_.-]{3,40}$/)
      .transform((v) => v.toLowerCase()),
    email,
    password,
    guardian: z.string().trim().max(100).optional(),
    address: z.string().trim().max(1000).optional(),
    bloodGroup: z.string().trim().max(20).optional(),
    dob: optionalDate,
    enrollmentDate: optionalDate,
    consent,
  })
  .strict();
export const loginSchema = z
  .object({
    username: s(40).transform((v) => v.toLowerCase()),
    password: z.string().min(1).max(72),
    remember: z.boolean().optional(),
  })
  .strict();
const base = {
  fullName: s(100),
  email,
  phone: z
    .string()
    .trim()
    .regex(/^[+\d ()-]{7,30}$/, "Use a valid phone number"),
  address: s(1000),
};
export const cadetSchema = z
  .object({
    ...base,
    guardian: s(100),
    guardianPhone: base.phone,
    dob: date,
    age: z.string().max(3).optional(),
    qualification: s(),
    school: s(),
    institution: s(),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
    introducerName: z.string().trim().max(100).optional(),
    introducerCode: z.string().trim().max(50).optional(),
    introducerPhone: z.string().trim().max(30).optional(),
    enrollmentDate: optionalDate,
    guardianDeclaration: consent,
    finalConfirmation: consent,
    place: s(100),
    declarationDate: date,
    gender: z.enum(["Male", "Female"]),
    fatherName: s(100),
    fatherOccupation: z.string().trim().max(200).optional(),
    motherName: s(100),
    motherOccupation: z.string().trim().max(200).optional(),
    citizenship: z.enum(["India", "Nepal"]),
    village: s(),
    tehsil: s(),
    district: s(),
    pincode: s(20),
    postOffice: s(),
    railwayStation: z.string().trim().max(200).optional(),
    training: z.enum(["Yes", "No"]),
    residentialAddress: s(1000),
  })
  .strict();
export const internshipSchema = z
  .object({
    ...base,
    gender: z.enum(["Male", "Female"]),
    position: z.enum([
      "Volunteer Trainer (NCC C Certificate Internship)",
      "NGO Fundraising & Field Coordinator Internship",
    ]),
    qualification: s(),
    institute: s(),
    jobPortal: z.string().trim().max(200).optional(),
    motivation: s(3000),
    applicationDate: date,
    consent,
  })
  .strict();
export const pledgeSchema = z
  .object({
    fullName: s(100),
    email,
    phone: base.phone,
    kind: z.enum(["Donate", "Membership"]),
    membershipType: z.enum(["monthly", "yearly"]).optional(),
    amount: z.coerce.number().finite().min(1).max(1000000),
  })
  .strict();
