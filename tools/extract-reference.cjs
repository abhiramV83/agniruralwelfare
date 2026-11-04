const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const ffmpeg = require("ffmpeg-static");
const ffprobe = require("ffprobe-static").path;
const sharp = require("sharp");
const source = path.resolve("reference/Recording 2026-10-26 233448.mp4");
const probe = spawnSync(
  ffprobe,
  [
    "-v",
    "quiet",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    source,
  ],
  { encoding: "utf8" },
);
fs.writeFileSync("reference/metadata.json", probe.stdout);
console.log(probe.stdout);
const result = spawnSync(
  ffmpeg,
  [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    source,
    "-vf",
    "fps=1",
    "reference/frames/frame_%04d.png",
  ],
  { stdio: "inherit" },
);
if (result.status) process.exit(result.status);
(async () => {
  const frames = fs
    .readdirSync("reference/frames")
    .filter((n) => n.endsWith(".png"));
  fs.mkdirSync("reference/contact-sheets", { recursive: true });
  for (let i = 0; i < frames.length; i += 12) {
    const composite = [];
    for (let j = 0; j < 12 && i + j < frames.length; j++) {
      const name = frames[i + j];
      const thumb = await sharp(path.join("reference/frames", name))
        .resize(480, 270, { fit: "contain", background: "#111" })
        .png()
        .toBuffer();
      composite.push({
        input: thumb,
        left: (j % 3) * 480,
        top: Math.floor(j / 3) * 294 + 24,
      });
      const label = Buffer.from(
        `<svg width="480" height="24"><rect width="480" height="24" fill="#111"/><text x="8" y="17" fill="white" font-size="15">${name} · second ${i + j}</text></svg>`,
      );
      composite.push({
        input: label,
        left: (j % 3) * 480,
        top: Math.floor(j / 3) * 294,
      });
    }
    await sharp({
      create: { width: 1440, height: 1176, channels: 3, background: "#111" },
    })
      .composite(composite)
      .jpeg({ quality: 88 })
      .toFile(
        `reference/contact-sheets/sheet_${String(i / 12 + 1).padStart(3, "0")}.jpg`,
      );
  }
  console.log(`Extracted ${frames.length} frames.`);
})();
