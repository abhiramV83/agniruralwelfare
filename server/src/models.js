import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
const { Schema, model } = mongoose;
const text = (required = false, maxlength = 200) => ({
  type: String,
  trim: true,
  required,
  maxlength,
});
const userSchema = new Schema(
  {
    fullName: text(true, 100),
    username: { ...text(true, 40), unique: true, lowercase: true },
    email: { ...text(true, 254), lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["member", "admin"], default: "member" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    approvedAt: { type: Date, default: null },
    registrationType: {
      type: String,
      enum: ["Register Member", "Register Cadets", "Register Volunteers", "Register Intern & Alumni Members"],
      default: "Register Member",
    },
    registrationDetails: { type: Schema.Types.Mixed, default: {} },
    guardian: text(false, 100),
    address: text(false, 1000),
    bloodGroup: text(false, 20),
    dob: text(false, 10),
    enrollmentDate: text(false, 10),
    photo: { type: Schema.Types.Mixed, default: null },
    cv: { type: Schema.Types.Mixed, default: null },
    membershipProof: { type: Schema.Types.Mixed, default: null },
    memberSignature: { type: Schema.Types.Mixed, default: null },
    supportingDocument: { type: Schema.Types.Mixed, default: null },
    workSample: { type: Schema.Types.Mixed, default: null },
    memberId: {
      type: String,
      default: () => `AGNI-${randomUUID()}`,
      unique: true,
    },
  },
  { timestamps: true, collection: "users" },
);
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});
export const User = model("User", userSchema);
export const Session = model(
  "Session",
  new Schema(
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      tokenHash: { type: String, unique: true, required: true },
      remember: { type: Boolean, default: false },
      expiresAt: { type: Date, required: true, index: { expires: 0 } },
    },
    { timestamps: true, collection: "sessions" },
  ),
);
const applicationBase = {
  registrationId: {
    type: String,
    unique: true,
    default: () => `ARWS-${randomUUID()}`,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  approvedAt: { type: Date, default: null },
  fullName: text(true, 100),
  email: text(true, 254),
  phone: text(true, 30),
  address: text(true, 1000),
};
export const Cadet = model(
  "Cadet",
  new Schema(
    {
      recordKind: { type: String, enum: ["cadetEnrollment"], default: "cadetEnrollment" },
      ...applicationBase,
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      guardian: text(true, 100),
      guardianPhone: text(true, 30),
      dob: text(true, 10),
      age: text(false, 3),
      qualification: text(true, 200),
      school: text(true, 200),
      institution: text(true, 200),
      bloodGroup: text(true, 5),
      introducerName: text(),
      introducerCode: text(false, 50),
      introducerPhone: text(false, 30),
      enrollmentDate: text(false, 10),
      guardianDeclaration: { type: Boolean, required: true },
      finalConfirmation: { type: Boolean, required: true },
      place: text(true, 100),
      declarationDate: text(true, 10),
      qualificationProof: { type: Schema.Types.Mixed, default: null },
      guardianSignature: { type: Schema.Types.Mixed, default: null },
      cadetSignature: { type: Schema.Types.Mixed, default: null },
      gender: text(true, 20),
      photo: { type: Schema.Types.Mixed, default: null },
      fatherName: text(true, 100),
      fatherOccupation: text(),
      motherName: text(true, 100),
      motherOccupation: text(),
      citizenship: text(true),
      village: text(true),
      tehsil: text(true),
      district: text(true),
      pincode: text(true, 20),
      postOffice: text(true),
      railwayStation: text(),
      training: text(true),
      residentialAddress: text(true, 1000),
      demo: { type: Boolean, default: true, immutable: true },
    },
    { timestamps: true, strict: "throw", collection: "registrations" },
  ),
);
export const Internship = model(
  "Internship",
  new Schema(
    {
      ...applicationBase,
      gender: text(true, 40),
      position: text(true, 200),
      qualification: text(true, 200),
      institute: text(true, 200),
      jobPortal: text(false, 200),
      motivation: text(true, 3000),
      applicationDate: text(true, 10),
      consent: { type: Boolean, required: true },
      cv: { type: Schema.Types.Mixed, required: true },
      demo: { type: Boolean, default: true, immutable: true },
    },
    { timestamps: true, collection: "internshipApplications" },
  ),
);
export const RegistrationApplication = model(
  "RegistrationApplication",
  new Schema(
    {
      recordKind: { type: String, enum: ["formRegistration"], default: "formRegistration" },
      registrationId: { type: String, unique: true, default: () => `ARWS-${randomUUID()}` },
      type: { type: String, enum: ["Member", "Cadet", "Volunteer", "Intern & Alumni Member"], required: true },
      data: { type: Schema.Types.Mixed, required: true },
      attachments: [{ name: text(false, 200), fileId: text(true, 80), filename: text(true, 200), mimetype: text(true, 120), size: { type: Number, required: true }, bucket: { type: String, enum: ["privateFiles", "publicFiles"], required: true } }],
      status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
      approvedAt: { type: Date, default: null },
      demo: { type: Boolean, default: true, immutable: true },
    },
    { timestamps: true, strict: "throw", collection: "registrations" },
  ),
);
export const Pledge = model(
  "Pledge",
  new Schema(
    {
      reference: {
        type: String,
        default: () => `PLEDGE-${randomUUID()}`,
        unique: true,
      },
      kind: { type: String, enum: ["Donate", "Membership"], required: true },
      membershipType: { type: String, enum: ["monthly", "yearly"] },
      amount: { type: Number, min: 1, max: 1000000, required: true },
      fullName: text(true, 100),
      email: text(true, 254),
      phone: text(true, 30),
      demo: { type: Boolean, default: true, immutable: true },
    },
    { timestamps: true, collection: "pledges" },
  ),
);
export const Gallery = model(
  "Gallery",
  new Schema(
    {
      src: text(true),
      alt: text(true, 200),
      referenceIndex: Number,
      file: { type: Schema.Types.Mixed, default: null },
      order: { type: Number, required: true },
    },
    { timestamps: true, collection: "galleryItems" },
  ),
);
export const SiteContent = model("SiteContent", new Schema({
  key: { type: String, required: true, unique: true, default: "site" },
  content: { type: Schema.Types.Mixed, required: true },
  sourceHash: { type: String },
}, { timestamps: true, collection: "siteContent" }));
