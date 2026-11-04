import multer from "multer";
import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const buckets = {};
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 6, fields: 60, fieldSize: 10000 },
});

function bucket(name) {
  if (!mongoose.connection.db) throw Object.assign(new Error("File storage is not connected."), { status: 503 });
  return buckets[name] ||= new GridFSBucket(mongoose.connection.db, { bucketName: name });
}

const acceptedDocument = (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const buffer = file.buffer;
  return (ext === ".pdf" && file.mimetype === "application/pdf" && buffer.subarray(0, 5).toString() === "%PDF-") ||
    (ext === ".doc" && file.mimetype === "application/msword" && buffer.subarray(0, 8).toString("hex") === "d0cf11e0a1b11ae1") ||
    (ext === ".docx" && file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && buffer.subarray(0, 4).toString("hex") === "504b0304" && buffer.includes(Buffer.from("[Content_Types].xml")) && buffer.includes(Buffer.from("word/document.xml")));
};

export async function saveUpload(file, folder, { isPublic = folder === "gallery" } = {}) {
  if (!file) return undefined;
  if (file.size > MAX_FILE_SIZE) throw Object.assign(new Error("Upload must be 2 MB or smaller."), { status: 413 });
  const isImage = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
  if (["photos", "gallery"].includes(folder) && !isImage)
    throw Object.assign(new Error("Choose a JPEG, PNG or WebP image."), { status: 400 });
  let buffer, mimetype, ext;
  if (isImage) {
    try {
      buffer = await sharp(file.buffer, { limitInputPixels: 25000000 }).rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
    } catch {
      throw Object.assign(new Error("The image could not be decoded."), { status: 400 });
    }
    mimetype = "image/jpeg";
    ext = ".jpg";
  } else if (acceptedDocument(file)) {
    buffer = file.buffer;
    mimetype = file.mimetype;
    ext = path.extname(file.originalname).toLowerCase();
  } else {
    throw Object.assign(new Error("Use a valid JPEG, PNG, WebP, PDF, DOC or DOCX file."), { status: 400 });
  }
  const bucketName = isPublic ? "publicFiles" : "privateFiles";
  const filename = `${randomUUID()}${ext}`;
  const id = new ObjectId();
  const uploadStream = bucket(bucketName).openUploadStream(filename, {
    id,
    contentType: mimetype,
    metadata: {
      originalName: path.basename(file.originalname).slice(0, 200),
      visibility: isPublic ? "public" : "private",
      category: folder,
    },
  });
  await new Promise((resolve, reject) => {
    uploadStream.once("error", reject);
    uploadStream.once("finish", resolve);
    uploadStream.end(buffer);
  });
  return { fileId: id.toString(), filename: path.basename(file.originalname).slice(0, 200), mimetype, size: buffer.length, bucket: bucketName };
}

export async function removeUpload(fileRef) {
  if (!fileRef?.fileId || !["privateFiles", "publicFiles"].includes(fileRef.bucket)) return;
  try { await bucket(fileRef.bucket).delete(new ObjectId(fileRef.fileId)); } catch { /* Cleanup is best effort after a failed document write. */ }
}

export async function getFileInfo(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  const objectId = new ObjectId(id);
  for (const name of ["publicFiles", "privateFiles"]) {
    const [file] = await bucket(name).find({ _id: objectId }).limit(1).toArray();
    if (file) return { file, bucketName: name, bucket: bucket(name) };
  }
  return null;
}

export async function getFileBuffer(fileRef) {
  if (!fileRef?.fileId || !["privateFiles", "publicFiles"].includes(fileRef.bucket)) return null;
  const info = await getFileInfo(fileRef.fileId);
  if (!info || info.bucketName !== fileRef.bucket) return null;
  return new Promise((resolve, reject) => {
    const chunks = [];
    const stream = info.bucket.openDownloadStream(info.file._id);
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.once("error", reject);
    stream.once("end", () => resolve(Buffer.concat(chunks)));
  });
}

export function pipeGridFile(info, res) {
  res.set({ "Content-Type": info.file.contentType || "application/octet-stream", "Content-Length": String(info.file.length), "Content-Disposition": `inline; filename="${String(info.file.metadata?.originalName || info.file.filename).replace(/[\r\n"\\]/g, "_")}"`, "X-Content-Type-Options": "nosniff", "Cache-Control": info.bucketName === "privateFiles" ? "private, no-store" : "public, max-age=86400" });
  info.bucket.openDownloadStream(info.file._id).on("error", (error) => { if (!res.headersSent) res.status(404).json({ message: "File not found." }); else res.end(); }).pipe(res);
}
