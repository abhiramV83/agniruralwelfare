import bcrypt from "bcrypt";
import { User, RegistrationApplication } from "../../models.js";
import { registerSchema } from "../../validation.js";
import { issueSession } from "../../auth.js";
import { saveUpload, removeUpload } from "../../uploads.js";
import { createRegistrationApplication, parseRegistrationApplication } from "./registration.service.js";
import { encryptSensitiveFields } from "../../field-encryption.js";

export async function registerAccount(req, res, cfg) {
  if (typeof req.body.registrationDetails === "string") {
    try { req.body.registrationDetails = JSON.parse(req.body.registrationDetails); }
    catch { return res.status(400).json({ message: "Invalid registration details." }); }
  }
  const data = registerSchema.parse(req.body);
  if (await User.exists({ username: data.username }))
    return res.status(409).json({ message: "Username is already in use." });
  const photo = await saveUpload(req.files?.photo?.[0], "photos");
  let cv, membershipProof, memberSignature, supportingDocument, workSample;
  try {
    cv = await saveUpload(req.files?.cv?.[0], "cv");
    membershipProof = await saveUpload(req.files?.membershipProof?.[0], "cv");
    memberSignature = await saveUpload(req.files?.memberSignature?.[0], "photos");
    supportingDocument = await saveUpload(req.files?.supportingDocument?.[0], "cv");
    workSample = await saveUpload(req.files?.workSample?.[0], "cv");
    const { password, consent, ...profile } = data;
    const applicationType = { "Register Member": "Member", "Register Cadets": "Cadet", "Register Volunteers": "Volunteer", "Register Intern & Alumni Members": "Intern & Alumni Member" }[data.registrationType || "Register Member"];
    const previousApplication = await RegistrationApplication.findOne({
      type: applicationType,
      status: { $in: ["pending", "approved", "rejected"] },
      $or: [{ "data.email": data.email.toLowerCase() }, { "data.memberEmail": data.email.toLowerCase() }],
    }).sort({ createdAt: -1 });
    const inheritedPhotoAttachment = previousApplication?.attachments?.find((file) => file.mimetype?.startsWith("image/"));
    const inheritedPhoto = inheritedPhotoAttachment ? { fileId: inheritedPhotoAttachment.fileId, filename: inheritedPhotoAttachment.filename, mimetype: inheritedPhotoAttachment.mimetype, size: inheritedPhotoAttachment.size, bucket: inheritedPhotoAttachment.bucket } : null;
    profile.registrationDetails = encryptSensitiveFields(profile.registrationDetails || {}, cfg.encryptionKey);
    const user = await User.create({
      ...profile,
      ...(previousApplication ? { registrationDetails: { ...(profile.registrationDetails || {}), ...previousApplication.data } } : {}),
      photo: photo || inheritedPhoto,
      cv, membershipProof, memberSignature, supportingDocument, workSample,
      status: previousApplication?.status || "pending",
      approvedAt: previousApplication?.approvedAt || null,
      passwordHash: await bcrypt.hash(password, 12),
    });
    return res.status(201).json(await issueSession(user, res, cfg));
  } catch (error) {
    await Promise.all([photo, cv, membershipProof, memberSignature, supportingDocument, workSample].filter(Boolean).map((file) => removeUpload(file)));
    throw error;
  }
}

export async function submitRegistrationApplication(req, res, cfg) {
  const parsed = parseRegistrationApplication(req.body);
  if (parsed.error) return res.status(400).json({ message: parsed.error });
  const { type, data } = parsed.value;
  const attachments = [];
  try {
    for (const file of req.files || []) {
      const folder = file.mimetype.startsWith("image/") ? "photos" : "cv";
      const saved = await saveUpload(file, folder);
      attachments.push({ name: saved.filename, fileId: saved.fileId, filename: saved.filename, mimetype: saved.mimetype, size: saved.size, bucket: saved.bucket });
    }
    const result = await createRegistrationApplication({ type, data: encryptSensitiveFields(data, cfg.encryptionKey) }, attachments);
    return res.status(201).json(result);
  } catch (error) {
    await Promise.all(attachments.map((file) => removeUpload(file)));
    throw error;
  }
}
