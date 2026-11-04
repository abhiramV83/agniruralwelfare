import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sharp from "sharp";
import { createApp } from "../src/app.js";
import { User, Session, Cadet, Internship, Pledge } from "../src/models.js";
let db, app, uploads, token, adminToken, memberId, refreshCookie, internshipId;
const secret = "test-secret-which-is-longer-than-32-characters";
const profile = {
  fullName: "Demo Test Member",
  username: "test.member",
  email: "member@example.com",
  password: "DemoPassword2026!",
  guardian: "Demo Guardian",
  address: "Demo address",
  bloodGroup: "O+",
  dob: "2005-01-01",
  enrollmentDate: "2026-10-27",
  consent: true,
};
before(
  async () => {
    process.env.MONGOMS_DOWNLOAD_DIR = path.resolve("../.cache/mongodb");
    db = await MongoMemoryServer.create({
      binary: {
        version: "7.0.14",
        downloadDir: process.env.MONGOMS_DOWNLOAD_DIR,
      },
    });
    await mongoose.connect(db.getUri());
    await Promise.all([
      User.init(),
      Session.init(),
      Cadet.init(),
      Internship.init(),
      Pledge.init(),
    ]);
    uploads = await fs.mkdtemp(path.join(os.tmpdir(), "agni-test-"));
    await fs.mkdir("../docs/qa", { recursive: true });
    app = createApp({
      secret,
      origin: "http://127.0.0.1:5173",
      uploads,
      production: false,
      test: true,
    });
    const admin = await User.create({
      fullName: "Demo Admin",
      username: "test.admin",
      email: "admin@example.com",
      role: "admin",
      passwordHash: await bcrypt.hash("DemoAdmin2026!", 12),
    });
    const res = await request(app)
      .post("/api/auth/admin-login")
      .timeout({ response: 10000, deadline: 15000 })
      .send({ username: admin.username, password: "DemoAdmin2026!" });
    assert.equal(res.status, 200);
    adminToken = res.body.accessToken;
  },
  { timeout: 240000 },
);
after(async () => {
  await mongoose.disconnect();
  if (db) await db.stop();
  if (uploads) {
    const resolved = path.resolve(uploads);
    assert.ok(
      resolved.startsWith(path.resolve(os.tmpdir()) + path.sep + "agni-test-"),
    );
    await fs.rm(resolved, { recursive: true, force: true });
  }
});
test("registration creates member, hashes password and issues short-lived JWT plus httpOnly cookie", async () => {
  const res = await request(app).post("/api/auth/register").send(profile);
  assert.equal(res.status, 201, JSON.stringify(res.body));
  token = res.body.accessToken;
  memberId = res.body.user.memberId;
  refreshCookie = res.headers["set-cookie"][0].split(";")[0];
  assert.match(res.headers["set-cookie"][0], /HttpOnly/);
  assert.match(res.headers["set-cookie"][0], /SameSite=Strict/);
  const claims = jwt.verify(token, secret);
  assert.equal(claims.exp - claims.iat, 900);
  assert.equal(claims.role, "member");
  const stored = await User.findOne({ username: profile.username }).select(
    "+passwordHash",
  );
  assert.notEqual(stored.passwordHash, profile.password);
  assert.equal(
    await bcrypt.compare(profile.password, stored.passwordHash),
    true,
  );
  assert.equal(res.body.user.passwordHash, undefined);
  assert.equal(res.body.user.bloodGroup, "O+");
});
test("member/admin separation, strict payloads, hostile origins and invalid credentials are rejected", async () => {
  assert.equal((await request(app).get("/api/admin/stats")).status, 401);
  assert.equal(
    (await request(app).get("/api/admin/stats").auth(token, { type: "bearer" }))
      .status,
    403,
  );
  assert.equal(
    (
      await request(app)
        .post("/api/auth/register")
        .send({ ...profile, username: "role.attack", role: "admin" })
    ).status,
    400,
  );
  assert.equal(
    (
      await request(app)
        .post("/api/auth/login")
        .send({ username: profile.username, password: "incorrect" })
    ).status,
    401,
  );
  assert.equal(
    (
      await request(app)
        .post("/api/auth/admin-login")
        .send({ username: profile.username, password: profile.password })
    ).status,
    401,
  );
  assert.equal(
    (
      await request(app)
        .post("/api/pledges")
        .set("Origin", "https://evil.example")
        .send({})
    ).status,
    403,
  );
  assert.equal(
    (
      await request(app)
        .post("/api/auth/login")
        .send({ username: { $ne: null }, password: profile.password })
    ).status,
    400,
  );
});
test("refresh rotates atomically; old refresh cookies cannot be reused", async () => {
  const renewed = await request(app)
    .post("/api/auth/refresh")
    .set("Cookie", refreshCookie);
  assert.equal(renewed.status, 200);
  assert.ok(renewed.body.accessToken);
  assert.equal(
    (await request(app).post("/api/auth/refresh").set("Cookie", refreshCookie))
      .status,
    401,
  );
  const newCookie = renewed.headers["set-cookie"][0].split(";")[0];
  assert.equal(
    (await request(app).post("/api/auth/logout").set("Cookie", newCookie))
      .status,
    204,
  );
  assert.equal(
    (await request(app).post("/api/auth/refresh").set("Cookie", newCookie))
      .status,
    401,
  );
});
test("pledges persist and enforce numeric limits", async () => {
  const res = await request(app).post("/api/pledges").send({
    fullName: "=1+1",
    email: "pledge@example.com",
    phone: "0000000000",
    kind: "Donate",
    amount: 500,
  });
  assert.equal(res.status, 201);
  assert.match(res.body.message, /without charge/);
  assert.equal(
    (await Pledge.findOne({ reference: res.body.reference })).amount,
    500,
  );
  assert.equal(
    (
      await request(app).post("/api/pledges").send({
        fullName: "Demo",
        email: "bad",
        phone: "0000000000",
        kind: "Donate",
        amount: -1,
      })
    ).status,
    400,
  );
  const member = await request(app).post("/api/pledges").send({
    fullName: "Demo Member",
    email: "demo@example.com",
    phone: "0000000000",
    kind: "Membership",
    membershipType: "yearly",
    amount: 1000,
  });
  assert.equal(member.status, 201);
  assert.equal(
    (await Pledge.findOne({ reference: member.body.reference })).membershipType,
    "yearly",
  );
});
test("cadet workflow persists ID, rejects sensitive fields and permits admin approval only", async () => {
  const data = {
    fullName: "Demo Cadet",
    guardian: "Demo Guardian",
    dob: "2005-01-01",
    phone: "0000000000",
    email: "cadet@example.com",
    address: "Demo address",
    qualification: "Demo Graduate",
    school: "Demo School",
    gender: "Female",
    fatherName: "Demo Father",
    motherName: "Demo Mother",
    citizenship: "India",
    village: "Demo Village",
    tehsil: "Demo Taluka",
    district: "Demo District",
    pincode: "000000",
    postOffice: "Demo Post",
    training: "Yes",
    residentialAddress: "Demo address",
  };
  assert.equal(
    (
      await request(app)
        .post("/api/cadets")
        .auth(token, { type: "bearer" })
        .send({ ...data, aadhaar: "1234" })
    ).status,
    400,
  );
  let cadetReq = request(app)
    .post("/api/cadets")
    .auth(token, { type: "bearer" });
  for (const [key, value] of Object.entries(data))
    cadetReq = cadetReq.field(key, value);
  const photo = await sharp({
    create: { width: 20, height: 20, channels: 3, background: "#336655" },
  })
    .png()
    .toBuffer();
  const res = await cadetReq.attach("photo", photo, {
    filename: "demo.png",
    contentType: "image/png",
  });
  assert.equal(res.status, 201);
  assert.match(res.body.registrationId, /^ARWS-/);
  const card = await request(app)
    .get(`/api/cadets/${res.body.registrationId}/id-card`)
    .auth(token, { type: "bearer" });
  assert.equal(card.status, 200);
  assert.equal(card.body.subarray(0, 5).toString(), "%PDF-");
  await fs.writeFile("../docs/qa/demo-cadet-card.pdf", card.body);
  assert.equal(
    (card.body.toString("latin1").match(/\/Type \/Page\b/g) || []).length,
    1,
  );
  const publicRecord = await request(app).get(
    `/api/verify/${res.body.registrationId}`,
  );
  assert.equal(publicRecord.status, 200);
  assert.equal(publicRecord.body.phone, undefined);
  const item = await Cadet.findOne({ registrationId: res.body.registrationId });
  assert.equal(item.fatherName, "Demo Father");
  assert.equal(item.citizenship, "India");
  // Database role wins over claims: a forged admin claim cannot grant another member access.
  const other = await User.create({
    fullName: "Demo Other",
    username: "other.member",
    email: "other@example.com",
    passwordHash: "unused-demo-hash",
  });
  const otherMemberToken = jwt.sign({ role: "admin" }, secret, {
    subject: other.id,
    issuer: "agni-demo",
    audience: "agni-client",
    expiresIn: "15m",
  });
  assert.equal(
    (
      await request(app)
        .get(`/api/cadets/${item.registrationId}/id-card`)
        .auth(otherMemberToken, { type: "bearer" })
    ).status,
    403,
  );
  await User.deleteOne({ _id: other._id });
  assert.equal(
    (
      await request(app)
        .patch(`/api/admin/cadets/${item.id}`)
        .auth(token, { type: "bearer" })
        .send({ status: "approved" })
    ).status,
    403,
  );
  const approved = await request(app)
    .patch(`/api/admin/cadets/${item.id}`)
    .auth(adminToken, { type: "bearer" })
    .send({ status: "approved" });
  assert.equal(approved.status, 200);
  assert.equal(approved.body.status, "approved");
  const mine = await request(app)
    .get("/api/cadets/mine")
    .auth(token, { type: "bearer" });
  assert.equal(mine.body[0].status, "approved");
});
test("internship validates CV, stores it privately and supports review/rejection", async () => {
  const data = {
    fullName: "Demo Intern",
    gender: "Female",
    phone: "0000000000",
    email: "intern@example.com",
    address: "Demo address",
    position: "NGO Fundraising & Field Coordinator Internship",
    qualification: "Demo Graduate",
    institute: "Demo Institute",
    jobPortal: "Demo portal",
    motivation: "Demo motivation",
    applicationDate: "2026-10-27",
    consent: "true",
  };
  let req = request(app).post("/api/internships");
  for (const [key, value] of Object.entries(data)) req = req.field(key, value);
  const res = await req.attach(
    "cv",
    Buffer.from("%PDF-1.4\nDemo test CV\n%%EOF"),
    { filename: "demo.pdf", contentType: "application/pdf" },
  );
  assert.equal(res.status, 201, JSON.stringify(res.body));
  const stored = await Internship.findOne({
    registrationId: res.body.registrationId,
  });
  internshipId = stored.id;
  assert.equal((await request(app).get(`/uploads/${stored.cv}`)).status, 404);
  assert.equal(
    (
      await request(app)
        .get(`/api/admin/internships/${stored.id}/cv`)
        .auth(token, { type: "bearer" })
    ).status,
    403,
  );
  const cv = await request(app)
    .get(`/api/admin/internships/${stored.id}/cv`)
    .auth(adminToken, { type: "bearer" });
  assert.equal(cv.status, 200);
  assert.match(cv.headers["content-disposition"], /attachment/);
  const rejected = await request(app)
    .patch(`/api/admin/internships/${stored.id}`)
    .auth(adminToken, { type: "bearer" })
    .send({ status: "rejected" });
  assert.equal(rejected.body.status, "rejected");
  let bad = request(app).post("/api/internships");
  for (const [key, value] of Object.entries(data)) bad = bad.field(key, value);
  assert.equal(
    (
      await bad.attach("cv", Buffer.from("not a pdf"), {
        filename: "fake.pdf",
        contentType: "application/pdf",
      })
    ).status,
    400,
  );
});
test("ID card returns a PDF; QR verification exposes only minimal public fields", async () => {
  const pdf = await request(app)
    .get("/api/members/id-card")
    .auth(token, { type: "bearer" });
  assert.equal(pdf.status, 200);
  assert.match(pdf.headers["content-type"], /application\/pdf/);
  assert.equal(pdf.body.subarray(0, 5).toString(), "%PDF-");
  assert.equal(
    (pdf.body.toString("latin1").match(/\/Type \/Page\b/g) || []).length,
    1,
    "ID card must fit on one PDF page",
  );
  await fs.mkdir("../docs/qa", { recursive: true });
  await fs.writeFile("../docs/qa/demo-id-card.pdf", pdf.body);
  const verify = await request(app).get(`/api/verify/${memberId}`);
  assert.equal(verify.status, 200);
  assert.equal(verify.body.fullName, profile.fullName);
  assert.equal(verify.body.email, undefined);
  assert.equal(verify.body.address, undefined);
  assert.equal(
    (await request(app).get("/api/verify/not-a-member")).status,
    404,
  );
});
test("admin stats and CSV exports work and escape spreadsheet formulas", async () => {
  const stats = await request(app)
    .get("/api/admin/stats")
    .auth(adminToken, { type: "bearer" });
  assert.equal(stats.status, 200);
  assert.equal(stats.body.cadets, 1);
  assert.equal(stats.body.internships, 1);
  assert.equal(stats.body.pledges, 2);
  const csv = await request(app)
    .get("/api/admin/pledges/export")
    .auth(adminToken, { type: "bearer" });
  assert.equal(csv.status, 200);
  assert.match(csv.text, /'=1\+1/);
  assert.equal(
    (
      await request(app)
        .patch(`/api/admin/internships/${internshipId}`)
        .auth(adminToken, { type: "bearer" })
        .send({ status: "approved", fullName: "attack" })
    ).status,
    400,
  );
});
test("gallery upload decodes images and rejects disguised files and oversized uploads", async () => {
  const png = await sharp({
    create: { width: 20, height: 20, channels: 3, background: "#b9ee83" },
  })
    .png()
    .toBuffer();
  const res = await request(app)
    .post("/api/admin/gallery")
    .auth(adminToken, { type: "bearer" })
    .field("alt", "Demo test image")
    .attach("image", png, { filename: "demo.png", contentType: "image/png" });
  assert.equal(res.status, 201);
  assert.match(res.body.src, /\.jpg$/);
  const image = await request(app).get(res.body.src);
  assert.equal(image.status, 200);
  assert.match(image.headers["content-type"], /image\/jpeg/);
  assert.equal(
    (
      await request(app)
        .post("/api/admin/gallery")
        .auth(adminToken, { type: "bearer" })
        .field("alt", "Bad")
        .attach("image", Buffer.from("<script>"), {
          filename: "bad.png",
          contentType: "image/png",
        })
    ).status,
    400,
  );
  assert.equal(
    (
      await request(app)
        .post("/api/admin/gallery")
        .auth(adminToken, { type: "bearer" })
        .field("alt", "Too big")
        .attach("image", Buffer.alloc(6 * 1024 * 1024), {
          filename: "large.png",
          contentType: "image/png",
        })
    ).status,
    413,
  );
});

test("Remember me controls persistence and survives refresh rotation", async () => {
  const login = await request(app).post("/api/auth/login").send({
    username: profile.username,
    password: profile.password,
    remember: true,
  });
  assert.equal(login.status, 200);
  assert.match(login.headers["set-cookie"][0], /Max-Age=604800/);
  const refreshed = await request(app)
    .post("/api/auth/refresh")
    .set("Cookie", login.headers["set-cookie"][0].split(";")[0]);
  assert.equal(refreshed.status, 200);
  assert.match(refreshed.headers["set-cookie"][0], /Max-Age=604800/);
  const session = await request(app).post("/api/auth/login").send({
    username: profile.username,
    password: profile.password,
    remember: false,
  });
  assert.equal(session.status, 200);
  assert.doesNotMatch(session.headers["set-cookie"][0], /Max-Age=/);
});

test("impossible dates are rejected and authentication is rate limited", async () => {
  const invalid = await request(app)
    .post("/api/auth/register")
    .send({ ...profile, username: "bad.date", dob: "2026-02-30" });
  assert.equal(invalid.status, 400);
  const isolated = createApp({
    secret,
    origin: "http://127.0.0.1:5173",
    uploads,
    production: false,
    test: true,
  });
  let response;
  for (let i = 0; i < 31; i++)
    response = await request(isolated)
      .post("/api/auth/login")
      .send({ username: "missing.user", password: "incorrect" });
  assert.equal(response.status, 429);
});
