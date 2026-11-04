import mongoose from "mongoose";
import { config } from "./config.js";
import { createApp } from "./app.js";
import { migrateLegacyData } from "./migrate-legacy-data.js";
const cfg = config();
try {
  await mongoose.connect(cfg.mongo, { dbName: cfg.dbName, serverSelectionTimeoutMS: 15000, appName: "agni-rural-welfare-society" });
} catch (error) {
  const diagnostic = String(error?.message || "connection failed").replaceAll(cfg.mongo, "[MONGODB_URI redacted]");
  const category = /auth|credential/i.test(error?.name + diagnostic) ? "authentication failed" : /ENOTFOUND|ECONN|server selection|timeout/i.test(error?.name + diagnostic) ? "network or Atlas host unreachable" : "connection failed";
  console.error(`MongoDB Atlas ${category}. Check the database user password, IP access list, cluster state, and MONGODB_URI in server/.env. Details: ${diagnostic.slice(0, 500)}`);
  process.exit(1);
}
try {
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
  await migrateLegacyData(mongoose.connection.db, cfg.encryptionKey);
} catch (error) {
  console.error(`MongoDB Atlas data migration failed (${error.name || "Error"}). No legacy source records were deleted.`);
  process.exit(1);
}
console.log(`MongoDB connected: ${mongoose.connection.name}`);
const server = createApp(cfg).listen(cfg.port, "0.0.0.0", () =>
  console.log(`Agni API listening on port ${cfg.port}`),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    }),
  );
