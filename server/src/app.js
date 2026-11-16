import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import QRCode from "qrcode";
import { sendIdCard, generateIdCardPdf } from "./id-card.js";
import { sendAcceptanceEmail, sendRejectionEmail, isSmtpConfigured } from "./email.js";
import { getNextRegistrationId } from "./registration-id.js";
import { registerAccount, submitRegistrationApplication } from "./modules/registration/registration.controller.js";
import { answerNgoInquiry, getApplicationAiInsights, draftContentForAdmin } from "./ai-service.js";

import { stringify } from "csv-stringify/sync";
import { ZodError } from "zod";
import { User, Session, Cadet, Internship, RegistrationApplication, Pledge, Gallery, SiteContent, ContactMessage } from "./models.js";
import {
  authMiddleware,
  adminOnly,
  issueSession,
  hashToken,
  clearSessionCookie,
  publicUser,
} from "./auth.js";
import {
  loginSchema,
  cadetSchema,
  internshipSchema,
  pledgeSchema,
} from "./validation.js";
import { upload, saveUpload, removeUpload, getFileInfo, getFileBuffer, pipeGridFile, saveBufferAsFile } from "./uploads.js";
import { encryptSensitiveFields, maskSensitiveFields } from "./field-encryption.js";
const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const readSiteCopy = async () => {
  const row = await SiteContent.findOne({ key: "site" }).lean();
  if (!row?.content) throw Object.assign(new Error("Site content has not been seeded."), { status: 503 });
  return row.content;
};
export function createApp(cfg) {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet({ crossOriginResourcePolicy: { policy: "same-origin" } }));
  const allowedOrigins = [
    ...(cfg.clientOrigins || [cfg.origin]),
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5000",
    "http://localhost:5000",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://127.0.0.1:4173",
    "http://localhost:4173",
    "http://127.0.0.1:5001",
    "http://localhost:5001",
  ].map((o) => (o ? o.trim().replace(/\/$/, "").toLowerCase() : "")).filter(Boolean);
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
  const isOriginAllowed = (requestOrigin, reqHost = null) => {
    if (!requestOrigin || requestOrigin === "null") return true;
    const cleanOrigin = requestOrigin.trim().replace(/\/$/, "").toLowerCase();
    if (allowedOrigins.includes(cleanOrigin)) return true;
    try {
      const url = new URL(requestOrigin);
      // Loopback/localhost and private RFC1918 IPs on ANY port are always allowed
      if (isPrivateOrLoopbackHost(url.hostname)) {
        return true;
      }
      if (reqHost) {
        const cleanHost = reqHost.split(":")[0].toLowerCase();
        const urlHost = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
        if (urlHost === cleanHost) return true;
        if (isPrivateOrLoopbackHost(cleanHost) && isPrivateOrLoopbackHost(urlHost)) {
          return true;
        }
      }
    } catch {}
    return false;
  };
  app.use(cors({
    origin: (requestOrigin, callback) => callback(null, isOriginAllowed(requestOrigin)),
    credentials: true,
  }));
  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60000,
      limit: 300,
      standardHeaders: "draft-7",
      legacyHeaders: false,
    }),
  );
  app.use(express.json({ limit: "100kb" }), cookieParser(), mongoSanitize());
  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      req.headers.origin &&
      !isOriginAllowed(req.headers.origin, req.headers.host)
    )
      return res.status(403).json({ message: "Origin not allowed." });
    next();
  });
  const auth = authMiddleware(cfg);
  const authLimit = rateLimit({
    windowMs: 15 * 60000,
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  });
  const submissionLimit = rateLimit({
    windowMs: 60 * 60000,
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  });
  app.get("/api/health", (_req, res) => {
    const connected = mongoose.connection.readyState === 1;
    res.status(connected ? 200 : 503).json({ status: connected ? "ok" : "degraded", database: { status: connected ? "connected" : "disconnected", name: mongoose.connection.name || null } });
  });
  app.get("/api/site-content", wrap(async (_req, res) => {
    const content = await SiteContent.findOne({ key: "site" }).lean();
    if (!content) return res.status(503).json({ message: "Site content has not been seeded yet." });
    res.json({ content: content.content, updatedAt: content.updatedAt });
  }));
  app.post("/api/ai/assistant", submissionLimit, wrap(async (req, res) => {
    const result = await answerNgoInquiry(req.body);
    res.json(result);
  }));
  app.get("/api/files/:id", wrap(async (req, res, next) => {
    const fileId = req.params.id.replace(/\.[a-zA-Z0-9]+$/, "");
    const info = await getFileInfo(fileId);
    if (!info) return res.status(404).json({ message: "File not found." });
    if (info.bucketName === "privateFiles") return auth(req, res, () => {
      const id = fileId;
      const ownsFile = async () => {
        if (req.user.role === "admin") return true;
        const [account, cadet, internship, application] = await Promise.all([
          User.exists({ _id: req.user._id, $or: ["photo", "cv", "membershipProof", "memberSignature", "supportingDocument", "workSample"].map((field) => ({ [`${field}.fileId`]: id })) }),
          Cadet.exists({ user: req.user._id, recordKind: "cadetEnrollment", $or: ["photo", "qualificationProof", "guardianSignature", "cadetSignature"].map((field) => ({ [`${field}.fileId`]: id })) }),
          Internship.exists({ email: req.user.email, "cv.fileId": id }),
          RegistrationApplication.exists({ recordKind: "formRegistration", "attachments.fileId": id, $or: [{ "data.email": req.user.email }, { "data.memberEmail": req.user.email }] }),
        ]);
        return Boolean(account || cadet || internship || application);
      };
      ownsFile().then((allowed) => allowed ? pipeGridFile(info, res) : res.status(403).json({ message: "Access denied." })).catch(next);
    });
    pipeGridFile(info, res);
  }));
  app.post(
    "/api/auth/register",
    authLimit,
    upload.fields([
      { name: "photo", maxCount: 1 }, { name: "cv", maxCount: 1 },
      { name: "membershipProof", maxCount: 1 }, { name: "memberSignature", maxCount: 1 },
      { name: "supportingDocument", maxCount: 1 }, { name: "workSample", maxCount: 1 },
    ]),
    wrap((req, res) => registerAccount(req, res, cfg)),
  );
  for (const [route, role] of [
    ["login", "member"],
    ["admin-login", "admin"],
  ])
    app.post(
      `/api/auth/${route}`,
      authLimit,
      wrap(async (req, res) => {
        const data = loginSchema.parse(req.body);
        const user = await User.findOne({
          $or: [
            { username: data.username },
            { email: data.username },
          ],
        }).select("+passwordHash");
        if (
          !user ||
          user.role !== role ||
          !(await bcrypt.compare(data.password, user.passwordHash))
        )
          return res
            .status(401)
            .json({ message: "Username or password is incorrect." });
        if (role === "member" && user.status === "rejected")
          return res.status(403).json({ message: "This registration was declined. Please contact Agni Rural Welfare Society for assistance." });
        res.json(await issueSession(user, res, cfg, data.remember === true));
      }),
    );
  app.post(
    "/api/auth/refresh",
    authLimit,
    wrap(async (req, res) => {
      const token = req.cookies.agni_refresh;
      if (!token) return res.status(401).json({ message: "Please sign in." });
      const session = await Session.findOneAndDelete({
        tokenHash: hashToken(token),
        expiresAt: { $gt: new Date() },
      });
      if (!session) {
        clearSessionCookie(res, cfg);
        return res.status(401).json({ message: "Please sign in again." });
      }
      const user = await User.findById(session.user);
      if (!user) {
        clearSessionCookie(res, cfg);
        return res.status(401).json({ message: "Please sign in again." });
      }
      res.json(await issueSession(user, res, cfg, session.remember));
    }),
  );
  app.post(
    "/api/auth/logout",
    wrap(async (req, res) => {
      if (req.cookies.agni_refresh)
        await Session.deleteOne({
          tokenHash: hashToken(req.cookies.agni_refresh),
        });
      clearSessionCookie(res, cfg);
      res.status(204).end();
    }),
  );
  app.get("/api/auth/me", auth, (req, res) =>
    res.json({ user: publicUser(req.user) }),
  );
  app.get("/api/members/photo", auth, wrap(async (req, res) => {
    if (!req.user.photo)
      return res.status(404).json({ message: "No photo uploaded." });
    const info = await getFileInfo(req.user.photo.fileId);
    if (!info || info.bucketName !== "privateFiles") return res.status(404).json({ message: "No photo uploaded." });
    return pipeGridFile(info, res);
  }));
  app.get(
    "/api/members/id-card",
    auth,
    wrap(async (req, res) => {
      if (req.user.role !== "admin" && req.user.status && req.user.status !== "approved")
        return res.status(403).json({ message: "Your identity card will be available after administrator approval." });
      await sendIdCard(res, { ...req.user.toObject(), photoBuffer: await getFileBuffer(req.user.photo) }, cfg, await readSiteCopy());
    }),
  );
  app.get(
    "/api/verify/:id",
    wrap(async (req, res) => {
      const id = req.params.id;
      const user = await User.findOne({ $or: [{ memberId: id }, { registrationId: id }, { registrationNumber: id }] }).select(
        "fullName memberId registrationId registrationNumber registrationType enrollmentDate status approvedAt",
      );
      if (user && ["approved", "accepted"].includes(user.status)) {
        return res.json({
          fullName: user.fullName,
          memberId: user.registrationNumber || user.memberId || user.registrationId,
          category: user.registrationType || "Member",
          enrollmentDate: user.enrollmentDate || user.approvedAt,
          status: "Verified",
        });
      }
      const cadet = await Cadet.findOne({ $or: [{ registrationId: id }, { registrationNumber: id }], recordKind: "cadetEnrollment" }).select(
        "fullName registrationId registrationNumber enrollmentDate status approvedAt",
      );
      if (cadet && ["approved", "accepted"].includes(cadet.status)) {
        return res.json({
          fullName: cadet.fullName,
          memberId: cadet.registrationNumber || cadet.registrationId,
          category: "Cadet",
          enrollmentDate: cadet.enrollmentDate || cadet.approvedAt,
          status: "Verified",
        });
      }
      const appRecord = await RegistrationApplication.findOne({ $or: [{ registrationId: id }, { registrationNumber: id }], recordKind: "formRegistration" }).select(
        "data type registrationId registrationNumber status approvedAt createdAt",
      );
      if (appRecord && ["approved", "accepted"].includes(appRecord.status)) {
        const name = appRecord.data?.fullName || appRecord.data?.memberName || appRecord.data?.cadetName || "Verified Member";
        return res.json({
          fullName: name,
          memberId: appRecord.registrationNumber || appRecord.registrationId,
          category: appRecord.type || "Member",
          enrollmentDate: appRecord.approvedAt || appRecord.createdAt,
          status: "Verified",
        });
      }
      return res.status(404).json({ message: "Record not found" });
    }),
  );
  app.get(
    "/api/verify/:id/qr",
    wrap(async (req, res) => {
      const id = req.params.id;
      const qrUrl = `${cfg?.origin || "http://127.0.0.1:5173"}/verify/${encodeURIComponent(id)}`;
      const qrBuffer = await QRCode.toBuffer(qrUrl, { width: 240, margin: 1, color: { dark: "#17231f", light: "#fffafc" } });
      res.set({ "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" });
      res.send(qrBuffer);
    }),
  );
  app.post(
    "/api/cadets",
    auth,
    submissionLimit,
    upload.fields([
      { name: "photo", maxCount: 1 },
      { name: "qualificationProof", maxCount: 1 },
      { name: "guardianSignature", maxCount: 1 },
      { name: "cadetSignature", maxCount: 1 },
    ]),
    wrap(async (req, res) => {
      const data = cadetSchema.parse(req.body);
      if (!req.files?.photo?.[0])
        return res
          .status(400)
          .json({ message: "Upload a passport photo." });
      const photo = await saveUpload(req.files.photo[0], "photos");
      const saved = [photo];
      let item;
      try {
        const qualificationProof = await saveUpload(req.files?.qualificationProof?.[0], "cv"); saved.push(qualificationProof);
        const guardianSignature = await saveUpload(req.files?.guardianSignature?.[0], "photos"); saved.push(guardianSignature);
        const cadetSignature = await saveUpload(req.files?.cadetSignature?.[0], "photos"); saved.push(cadetSignature);
        item = await Cadet.create({ ...data, recordKind: "cadetEnrollment", photo, qualificationProof, guardianSignature, cadetSignature, user: req.user._id });
      } catch (error) {
        await Promise.all(saved.map((file) => removeUpload(file)));
        throw error;
      }
      res
        .status(201)
        .json({ registrationId: item.registrationId, status: item.status });
    }),
  );
  app.get(
    "/api/cadets/:id/id-card",
    auth,
    wrap(async (req, res) => {
      const item = await Cadet.findOne({ registrationId: req.params.id, recordKind: "cadetEnrollment" });
      if (!item) return res.status(404).json({ message: "Record not found" });
      if (req.user.role !== "admin" && item.status !== "approved")
        return res.status(403).json({ message: "The cadet identity card will be available after administrator approval." });
      if (item.user.toString() !== req.user.id && req.user.role !== "admin")
        return res.status(403).json({ message: "Access denied" });
      await sendIdCard(res, { ...item.toObject(), photoBuffer: await getFileBuffer(item.photo) }, cfg, await readSiteCopy(), true);
    }),
  );
  app.get(
    "/api/cadets/mine",
    auth,
    wrap(async (req, res) =>
      res.json(
        await Cadet.find({ user: req.user._id, recordKind: "cadetEnrollment" })
          .select("registrationId status createdAt")
          .sort({ createdAt: -1 }),
      ),
    ),
  );
  app.post(
    "/api/internships",
    submissionLimit,
    upload.single("cv"),
    wrap(async (req, res) => {
      const data = internshipSchema.parse(req.body);
      if (!req.file)
        return res.status(400).json({ message: "Upload your CV." });
      const cv = await saveUpload(req.file, "cv");
      try {
        const item = await Internship.create({ ...data, cv });
        res
          .status(201)
          .json({ registrationId: item.registrationId, status: item.status });
      } catch (e) {
        await removeUpload(cv);
        throw e;
      }
    }),
  );
  app.post(
    "/api/registration-applications",
    submissionLimit,
    upload.array("attachments", 6),
    wrap((req, res) => submitRegistrationApplication(req, res, cfg)),
  );
  app.post(
    "/api/pledges",
    submissionLimit,
    wrap(async (req, res) => {
      const data = pledgeSchema.parse(req.body);
      const item = await Pledge.create(data);
      res.status(201).json({
        reference: item.reference,
        message: "Payment processing is unavailable; your pledge was recorded without charge.",
      });
    }),
  );
  app.post(
    "/api/contact",
    submissionLimit,
    wrap(async (req, res) => {
      const { fullName, email, phone, category, subject, message, rating } = req.body || {};
      if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
        return res.status(400).json({ message: "Full name is required." });
      }
      if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ message: "A valid email address is required." });
      }
      if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ message: "Message content is required." });
      }
      const isFeedback = category === "feedback" || /feedback/i.test(subject || "");
      const item = await ContactMessage.create({
        fullName: fullName.trim().slice(0, 100),
        email: email.trim().toLowerCase().slice(0, 254),
        phone: typeof phone === "string" ? phone.trim().slice(0, 30) : "",
        category: isFeedback ? "feedback" : (["enquiry", "volunteer", "general"].includes(category) ? category : "contact"),
        subject: typeof subject === "string" ? subject.trim().slice(0, 200) : (isFeedback ? "User Feedback" : "General Message"),
        message: message.trim().slice(0, 5000),
        rating: Number(rating) >= 1 && Number(rating) <= 5 ? Number(rating) : undefined,
      });

      const responseHeading = isFeedback ? "Your Voice Matters!" : "Message Received Successfully!";
      const responseMessage = isFeedback
        ? "Thank you for sharing your valuable feedback. We appreciate your contribution to improving our organization."
        : "Thank you for reaching out to AGNI Rural Welfare Society. Our team appreciates your message and will get back to you if a response is required.";

      res.status(201).json({
        success: true,
        reference: item.reference,
        heading: responseHeading,
        message: responseMessage,
      });
    }),
  );
  app.get(
    "/api/gallery",
    wrap(async (_req, res) =>
      res.json(await Gallery.find().sort({ order: 1, createdAt: 1 })),
    ),
  );
  app.use("/api/admin", auth, adminOnly);
  const collections = {
    cadets: Cadet,
    internships: Internship,
    pledges: Pledge,
    contacts: ContactMessage,
  };
  function getApplicationCategory(source, item) {
    if (source === "cadets") return "Cadets";
    if (source === "internships") return "Intern & Alumni";
    const typeStr = item.type || item.registrationType || "";
    if (/cadet/i.test(typeStr)) return "Cadets";
    if (/volunteer/i.test(typeStr)) return "Volunteers";
    if (/intern|alumni/i.test(typeStr)) return "Intern & Alumni";
    return "Members";
  }

  async function checkUniqueRegistrationNumber(regNum, currentRecordId, applicantEmail = null) {
    if (!regNum) return true;
    const num = String(regNum).trim();
    const idStr = String(currentRecordId);
    const cleanEmail = (applicantEmail || "").trim().toLowerCase();

    const isMatchOther = (doc) => {
      if (!doc) return false;
      if (String(doc._id) === idStr) return false;
      const docEmail = (doc.email || doc.data?.email || doc.data?.memberEmail || "").trim().toLowerCase();
      if (cleanEmail && docEmail && docEmail === cleanEmail) return false;
      return true;
    };

    const [u, c, i, r] = await Promise.all([
      User.findOne({ $or: [{ memberId: num }, { registrationNumber: num }] }).select("_id email").lean(),
      Cadet.findOne({ $or: [{ registrationId: num }, { registrationNumber: num }] }).select("_id email").lean(),
      Internship.findOne({ $or: [{ registrationId: num }, { registrationNumber: num }] }).select("_id email").lean(),
      RegistrationApplication.findOne({ $or: [{ registrationId: num }, { registrationNumber: num }] }).select("_id data").lean(),
    ]);

    if (isMatchOther(u) || isMatchOther(c) || isMatchOther(i) || isMatchOther(r)) {
      return false;
    }
    return true;
  }

  async function resolveApplication(source, id) {
    let targetId = id;
    let targetSource = source;
    if (!targetId && mongoose.isValidObjectId(source)) {
      targetId = source;
      targetSource = null;
    }
    if (!mongoose.isValidObjectId(targetId)) {
      throw Object.assign(new Error("Invalid record ID."), { status: 400 });
    }

    if (targetSource) {
      const Model = {
        accounts: User,
        cadets: Cadet,
        internships: Internship,
        submissions: RegistrationApplication,
      }[targetSource];

      if (Model) {
        const doc = await Model.findById(targetId);
        if (doc) {
          if (targetSource === "cadets" && (doc.recordKind === "formRegistration" || (!doc.user && doc.data))) {
            const actualDoc = await RegistrationApplication.findById(targetId);
            if (actualDoc) return { item: actualDoc, Model: RegistrationApplication, source: "submissions", id: targetId };
          }
          return { item: doc, Model, source: targetSource, id: targetId };
        }
      }
    }

    const [subDoc, accDoc, cadDoc, intDoc] = await Promise.all([
      RegistrationApplication.findById(targetId),
      User.findById(targetId),
      Cadet.findOne({ _id: targetId, $or: [{ recordKind: "cadetEnrollment" }, { user: { $exists: true } }] }),
      Internship.findById(targetId),
    ]);

    if (subDoc) return { item: subDoc, Model: RegistrationApplication, source: "submissions", id: targetId };
    if (accDoc) return { item: accDoc, Model: User, source: "accounts", id: targetId };
    if (cadDoc) return { item: cadDoc, Model: Cadet, source: "cadets", id: targetId };
    if (intDoc) return { item: intDoc, Model: Internship, source: "internships", id: targetId };

    throw Object.assign(new Error("Applicant not found."), { status: 404 });
  }

  async function handleAcceptApplication(source, id, body = {}, cfg = {}, user = null) {
    const { item, Model, source: actualSource, id: actualId } = await resolveApplication(source, id);

    const category = getApplicationCategory(actualSource, item);
    const applicantEmail = item.email || item.data?.email || item.data?.memberEmail || "";

    // 1. Validate required fields
    const inputRegNo = (body.registrationNumber || "").trim();
    if (!inputRegNo) {
      throw Object.assign(new Error("Official Registration Number is required."), { status: 400 });
    }

    // 2. Date validation: Valid Until >= Valid From
    const validFrom = (body.validFrom || item.validFrom || "").trim();
    const validUntil = (body.validUntil || item.validUntil || "").trim();
    if (validFrom && validUntil) {
      const fromDate = new Date(validFrom);
      const untilDate = new Date(validUntil);
      if (!Number.isNaN(fromDate.valueOf()) && !Number.isNaN(untilDate.valueOf()) && untilDate < fromDate) {
        throw Object.assign(new Error("Valid Until date must be on or after Valid From date."), { status: 400 });
      }
    }

    // 3. Uniqueness check
    const isUnique = await checkUniqueRegistrationNumber(inputRegNo, actualId, applicantEmail);
    if (!isUnique) {
      throw Object.assign(new Error(`Registration Number "${inputRegNo}" is already in use by another record.`), { status: 400 });
    }

    const regId = inputRegNo;
    const approvedAt = new Date();
    const approvedBy = user?.username || user?.fullName || "admin";

    // 4. Update the record
    item.status = "accepted";
    item.approvedAt = approvedAt;
    item.approvedBy = approvedBy;
    item.reviewedBy = approvedBy;
    item.rejectedAt = null;
    item.rejectionReason = null;
    item.declinedAt = null;
    item.declinedBy = null;
    item.registrationNumber = regId;
    if (validFrom) item.validFrom = validFrom;
    if (validUntil) item.validUntil = validUntil;

    if (actualSource === "accounts") {
      item.memberId = regId;
    }
    if (actualSource === "submissions" && item.data) {
      item.data.registrationNumber = regId;
      if (validFrom) item.data.validFrom = validFrom;
      if (validUntil) item.data.validUntil = validUntil;
    }

    // Safe save
    try {
      await item.save({ validateModifiedOnly: true });
    } catch {
      await Model.findByIdAndUpdate(
        actualId,
        {
          $set: {
            status: "accepted",
            approvedAt,
            approvedBy,
            reviewedBy: approvedBy,
            rejectedAt: null,
            rejectionReason: null,
            declinedAt: null,
            declinedBy: null,
            registrationNumber: regId,
            ...(validFrom ? { validFrom } : {}),
            ...(validUntil ? { validUntil } : {}),
            ...(actualSource === "accounts" ? { memberId: regId } : {}),
            ...(actualSource === "submissions" ? { "data.registrationNumber": regId } : {}),
          },
        },
        { new: true, runValidators: false }
      );
    }

    // Safely sync linked user account if exists
    if (actualSource === "submissions" && applicantEmail) {
      try {
        const account = await User.findOne({ role: "member", email: applicantEmail.trim().toLowerCase() });
        if (account) {
          account.status = "accepted";
          account.approvedAt = approvedAt;
          account.approvedBy = approvedBy;
          account.registrationNumber = regId;
          if (validFrom) account.validFrom = validFrom;
          if (validUntil) account.validUntil = validUntil;
          account.reviewedBy = approvedBy;
          await account.save({ validateModifiedOnly: true });
        }
      } catch (syncErr) {
        console.warn("Linked user account sync notice:", syncErr?.message);
      }
    }

    return {
      success: true,
      status: "accepted",
      registrationId: regId,
      registrationNumber: regId,
      approvedAt: item.approvedAt,
      approvedBy: item.approvedBy,
      validFrom: item.validFrom,
      validUntil: item.validUntil,
      reviewedBy: item.reviewedBy,
      idCardFileId: item.idCardFileId,
      idCardGenerated: Boolean(item.idCardFileId || item.idCardGenerated),
      idCardGeneratedAt: item.idCardGeneratedAt,
      emailStatus: item.emailStatus,
      approvalEmailStatus: item.approvalEmailStatus,
      acceptanceEmailSent: Boolean(item.acceptanceEmailSent),
    };
  }

  async function handleGenerateIdCard(source, id, cfg, customRegId = null) {
    const { item, Model, source: actualSource, id: actualId } = await resolveApplication(source, id);

    const isAccepted = item.status === "accepted" || item.status === "approved";
    if (!isAccepted) {
      throw Object.assign(new Error(`Cannot generate ID card for ${item.status || "unapproved"} application. Application must be approved first.`), { status: 400 });
    }

    const category = getApplicationCategory(actualSource, item);
    const assignedRegId = (typeof customRegId === "string" && customRegId.trim())
      ? customRegId.trim()
      : (item.registrationNumber || (actualSource === "accounts" ? item.memberId : item.registrationId) || await getNextRegistrationId(category));
    const regId = assignedRegId;

    // Resolve photo buffer
    let photoBuffer = null;
    let photoRef = null;
    if (actualSource === "accounts" && item.photo) {
      photoRef = item.photo;
    } else if (actualSource === "cadets" && item.photo) {
      photoRef = item.photo;
    } else if (actualSource === "submissions" && item.attachments?.length) {
      photoRef = item.attachments.find((f) => f.mimetype?.startsWith("image/") || /photo/i.test(f.name || ""));
    }
    if (photoRef?.fileId) {
      try { photoBuffer = await getFileBuffer(photoRef); } catch {}
    }

    const siteCopy = await readSiteCopy().catch(() => ({ brand: { name: "Agni Rural Welfare Society", motto: "Service to humanity is service to God" } }));
    const fullName = item.fullName || item.data?.fullName || item.data?.memberName || item.data?.cadetName || "Valued Member";

    // Generate ID Card PDF buffer
    const cardRecord = {
      ...(item.toObject ? item.toObject() : item),
      registrationId: regId,
      registrationNumber: regId,
      memberId: regId,
      category,
      type: category,
      photoBuffer,
      fullName,
      address: item.address || item.residentialAddress || item.data?.address || item.data?.residentialAddress || "",
      guardian: item.guardian || item.fatherName || item.data?.guardian || item.data?.fatherName || "",
      bloodGroup: item.bloodGroup || item.data?.bloodGroup || "",
      dob: item.dob || item.data?.dob || item.data?.dateOfBirth || "",
      enrollmentDate: item.enrollmentDate || item.data?.enrollmentDate || new Date(),
      approvedAt: item.approvedAt || new Date(),
      validFrom: item.validFrom || item.data?.validFrom || null,
      validUntil: item.validUntil || item.data?.validUntil || null,
      troopNo: item.troopNo || item.data?.troopNo || null,
    };

    const pdfBuffer = await generateIdCardPdf(cardRecord, cfg, siteCopy);

    // Save ID card in GridFS
    const savedCard = await saveBufferAsFile(pdfBuffer, `agni-id-card-${regId}.pdf`, "application/pdf");

    item.registrationNumber = regId;
    if (actualSource === "accounts") item.memberId = regId;
    else item.registrationId = regId;
    item.idCardFileId = savedCard.fileId;
    item.idCardFileReference = savedCard.fileId;
    item.idCardGenerated = true;
    item.idCardGeneratedAt = new Date();
    try {
      await item.save({ validateModifiedOnly: true });
    } catch {
      await Model.findByIdAndUpdate(actualId, {
        $set: {
          registrationNumber: regId,
          ...(actualSource === "accounts" ? { memberId: regId } : { registrationId: regId }),
          idCardFileId: savedCard.fileId,
          idCardFileReference: savedCard.fileId,
          idCardGenerated: true,
          idCardGeneratedAt: item.idCardGeneratedAt,
        }
      });
    }

    // Sync linked user account if exists
    const applicantEmail = item.email || item.data?.email || item.data?.memberEmail;
    if (applicantEmail) {
      try {
        const account = await User.findOne({ email: applicantEmail.trim().toLowerCase() });
        if (account) {
          account.registrationNumber = regId;
          account.memberId = regId;
          account.idCardFileId = savedCard.fileId;
          account.idCardFileReference = savedCard.fileId;
          account.idCardGenerated = true;
          account.idCardGeneratedAt = item.idCardGeneratedAt;
          if (!account.photo && photoRef?.fileId) {
            account.photo = { fileId: photoRef.fileId, filename: photoRef.filename, mimetype: photoRef.mimetype, size: photoRef.size, bucket: photoRef.bucket };
          }
          await account.save({ validateModifiedOnly: true });
        }
      } catch (syncErr) {
        console.warn("Linked account ID card sync notice:", syncErr?.message);
      }
    }

    return {
      success: true,
      registrationNumber: regId,
      idCardFileId: savedCard.fileId,
      idCardGenerated: true,
      idCardGeneratedAt: item.idCardGeneratedAt,
    };
  }

  async function handleSendApprovalEmail(source, id, cfg) {
    const { item, source: actualSource, id: actualId } = await resolveApplication(source, id);

    const isAccepted = item.status === "accepted" || item.status === "approved";
    if (!isAccepted) {
      throw Object.assign(new Error("Application must be approved before sending an acceptance email."), { status: 400 });
    }

    const applicantEmail = item.email || item.data?.email || item.data?.memberEmail;
    if (!applicantEmail) throw Object.assign(new Error("No email address found for this applicant."), { status: 400 });

    const category = getApplicationCategory(actualSource, item);
    const regId = item.registrationNumber || (actualSource === "accounts" ? item.memberId : item.registrationId) || "AGNI-MEM-2026-0001";
    const fullName = item.fullName || item.data?.fullName || item.data?.memberName || item.data?.cadetName || "Valued Member";

    // Attach ID Card ONLY IF already generated (do not auto-generate)
    let pdfBuffer = null;
    if (item.idCardFileId) {
      try {
        pdfBuffer = await getFileBuffer({ fileId: item.idCardFileId, bucket: "privateFiles" });
      } catch (e) {
        console.error("Failed to read existing ID card PDF from GridFS:", e);
      }
    }

    const downloadUrl = `${cfg?.origin || "http://127.0.0.1:5173"}/verify/${encodeURIComponent(regId)}`;

    const emailResult = await sendAcceptanceEmail({
      to: applicantEmail,
      name: fullName,
      type: category,
      registrationNumber: regId,
      applicationId: regId,
      validFrom: item.validFrom,
      validUntil: item.validUntil,
      downloadUrl,
      pdfBuffer,
    });

    let statusStr = "failed";
    if (emailResult.success) statusStr = "sent";
    else if (emailResult.notConfigured) statusStr = "not_configured";

    item.approvalEmailStatus = statusStr;
    item.approvalEmailSentAt = new Date();
    item.acceptanceEmailSent = emailResult.success;
    item.acceptanceEmailSentAt = item.approvalEmailSentAt;
    item.emailStatus = statusStr;
    item.emailSentAt = item.approvalEmailSentAt;
    item.emailError = emailResult.error || null;
    item.emailHistory = item.emailHistory || [];
    item.emailHistory.push({
      recipient: applicantEmail,
      subject: "Your Registration Has Been Approved – AGNI Rural Welfare Society",
      type: "acceptance",
      hasAttachment: Boolean(pdfBuffer),
      sentAt: item.approvalEmailSentAt,
      status: statusStr,
      error: emailResult.error || null,
    });
    try {
      await item.save({ validateModifiedOnly: true });
    } catch {}

    return {
      success: emailResult.success,
      notConfigured: emailResult.notConfigured,
      approvalEmailStatus: statusStr,
      acceptanceEmailSent: Boolean(item.acceptanceEmailSent),
      emailStatus: statusStr,
      emailError: item.emailError,
      emailSentAt: item.approvalEmailSentAt,
      hasAttachment: Boolean(pdfBuffer),
    };
  }

  async function handleDeclineApplication(source, id, reason, cfg = {}, user = null) {
    const { item, Model, source: actualSource, id: actualId } = await resolveApplication(source, id);

    const cleanReason = (reason || "").trim();
    item.status = "rejected";
    item.declinedAt = new Date();
    item.declinedBy = user?.username || user?.fullName || "admin";
    item.rejectedAt = item.declinedAt;
    item.rejectionReason = cleanReason;
    item.reviewedBy = item.declinedBy;
    item.approvedAt = null;
    item.approvedBy = null;
    try {
      await item.save({ validateModifiedOnly: true });
    } catch {
      await Model.findByIdAndUpdate(actualId, {
        $set: {
          status: "rejected",
          declinedAt: item.declinedAt,
          declinedBy: item.declinedBy,
          rejectedAt: item.declinedAt,
          rejectionReason: cleanReason,
          reviewedBy: item.declinedBy,
          approvedAt: null,
          approvedBy: null,
        }
      });
    }

    const applicantEmail = item.email || item.data?.email || item.data?.memberEmail;
    if (actualSource === "submissions" && applicantEmail) {
      try {
        const account = await User.findOne({ role: "member", email: applicantEmail.trim().toLowerCase() });
        if (account) {
          account.status = "rejected";
          account.declinedAt = item.declinedAt;
          account.declinedBy = item.declinedBy;
          account.rejectedAt = item.declinedAt;
          account.rejectionReason = cleanReason;
          account.reviewedBy = item.declinedBy;
          account.approvedAt = null;
          account.approvedBy = null;
          await account.save({ validateModifiedOnly: true });
        }
      } catch (syncErr) {
        console.warn("Linked account decline notice:", syncErr?.message);
      }
    }

    return {
      success: true,
      status: "rejected",
      declinedAt: item.declinedAt,
      declinedBy: item.declinedBy,
      rejectedAt: item.rejectedAt,
      rejectionReason: item.rejectionReason,
      reviewedBy: item.reviewedBy,
    };
  }

  async function handleSendRejectionEmail(source, id) {
    const { item } = await resolveApplication(source, id);

    if (item.status !== "rejected") {
      throw Object.assign(new Error("Application must be declined before sending a rejection email."), { status: 400 });
    }

    const applicantEmail = item.email || item.data?.email || item.data?.memberEmail;
    if (!applicantEmail) throw Object.assign(new Error("No email address found for this applicant."), { status: 400 });

    const category = getApplicationCategory(source, item);
    const regId = item.registrationNumber || (source === "accounts" ? item.memberId : item.registrationId) || "—";
    const fullName = item.fullName || item.data?.fullName || item.data?.memberName || item.data?.cadetName || "Applicant";

    const emailResult = await sendRejectionEmail({
      to: applicantEmail,
      name: fullName,
      type: category,
      applicationId: regId,
      reason: item.rejectionReason,
    });

    let statusStr = "failed";
    if (emailResult.success) statusStr = "sent";
    else if (emailResult.notConfigured) statusStr = "not_configured";

    item.rejectionEmailStatus = statusStr;
    item.rejectionEmailSentAt = new Date();
    item.rejectionEmailSent = emailResult.success;
    item.emailStatus = statusStr;
    item.emailSentAt = item.rejectionEmailSentAt;
    item.emailError = emailResult.error || null;
    item.emailHistory = item.emailHistory || [];
    item.emailHistory.push({
      recipient: applicantEmail,
      subject: "Registration Application Update – AGNI Rural Welfare Society",
      type: "rejection",
      hasAttachment: false,
      sentAt: item.rejectionEmailSentAt,
      status: statusStr,
      error: emailResult.error || null,
    });
    try {
      await item.save({ validateModifiedOnly: true });
    } catch {}

    return {
      success: emailResult.success,
      notConfigured: emailResult.notConfigured,
      rejectionEmailStatus: statusStr,
      rejectionEmailSent: Boolean(item.rejectionEmailSent),
      emailStatus: statusStr,
      emailError: item.emailError,
      emailSentAt: item.rejectionEmailSentAt,
    };
  }

  async function handleRetryEmail(source, id, cfg) {
    const { item, source: actualSource, id: actualId } = await resolveApplication(source, id);
    if (!item) throw Object.assign(new Error("Applicant not found."), { status: 404 });

    const applicantEmail = item.email || item.data?.email || item.data?.memberEmail;
    if (!applicantEmail) throw Object.assign(new Error("No email address associated with this application."), { status: 400 });

    const fullName = item.fullName || item.data?.fullName || item.data?.memberName || item.data?.cadetName || "Valued Member";
    const category = getApplicationCategory(source, item);
    const regId = source === "accounts" ? item.memberId : item.registrationId;

    if (item.status === "accepted" || item.status === "approved") {
      let pdfBuffer = null;
      if (item.idCardFileId) {
        try { pdfBuffer = await getFileBuffer({ fileId: item.idCardFileId, bucket: "privateFiles" }); } catch {}
      }
      if (!pdfBuffer) {
        const siteCopy = await readSiteCopy().catch(() => ({ brand: { name: "Agni Rural Welfare Society", motto: "Service to humanity is service to God" } }));
        let photoBuffer = null;
        let photoRef = item.photo || item.attachments?.find((f) => f.mimetype?.startsWith("image/"));
        if (photoRef?.fileId) {
          try { photoBuffer = await getFileBuffer(photoRef); } catch {}
        }
        pdfBuffer = await generateIdCardPdf({
          ...(item.toObject ? item.toObject() : item),
          registrationId: regId,
          memberId: regId,
          category,
          fullName,
          photoBuffer,
        }, cfg, siteCopy);
      }

      const emailResult = await sendAcceptanceEmail({
        to: applicantEmail,
        name: fullName,
        type: category,
        registrationNumber: item.registrationNumber || regId,
        applicationId: regId,
        validFrom: item.validFrom,
        validUntil: item.validUntil,
        pdfBuffer,
      });

      if (emailResult.success) {
        item.emailStatus = "sent";
        item.approvalEmailStatus = "sent";
        item.acceptanceEmailSent = true;
        item.emailSentAt = new Date();
        item.approvalEmailSentAt = item.emailSentAt;
        item.acceptanceEmailSentAt = item.emailSentAt;
        item.emailError = null;
      } else if (emailResult.notConfigured) {
        item.emailStatus = "not_configured";
        item.approvalEmailStatus = "not_configured";
        item.emailError = emailResult.error;
      } else {
        item.emailStatus = "failed";
        item.approvalEmailStatus = "failed";
        item.emailError = emailResult.error;
      }
      item.emailHistory = item.emailHistory || [];
      item.emailHistory.push({
        recipient: applicantEmail,
        subject: "Your Registration Has Been Approved – AGNI Rural Welfare Society",
        type: "acceptance-retry",
        hasAttachment: Boolean(pdfBuffer),
        sentAt: new Date(),
        status: item.emailStatus,
        error: item.emailError,
      });
      try {
        await item.save({ validateModifiedOnly: true });
      } catch {
        await Model.findByIdAndUpdate(actualId, {
          $set: {
            emailStatus: item.emailStatus,
            approvalEmailStatus: item.approvalEmailStatus,
            acceptanceEmailSent: item.acceptanceEmailSent,
            emailSentAt: item.emailSentAt,
            emailError: item.emailError,
          },
          $push: { emailHistory: item.emailHistory[item.emailHistory.length - 1] },
        });
      }
      return {
        success: emailResult.success,
        notConfigured: emailResult.notConfigured,
        emailStatus: item.emailStatus,
        approvalEmailStatus: item.approvalEmailStatus,
        emailError: item.emailError,
        emailSentAt: item.emailSentAt,
      };
    } else if (item.status === "rejected") {
      const emailResult = await sendRejectionEmail({
        to: applicantEmail,
        name: fullName,
        type: category,
        applicationId: regId,
        reason: item.rejectionReason,
      });
      if (emailResult.success) {
        item.emailStatus = "sent";
        item.rejectionEmailStatus = "sent";
        item.rejectionEmailSent = true;
        item.emailSentAt = new Date();
        item.rejectionEmailSentAt = item.emailSentAt;
        item.emailError = null;
      } else if (emailResult.notConfigured) {
        item.emailStatus = "not_configured";
        item.rejectionEmailStatus = "not_configured";
        item.emailError = emailResult.error;
      } else {
        item.emailStatus = "failed";
        item.rejectionEmailStatus = "failed";
        item.emailError = emailResult.error;
      }
      item.emailHistory = item.emailHistory || [];
      item.emailHistory.push({
        recipient: applicantEmail,
        subject: "Registration Application Update – AGNI Rural Welfare Society",
        type: "rejection-retry",
        hasAttachment: false,
        sentAt: new Date(),
        status: item.emailStatus,
        error: item.emailError,
      });
      try {
        await item.save({ validateModifiedOnly: true });
      } catch {
        await Model.findByIdAndUpdate(actualId, {
          $set: {
            emailStatus: item.emailStatus,
            rejectionEmailStatus: item.rejectionEmailStatus,
            rejectionEmailSent: item.rejectionEmailSent,
            emailSentAt: item.emailSentAt,
            emailError: item.emailError,
          },
          $push: { emailHistory: item.emailHistory[item.emailHistory.length - 1] },
        });
      }
      return {
        success: emailResult.success,
        notConfigured: emailResult.notConfigured,
        emailStatus: item.emailStatus,
        rejectionEmailStatus: item.rejectionEmailStatus,
        emailError: item.emailError,
        emailSentAt: item.emailSentAt,
      };
    } else {
      throw Object.assign(new Error("Cannot send email for a pending application."), { status: 400 });
    }
  }

  async function handleDownloadIdCard(source, id, res, cfg) {
    const { item, source: actualSource, id: actualId } = await resolveApplication(source, id);
    if (!item) return res.status(404).json({ message: "Applicant not found." });

    if (!["approved", "accepted"].includes(item.status)) {
      return res.status(400).json({ message: "ID card is only available for accepted applications." });
    }

    if (item.idCardFileId) {
      const info = await getFileInfo(item.idCardFileId);
      if (info) return pipeGridFile(info, res);
    }

    const category = getApplicationCategory(actualSource, item);
    const regId = item.registrationNumber || (actualSource === "accounts" ? item.memberId : item.registrationId);
    const siteCopy = await readSiteCopy().catch(() => ({ brand: { name: "Agni Rural Welfare Society", motto: "Service to humanity is service to God" } }));
    let photoBuffer = null;
    let photoRef = item.photo || item.attachments?.find((f) => f.mimetype?.startsWith("image/"));
    if (photoRef?.fileId) {
      try { photoBuffer = await getFileBuffer(photoRef); } catch {}
    }
    await sendIdCard(res, {
      ...(item.toObject ? item.toObject() : item),
      registrationId: regId,
      registrationNumber: item.registrationNumber || regId,
      memberId: regId,
      category,
      type: category,
      photoBuffer,
      fullName: item.fullName || item.data?.fullName || item.data?.memberName || item.data?.cadetName || "Member",
    }, cfg, siteCopy);
  }

  app.get(
    "/api/admin/stats",
    wrap(async (_req, res) => {
      const [users, cadets, internships, submissions, pledges] = await Promise.all([
        User.find({ role: "member", username: { $not: /^demo\.member\d+$/i } }).select("registrationType status").lean(),
        Cadet.find({ $or: [{ recordKind: "cadetEnrollment" }, { user: { $exists: true } }] }).select("status").lean(),
        Internship.find().select("status").lean(),
        RegistrationApplication.find({ $or: [{ recordKind: "formRegistration" }, { data: { $exists: true } }] }).select("type status").lean(),
        Pledge.countDocuments(),
      ]);

      const normalizeStatus = (s) => (s === "approved" || s === "accepted") ? "accepted" : (s === "rejected" ? "rejected" : "pending");

      const allApps = [
        ...users.map((u) => ({ category: getApplicationCategory("accounts", u), status: normalizeStatus(u.status) })),
        ...cadets.map((c) => ({ category: "Cadets", status: normalizeStatus(c.status) })),
        ...internships.map((i) => ({ category: "Intern & Alumni", status: normalizeStatus(i.status) })),
        ...submissions.map((s) => ({ category: getApplicationCategory("submissions", s), status: normalizeStatus(s.status) })),
      ];

      const totalApplications = allApps.length;
      const pending = allApps.filter((a) => a.status === "pending").length;
      const accepted = allApps.filter((a) => a.status === "accepted").length;
      const rejected = allApps.filter((a) => a.status === "rejected").length;

      const members = allApps.filter((a) => a.category === "Members").length;
      const cadetsCount = allApps.filter((a) => a.category === "Cadets").length;
      const volunteers = allApps.filter((a) => a.category === "Volunteers").length;
      const interns = allApps.filter((a) => a.category === "Intern & Alumni").length;

      res.json({
        totalApplications,
        applicants: totalApplications,
        pending,
        accepted,
        rejected,
        members,
        cadets: cadetsCount,
        volunteers,
        internships: interns,
        pledges,
      });
    }),
  );

  app.get("/api/admin/applications", wrap(async (_req, res) => {
    const [users, cadets, internships, applications] = await Promise.all([
      User.find({ role: "member", username: { $not: /^demo\.member\d+$/i } }).select("fullName username email memberId registrationType registrationDetails guardian address bloodGroup dob enrollmentDate status approvedAt approvedBy declinedAt declinedBy rejectedAt rejectionReason reviewedBy registrationNumber validFrom validUntil idCardFileId idCardFileReference idCardGenerated idCardGeneratedAt acceptanceEmailSent acceptanceEmailSentAt rejectionEmailSent rejectionEmailSentAt emailStatus emailError emailSentAt approvalEmailStatus approvalEmailSentAt rejectionEmailStatus rejectionEmailSentAt troopNo photo cv membershipProof memberSignature supportingDocument workSample createdAt").lean(),
      Cadet.find({ $or: [{ recordKind: "cadetEnrollment" }, { user: { $exists: true } }] }).lean(),
      Internship.find().lean(),
      RegistrationApplication.find({ $or: [{ recordKind: "formRegistration" }, { data: { $exists: true } }] }).lean(),
    ]);

    const sensitive = /(?:password|token|secret|hash)/i;
    const internal = /^(?:_id|__v|user|photo|cv|membershipProof|memberSignature|supportingDocument|workSample|qualificationProof|guardianSignature|cadetSignature)$/i;

    const safeDetails = (input) => Object.fromEntries(Object.entries(maskSensitiveFields(input || {}))
      .filter(([key, value]) => !sensitive.test(key) && !internal.test(key) && value !== undefined && value !== null)
      .map(([key, value]) => [key, Array.isArray(value) ? value.map((entry) => String(entry)).join(", ") : typeof value === "object" ? JSON.stringify(value) : String(value)]));

    const fileSummary = (input) => Object.entries(input || {})
      .filter(([key, value]) => /(?:photo|cv|proof|signature|document|sample)/i.test(key) && value?.fileId)
      .map(([key, value]) => ({ name: key.replace(/([a-z])([A-Z])/g, "$1 $2"), filename: value.filename, mimetype: value.mimetype, size: value.size, fileId: value.fileId }));

    const normalizeStatus = (s) => (s === "approved" || s === "accepted") ? "accepted" : (s === "rejected" ? "rejected" : "pending");

    const accountRows = users.map((item) => ({
      _id: `accounts:${item._id}`,
      recordId: String(item._id),
      source: "accounts",
      category: getApplicationCategory("accounts", item),
      type: item.registrationType || "Member",
      fullName: item.fullName,
      email: item.email,
      phone: item.registrationDetails?.phone || item.registrationDetails?.mobile || "",
      address: item.address || item.registrationDetails?.address || "",
      registrationId: item.memberId,
      registrationNumber: item.registrationNumber || item.memberId || null,
      validFrom: item.validFrom || null,
      validUntil: item.validUntil || null,
      approvedBy: item.approvedBy || item.reviewedBy || null,
      declinedBy: item.declinedBy || item.reviewedBy || null,
      reviewedBy: item.reviewedBy || item.approvedBy || item.declinedBy || null,
      status: normalizeStatus(item.status),
      createdAt: item.createdAt,
      approvedAt: item.approvedAt,
      declinedAt: item.declinedAt || item.rejectedAt || null,
      rejectedAt: item.rejectedAt,
      rejectionReason: item.rejectionReason,
      idCardFileId: item.idCardFileId,
      idCardFileReference: item.idCardFileReference || item.idCardFileId || null,
      idCardGenerated: Boolean(item.idCardGenerated || item.idCardFileId),
      idCardGeneratedAt: item.idCardGeneratedAt || null,
      acceptanceEmailSent: Boolean(item.acceptanceEmailSent),
      acceptanceEmailSentAt: item.acceptanceEmailSentAt || null,
      rejectionEmailSent: Boolean(item.rejectionEmailSent),
      rejectionEmailSentAt: item.rejectionEmailSentAt || null,
      emailStatus: item.emailStatus || (normalizeStatus(item.status) === "accepted" ? (isSmtpConfigured() ? "sent" : "not_configured") : null),
      emailError: item.emailError,
      emailSentAt: item.emailSentAt,
      approvalEmailStatus: item.approvalEmailStatus || null,
      approvalEmailSentAt: item.approvalEmailSentAt || null,
      rejectionEmailStatus: item.rejectionEmailStatus || null,
      rejectionEmailSentAt: item.rejectionEmailSentAt || null,
      photoFileId: item.photo?.fileId,
      details: safeDetails({ username: item.username, guardian: item.guardian, address: item.address, bloodGroup: item.bloodGroup, dob: item.dob, enrollmentDate: item.enrollmentDate, ...item.registrationDetails }),
      files: fileSummary(item),
    }));

    const cadetRows = cadets.map((item) => ({
      _id: `cadets:${item._id}`,
      recordId: String(item._id),
      source: "cadets",
      category: "Cadets",
      type: "Cadet",
      fullName: item.fullName,
      email: item.email,
      phone: item.phone || item.guardianPhone || "",
      address: item.address || item.residentialAddress || "",
      registrationId: item.registrationId,
      registrationNumber: item.registrationNumber || item.registrationId || null,
      validFrom: item.validFrom || null,
      validUntil: item.validUntil || null,
      approvedBy: item.approvedBy || item.reviewedBy || null,
      declinedBy: item.declinedBy || item.reviewedBy || null,
      reviewedBy: item.reviewedBy || item.approvedBy || item.declinedBy || null,
      status: normalizeStatus(item.status),
      createdAt: item.createdAt,
      approvedAt: item.approvedAt,
      declinedAt: item.declinedAt || item.rejectedAt || null,
      rejectedAt: item.rejectedAt,
      rejectionReason: item.rejectionReason,
      idCardFileId: item.idCardFileId,
      idCardFileReference: item.idCardFileReference || item.idCardFileId || null,
      idCardGenerated: Boolean(item.idCardGenerated || item.idCardFileId),
      idCardGeneratedAt: item.idCardGeneratedAt || null,
      acceptanceEmailSent: Boolean(item.acceptanceEmailSent),
      acceptanceEmailSentAt: item.acceptanceEmailSentAt || null,
      rejectionEmailSent: Boolean(item.rejectionEmailSent),
      rejectionEmailSentAt: item.rejectionEmailSentAt || null,
      emailStatus: item.emailStatus || (normalizeStatus(item.status) === "accepted" ? (isSmtpConfigured() ? "sent" : "not_configured") : null),
      emailError: item.emailError,
      emailSentAt: item.emailSentAt,
      approvalEmailStatus: item.approvalEmailStatus || null,
      approvalEmailSentAt: item.approvalEmailSentAt || null,
      rejectionEmailStatus: item.rejectionEmailStatus || null,
      rejectionEmailSentAt: item.rejectionEmailSentAt || null,
      photoFileId: item.photo?.fileId,
      details: safeDetails(item),
      files: fileSummary(item),
    }));

    const internshipRows = internships.map((item) => ({
      _id: `internships:${item._id}`,
      recordId: String(item._id),
      source: "internships",
      category: "Intern & Alumni",
      type: "Intern & Alumni Member",
      fullName: item.fullName,
      email: item.email,
      phone: item.phone || "",
      address: item.address || "",
      registrationId: item.registrationId,
      registrationNumber: item.registrationNumber || item.registrationId || null,
      validFrom: item.validFrom || null,
      validUntil: item.validUntil || null,
      approvedBy: item.approvedBy || item.reviewedBy || null,
      declinedBy: item.declinedBy || item.reviewedBy || null,
      reviewedBy: item.reviewedBy || item.approvedBy || item.declinedBy || null,
      status: normalizeStatus(item.status),
      createdAt: item.createdAt,
      approvedAt: item.approvedAt,
      declinedAt: item.declinedAt || item.rejectedAt || null,
      rejectedAt: item.rejectedAt,
      rejectionReason: item.rejectionReason,
      idCardFileId: item.idCardFileId,
      idCardFileReference: item.idCardFileReference || item.idCardFileId || null,
      idCardGenerated: Boolean(item.idCardGenerated || item.idCardFileId),
      idCardGeneratedAt: item.idCardGeneratedAt || null,
      acceptanceEmailSent: Boolean(item.acceptanceEmailSent),
      acceptanceEmailSentAt: item.acceptanceEmailSentAt || null,
      rejectionEmailSent: Boolean(item.rejectionEmailSent),
      rejectionEmailSentAt: item.rejectionEmailSentAt || null,
      emailStatus: item.emailStatus || (normalizeStatus(item.status) === "accepted" ? (isSmtpConfigured() ? "sent" : "not_configured") : null),
      emailError: item.emailError,
      emailSentAt: item.emailSentAt,
      approvalEmailStatus: item.approvalEmailStatus || null,
      approvalEmailSentAt: item.approvalEmailSentAt || null,
      rejectionEmailStatus: item.rejectionEmailStatus || null,
      rejectionEmailSentAt: item.rejectionEmailSentAt || null,
      photoFileId: null,
      details: safeDetails(item),
      files: fileSummary(item),
    }));

    const genericRows = applications.map((item) => {
      const category = getApplicationCategory("submissions", item);
      const photoAtt = (item.attachments || []).find((f) => f.mimetype?.startsWith("image/") || /photo/i.test(f.name || ""));
      return {
        _id: `submissions:${item._id}`,
        recordId: String(item._id),
        source: "submissions",
        category,
        type: item.type || category,
        fullName: item.data?.fullName || item.data?.memberName || item.data?.cadetName || "Applicant",
        email: item.data?.email || item.data?.memberEmail || "",
        phone: item.data?.phone || item.data?.mobile || item.data?.contactNumber || item.data?.guardianPhone || "",
        address: item.data?.address || item.data?.residentialAddress || item.data?.permanentAddress || [item.data?.state, item.data?.district].filter(Boolean).join(", ") || "",
        registrationId: item.registrationId,
        registrationNumber: item.registrationNumber || item.registrationId || null,
        validFrom: item.validFrom || null,
        validUntil: item.validUntil || null,
        approvedBy: item.approvedBy || item.reviewedBy || null,
        declinedBy: item.declinedBy || item.reviewedBy || null,
        reviewedBy: item.reviewedBy || item.approvedBy || item.declinedBy || null,
        status: normalizeStatus(item.status),
        createdAt: item.createdAt,
        approvedAt: item.approvedAt,
        declinedAt: item.declinedAt || item.rejectedAt || null,
        rejectedAt: item.rejectedAt,
        rejectionReason: item.rejectionReason,
        idCardFileId: item.idCardFileId,
        idCardFileReference: item.idCardFileReference || item.idCardFileId || null,
        idCardGenerated: Boolean(item.idCardGenerated || item.idCardFileId),
        idCardGeneratedAt: item.idCardGeneratedAt || null,
        acceptanceEmailSent: Boolean(item.acceptanceEmailSent),
        acceptanceEmailSentAt: item.acceptanceEmailSentAt || null,
        rejectionEmailSent: Boolean(item.rejectionEmailSent),
        rejectionEmailSentAt: item.rejectionEmailSentAt || null,
        emailStatus: item.emailStatus || (normalizeStatus(item.status) === "accepted" ? (isSmtpConfigured() ? "sent" : "not_configured") : null),
        emailError: item.emailError,
        emailSentAt: item.emailSentAt,
        approvalEmailStatus: item.approvalEmailStatus || null,
        approvalEmailSentAt: item.approvalEmailSentAt || null,
        rejectionEmailStatus: item.rejectionEmailStatus || null,
        rejectionEmailSentAt: item.rejectionEmailSentAt || null,
        photoFileId: photoAtt?.fileId,
        details: safeDetails(item.data),
        files: (item.attachments || []).map(({ name, filename, mimetype, size, fileId }) => ({ name: name || filename, filename, mimetype, size, fileId })),
      };
    });

    res.json([...accountRows, ...cadetRows, ...internshipRows, ...genericRows]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
  }));

  app.post(["/api/admin/applications/:source/:id/accept", "/api/admin/applications/:id/accept"], wrap(async (req, res) => {
    const result = await handleAcceptApplication(req.params.source, req.params.id, req.body, cfg, req.user);
    res.json(result);
  }));

  app.post(["/api/admin/applications/:source/:id/generate-id-card", "/api/admin/applications/:id/generate-id-card"], wrap(async (req, res) => {
    const customRegId = req.body?.registrationNumber || req.body?.regId || req.body?.registrationId;
    const result = await handleGenerateIdCard(req.params.source, req.params.id, cfg, customRegId);
    res.json(result);
  }));

  app.post(["/api/admin/applications/:source/:id/send-approval-email", "/api/admin/applications/:id/send-approval-email"], wrap(async (req, res) => {
    const result = await handleSendApprovalEmail(req.params.source, req.params.id, cfg);
    res.json(result);
  }));

  app.post(["/api/admin/applications/:source/:id/decline", "/api/admin/applications/:id/decline"], wrap(async (req, res) => {
    const result = await handleDeclineApplication(req.params.source, req.params.id, req.body.reason || req.body.rejectionReason, cfg, req.user);
    res.json(result);
  }));

  app.post(["/api/admin/applications/:source/:id/send-rejection-email", "/api/admin/applications/:id/send-rejection-email"], wrap(async (req, res) => {
    const result = await handleSendRejectionEmail(req.params.source, req.params.id);
    res.json(result);
  }));

  app.post(["/api/admin/applications/:source/:id/retry-email", "/api/admin/applications/:id/retry-email"], wrap(async (req, res) => {
    const result = await handleRetryEmail(req.params.source, req.params.id, cfg);
    res.json(result);
  }));

  app.get(["/api/admin/applications/:source/:id/id-card", "/api/admin/applications/:id/id-card"], wrap(async (req, res) => {
    await handleDownloadIdCard(req.params.source, req.params.id, res, cfg);
  }));

  app.patch(["/api/admin/applications/:source/:id", "/api/admin/applications/:id"], wrap(async (req, res) => {
    const { source, id } = req.params;
    const status = req.body.status;
    if (status === "approved" || status === "accepted") {
      const result = await handleAcceptApplication(source, id, req.body, cfg, req.user);
      return res.json(result);
    }
    if (status === "rejected") {
      const result = await handleDeclineApplication(source, id, req.body.rejectionReason || req.body.reason, cfg, req.user);
      return res.json(result);
    }
    return res.status(400).json({ message: "Choose accepted or rejected." });
  }));
  app.get(
    "/api/admin/:collection/export",
    wrap(async (req, res) => {
      const Model = collections[req.params.collection];
      if (!Model) return res.status(404).json({ message: "Not found" });
      const keys =
        req.params.collection === "pledges"
          ? [
              "reference",
              "kind",
              "membershipType",
              "fullName",
              "email",
              "amount",
              "createdAt",
            ]
          : ["registrationId", "fullName", "email", "status", "createdAt"];
      const filter = req.params.collection === "cadets" ? { recordKind: "cadetEnrollment" } : {};
      const records = await Model.find(filter)
        .sort({ createdAt: -1 })
        .limit(10000)
        .lean();
      const safe = (v) =>
        typeof v === "string" && /^[\s]*[=+@-]/.test(v) ? `'${v}` : v;
      res
        .attachment(`${req.params.collection}.csv`)
        .type("text/csv")
        .send(
          stringify(
            records.map((r) =>
              Object.fromEntries(keys.map((k) => [k, safe(r[k])])),
            ),
            { header: true, columns: keys },
          ),
        );
    }),
  );
  app.get(
    "/api/admin/:collection",
    wrap(async (req, res) => {
      const Model = collections[req.params.collection];
      if (!Model) return res.status(404).json({ message: "Not found" });
      const filter = req.params.collection === "cadets" ? { recordKind: "cadetEnrollment" } : {};
      res.json(await Model.find(filter).sort({ createdAt: -1 }).limit(200));
    }),
  );
  app.patch(
    "/api/admin/:collection/:id",
    wrap(async (req, res) => {
      const Model = { cadets: Cadet, internships: Internship }[
        req.params.collection
      ];
      if (!Model) return res.status(404).json({ message: "Not found" });
      if (
        !["approved", "rejected"].includes(req.body.status) ||
        Object.keys(req.body).length !== 1
      )
        return res
          .status(400)
          .json({ message: "Choose approved or rejected." });
      if (!mongoose.isValidObjectId(req.params.id))
        return res.status(400).json({ message: "Invalid record ID." });
      const item = await Model.findOneAndUpdate(
        { _id: req.params.id, ...(req.params.collection === "cadets" ? { recordKind: "cadetEnrollment" } : {}) },
        { $set: { status: req.body.status } },
        { new: true, runValidators: true },
      );
      if (!item) return res.status(404).json({ message: "Record not found" });
      res.json(item);
    }),
  );
  app.get(
    "/api/admin/internships/:id/cv",
    wrap(async (req, res) => {
      if (!mongoose.isValidObjectId(req.params.id))
        return res.status(400).json({ message: "Invalid record ID." });
      const item = await Internship.findById(req.params.id);
      if (!item) return res.status(404).json({ message: "Record not found" });
      const info = await getFileInfo(item.cv?.fileId);
      if (!info || info.bucketName !== "privateFiles") return res.status(404).json({ message: "CV file not found." });
      res.set({ "Cache-Control": "private, no-store", "Content-Disposition": `attachment; filename="${String(item.cv.filename || "application-cv").replace(/[\r\n"\\]/g, "_")}"`, "Content-Type": item.cv.mimetype || "application/octet-stream", "Content-Length": String(info.file.length), "X-Content-Type-Options": "nosniff" });
      info.bucket.openDownloadStream(info.file._id).pipe(res);
    }),
  );
  app.post(
    "/api/admin/gallery",
    upload.single("image"),
    wrap(async (req, res) => {
      const alt = typeof req.body.alt === "string" ? req.body.alt.trim() : "";
      if (!alt || alt.length > 200 || !req.file)
        return res.status(400).json({
          message: "An image and descriptive alternative text are required.",
        });
      const file = await saveUpload(req.file, "gallery", { isPublic: true });
      try {
        const last = await Gallery.findOne().sort({ order: -1 });
        const item = await Gallery.create({
          src: `/api/files/${file.fileId}.jpg`,
          file,
          alt,
          order: (last?.order ?? 0) + 1,
        });
        res.status(201).json(item);
      } catch (e) {
        await removeUpload(file);
        throw e;
      }
    }),
  );
  app.post(
    "/api/admin/ai/insights",
    wrap(async (req, res) => {
      const { application, existingList } = req.body || {};
      if (!application) {
        return res.status(400).json({ message: "Application data is required." });
      }
      const insights = getApplicationAiInsights(application, existingList || []);
      res.json(insights);
    }),
  );
  app.post(
    "/api/admin/ai/draft-content",
    wrap(async (req, res) => {
      const draft = await draftContentForAdmin(req.body || {});
      res.json(draft);
    }),
  );
  app.use("/api", (_req, res) =>
    res.status(404).json({ message: "Endpoint not found." }),
  );
  app.use((err, _req, res, _next) => {
    if (res.headersSent) return res.end();
    if (err instanceof ZodError)
      return res.status(400).json({
        message: "Please check the form fields.",
        errors: err.flatten().fieldErrors,
      });
    if (err.code === 11000)
      return res.status(409).json({ message: "This record already exists." });
    if (err.code === "LIMIT_FILE_SIZE")
      return res
        .status(413)
        .json({ message: "Upload must be 2 MB or smaller." });
    if (err.name === "MulterError" || err instanceof SyntaxError)
      return res.status(400).json({ message: "Invalid request or upload." });
    if (err.name === "ValidationError")
      return res.status(400).json({ message: err.message || "Please check the submitted data." });
    if (!cfg.test) console.error(`API request failed: ${err.name || "Error"}`, err);
    res.status(err.status || 500).json({
      message: err.status
        ? err.message
        : "The request could not be completed. Please try again.",
    });
  });
  return app;
}
