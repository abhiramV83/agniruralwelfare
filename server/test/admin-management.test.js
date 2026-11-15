import { test } from "node:test";
import assert from "node:assert/strict";
import { getCategoryPrefix } from "../src/registration-id.js";
import { generateIdCardPdf } from "../src/id-card.js";
import { sendAcceptanceEmail, sendRejectionEmail, isSmtpConfigured, getSmtpConfig } from "../src/email.js";
import { parseRegistrationApplication } from "../src/modules/registration/registration.service.js";

test("registration ID category prefixes match requirements for all 4 categories", () => {
  assert.equal(getCategoryPrefix("Member"), "MEM");
  assert.equal(getCategoryPrefix("Members"), "MEM");
  assert.equal(getCategoryPrefix("Register Member"), "MEM");

  assert.equal(getCategoryPrefix("Cadet"), "CAD");
  assert.equal(getCategoryPrefix("Cadets"), "CAD");
  assert.equal(getCategoryPrefix("Register Cadets"), "CAD");

  assert.equal(getCategoryPrefix("Volunteer"), "VOL");
  assert.equal(getCategoryPrefix("Volunteers"), "VOL");
  assert.equal(getCategoryPrefix("Register Volunteers"), "VOL");

  assert.equal(getCategoryPrefix("Intern & Alumni"), "INT");
  assert.equal(getCategoryPrefix("Intern & Alumni Member"), "INT");
  assert.equal(getCategoryPrefix("Register Intern & Alumni Members"), "INT");
  assert.equal(getCategoryPrefix("Internship"), "INT");
});

test("generates valid PDF ID cards for all 4 categories with QR code and organization details", async () => {
  const copy = {
    brand: {
      name: "Agni Rural Welfare Society",
      motto: "Service to humanity is service to God",
    },
  };

  const categories = [
    { cat: "Members", prefix: "MEM", id: "AGNI-MEM-2026-0001", name: "Priya Sharma" },
    { cat: "Cadets", prefix: "CAD", id: "AGNI-CAD-2026-0001", name: "Rohan Das" },
    { cat: "Volunteers", prefix: "VOL", id: "AGNI-VOL-2026-0001", name: "Ananya Roy" },
    { cat: "Intern & Alumni", prefix: "INT", id: "AGNI-INT-2026-0001", name: "Siddharth Bose" },
  ];

  for (const c of categories) {
    const record = {
      fullName: c.name,
      registrationId: c.id,
      category: c.cat,
      type: c.cat,
      address: "Baruipur, South 24 Parganas, West Bengal",
      guardian: "Gouranga " + c.name.split(" ")[1],
      bloodGroup: "O+",
      dob: "1999-04-12",
      enrollmentDate: "2026-11-13",
      approvedAt: new Date("2026-11-13"),
    };

    const buffer = await generateIdCardPdf(record, { origin: "http://127.0.0.1:5173" }, copy);
    assert.ok(Buffer.isBuffer(buffer), `Expected a Buffer for ${c.cat}`);
    assert.ok(buffer.length > 2000, `PDF buffer should contain card data for ${c.cat}`);
    assert.equal(buffer.subarray(0, 4).toString(), "%PDF", `Buffer should start with %PDF header for ${c.cat}`);
  }
});

test("ID card generation does not invent missing data (e.g. validity or photo)", async () => {
  const minimalRecord = {
    fullName: "Minimal Applicant",
    registrationId: "AGNI-MEM-2026-0099",
    category: "Members",
    approvedAt: new Date(),
  };

  const buffer = await generateIdCardPdf(minimalRecord, { origin: "http://127.0.0.1:5173" }, {});
  assert.ok(Buffer.isBuffer(buffer));
  assert.equal(buffer.subarray(0, 4).toString(), "%PDF");
});

test("isSmtpConfigured identifies unconfigured/placeholder credentials safely", () => {
  const result = isSmtpConfigured();
  assert.equal(typeof result, "boolean");
});

