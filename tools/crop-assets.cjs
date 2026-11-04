const sharp = require("sharp");
const fs = require("node:fs");
const crops = [
  ["hero-01", 1, 0, 369, 1907, 525],
  ["hero-02", 16, 0, 369, 1907, 525],
  ["hero-03", 31, 0, 369, 1907, 525],
  ["donate-poster", 6, 972, 190, 650, 657],
  ["ncc-poster", 38, 204, 413, 650, 433],
  ["logo", 40, 1034, 270, 170, 169],
  ["gallery-01", 94, 538, 236, 830, 468],
  ["gallery-06", 100, 538, 164, 830, 623],
  ["certificate-society", 114, 341, 223, 563, 699],
  ["certificate-csr", 114, 1004, 204, 562, 736],
  ["approval-signature", 112, 0, 248, 340, 221],
  ["supporter-cf", 137, 811, 573, 61, 61],
  ["supporter-is", 137, 930, 573, 61, 61],
  ["supporter-nyks", 137, 1048, 573, 61, 61],
];
(async () => {
  for (const [name, frame, left, top, width, height] of crops) {
    await sharp(`reference/frames/frame_${String(frame).padStart(4, "0")}.png`)
      .extract({ left, top, width, height })
      .png()
      .toFile(`client/public/assets/${name}.png`);
  }
  // The membership chart scrolls past the viewport. Join the two matching portions.
  const top = await sharp("reference/frames/frame_0119.png")
    .extract({ left: 531, top: 366, width: 837, height: 606 })
    .png()
    .toBuffer();
  const bottom = await sharp("reference/frames/frame_0120.png")
    .extract({ left: 531, top: 617, width: 837, height: 261 })
    .png()
    .toBuffer();
  await sharp({
    create: { width: 837, height: 867, channels: 3, background: "#fff" },
  })
    .composite([
      { input: top, left: 0, top: 0 },
      { input: bottom, left: 0, top: 606 },
    ])
    .png()
    .toFile("client/public/assets/membership-criteria.png");
  const fundTop = await sharp("reference/frames/frame_0011.png")
    .extract({ left: 1000, top: 153, width: 624, height: 600 })
    .png()
    .toBuffer();
  const fundBottom = await sharp("reference/frames/frame_0067.png")
    .extract({ left: 1000, top: 445, width: 624, height: 338 })
    .png()
    .toBuffer();
  await sharp({
    create: { width: 624, height: 938, channels: 3, background: "#fff" },
  })
    .composite([
      { input: fundTop, left: 0, top: 0 },
      { input: fundBottom, left: 0, top: 600 },
    ])
    .png()
    .toFile("client/public/assets/fundraising-poster.png");
  const galleryTop = await sharp("reference/frames/frame_0105.png")
    .extract({ left: 538, top: 720, width: 830, height: 180 })
    .png()
    .toBuffer();
  const galleryBottom = await sharp("reference/frames/frame_0103.png")
    .extract({ left: 538, top: 273, width: 830, height: 444 })
    .png()
    .toBuffer();
  await sharp({
    create: { width: 830, height: 624, channels: 3, background: "#fff" },
  })
    .composite([
      { input: galleryTop, left: 0, top: 0 },
      { input: galleryBottom, left: 0, top: 180 },
    ])
    .png()
    .toFile("client/public/assets/gallery-07.png");
  fs.writeFileSync(
    "reference/asset-provenance.json",
    JSON.stringify(
      [
        ...crops.map(([name, frame, left, top, width, height]) => ({
          asset: `${name}.png`,
          frame,
          rect: { left, top, width, height },
        })),
        {
          asset: "fundraising-poster.png",
          frames: [11, 67],
          verticalOffset: 308,
          method: "adjoining crops; see tools/crop-assets.cjs",
        },
        {
          asset: "membership-criteria.png",
          frames: [119, 120],
          verticalOffset: 355,
          method: "adjoining crops; see tools/crop-assets.cjs",
        },
        {
          asset: "gallery-07.png",
          frames: [105, 103],
          verticalOffset: 627,
          method: "adjoining crops; see tools/crop-assets.cjs",
        },
      ],
      null,
      2,
    ),
  );
})();
