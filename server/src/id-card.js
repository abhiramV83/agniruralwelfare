import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { fileURLToPath } from "node:url";

const value = (record, ...keys) => {
  for (const key of keys) {
    const candidate = record?.[key] ?? record?.registrationDetails?.[key];
    if (candidate !== undefined && candidate !== null && String(candidate).trim()) return String(candidate).trim();
  }
  return "—";
};
const dateText = (input) => {
  if (!input) return "—";
  const date = new Date(input);
  return Number.isNaN(date.valueOf()) ? String(input) : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Kolkata" }).format(date);
};

/** A double-sided, printable identity card. The QR resolves to the public verification record. */
export async function sendIdCard(res, record, cfg, copy, cadet = false) {
  const id = cadet ? record.registrationId : record.memberId;
  const qr = await QRCode.toBuffer(`${cfg.origin}/verify/${encodeURIComponent(id)}`, { width: 240, margin: 1, color: { dark: "#17231f", light: "#fffafc" } });
  const doc = new PDFDocument({ size: [800, 500], margin: 0, info: { Title: `${copy.brand.name} Identity Card`, Author: copy.brand.name } });
  res.set({ "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="agni-${cadet ? "cadet" : "member"}-card.pdf"`, "Cache-Control": "no-store" });
  doc.pipe(res);
  const logo = fileURLToPath(new URL("../../client/public/assets/logo.png", import.meta.url));
  const name = value(record, "fullName", "memberName", "cadetName");
  const registrationId = cadet ? value(record, "registrationId") : value(record, "memberId");
  const type = value(record, "registrationType");
  const designation = cadet ? "CADET" : /volunteer/i.test(type) ? "TRAINER" : /intern|alumni/i.test(type) ? "INTERN / ALUMNI MEMBER" : "MEMBER";
  const institution = value(record, "institution", "memberInstitution", "school", "schoolName", "institute");
  const guardian = value(record, "guardian", "guardianName", "fatherName", "memberGuardian");
  const address = value(record, "address", "memberAddress", "cadetAddress", "currentAddress", "permanentAddress", "residentialAddress");
  const dob = value(record, "dob", "dateOfBirth");
  const blood = value(record, "bloodGroup");
  const approved = record.approvedAt || record.enrollmentDate || record.createdAt;
  const enrollmentDate = value(record, "enrollmentDate") !== "—" ? dateText(record.enrollmentDate) : dateText(approved);
  const frontBg = "#fff6fa", ink = "#201b1d", red = "#b92e31", green = "#17664b", rose = "#f8dce9";

  // Front
  doc.rect(0, 0, 800, 500).fill(frontBg);
  doc.rect(0, 0, 800, 12).fill(green);
  doc.rect(24, 28, 170, 220).lineWidth(3).stroke(ink);
  if (record.photoBuffer) {
    try { doc.image(record.photoBuffer, 36, 40, { fit: [146, 196], align: "center", valign: "center" }); } catch {}
  }
  doc.fillColor(red).font("Helvetica-Bold").fontSize(25).text(copy.brand.name.toUpperCase(), 215, 35, { width: 500, align: "center", characterSpacing: 1.2 });
  doc.fillColor(ink).font("Helvetica").fontSize(17).text("Regd. No. : S/1L/55059", 215, 70, { width: 520, align: "center" });
  doc.font("Helvetica-Bold").fontSize(30).text("IDENTITY CARD", 215, 104, { width: 520, align: "center" });
  doc.fontSize(17).text(`Motto : ${copy.brand.motto}`, 215, 144, { width: 520, align: "center" });
  const memberMark = designation === "MEMBER" ? "X" : " ";
  const cadetMark = designation === "CADET" ? "X" : " ";
  const trainerMark = designation === "TRAINER" ? "X" : " ";
  const studentMark = /intern|alumni/i.test(type) ? "X" : " ";
  doc.fontSize(14).text(`MEMBER [${memberMark}]   CADET [${cadetMark}]   TRAINER [${trainerMark}]   MAST STUDENT [${studentMark}]`, 215, 183, { width: 500, align: "center" });
  try { doc.image(logo, 733, 30, { fit: [42, 42] }); } catch {}
  doc.save().fillColor(rose).opacity(0.42).circle(515, 430, 138).fill().restore();
  const frontRows = [
    ["Name", name], ["Designation / Rank", designation], ["Regd. No.", registrationId],
    ["Institution", institution], ["Troop / Center No", value(record, "troopNumber", "centerNumber", "introducerCode")],
  ];
  let y = 270;
  for (const [label, text] of frontRows) {
    doc.fillColor(ink).font("Helvetica").fontSize(16).text(label, 35, y, { width: 205, height: 22, ellipsis: true });
    doc.save().dash(2, { space: 3 }).moveTo(242, y + 19).lineTo(278, y + 19).lineWidth(0.7).strokeColor("#62565b").stroke().restore();
    doc.font("Helvetica-Bold").fontSize(17).text(text, 290, y, { width: 470, height: 25, ellipsis: true });
    y += 39;
  }
  doc.fillColor(ink).font("Helvetica").fontSize(15).text("Signature of Issuing Authority  ........................................................................", 35, 465, { width: 730 });

  // Reverse
  doc.addPage({ size: [800, 500], margin: 0 });
  doc.rect(0, 0, 800, 500).fill(frontBg);
  doc.rect(0, 0, 800, 12).fill(green);
  doc.rect(20, 24, 760, 452).lineWidth(1).stroke(rose);
  doc.fillColor(red).font("Helvetica-Bold").fontSize(20).text(copy.brand.name.toUpperCase(), 42, 34, { width: 610 });
  doc.fillColor(ink).font("Helvetica").fontSize(14).text(`Registration ID: ${registrationId}`, 42, 64, { width: 610 });
  const backRows = [
    ["Father’s / Guardian Name", guardian], ["Permanent Address", address],
    ["Blood Group", blood], ["Date of Enrollment", enrollmentDate],
    ["Date of Birth", dateText(value(record, "dob", "dateOfBirth"))], ["Nationality", value(record, "citizenship", "nationality")],
    ["Valid From", dateText(approved)], ["Valid To", value(record, "validUntil")],
  ];
  let by = 105;
  for (const [label, text] of backRows) {
    doc.fillColor(ink).font("Helvetica-Bold").fontSize(13).text(label, 42, by, { width: 190 });
    doc.font("Helvetica").fontSize(13).text(text, 235, by, { width: 480, height: 26, ellipsis: true });
    doc.save().dash(2, { space: 3 }).moveTo(235, by + 21).lineTo(715, by + 21).lineWidth(0.7).strokeColor("#62565b").stroke().restore();
    by += 36;
  }
  doc.fillColor(red).font("Helvetica-Bold").fontSize(12).text("INSTRUCTION", 42, 405);
  doc.fillColor(ink).font("Helvetica").fontSize(10).text("Candidates are not allowed on the premises without their identity card. If found, please return this card to Agni Rural Welfare Society.", 42, 423, { width: 500, height: 34 });
  doc.image(qr, 640, 365, { width: 104 });
  doc.fillColor(green).font("Helvetica-Bold").fontSize(9).text(copy.demo.scan, 635, 471, { width: 115, align: "center" });
  doc.end();
}
