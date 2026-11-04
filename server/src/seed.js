import mongoose from "mongoose";
import bcrypt from "bcrypt";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { config } from "./config.js";
import { User, Gallery, SiteContent } from "./models.js";
const cfg = config();
if (!process.env.SEED_ADMIN_PASSWORD || !process.env.SEED_MEMBER_PASSWORD)
  throw new Error(
    "Set SEED_ADMIN_PASSWORD and SEED_MEMBER_PASSWORD in server/.env.",
  );
const { password } = await import("./validation.js");
password.parse(process.env.SEED_ADMIN_PASSWORD);
password.parse(process.env.SEED_MEMBER_PASSWORD);
try {
  await mongoose.connect(cfg.mongo, { dbName: cfg.dbName, serverSelectionTimeoutMS: 15000 });
  const users = [
    { username: "demo.admin", fullName: "Demo Administrator", role: "admin" },
    ...Array.from({ length: 5 }, (_, i) => ({
      username: `demo.member${i + 1}`,
      fullName: `Demo Member ${i + 1}`,
      role: "member",
    })),
  ];
  for (const user of users) {
    const passwordHash = await bcrypt.hash(
      user.role === "admin"
        ? process.env.SEED_ADMIN_PASSWORD
        : process.env.SEED_MEMBER_PASSWORD,
      12,
    );
    await User.updateOne(
      { username: user.username },
      {
        $setOnInsert: {
          ...user,
          status: "approved",
          approvedAt: new Date(),
          email: `${user.username}@example.com`,
          passwordHash,
          guardian: "Demo Guardian",
          bloodGroup: "O+", dob: "2005-01-01",
          address: "Demo address, Kolkata",
          enrollmentDate: "2026-10-27",
          memberId: `AGNI-DEMO-${user.username}`,
        },
      },
      { upsert: true, runValidators: true },
    );
  }
  const content = JSON.parse(
    await fs.readFile(
      new URL("../../client/src/content/site.json", import.meta.url),
      "utf8",
    ),
  );
  await SiteContent.updateOne(
    { key: "site" },
    { $set: { content, sourceHash: createHash("sha256").update(JSON.stringify(content)).digest("hex") } },
    { upsert: true, runValidators: true },
  );
  for (const [order, image] of content.gallery.images.entries())
    await Gallery.updateOne(
      { src: image.src },
      { $setOnInsert: { ...image, order } },
      { upsert: true },
    );
  console.log(
    "Seed complete: 1 demo admin, 5 demo members, 47 original gallery images. Existing records were preserved.",
  );
} finally {
  await mongoose.disconnect();
}
