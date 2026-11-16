import test from "node:test";
import assert from "node:assert/strict";
import { getTimeGreeting } from "../../client/src/time-greeting-logic.js";

test("time greeting returns Good Morning and morning welcome message from 5am to 11:59am", () => {
  // 5:00 AM
  const d5am = new Date("2026-11-16T05:00:00");
  const g5 = getTimeGreeting(d5am);
  assert.equal(g5.period, "morning");
  assert.equal(g5.salutation, "Good Morning");
  assert.equal(g5.iconName, "Sunrise");
  assert.ok(g5.welcomeMessage.includes("inspiring morning"));

  // 11:59 AM
  const d11am = new Date("2026-11-16T11:59:59");
  const g11 = getTimeGreeting(d11am);
  assert.equal(g11.period, "morning");
  assert.equal(g11.salutation, "Good Morning");
});

test("time greeting returns Good Afternoon and afternoon welcome message from 12pm to 4:59pm", () => {
  // 12:00 PM
  const d12pm = new Date("2026-11-16T12:00:00");
  const g12 = getTimeGreeting(d12pm);
  assert.equal(g12.period, "afternoon");
  assert.equal(g12.salutation, "Good Afternoon");
  assert.equal(g12.iconName, "Sun");
  assert.ok(g12.welcomeMessage.includes("Empowering rural youth"));

  // 4:59 PM
  const d4pm = new Date("2026-11-16T16:59:59");
  const g4 = getTimeGreeting(d4pm);
  assert.equal(g4.period, "afternoon");
  assert.equal(g4.salutation, "Good Afternoon");
});

test("time greeting returns Good Evening and evening welcome message from 5pm to 9:59pm", () => {
  // 5:00 PM
  const d5pm = new Date("2026-11-16T17:00:00");
  const g5 = getTimeGreeting(d5pm);
  assert.equal(g5.period, "evening");
  assert.equal(g5.salutation, "Good Evening");
  assert.equal(g5.iconName, "Sunset");
  assert.ok(g5.welcomeMessage.includes("dusk settles"));

  // 9:59 PM
  const d9pm = new Date("2026-11-16T21:59:59");
  const g9 = getTimeGreeting(d9pm);
  assert.equal(g9.period, "evening");
  assert.equal(g9.salutation, "Good Evening");
});

test("time greeting returns night greeting and round-the-clock message from 10pm to 4:59am", () => {
  // 10:00 PM
  const d10pm = new Date("2026-11-16T22:00:00");
  const g10 = getTimeGreeting(d10pm);
  assert.equal(g10.period, "night");
  assert.equal(g10.iconName, "Moon");
  assert.ok(g10.welcomeMessage.includes("round the clock"));

  // 2:00 AM
  const d2am = new Date("2026-11-16T02:00:00");
  const g2 = getTimeGreeting(d2am);
  assert.equal(g2.period, "night");
  assert.equal(g2.iconName, "Moon");
});

