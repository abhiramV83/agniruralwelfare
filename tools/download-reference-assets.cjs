// Read-only fetches of image URLs observed in the permitted reference HTML/JS.
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const sharp = require("sharp");
(async () => {
  const source = JSON.parse(
    await fs.readFile("reference/live-structure.json", "utf8"),
  );
  const dir = "client/public/assets/original";
  await fs.mkdir(dir, { recursive: true });
  const records = [];
  const queue = [...source.images];
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (queue.length) {
        const relative = queue.shift();
        const url = new URL(relative, source.source);
        if (url.origin !== new URL(source.source).origin)
          throw new Error("Unexpected image origin");
        const file = path.join(dir, path.basename(url.pathname));
        try {
          let bytes;
          try {
            bytes = await fs.readFile(file);
          } catch {
            const response = await fetch(url, {
              signal: AbortSignal.timeout(30000),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            bytes = Buffer.from(await response.arrayBuffer());
            await sharp(bytes).metadata();
            await fs.writeFile(file, bytes, { flag: "wx" });
          }
          const { width, height, format } = await sharp(bytes).metadata();
          records.push({
            relative,
            url: url.href,
            local:
              "/" + file.replaceAll("\\", "/").replace("client/public/", ""),
            bytes: bytes.length,
            width,
            height,
            format,
            sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
          });
        } catch (error) {
          records.push({ relative, error: error.message });
        }
      }
    }),
  );
  records.sort(
    (a, b) =>
      source.images.indexOf(a.relative) - source.images.indexOf(b.relative),
  );
  await fs.writeFile(
    "reference/asset-manifest.json",
    JSON.stringify(records, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({
      downloaded: records.filter((r) => !r.error).length,
      failed: records.filter((r) => r.error),
    }),
  );
})();
