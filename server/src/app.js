import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { sendIdCard } from "./id-card.js";
import { registerAccount, submitRegistrationApplication } from "./modules/registration/registration.controller.js";

import { stringify } from "csv-stringify/sync";
import { ZodError } from "zod";
import { User, Session, Cadet, Internship, RegistrationApplication, Pledge, Gallery, SiteContent } from "./models.js";
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
import { upload, saveUpload, removeUpload, getFileInfo, getFileBuffer, pipeGridFile } from "./uploads.js";
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
  const allowedOrigins = cfg.clientOrigins || [cfg.origin];
  app.use(cors({
    origin: (requestOrigin, callback) => callback(null, !requestOrigin || allowedOrigins.includes(requestOrigin)),
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
      !allowedOrigins.includes(req.headers.origin)
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
  app.get("/api/files/:id", wrap(async (req, res, next) => {
    const info = await getFileInfo(req.params.id);
    if (!info) return res.status(404).json({ message: "File not found." });
    if (info.bucketName === "privateFiles") return auth(req, res, () => {
      const id = req.params.id;
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
        const user = await User.findOne({ username: data.username }).select(
          "+passwordHash",
        );
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
      const user = await User.findOne({ memberId: req.params.id }).select(
        "fullName memberId enrollmentDate status",
      );
      if (user && user.status && user.status !== "approved")
        return res.status(404).json({ message: "Record not found" });
      if (!user) {
        const cadet = await Cadet.findOne({
          registrationId: req.params.id,
          recordKind: "cadetEnrollment",
        }).select("fullName registrationId status");
        if (!cadet)
          return res.status(404).json({ message: "Record not found" });
        if (cadet.status !== "approved") return res.status(404).json({ message: "Record not found" });
        return res.json({
          fullName: cadet.fullName,
          memberId: cadet.registrationId,
        });
      }
      res.json({
        fullName: user.fullName,
        memberId: user.memberId,
        enrollmentDate: user.enrollmentDate,
      });
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
  };
  app.get(
    "/api/admin/stats",
    wrap(async (_req, res) => {
      const [memberAccounts, cadetAccounts, volunteerAccounts, internAccounts, cadetForms, internshipForms, memberForms, genericCadetForms, volunteerForms, internForms, pledges] = await Promise.all([
        User.countDocuments({ role: "member", $or: [{ registrationType: "Register Member" }, { registrationType: { $exists: false } }] }),
        User.countDocuments({ role: "member", registrationType: "Register Cadets" }),
        User.countDocuments({ role: "member", registrationType: "Register Volunteers" }),
        User.countDocuments({ role: "member", registrationType: "Register Intern & Alumni Members" }),
        Cadet.countDocuments({ recordKind: "cadetEnrollment" }),
        Internship.countDocuments(),
        RegistrationApplication.countDocuments({ recordKind: "formRegistration", type: "Member" }),
        RegistrationApplication.countDocuments({ recordKind: "formRegistration", type: "Cadet" }),
        RegistrationApplication.countDocuments({ recordKind: "formRegistration", type: "Volunteer" }),
        RegistrationApplication.countDocuments({ recordKind: "formRegistration", type: "Intern & Alumni Member" }),
        Pledge.countDocuments(),
      ]);
      const members = memberAccounts + memberForms;
      const cadets = cadetAccounts + cadetForms + genericCadetForms;
      const volunteers = volunteerAccounts + volunteerForms;
      const internships = internAccounts + internshipForms + internForms;
      res.json({ applicants: members + cadets + volunteers + internships, members, cadets, volunteers, internships, pledges });
    }),
  );
  app.get("/api/admin/applications", wrap(async (_req, res) => {
    const [users, cadets, internships, applications] = await Promise.all([
      User.find({ role: "member" }).select("fullName username email memberId registrationType registrationDetails guardian address bloodGroup dob enrollmentDate status approvedAt photo cv membershipProof memberSignature supportingDocument workSample createdAt").lean(),
      Cadet.find({ recordKind: "cadetEnrollment" }).lean(),
      Internship.find().lean(),
      RegistrationApplication.find({ recordKind: "formRegistration" }).lean(),
    ]);
    const sensitive = /(?:password|token|secret|hash)/i;
    const internal = /^(?:_id|__v|user|photo|cv|membershipProof|memberSignature|supportingDocument|workSample|qualificationProof|guardianSignature|cadetSignature)$/i;
    const safeDetails = (input) => Object.fromEntries(Object.entries(maskSensitiveFields(input || {}))
      .filter(([key, value]) => !sensitive.test(key) && !internal.test(key) && value !== undefined && value !== null)
      .map(([key, value]) => [key, Array.isArray(value) ? value.map((entry) => String(entry)).join(", ") : typeof value === "object" ? JSON.stringify(value) : String(value)]));
    const fileSummary = (input) => Object.entries(input || {})
      .filter(([key, value]) => /(?:photo|cv|proof|signature|document|sample)/i.test(key) && value?.fileId)
      .map(([key, value]) => ({ name: key.replace(/([a-z])([A-Z])/g, "$1 $2"), filename: value.filename, mimetype: value.mimetype, size: value.size }));
    const accountRows = users.map((item) => ({
      _id: `account:${item._id}`, source: "Account registration", type: item.registrationType || "Register Member",
      fullName: item.fullName, email: item.email, registrationId: item.memberId,
      status: item.status || "approved", createdAt: item.createdAt,
      details: safeDetails({ username: item.username, guardian: item.guardian, address: item.address, bloodGroup: item.bloodGroup, dob: item.dob, enrollmentDate: item.enrollmentDate, ...item.registrationDetails }),
      files: fileSummary(item),
    }));
    const dedicatedRows = (items, source, type) => items.map((item) => ({
      _id: `${source}:${item._id}`, source, type, fullName: item.fullName, email: item.email,
      registrationId: item.registrationId, status: item.status, createdAt: item.createdAt,
      details: safeDetails(item), files: fileSummary(item),
    }));
    const genericRows = applications.map((item) => ({
      _id: `application:${item._id}`, source: "Registration application", type: item.type,
      fullName: item.data?.fullName || item.data?.memberName || item.data?.cadetName || "Applicant",
      email: item.data?.email || item.data?.memberEmail || "", registrationId: item.registrationId,
      status: item.status, createdAt: item.createdAt, details: safeDetails(item.data),
      files: (item.attachments || []).map(({ name, mimetype, size }) => ({ name, mimetype, size })),
    }));
    res.json([...accountRows, ...dedicatedRows(cadets, "Cadet enrollment", "Cadet"), ...dedicatedRows(internships, "Internship application", "Internship"), ...genericRows]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
  }));
  app.patch("/api/admin/applications/:source/:id", wrap(async (req, res) => {
    const { source, id } = req.params;
    const status = req.body.status;
    if (!["approved", "rejected"].includes(status) || Object.keys(req.body).length !== 1)
      return res.status(400).json({ message: "Choose approved or rejected." });
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid record ID." });
    const Model = { accounts: User, cadets: Cadet, internships: Internship, submissions: RegistrationApplication }[source];
    if (!Model) return res.status(404).json({ message: "Application type not found." });
    const filter = source === "accounts" ? { _id: id, role: "member" } : source === "cadets" ? { _id: id, recordKind: "cadetEnrollment" } : source === "submissions" ? { _id: id, recordKind: "formRegistration" } : { _id: id };
    const item = await Model.findOneAndUpdate(filter, { $set: { status, approvedAt: status === "approved" ? new Date() : null } }, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: "Applicant not found." });
    let linkedAccountId, linkedAccountStatus;
    if (source === "submissions") {
      const email = String(item.data?.email || item.data?.memberEmail || "").trim().toLowerCase();
      if (email) {
        const account = await User.findOne({ role: "member", email });
        if (account) {
          linkedAccountId = account._id.toString();
          if (status === "approved" || account.status === "pending" || !account.status) {
            const accountType = { Member: "Register Member", Cadet: "Register Cadets", Volunteer: "Register Volunteers", "Intern & Alumni Member": "Register Intern & Alumni Members" }[item.type];
            account.status = status;
            account.approvedAt = status === "approved" ? new Date() : null;
            account.registrationType = accountType || account.registrationType;
            account.registrationDetails = { ...(account.registrationDetails || {}), ...item.data };
            if (!account.photo) {
              const attachment = item.attachments?.find((file) => file.mimetype?.startsWith("image/"));
              if (attachment) account.photo = { fileId: attachment.fileId, filename: attachment.filename, mimetype: attachment.mimetype, size: attachment.size, bucket: attachment.bucket };
            }
            await account.save();
          }
          linkedAccountStatus = account.status || "approved";
        }
      }
    }
    res.json({ status: item.status, approvedAt: item.approvedAt || null, linkedAccountId, linkedAccountStatus });
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
          src: `/api/files/${file.fileId}`,
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
    if (!cfg.test) console.error(`API request failed: ${err.name || "Error"}`);
    res.status(err.status || 500).json({
      message: err.status
        ? err.message
        : "The request could not be completed. Please try again.",
    });
  });
  return app;
}