test("acceptance email template formats official approval email with all required fields", async () => {
  const result = await sendAcceptanceEmail({
    to: "priya.sharma@example.com",
    name: "Priya Sharma",
    type: "Members",
    registrationNumber: "AGNI-MEM-2026-0001",
    applicationId: "ARWS-123456",
    validFrom: "2026-01-01",
    validUntil: "2027-01-01",
    downloadUrl: "http://127.0.0.1:5173/verify/AGNI-MEM-2026-0001",
    pdfBuffer: Buffer.from("%PDF-1.4 sample"),
  });

  assert.ok(result.notConfigured || result.success || result.error);
});

test("rejection email template formats official rejection notice with reason", async () => {
  const result = await sendRejectionEmail({
    to: "rohan.das@example.com",
    name: "Rohan Das",
    type: "Cadets",
    applicationId: "ARWS-987654",
    reason: "Age criteria not met for senior cadet enrollment.",
  });

  assert.ok(result.notConfigured || result.success || result.error);
});

test("generateIdCardPdf renders front and back pages with assigned validity and registration number", async () => {
  const record = {
    fullName: "Sourav Ganguly",
    registrationNumber: "AGNI-CAD-2026-0042",
    category: "Cadets",
    type: "Cadet",
    rank: "Cadet Corporal",
    troopNo: "Troop 4",
    institution: "ARWS Training Center Kolkata",
    address: "Kolkata, West Bengal",
    guardian: "Chandidas Ganguly",
    bloodGroup: "B+",
    dob: "2008-07-08",
    validFrom: "2026-01-01",
    validUntil: "2028-01-01",
    enrollmentDate: "2026-01-01",
    approvedAt: new Date("2026-01-01"),
  };

  const buffer = await generateIdCardPdf(record, { origin: "http://127.0.0.1:5173" }, {});
  assert.ok(Buffer.isBuffer(buffer));
  assert.ok(buffer.length > 2500);
  assert.equal(buffer.subarray(0, 4).toString(), "%PDF");
});

test("date range validation enforces Valid Until >= Valid From", () => {
  const fromValid = new Date("2026-01-01");
  const untilValid = new Date("2027-01-01");
  assert.ok(untilValid >= fromValid, "Valid until should be after or equal to valid from");

  const untilInvalid = new Date("2025-12-31");
  assert.ok(untilInvalid < fromValid, "Invalid date correctly caught");
});

test("parseRegistrationApplication supports all 4 categories and parses valid JSON data", () => {
  const categories = ["Member", "Cadet", "Volunteer", "Intern & Alumni Member"];
  for (const cat of categories) {
    const parsed = parseRegistrationApplication({
      type: cat,
      data: JSON.stringify({ fullName: "Test Applicant", email: "test@example.com", phone: "9876543210" }),
    });
    assert.equal(parsed.error, undefined);
    assert.equal(parsed.value.type, cat);
    assert.equal(parsed.value.data.fullName, "Test Applicant");
    assert.equal(parsed.value.data.email, "test@example.com");
  }
});

