// Convenience launcher. The API and seed data use the configured Atlas database.
// Unlike the former temporary database launcher, stopping this process never removes records.
const { spawn } = require("node:child_process");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const children = [];
const run = (command, args, cwd) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
  children.push(child);
  child.once("error", reject);
  child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`${args.join(" ")} exited with code ${code}`)));
});
(async () => {
  await run(process.execPath, ["src/seed.js"], path.join(root, "server"));
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const start = (cwd) => {
    const child = spawn(npm, ["run", "dev"], { cwd, stdio: "inherit", shell: process.platform === "win32" });
    children.push(child);
    child.once("exit", (code) => { if (code && !stopping) stop(code); });
  };
  let stopping = false;
  const stop = (code = 0) => {
    if (stopping) return;
    stopping = true;
    children.forEach((child) => child.kill());
    process.exitCode = code;
  };
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => stop());
  start(path.join(root, "server"));
  if (!process.argv.includes("--api-only")) start(path.join(root, "client"));
  console.log("Persistent demo is using MongoDB Atlas. Stopping the servers will not delete database data.");
  console.log("Seed credentials are read from server/.env.");
})().catch((error) => {
  console.error(error.message);
  children.forEach((child) => child.kill());
  process.exitCode = 1;
});
