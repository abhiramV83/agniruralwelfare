import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const sensitiveKey = /(?:aadhaar|aadhar|pan|bankaccount(?:number)?|ifsc)/i;
function keyBytes(secret) {
  if (/^[a-f0-9]{64}$/i.test(secret)) return Buffer.from(secret, "hex");
  const normalized = secret.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="), "base64");
}
export function encryptSensitiveFields(value, secret) {
  if (Array.isArray(value)) return value.map((entry) => encryptSensitiveFields(entry, secret));
  if (!value || typeof value !== "object" || Buffer.isBuffer(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => {
    if (sensitiveKey.test(key) && typeof entry === "string" && entry && !entry.startsWith("enc:v1:")) {
      const iv = randomBytes(12);
      const cipher = createCipheriv("aes-256-gcm", keyBytes(secret), iv);
      const encrypted = Buffer.concat([cipher.update(entry, "utf8"), cipher.final()]);
      return [key, `enc:v1:${iv.toString("base64url")}:${cipher.getAuthTag().toString("base64url")}:${encrypted.toString("base64url")}`];
    }
    return [key, encryptSensitiveFields(entry, secret)];
  }));
}
export function maskSensitiveFields(value) {
  if (Array.isArray(value)) return value.map(maskSensitiveFields);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => {
    if (sensitiveKey.test(key) && typeof entry === "string") {
      const raw = entry.startsWith("enc:v1:") ? "" : entry;
      return [key, raw.length >= 4 ? `${"•".repeat(Math.min(8, raw.length - 4))}${raw.slice(-4)}` : "••••"];
    }
    return [key, maskSensitiveFields(entry)];
  }));
}
export function decryptField(value, secret) {
  if (typeof value !== "string" || !value.startsWith("enc:v1:")) return value;
  const [, , iv, tag, payload] = value.split(":");
  const decipher = createDecipheriv("aes-256-gcm", keyBytes(secret), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(payload, "base64url")), decipher.final()]).toString("utf8");
}