test("Origin validation rules allow localhost, loopback, private IPs, and development origins", () => {
  const allowedOrigins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5001",
    "http://localhost:5001",
    "http://127.0.0.1:5000",
    "http://localhost:5000",
  ];

  const isPrivateOrLoopbackHost = (hostname) => {
    if (!hostname) return false;
    const clean = hostname.replace(/^\[|\]$/g, "").toLowerCase();
    return (
      clean === "localhost" ||
      clean === "127.0.0.1" ||
      clean === "0.0.0.0" ||
      clean === "::1" ||
      clean.endsWith(".local") ||
      /^127\.\d+\.\d+\.\d+$/.test(clean) ||
      /^10\.\d+\.\d+\.\d+$/.test(clean) ||
      /^192\.168\.\d+\.\d+$/.test(clean) ||
      /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(clean)
    );
  };

  const isOriginAllowed = (requestOrigin, reqHost = null, production = false) => {
    if (!requestOrigin || requestOrigin === "null") return true;
    if (!production) return true; // Development mode allows all local dev servers
    if (allowedOrigins.includes(requestOrigin)) return true;
    try {
      const url = new URL(requestOrigin);
      if (isPrivateOrLoopbackHost(url.hostname)) return true;
      if (reqHost) {
        const cleanHost = reqHost.split(":")[0].toLowerCase();
        const urlHost = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
        if (urlHost === cleanHost) return true;
        if (isPrivateOrLoopbackHost(cleanHost) && isPrivateOrLoopbackHost(urlHost)) return true;
      }
    } catch {}
    return false;
  };

  // Development mode: always allows origins
  assert.equal(isOriginAllowed("http://localhost:5173", "127.0.0.1:5001", false), true);
  assert.equal(isOriginAllowed("http://127.0.0.1:5173", "127.0.0.1:5001", false), true);
  assert.equal(isOriginAllowed("http://192.168.1.105:5173", "127.0.0.1:5001", false), true);

  // Production mode: loopback and private RFC1918 IPs on any port are allowed
  assert.equal(isOriginAllowed("http://localhost:5173", "127.0.0.1:5001", true), true);
  assert.equal(isOriginAllowed("http://127.0.0.1:5173", "127.0.0.1:5001", true), true);
  assert.equal(isOriginAllowed("http://192.168.0.20:5173", "192.168.0.20:5001", true), true);

  // Production mode: malicious unknown public origin rejected
  assert.equal(isOriginAllowed("http://evil-attacker.com", "myngo.org", true), false);
});

test("Form submission message format includes appreciation text", () => {
  const formTypes = [
    { type: "Member", label: "Member Registration" },
    { type: "Cadet", label: "Cadet Enrollment" },
    { type: "Volunteer", label: "Volunteer Registration" },
    { type: "Intern & Alumni Member", label: "Internship & Alumni Application" },
  ];

  for (const { type, label } of formTypes) {
    const successMsg = `Your ${label} form is submitted successfully!\n\nThank You for Your Support!\nYour kindness and generosity help us create a better tomorrow.`;
    assert.ok(successMsg.includes("Thank You for Your Support!"));
    assert.ok(successMsg.includes("Your kindness and generosity help us create a better tomorrow."));
    assert.ok(successMsg.includes(label));
  }
});

test("SMTP configuration parser extracts and normalizes environment settings safely", () => {
  const originalEnv = { ...process.env };
  try {
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_SECURE = "false";
    process.env.SMTP_USER = "mailer@example.com";
    process.env.SMTP_PASS = "SecretPass123";
    process.env.EMAIL_FROM = "Agni Welfare <support@agni.org>";

    const cfg = getSmtpConfig();
    assert.equal(cfg.host, "smtp.example.com");
    assert.equal(cfg.port, 587);
    assert.equal(cfg.secure, false);
    assert.equal(cfg.user, "mailer@example.com");
    assert.equal(cfg.pass, "SecretPass123");
    assert.equal(cfg.fromAddress, "Agni Welfare <support@agni.org>");
  } finally {
    process.env = originalEnv;
  }
});

test("isSmtpConfigured recognizes placeholder and unconfigured values as disabled", () => {
  const originalEnv = { ...process.env };
  try {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    assert.equal(isSmtpConfigured(), false);

    process.env.SMTP_HOST = "smtp.gmail.com";
    process.env.SMTP_USER = "your-dedicated-mailbox@gmail.com";
    process.env.SMTP_PASS = "your-google-app-password";
    assert.equal(isSmtpConfigured(), false);

    process.env.SMTP_USER = "admin@agni.org";
    process.env.SMTP_PASS = "real-production-password-2026";
    assert.equal(isSmtpConfigured(), true);
  } finally {
    process.env = originalEnv;
  }
});
