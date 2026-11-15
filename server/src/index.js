import mongoose from "mongoose";
import { writeSync } from "node:fs";
import { config } from "./config.js";
import { createApp } from "./app.js";
import { migrateLegacyData } from "./migrate-legacy-data.js";
import { verifySmtpConnection } from "./email.js";
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
let mongodInstance = null;
startupLog("Configuration loaded. Connecting to MongoDB...");
if (process.env.NODE_ENV === "production") {
  mongoose.set("autoIndex", false);
  mongoose.set("debug", false);
}
try {
  await mongoose.connect(cfg.mongo, {
    dbName: cfg.dbName,
    serverSelectionTimeoutMS: 5000,
    appName: "agni-rural-welfare-society",
    autoIndex: process.env.NODE_ENV !== "production",
  });
} catch (error) {
  if (process.env.NODE_ENV !== "production") {
    startupLog("External MongoDB not reachable. Initializing local database with cached engine...");
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const path = await import("node:path");
      const fs = await import("node:fs");
      const { fileURLToPath } = await import("node:url");
      const dir = path.dirname(fileURLToPath(import.meta.url));
      const binaryPath = path.resolve(dir, "../node_modules/.cache/mongodb-memory-server/mongod-x64-win32-7.0.24.exe");
      const dbPath = path.resolve(dir, "../.local_mongodb_data");
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      } else {
        const lockFile = path.join(dbPath, "mongod.lock");
        for (let attempt = 0; attempt < 5; attempt++) {
          if (!fs.existsSync(lockFile)) break;
          try {
            fs.unlinkSync(lockFile);
            break;
          } catch (_err) {
            await new Promise((r) => setTimeout(r, 600));
          }
        }
      }
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          mongodInstance = await MongoMemoryServer.create({
            binary: { systemBinary: binaryPath },
            instance: { dbName: cfg.dbName, dbPath },
          });
          break;
        } catch (err) {
          if (attempt === 3) throw err;
          await new Promise((r) => setTimeout(r, 1000));
          const lockFile = path.join(dbPath, "mongod.lock");
          try { if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile); } catch {}
        }
      }
      const cleanup = async () => {
        if (mongodInstance) {
          try { await mongodInstance.stop(); } catch {}
        }
      };
      process.once("SIGINT", cleanup);
      process.once("SIGTERM", cleanup);
      process.once("exit", cleanup);
      const uri = mongodInstance.getUri();
      await mongoose.connect(uri, { dbName: cfg.dbName });
      startupLog(`Connected to local database. Seeding initial accounts and content...`);
      const { seedDatabase } = await import("./seed.js");
      await seedDatabase();
    } catch (localError) {
      startupLog(`Failed to start local database fallback: ${localError?.message || localError}`);
      process.exit(1);
    }
  } else {
    // Server selection errors wrap the useful authentication/DNS/socket error
    // inside topology descriptions. Inspect those causes without printing values.
    const pending = [error];
    const seen = new Set();
    const diagnostics = [];
    while (pending.length && seen.size < 30) {
      const current = pending.shift();
      if (!current || typeof current !== "object" || seen.has(current)) continue;
      seen.add(current);
      diagnostics.push(`${current.name || ""} ${current.code || ""} ${current.codeName || ""} ${current.message || ""}`);
      if (current.cause) pending.push(current.cause);
      if (current.reason?.servers instanceof Map) {
        for (const server of current.reason.servers.values()) {
          if (server.error) pending.push(server.error);
        }
      }
    }
    const diagnostic = diagnostics.join(" ");
    const category = /18|8000|AuthenticationFailed|auth|credential/i.test(diagnostic) ? "authentication failed: check the Atlas database username and password in MONGODB_URI; URL-encode special password characters" : /ENOTFOUND|ECONN|server selection|timeout|ETIMEDOUT|ETIMEOUT/i.test(diagnostic) ? "network or host unreachable: check the cluster hostname, cluster state, and Atlas Network Access for this server's outbound IP addresses" : "connection failed: check MONGODB_URI and Atlas cluster settings";
    startupLog(`MongoDB Atlas ${category}. Update the hosting environment variables or server/.env. No credentials logged.`);
    process.exit(1);
  }
}
startupLog("MongoDB connected. Initializing indexes...");
try {
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
  startupLog("Indexes ready. Migrating legacy data...");
  await migrateLegacyData(mongoose.connection.db, cfg.encryptionKey);
  startupLog("Verifying core administrative accounts and assets...");
  const { seedDatabase } = await import("./seed.js");
  await seedDatabase();
} catch (error) {
  startupLog(`MongoDB index initialization or setup failed: ${error?.message || error}`);
  process.exit(1);
}
startupLog("Database initialization complete. Starting HTTP server...");

async function startServer(app, initialPort) {
  const tryListen = (port, host) =>
    new Promise((resolve, reject) => {
      const s = app.listen(port, host, () => resolve({ server: s, port, host }));
      s.once("error", reject);
    });

  const candidates = [
    { port: initialPort, host: "0.0.0.0" },
    { port: initialPort, host: "127.0.0.1" },
    { port: 5001, host: "0.0.0.0" },
    { port: 5001, host: "127.0.0.1" },
    { port: 5002, host: "0.0.0.0" },
    { port: 5002, host: "127.0.0.1" },
  ];

  const tried = new Set();
  let lastErr = null;

  for (const candidate of candidates) {
    const key = `${candidate.host}:${candidate.port}`;
    if (tried.has(key)) continue;
    tried.add(key);
    try {
      const res = await tryListen(candidate.port, candidate.host);
      console.log(`Agni API listening on ${res.host}:${res.port}`);
      return res.server;
    } catch (err) {
      lastErr = err;
      if (err.code !== "EADDRINUSE" && err.code !== "EACCES") {
        throw err;
      }
    }
  }
  throw lastErr || new Error("No available port found.");
}

const app = createApp(cfg);
let server;
try {
  server = await startServer(app, cfg.port);
  await verifySmtpConnection();
} catch (err) {
  if (mongodInstance) {
    try { await mongodInstance.stop(); } catch {}
  }
  startupLog(`HTTP server failed to listen. ${err?.message || "Check PORT."}`);
  process.exit(1);
}

for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(async () => {
      await mongoose.disconnect();
      if (mongodInstance) await mongodInstance.stop();
      process.exit(0);
    }),
  );
