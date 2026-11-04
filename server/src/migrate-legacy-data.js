import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { saveUpload } from "./uploads.js";
import { encryptSensitiveFields } from "./field-encryption.js";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const uploadRoot = path.join(serverRoot, "uploads");
const mimeByExtension = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
  ".pdf": "application/pdf", ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

async function importLegacyFile(reference, { isPublic = false } = {}) {
  if (!reference || typeof reference !== "string") return reference || null;
  let relative = reference.replace(/^\/+/, "").replace(/^uploads\//i, "").replaceAll("\\", "/");
  if (relative.includes("..") || path.isAbsolute(relative)) return null;
  const absolute = path.resolve(uploadRoot, relative);
  if (!absolute.startsWith(uploadRoot + path.sep)) return null;
  try {
    const buffer = await fs.readFile(absolute);
    const originalname = path.basename(relative);
    const mimetype = mimeByExtension[path.extname(originalname).toLowerCase()];
    if (!mimetype) return null;
    return await saveUpload({ originalname, mimetype, buffer, size: buffer.length }, isPublic ? "gallery" : mimetype.startsWith("image/") ? "photos" : "cv", { isPublic });
  } catch {
    return null;
  }
}

async function moveRecordFiles(record, { isPublicGallery = false } = {}) {
  const next = { ...record };
  if (isPublicGallery && typeof next.src === "string" && next.src.startsWith("/uploads/")) {
    const file = await importLegacyFile(next.src, { isPublic: true });
    if (file?.fileId) {
      next.file = file;
      next.src = `/api/files/${file.fileId}`;
    }
  }
  const privateKeys = ["photo", "cv", "membershipProof", "memberSignature", "supportingDocument", "workSample", "qualificationProof", "guardianSignature", "cadetSignature"];
  for (const key of privateKeys) {
    if (typeof next[key] === "string") {
      const file = await importLegacyFile(next[key]);
      if (file?.fileId) next[key] = file;
    }
  }
  if (Array.isArray(next.attachments)) {
    next.attachments = await Promise.all(next.attachments.map(async (attachment) => {
      if (!attachment?.path) return attachment;
      const file = await importLegacyFile(attachment.path);
      return file?.fileId
        ? { name: attachment.name || file.filename, fileId: file.fileId, filename: file.filename, mimetype: file.mimetype, size: file.size, bucket: file.bucket }
        : { name: attachment.name || path.basename(attachment.path), filename: attachment.name || path.basename(attachment.path), mimetype: attachment.mimeType || "application/octet-stream", size: 0, bucket: "privateFiles", legacyFileUnavailable: true };
    }));
  }
  return next;
}

async function copyCollection(db, sourceName, targetName, transform, existsFilter = (record) => ({ _id: record._id })) {
  const source = db.collection(sourceName);
  const target = db.collection(targetName);
  let copied = 0;
  for await (const original of source.find({})) {
    if (await target.findOne(existsFilter(original), { projection: { _id: 1 } })) continue;
    const transformed = await transform(original, source);
    try { await target.insertOne(transformed); copied += 1; }
    catch (error) { if (error.code !== 11000) throw error; }
  }
  return copied;
}

/** Idempotently copy pre-Atlas-schema collections and upload files into the current Atlas layout. */
export async function migrateLegacyData(db, encryptionKey) {
  let filesUpdated = 0;
  const users = db.collection("users");
  for await (const user of users.find({})) {
    const moved = await moveRecordFiles(user);
    const updates = {};
    const encryptedDetails = encryptSensitiveFields(user.registrationDetails || {}, encryptionKey);
    if (JSON.stringify(encryptedDetails) !== JSON.stringify(user.registrationDetails || {})) updates.registrationDetails = encryptedDetails;
    for (const key of ["photo", "cv", "membershipProof", "memberSignature", "supportingDocument", "workSample"])
      if (moved[key] && moved[key] !== user[key]) updates[key] = moved[key];
    if (Object.keys(updates).length) { await users.updateOne({ _id: user._id }, { $set: updates }); filesUpdated += Object.keys(updates).length; }
  }
  const cadets = await copyCollection(db, "cadets", "registrations", async (record) => ({ ...(await moveRecordFiles(record)), recordKind: "cadetEnrollment" }));
  const oldDetailed = db.collection("registrationapplications");
  for await (const record of oldDetailed.find({})) {
    const data = encryptSensitiveFields(record.data || {}, encryptionKey);
    if (JSON.stringify(data) !== JSON.stringify(record.data || {}))
      await oldDetailed.updateOne({ _id: record._id }, { $set: { data } });
  }
  const detailed = await copyCollection(db, "registrationapplications", "registrations", async (record) => ({ ...(await moveRecordFiles(record)), recordKind: "formRegistration" }));
  const internships = await copyCollection(db, "internships", "internshipApplications", (record) => moveRecordFiles(record));
  const galleries = await copyCollection(db, "galleries", "galleryItems", (record) => moveRecordFiles(record, { isPublicGallery: true }), (record) => record.src ? { src: record.src } : { _id: record._id });
  const total = cadets + detailed + internships + galleries + filesUpdated;
  if (total) console.log(`Legacy Atlas data copied without deleting source records (records: ${cadets + detailed + internships + galleries}; file fields migrated: ${filesUpdated}).`);
}
