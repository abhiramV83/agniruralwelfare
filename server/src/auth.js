import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";
import { User, Session } from "./models.js";
export const hashToken = (t) => createHash("sha256").update(t).digest("hex");
// Safe authenticated profile response, never used by the public verification endpoint.
export const publicUser = (u) => ({
  id: u.id,
  fullName: u.fullName,
  username: u.username,
  role: u.role,
  status: u.status || "approved",
  approvedAt: u.approvedAt || null,
  registrationType: u.registrationType || "Register Member",
  memberId: u.memberId,
  enrollmentDate: u.enrollmentDate,
  email: u.email,
  guardian: u.guardian,
  address: u.address,
  bloodGroup: u.bloodGroup,
  dob: u.dob,
  registrationDetails: Object.fromEntries(Object.entries(u.registrationDetails || {}).filter(([key]) => !/(?:aadhaar|aadhar|pan|income|bankaccount|ifsc|password|token|secret|hash)/i.test(key))),
});
export function authMiddleware(cfg) {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
      if (!token) return res.status(401).json({ message: "Please sign in." });
      const claims = jwt.verify(token, cfg.secret, {
        algorithms: ["HS256"],
        issuer: "agni-demo",
        audience: "agni-client",
      });
      const user = await User.findById(claims.sub);
      if (!user)
        return res.status(401).json({ message: "Please sign in again." });
      req.user = user;
      next();
    } catch {
      res
        .status(401)
        .json({ message: "Session expired. Please sign in again." });
    }
  };
}
export function adminOnly(req, res, next) {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin access required." });
  next();
}
const cookieOptions = (cfg) => ({
  httpOnly: true,
  secure: cfg.production,
  sameSite: "strict",
  path: "/api/auth",
});
export async function issueSession(user, res, cfg, remember = false) {
  const token = randomBytes(48).toString("base64url");
  await Session.create({
    user: user._id,
    tokenHash: hashToken(token),
    remember,
    expiresAt: new Date(Date.now() + 7 * 86400000),
  });
  res.cookie("agni_refresh", token, {
    ...cookieOptions(cfg),
    ...(remember ? { maxAge: 7 * 86400000 } : {}),
  });
  return {
    accessToken: jwt.sign({ role: user.role }, cfg.secret, {
      subject: user.id,
      expiresIn: "15m",
      issuer: "agni-demo",
      audience: "agni-client",
      algorithm: "HS256",
    }),
    user: publicUser(user),
  };
}
export function clearSessionCookie(res, cfg) {
  res.clearCookie("agni_refresh", cookieOptions(cfg));
}
