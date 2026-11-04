const { spawn } = require("node:child_process");
const path = require("node:path");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const children = ["server", "client"].map((dir) =>
  spawn(npm, ["run", "dev"], {
    cwd: path.resolve(dir),
    stdio: "inherit",
    shell: process.platform === "win32",
  }),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    children.forEach((child) => child.kill(signal));
  });
children.forEach((child) =>
  child.on("exit", (code) => {
    if (code) process.exitCode = code;
  }),
);
