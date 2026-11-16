import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { fileURLToPath } from "node:url";

const value = (record, ...keys) => {
  for (const key of keys) {
    const candidate = record?.[key] ?? record?.data?.[key] ?? record?.registrationDetails?.[key];
    if (candidate !== undefined && candidate !== null && String(candidate).trim()) return String(candidate).trim();
  }
  return null;
};

const dateText = (input) => {
  if (!input) return "—";
  const date = new Date(input);
  return Number.isNaN(date.valueOf()) ? String(input) : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Kolkata" }).format(date);
};

/**
 * Generates a high-quality, professional double-sided ID card PDF Buffer.
 * Contains:
 * - Organization name and logo
 * - Applicant name
 * - Photograph if available
 * - Unique ID (e.g. AGNI-MEM-2026-0001, AGNI-CAD-2026-0001, etc.)
 * - Registration category
 * - Issue date
 * - Validity ONLY if defined (do not invent missing data)
 * - QR code for public verification
 * - Organization contact details
 */
export async function generateIdCardPdf(record, cfg, copy = {}) {
  const brandName = (copy?.brand?.name || "Agni Rural Welfare Society").trim();
  const rawMotto = copy?.brand?.motto || "Bravery, Unity & Discipline";
  let cleanMotto = String(rawMotto)
    .replace(/(?:^|\s*)motto\s*:\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  cleanMotto = cleanMotto.replace(/Bravery\s*,?\s*Unity/i, "Bravery, Unity");
  if (!cleanMotto) cleanMotto = "Bravery, Unity & Discipline";

  const registrationId = record.registrationNumber || record.registrationId || record.memberId || "AGNI-MEM-2026-0001";
  const categoryRaw = record.type || record.registrationType || record.category || "Member";

  let designation = "MEMBER";
  if (/cadet/i.test(categoryRaw)) designation = "CADET";
  else if (/volunteer/i.test(categoryRaw)) designation = "VOLUNTEER";
  else if (/intern|alumni/i.test(categoryRaw)) designation = "INTERN & ALUMNI";

  const qrUrl = `${cfg?.origin || "http://127.0.0.1:5173"}/verify/${encodeURIComponent(registrationId)}`;
  const qrBuffer = await QRCode.toBuffer(qrUrl, { width: 240, margin: 1, color: { dark: "#17231f", light: "#fffafc" } });

  const logoPath = fileURLToPath(new URL("../../client/public/assets/logo.png", import.meta.url));

  const name = value(record, "fullName", "memberName", "cadetName") || "Valued Member";
  const rank = value(record, "rank", "cadetRank", "position") || designation;
  const troopOrInst = value(record, "troopNo", "institution", "memberInstitution", "school", "schoolName", "institute") || "Agni Rural Welfare Society";
  const guardian = value(record, "guardian", "guardianName", "fatherName", "memberGuardian");
  const address = value(record, "address", "memberAddress", "cadetAddress", "currentAddress", "permanentAddress", "residentialAddress");
  const dob = value(record, "dob", "dateOfBirth");
  const blood = value(record, "bloodGroup");
  const approved = record.approvedAt || record.enrollmentDate || record.createdAt || new Date();
  const enrollmentDate = value(record, "enrollmentDate") ? dateText(record.enrollmentDate) : dateText(approved);
  const validFromVal = value(record, "validFrom") ? dateText(record.validFrom) : dateText(approved);
  const validUntilVal = value(record, "validUntil", "validity", "validTo") ? dateText(record.validUntil || record.validity || record.validTo) : "Permanent";

  const frontBg = "#fffcf9", ink = "#141c19", red = "#a82024", green = "#0a5c53", lightGreen = "#e8f5f2", subtleBorder = "#cbdcd6";

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: [800, 500], margin: 0, info: { Title: `${brandName} Identity Card`, Author: brandName } });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // ==========================================
      // FRONT SIDE
      // ==========================================
      doc.rect(0, 0, 800, 500).fill(frontBg);
      doc.rect(0, 0, 800, 12).fill(green);
      doc.roundedRect(12, 12, 776, 476, 6).lineWidth(1.5).strokeColor(green).stroke();

      // Top logo
      try {
        doc.image(logoPath, 725, 22, { fit: [50, 50] });
      } catch {}

      // Photo frame (Left side: x:28, y:24, width:164, height:205) -> Ends cleanly at y:229
      const photoX = 28, photoY = 24, photoW = 164, photoH = 205;
      doc.roundedRect(photoX, photoY, photoW, photoH, 4).lineWidth(1.5).strokeColor("#20302b").stroke();
      if (record.photoBuffer) {
        try {
          doc.image(record.photoBuffer, photoX + 4, photoY + 4, { fit: [photoW - 8, photoH - 8], align: "center", valign: "center" });
        } catch {
          doc.fillColor("#6b7280").font("Helvetica-Bold").fontSize(11).text("APPLICANT PHOTO", photoX, photoY + 95, { width: photoW, align: "center" });
        }
      } else {
        doc.save().fillColor("#f1f5f3").roundedRect(photoX + 2, photoY + 2, photoW - 4, photoH - 4, 3).fill().restore();
        doc.fillColor("#4b5563").font("Helvetica-Bold").fontSize(12).text("AFFIX PHOTO", photoX, photoY + 86, { width: photoW, align: "center" });
        doc.font("Helvetica").fontSize(10).fillColor("#6b7280").text("OFFICIAL RECORD", photoX, photoY + 104, { width: photoW, align: "center" });
      }

      // Organization Header (Centered in remaining space: x: 202, width: 515)
      const headerX = 202, headerW = 515;
      doc.fillColor(red).font("Helvetica-Bold").fontSize(23).text(brandName.toUpperCase(), headerX, 26, { width: headerW, align: "center", characterSpacing: 0.8 });
      doc.fillColor("#4b5563").font("Helvetica-Bold").fontSize(13.5).text("Govt. Regd. No. : S/1L/55059", headerX, 58, { width: headerW, align: "center" });
      doc.fillColor(ink).font("Helvetica-Bold").fontSize(26).text("OFFICIAL IDENTITY CARD", headerX, 84, { width: headerW, align: "center", characterSpacing: 0.5 });

      // Clean single motto line
      doc.fillColor(green).font("Helvetica-Oblique").fontSize(13.5).text(`Motto: ${cleanMotto}`, headerX, 120, { width: headerW, align: "center" });

      // Category Badges (4 side-by-side pills)
      const categories = ["MEMBER", "CADET", "VOLUNTEER", "INTERN & ALUMNI"];
      const badgeY = 152, badgeH = 26;
      const badgeWidths = [105, 95, 115, 155];
      const totalBadgesW = badgeWidths.reduce((a, b) => a + b, 0) + (categories.length - 1) * 10;
      let curBadgeX = headerX + Math.round((headerW - totalBadgesW) / 2);

      for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        const bW = badgeWidths[i];
        const isActive = designation === cat;

        if (isActive) {
          doc.save().fillColor(green).roundedRect(curBadgeX, badgeY, bW, badgeH, 13).fill().restore();
          doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(11).text(`● ${cat}`, curBadgeX, badgeY + 7, { width: bW, align: "center" });
        } else {
          doc.save().fillColor("#ffffff").roundedRect(curBadgeX, badgeY, bW, badgeH, 13).fill().restore();
          doc.roundedRect(curBadgeX, badgeY, bW, badgeH, 13).lineWidth(1).strokeColor(subtleBorder).stroke();
          doc.fillColor("#64748b").font("Helvetica-Bold").fontSize(10.5).text(cat, curBadgeX, badgeY + 7, { width: bW, align: "center" });
        }
        curBadgeX += bW + 10;
      }

      // Elegant horizontal divider below photo (at y = 240)
      doc.save().strokeColor(green).lineWidth(1.2).moveTo(28, 240).lineTo(772, 240).stroke().restore();

      // Decorative subtle watermark background emblem
      doc.save().fillColor(green).opacity(0.04).circle(530, 360, 110).fill().restore();

      // Front Key-Value Rows (All start comfortably below y = 240)
      const frontRows = [
        ["Name", name, false],
        ["Rank / Role", rank, false],
        ["Regd. No.", registrationId, true],
        ["Institution / Troop", troopOrInst, false],
        ["Date of Issue", dateText(approved), false],
      ];

      let rowY = 252;
      const rowH = 36;
      for (let i = 0; i < frontRows.length; i++) {
        const [label, valText, isHighlight] = frontRows[i];

        if (i % 2 === 0) {
          doc.save().fillColor(lightGreen).opacity(0.4).roundedRect(32, rowY, 736, rowH - 4, 4).fill().restore();
        }

        // Label
        doc.fillColor("#2d3748").font("Helvetica-Bold").fontSize(14).text(label, 48, rowY + 7, { width: 175 });

        // Colon
        doc.fillColor(green).font("Helvetica-Bold").fontSize(14).text(":", 225, rowY + 7, { width: 15, align: "center" });

        // Value
        if (isHighlight) {
          doc.fillColor(red).font("Helvetica-Bold").fontSize(15.5).text(valText, 250, rowY + 6, { width: 505, height: 24, ellipsis: true });
        } else {
          doc.fillColor(ink).font("Helvetica-Bold").fontSize(15).text(valText, 250, rowY + 6, { width: 505, height: 24, ellipsis: true });
        }

        rowY += rowH;
      }

      // Signature line at bottom
      doc.fillColor("#2d3748").font("Helvetica-Bold").fontSize(13).text("Signature of Issuing Authority :", 48, 452);
      doc.save().lineWidth(1).strokeColor("#4a5568").moveTo(260, 465).lineTo(520, 465).stroke().restore();

      // Official Stamp box on right
      doc.roundedRect(630, 436, 130, 44, 4).lineWidth(1).dash(3, { space: 3 }).strokeColor("#94a3b8").stroke();
      doc.undash();
      doc.fillColor("#94a3b8").font("Helvetica-Bold").fontSize(9.5).text("OFFICIAL SEAL / STAMP", 630, 452, { width: 130, align: "center" });

      // ==========================================
      // REVERSE SIDE
      // ==========================================
      doc.addPage({ size: [800, 500], margin: 0 });
      doc.rect(0, 0, 800, 500).fill(frontBg);
      doc.rect(0, 0, 800, 12).fill(green);
      doc.roundedRect(12, 12, 776, 476, 6).lineWidth(1.5).strokeColor(green).stroke();

      // Reverse Header
      doc.fillColor(red).font("Helvetica-Bold").fontSize(19).text(brandName.toUpperCase(), 38, 26, { width: 580 });
      doc.fillColor(ink).font("Helvetica-Bold").fontSize(13.5).text(`Official Regd. No. : ${registrationId}`, 38, 52, { width: 580 });
      doc.save().strokeColor(green).lineWidth(1).moveTo(38, 72).lineTo(762, 72).stroke().restore();

      // Back Details
      const backRows = [];
      if (guardian) backRows.push(["Father’s / Guardian Name", guardian]);
      if (address) backRows.push(["Address", address]);
      if (blood) backRows.push(["Blood Group", blood]);
      if (dob) backRows.push(["Date of Birth", dateText(dob)]);
      const citizenship = value(record, "citizenship", "nationality") || "Indian";
      backRows.push(["Nationality", citizenship]);
      backRows.push(["Date of Enrollment", enrollmentDate]);
      backRows.push(["Valid From", validFromVal]);
      backRows.push(["Valid Until", validUntilVal]);

      let by = 82;
      const bRowH = 29;
      for (let i = 0; i < backRows.length; i++) {
        const [label, bText] = backRows[i];

        if (i % 2 === 0) {
          doc.save().fillColor(lightGreen).opacity(0.35).roundedRect(36, by - 2, 570, bRowH - 2, 3).fill().restore();
        }

        // Label
        doc.fillColor("#334155").font("Helvetica-Bold").fontSize(12).text(label, 44, by + 4, { width: 195 });
        // Colon
        doc.fillColor(green).font("Helvetica-Bold").fontSize(12).text(":", 242, by + 4, { width: 12 });
        // Value
        doc.fillColor(ink).font("Helvetica-Bold").fontSize(12).text(bText, 258, by + 4, { width: 340, height: 20, ellipsis: true });

        by += bRowH;
      }

      // Organization Contact & Helpline Card
      doc.roundedRect(36, 362, 570, 114, 6).lineWidth(1).strokeColor(subtleBorder).stroke();
      doc.fillColor(red).font("Helvetica-Bold").fontSize(11.5).text("ORGANIZATION CONTACT & HELPLINE", 48, 372);
      doc.fillColor("#1e293b").font("Helvetica").fontSize(10).text(
        "AGNI RURAL WELFARE SOCIETY · Govt Regd No: S/1L/55059\n" +
        "Address: Sonarpur, Baruipur Sub-Division, South 24 Parganas, Kolkata, West Bengal\n" +
        "Helpline: +91 9433834013 · Email: contact@agniruralwelfare.org · Web: agniruralwelfare.org",
        48, 392, { width: 546, lineGap: 3.5 }
      );
      doc.fillColor("#842029").font("Helvetica-Bold").fontSize(8.5).text(
        "Notice: This identity card remains the property of Agni Rural Welfare Society. If found, please return to the address above.",
        48, 452, { width: 546 }
      );

      // QR Code container on right side
      const qrBoxX = 630, qrBoxY = 82, qrBoxW = 132, qrBoxH = 200;
      doc.roundedRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 6).lineWidth(1).strokeColor(subtleBorder).stroke();
      doc.fillColor(green).font("Helvetica-Bold").fontSize(11).text("PUBLIC VERIFICATION", qrBoxX, qrBoxY + 12, { width: qrBoxW, align: "center" });
      doc.image(qrBuffer, qrBoxX + 16, qrBoxY + 32, { width: 100 });
      doc.fillColor("#475569").font("Helvetica").fontSize(8.5).text("Scan with any camera or QR app to verify authenticity on official portal.", qrBoxX + 8, qrBoxY + 140, { width: qrBoxW - 16, align: "center", lineGap: 2 });

      // Hologram / Security Seal Box
      const holoBoxY = qrBoxY + qrBoxH + 14;
      doc.roundedRect(qrBoxX, holoBoxY, qrBoxW, 76, 6).lineWidth(1).strokeColor(green).stroke();
      doc.fillColor(green).font("Helvetica-Bold").fontSize(10).text("OFFICIAL CREDENTIAL", qrBoxX, holoBoxY + 12, { width: qrBoxW, align: "center" });
      doc.fillColor("#64748b").font("Helvetica").fontSize(8.5).text("Authorized Digital Issuance\nAgni Rural Welfare Society", qrBoxX, holoBoxY + 30, { width: qrBoxW, align: "center", lineGap: 2 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Express HTTP handler that sends the generated ID card PDF to the client
 */
export async function sendIdCard(res, record, cfg, copy) {
  const pdfBuffer = await generateIdCardPdf(record, cfg, copy);
  const filename = `agni-${record.registrationId || record.memberId || "id-card"}.pdf`;
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Content-Length": String(pdfBuffer.length),
    "Cache-Control": "no-store",
  });
  res.send(pdfBuffer);
}
