import mongoose from "mongoose";
import { writeSync } from "node:fs";
import { config } from "./config.js";
import { createApp } from "./app.js";
import { migrateLegacyData } from "./migrate-legacy-data.js";
// Render captures piped output. Synchronous writes preserve the last diagnostic
// even when startup must exit immediately; never log raw database errors/URIs.
const startupLog = (message) => writeSync(1, `[startup] ${message}\n`);
let cfg;
try {
  cfg = config();
} catch {
  startupLog("Configuration invalid. Check MONGODB_URI, JWT_ACCESS_SECRET (at least 32 characters), and FIELD_ENCRYPTION_KEY (32-byte hex/base64url) in the hosting environment or server/.env.");
  process.exit(1);
}
startupLog("Configuration loaded. Connecting to MongoDB Atlas...");
try {
  await mongoose.connect(cfg.mongo, { dbName: cfg.dbName, serverSelectionTimeoutMS: 15000, appName: "agni-rural-welfare-society" });
} catch (error) {
  const diagnostic = `${error?.name || ""} ${error?.message || ""}`;
  const category = error?.code === 18 || /auth|credential/i.test(diagnostic) ? "authentication failed: check the Atlas database username and password in MONGODB_URI; URL-encode special password characters" : /ENOTFOUND|ECONN|server selection|timeout/i.test(diagnostic) ? "network or host unreachable: check the cluster hostname, cluster state, and Atlas Network Access for this server's outbound IP addresses" : "connection failed: check MONGODB_URI and Atlas cluster settings";
  startupLog(`MongoDB Atlas ${category}. Update the hosting environment variables or server/.env. No credentials logged.`);
  process.exit(1);
}
startupLog("MongoDB connected. Initializing indexes...");
try {
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
  startupLog("Indexes ready. Migrating legacy data...");
  await migrateLegacyData(mongoose.connection.db, cfg.encryptionKey);
} catch (error) {
  startupLog("MongoDB index initialization or legacy migration failed. Check database permissions and existing indexes. No legacy source records were deleted.");
  process.exit(1);
}
startupLog("Database initialization complete. Starting HTTP server...");
const server = createApp(cfg).listen(cfg.port, "0.0.0.0", () =>
  console.log(`Agni API listening on port ${cfg.port}`),
);
server.on("error", () => {
  startupLog("HTTP server failed to listen. Check PORT and whether another process is using it.");
  process.exit(1);
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    }),
  );
