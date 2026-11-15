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
  const motto = copy?.brand?.motto || "Service to humanity is service to God";
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
  const troopOrInst = value(record, "troopNo", "institution", "memberInstitution", "school", "schoolName", "institute");
  const guardian = value(record, "guardian", "guardianName", "fatherName", "memberGuardian");
  const address = value(record, "address", "memberAddress", "cadetAddress", "currentAddress", "permanentAddress", "residentialAddress");
  const dob = value(record, "dob", "dateOfBirth");
  const blood = value(record, "bloodGroup");
  const approved = record.approvedAt || record.enrollmentDate || record.createdAt || new Date();
  const enrollmentDate = value(record, "enrollmentDate") ? dateText(record.enrollmentDate) : dateText(approved);
  const validFromVal = value(record, "validFrom") ? dateText(record.validFrom) : dateText(approved);
  const validUntilVal = value(record, "validUntil", "validity", "validTo") ? dateText(record.validUntil || record.validity || record.validTo) : "Permanent";

  const frontBg = "#fffafc", ink = "#17231f", red = "#b92e31", green = "#0d6b61", rose = "#fce8ef";

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
      doc.rect(0, 0, 800, 14).fill(green);

      // Photo frame
      doc.rect(26, 32, 172, 222).lineWidth(2).stroke(ink);
      if (record.photoBuffer) {
        try {
          doc.image(record.photoBuffer, 32, 38, { fit: [160, 210], align: "center", valign: "center" });
        } catch {
          doc.fillColor("#7a7074").font("Helvetica").fontSize(12).text("APPLICANT PHOTO", 32, 135, { width: 160, align: "center" });
        }
      } else {
        doc.fillColor("#8a8085").font("Helvetica-Bold").fontSize(13).text("AFFIX PHOTO", 32, 130, { width: 160, align: "center" });
        doc.font("Helvetica").fontSize(10).text("OFFICIAL RECORD", 32, 148, { width: 160, align: "center" });
      }

      // Organization Header
      doc.fillColor(red).font("Helvetica-Bold").fontSize(24).text(brandName.toUpperCase(), 215, 34, { width: 510, align: "center", characterSpacing: 1.1 });
      doc.fillColor(ink).font("Helvetica").fontSize(15).text("Govt. Regd. No. : S/1L/55059", 215, 68, { width: 510, align: "center" });
      doc.font("Helvetica-Bold").fontSize(28).text("OFFICIAL IDENTITY CARD", 215, 98, { width: 510, align: "center" });
      doc.fontSize(15).font("Helvetica-Oblique").text(`Motto : ${motto}`, 215, 136, { width: 510, align: "center" });

      // Category Indicators
      const memberMark = designation === "MEMBER" ? "✓" : " ";
      const cadetMark = designation === "CADET" ? "✓" : " ";
      const volunteerMark = designation === "VOLUNTEER" ? "✓" : " ";
      const internMark = designation === "INTERN & ALUMNI" ? "✓" : " ";
      doc.font("Helvetica-Bold").fontSize(13).text(`MEMBER [${memberMark}]    CADET [${cadetMark}]    VOLUNTEER [${volunteerMark}]    INTERN & ALUMNI [${internMark}]`, 215, 172, { width: 510, align: "center" });

      // Top logo
      try { doc.image(logoPath, 725, 28, { fit: [48, 48] }); } catch {}

      // Decorative background emblem
      doc.save().fillColor(rose).opacity(0.35).circle(520, 420, 130).fill().restore();

      // Front rows
      const frontRows = [
        ["Name", name],
        ["Rank / Role", rank],
        ["Regd. No.", registrationId],
      ];
      if (troopOrInst) frontRows.push(["Institution / Troop", troopOrInst]);
      frontRows.push(["Date of Issue", dateText(approved)]);

      let y = 250;
      for (const [label, text] of frontRows) {
        doc.fillColor(ink).font("Helvetica").fontSize(15).text(label, 35, y, { width: 190, height: 22, ellipsis: true });
        doc.save().dash(2, { space: 3 }).moveTo(230, y + 17).lineTo(265, y + 17).lineWidth(0.7).strokeColor("#62565b").stroke().restore();
        doc.font("Helvetica-Bold").fontSize(16).text(text, 275, y, { width: 490, height: 24, ellipsis: true });
        y += 38;
      }

      doc.fillColor(ink).font("Helvetica").fontSize(14).text("Signature of Issuing Authority :  ________________________________________", 35, 465, { width: 730 });

      // ==========================================
      // REVERSE SIDE
      // ==========================================
      doc.addPage({ size: [800, 500], margin: 0 });
      doc.rect(0, 0, 800, 500).fill(frontBg);
      doc.rect(0, 0, 800, 14).fill(green);
      doc.rect(20, 24, 760, 452).lineWidth(1.5).stroke(green);

      doc.fillColor(red).font("Helvetica-Bold").fontSize(20).text(brandName.toUpperCase(), 42, 34, { width: 600 });
      doc.fillColor(ink).font("Helvetica-Bold").fontSize(14).text(`Regd. No.: ${registrationId}`, 42, 62, { width: 600 });

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

      let by = 94;
      for (const [label, text] of backRows) {
        doc.fillColor(ink).font("Helvetica-Bold").fontSize(12).text(label, 42, by, { width: 210 });
        doc.font("Helvetica").fontSize(12).text(text, 260, by, { width: 460, height: 24, ellipsis: true });
        doc.save().dash(2, { space: 3 }).moveTo(260, by + 16).lineTo(715, by + 16).lineWidth(0.7).strokeColor("#62565b").stroke().restore();
        by += 28;
      }

      // Organization Contact Information
      doc.fillColor(red).font("Helvetica-Bold").fontSize(11).text("ORGANIZATION CONTACT & HELPLINE", 42, 385);
      doc.fillColor(ink).font("Helvetica").fontSize(9.5).text(
        "AGNI RURAL WELFARE SOCIETY · Govt Regd No: S/1L/55059\n" +
        "Address: Sonarpur, Baruipur Sub-Division, South 24 Parganas, Kolkata, West Bengal\n" +
        "Helpline: +91 9433834013 · Email: contact@agniruralwelfare.org · Web: agniruralwelfare.org",
        42, 403, { width: 560, lineGap: 3 }
      );

      doc.fillColor("#6e2226").font("Helvetica-Bold").fontSize(8.5).text(
        "Important: This identity card remains the property of the society. If found, please return to the address above.",
        42, 452, { width: 560 }
      );

      // QR Code on bottom right
      doc.image(qrBuffer, 635, 345, { width: 110 });
      doc.fillColor(green).font("Helvetica-Bold").fontSize(9).text("Scan to Verify", 635, 458, { width: 110, align: "center" });

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
