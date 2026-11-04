import test from "node:test";
import assert from "node:assert/strict";
import { parseRegistrationApplication } from "../src/modules/registration/registration.service.js";

test("registration application parser preserves safe string fields and filters sensitive keys", () => {
  const result = parseRegistrationApplication({
    type: "Volunteer",
    data: JSON.stringify({ fullName: "Asha", motivation: "Help locally", volunteerAreas: ["Education", "Events"], aadhaarNumber: "1234", annualIncome: "5000", count: 4 }),
  });
  assert.deepEqual(result.value, { type: "Volunteer", data: { fullName: "Asha", motivation: "Help locally", volunteerAreas: "Education, Events" } });
});

test("registration application parser rejects invalid types and malformed payloads", () => {
  assert.equal(parseRegistrationApplication({ type: "Unknown", data: "{}" }).error, "Choose a valid registration type.");
  assert.equal(parseRegistrationApplication({ type: "Member", data: "{" }).error, "Registration details are invalid.");
  assert.equal(parseRegistrationApplication({ type: "Member", data: "[]" }).error, "Registration details are invalid.");
});

test("registration application values are bounded to 5000 characters", () => {
  const result = parseRegistrationApplication({ type: "Member", data: JSON.stringify({ notes: "x".repeat(5100) }) });
  assert.equal(result.value.data.notes.length, 5000);
});
