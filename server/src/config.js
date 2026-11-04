import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
export const serverRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
dotenv.config({ path: path.join(serverRoot, ".env") });
export function config() {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (
    !secret ||
    secret.length < 32 ||
    /^(replace|generate|change)/i.test(secret)
  )
    throw new Error(
      "JWT_ACCESS_SECRET must contain a generated secret of at least 32 characters. Copy server/.env.example to server/.env and generate a secret.",
    );
  const clientOrigins = (process.env.CLIENT_ORIGIN || "http://127.0.0.1:5173")
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const origin = clientOrigins[0];
  const mongo = process.env.MONGODB_URI;
  if (!mongo || !/^mongodb(?:\+srv)?:\/\//i.test(mongo))
    throw new Error("MONGODB_URI is missing or invalid. Set the Atlas connection string in server/.env.");
  const encryptionKey = process.env.FIELD_ENCRYPTION_KEY;
  if (!encryptionKey || !/^(?:[a-f0-9]{64}|[A-Za-z0-9_-]{43}=?)$/i.test(encryptionKey))
    throw new Error("FIELD_ENCRYPTION_KEY must be a 32-byte hex or base64url key. Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"");
  return {
    secret,
    origin,
    clientOrigins,
    production: process.env.NODE_ENV === "production",
    port: Number(process.env.PORT || 5000),
    mongo,
    dbName: process.env.MONGODB_DATABASE || "agni_rural_welfare",
    encryptionKey,
  };
}
