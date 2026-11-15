import nodemailer from "nodemailer";

/**
 * Parses and returns the active SMTP configuration from environment variables.
 */
export function getSmtpConfig() {
  let host = (process.env.SMTP_HOST || "").trim();
  const port = Number(process.env.SMTP_PORT || 465);
  const secureStr = String(process.env.SMTP_SECURE || (port === 465 ? "true" : "false")).toLowerCase();
  const secure = secureStr === "true" || secureStr === "1";
  const user = (process.env.SMTP_USER || "").trim();
  let pass = (process.env.SMTP_PASS || "").trim();

  // Defensive auto-healing: if host was accidentally set to an app password or invalid host while using Gmail
  if ((!host || host.includes(" ") || /^[a-z]{4}\s+[a-z]{4}\s+[a-z]{4}\s+[a-z]{4}$/i.test(host)) && user.endsWith("@gmail.com")) {
    if (/^[a-z]{4}\s+[a-z]{4}\s+[a-z]{4}\s+[a-z]{4}$/i.test(host)) {
      pass = host.replace(/\s+/g, "");
    }
    host = "smtp.gmail.com";
  }

  // Strip whitespace from 16-character Google App Passwords
  if (/^[a-z]{4}\s+[a-z]{4}\s+[a-z]{4}\s+[a-z]{4}$/i.test(pass)) {
    pass = pass.replace(/\s+/g, "");
  }

  const fromName = (process.env.MAIL_FROM_NAME || "Agni Rural Welfare Society").trim();
  const fromAddress = (process.env.EMAIL_FROM || process.env.MAIL_FROM || user || "noreply@agnirural.org").trim();
  const replyTo = (process.env.MAIL_REPLY_TO || fromAddress).trim();

  return {
    host,
    port,
    secure,
    user,
    pass,
    fromName,
    fromAddress,
    replyTo,
    fromFormatted: `"${fromName}" <${fromAddress}>`,
  };
}

/**
 * Checks whether SMTP delivery is genuinely configured and ready to be used.
 * Filters out empty values and placeholder strings.
 */
export function isSmtpConfigured() {
  const { host, user, pass } = getSmtpConfig();
  if (!host || !user || !pass) return false;
  const isPlaceholder = /(?:your-dedicated-mailbox|your-google-app-password|example\.com|<[^>]+>|placeholder|replace)/i;
  if (isPlaceholder.test(host) || isPlaceholder.test(user) || isPlaceholder.test(pass)) {
    return false;
  }
  return true;
}

let cachedTransporter = null;
let lastTransporterConfigKey = "";

/**
 * Returns a cached Nodemailer transporter or creates a new one if configuration changed.
 */
export function getTransporter() {
  const cfg = getSmtpConfig();
  const configKey = `${cfg.host}:${cfg.port}:${cfg.secure}:${cfg.user}`;

  if (cachedTransporter && lastTransporterConfigKey === configKey) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  lastTransporterConfigKey = configKey;
  return cachedTransporter;
}

/**
 * Verifies the SMTP connection on server startup and logs diagnostic status.
 * Never prints passwords or credentials to the console.
 */
export async function verifySmtpConnection() {
  if (!isSmtpConfigured()) {
    console.log("[EMAIL] SMTP configuration missing. Email delivery is unavailable.");
    return { ok: false, reason: "missing_config" };
  }

  try {
    const transporter = getTransporter();
    await transporter.verify();
    console.log("[EMAIL] SMTP connection verified successfully.");
    return { ok: true };
  } catch (err) {
    console.error(`[EMAIL] SMTP connection failed. Check SMTP host, port and authentication settings. (${err.message || "Connection refused"})`);
    return { ok: false, error: err.message };
  }
}

/**
 * Core sendEmail function using Nodemailer.
 */
export async function sendEmail({ to, subject, text, html, attachments = [] }) {
  if (!to || !subject || !text) {
    return { success: false, error: "Recipient email, subject, and body text are required." };
  }

  const cleanRecipient = String(to).trim();
  if (!cleanRecipient.includes("@") || !cleanRecipient.includes(".")) {
    return { success: false, error: `Invalid recipient email address: "${cleanRecipient}".` };
  }

  if (!isSmtpConfigured()) {
    return {
      success: false,
      notConfigured: true,
      error: "SMTP credentials not configured. Configure SMTP_HOST, SMTP_USER, and SMTP_PASS in server/.env.",
    };
  }

  const cfg = getSmtpConfig();

  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: cfg.fromFormatted,
      to: cleanRecipient,
      subject,
      text,
      html: html || undefined,
      replyTo: cfg.replyTo,
      attachments: attachments.map((att) => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType || "application/octet-stream",
      })),
    };

    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      response: info.response,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Failed to deliver email through SMTP server.",
      code: err.code || null,
    };
  }
}

/**
 * Dispatches an official Acceptance Email with optional ID card PDF attachment.
 */
export async function sendAcceptanceEmail({
  to,
  name,
  type = "Member",
  registrationNumber,
  applicationId,
  validFrom,
  validUntil,
  pdfBuffer,
}) {
  const regNo = registrationNumber || applicationId || "AGNI-MEM-2026-0001";
  const subject = "Your Registration Has Been Approved – AGNI Rural Welfare Society";

  let validitySection = "";
  if (validFrom && validUntil) {
    validitySection = `\nOfficial Validity: ${validFrom} to ${validUntil}\n`;
  }

  const text = `Dear ${name},

Congratulations!

We are pleased to inform you that your registration application for ${type} has been officially verified and approved by the Executive Committee of AGNI Rural Welfare Society.

Official Registration Number: ${regNo}${validitySection}
Welcome to the AGNI family! We are honored to have your dedication, energy, and commitment toward rural empowerment, community health, and social welfare.

${pdfBuffer ? "Your official digital Identity Card (PDF) has been attached to this email. You may also download it anytime from the Member Portal." : "Your official digital Identity Card has been generated and is available through the Member Portal."}

Thank you for your trust and support in our mission to serve humanity.

Warm regards,
Administrator & Executive Council
AGNI Rural Welfare Society
Govt. Reg. No. S/1L/75855
Website: https://agnirural.org | Contact: contact@agnirural.org
"Service to humanity is service to God"`;

  const attachments = pdfBuffer ? [
    {
      filename: `agni-id-card-${regNo}.pdf`,
      content: pdfBuffer,
      contentType: "application/pdf",
    },
  ] : [];

  return sendEmail({ to, subject, text, attachments });
}

/**
 * Dispatches an official Rejection Email with feedback or rejection rationale.
 */
export async function sendRejectionEmail({
  to,
  name,
  type = "Member",
  applicationId,
  reason,
}) {
  const regNo = applicationId || "—";
  const subject = "Registration Application Update – AGNI Rural Welfare Society";
  const reasonText = reason && String(reason).trim()
    ? `\nReason / Assessment Notes:\n${String(reason).trim()}\n`
    : "";

  const text = `Dear ${name},

Thank you for your interest in joining AGNI Rural Welfare Society and submitting your ${type} registration application (Reference: ${regNo}).

After a comprehensive review of the submitted information and eligibility documentation, we regret to inform you that your application could not be approved at this time.
${reasonText}
If you believe there was an error in the documentation submitted, or if you would like to apply for another program or volunteering initiative, please feel free to reach out to our administrative office.

We deeply appreciate your passion for social welfare and wish you the very best in your future endeavors.

Sincerely,
Administrative Office
AGNI Rural Welfare Society
Govt. Reg. No. S/1L/75855
Website: https://agnirural.org | Contact: contact@agnirural.org`;

  return sendEmail({ to, subject, text, attachments: [] });
}
