import { test } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcrypt";
import { password, registerSchema } from "../src/validation.js";

const basePayload = {
  fullName: "Aarav Sharma",
  username: "aarav_sharma",
  email: "aarav@example.com",
  consent: true,
};

test("Password without uppercase letter – REJECT", () => {
  const result = password.safeParse("lowercase123!@#");
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some((i) => i.message.includes("uppercase")));
});

test("Password without lowercase letter – REJECT", () => {
  const result = password.safeParse("UPPERCASE123!@#");
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some((i) => i.message.includes("lowercase")));
});

test("Password without number – REJECT", () => {
  const result = password.safeParse("PasswordOnly!@#");
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some((i) => i.message.includes("number")));
});

test("Password without special character – REJECT", () => {
  const result = password.safeParse("Password12345");
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some((i) => i.message.includes("special character")));
});

test("Password shorter than 8 characters – REJECT", () => {
  const result = password.safeParse("Ab1!xyz"); // 7 chars
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some((i) => i.message.includes("at least 8 characters")));
});

test("Password longer than 64 characters – REJECT", () => {
  const longPass = "Ab1!" + "a".repeat(61); // 65 chars
  const result = password.safeParse(longPass);
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some((i) => i.message.includes("cannot exceed 64 characters")));
});

test("Password satisfying all requirements – ACCEPT", () => {
  const validPasswords = [
    "Agni@2026",
    "Secure#Pass99",
    "Welcome!ARWS2026",
    "P@ssw0rdValid!",
    "A1!b2@c3#d4$",
  ];
  for (const pass of validPasswords) {
    const result = password.safeParse(pass);
    assert.equal(result.success, true, `Expected "${pass}" to be accepted`);
  }
});

test("Password and Confirm Password mismatch – REJECT", () => {
  const payload = {
    ...basePayload,
    password: "Secure@Pass2026",
    confirmPassword: "Different@Pass2026",
  };
  const result = registerSchema.safeParse(payload);
  assert.equal(result.success, false);
  assert.ok(result.error.issues.some((i) => i.message.includes("Passwords do not match")));
});

test("Password and Confirm Password match – ACCEPT", () => {
  const payload = {
    ...basePayload,
    password: "Secure@Pass2026",
    confirmPassword: "Secure@Pass2026",
  };
  const result = registerSchema.safeParse(payload);
  assert.equal(result.success, true);
  assert.equal(result.data.password, "Secure@Pass2026");
});

test("Password bcrypt hashing produces secure hash (12 rounds) and does not store plaintext", async () => {
  const pass = "Agni@Welfare2026";
  const hash = await bcrypt.hash(pass, 12);
  assert.notEqual(hash, pass);
  assert.ok(hash.startsWith("$2b$12$") || hash.startsWith("$2a$12$"));
  const match = await bcrypt.compare(pass, hash);
  assert.equal(match, true);
  const falseMatch = await bcrypt.compare("WrongPassword@123", hash);
  assert.equal(falseMatch, false);
});

