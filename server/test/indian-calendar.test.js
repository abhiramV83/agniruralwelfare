import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getIndianDate,
  getCurrentSeason,
  getActiveFestival,
  getUpcomingFestivals,
  getFestivalById,
  getCalendarOverview,
  INDIAN_SEASONS,
  INDIAN_FESTIVALS
} from "../src/services/indian-calendar.js";

test("getIndianDate computes accurate Asia/Kolkata time parts", () => {
  // 2026-11-16T12:00:00Z is 17:30 in IST
  const d = new Date("2026-11-16T12:00:00Z");
  const ist = getIndianDate(d);
  assert.equal(ist.year, 2026);
  assert.equal(ist.month, 11);
  assert.equal(ist.day, 16);
  assert.equal(ist.hour, 17);
  assert.equal(ist.minute, 30);
  assert.equal(ist.dateString, "2026-11-16");
});

test("getCurrentSeason correctly identifies all 6 traditional Indian Ritus", () => {
  // 1. Shishira (Winter): Jan 15
  assert.equal(getCurrentSeason(new Date("2026-01-15T00:00:00Z")).id, "shishira");
  // 2. Vasant (Spring): Mar 15
  assert.equal(getCurrentSeason(new Date("2026-03-15T00:00:00Z")).id, "vasant");
  // 3. Grishma (Summer): May 15
  assert.equal(getCurrentSeason(new Date("2026-05-15T00:00:00Z")).id, "grishma");
  // 4. Varsha (Monsoon): Jul 15
  assert.equal(getCurrentSeason(new Date("2026-07-15T00:00:00Z")).id, "varsha");
  // 5. Sharad (Autumn): Sep 15
  assert.equal(getCurrentSeason(new Date("2026-09-15T00:00:00Z")).id, "sharad");
  // 6. Hemanta (Pre-Winter): Nov 16
  assert.equal(getCurrentSeason(new Date("2026-11-16T00:00:00Z")).id, "hemanta");
});

test("getActiveFestival detects active festival on festival date", () => {
  // Diwali in 2026 is 2026-11-08 to 2026-11-10
  const diwaliDate = new Date("2026-11-09T06:00:00Z");
  const active = getActiveFestival(diwaliDate);
  assert.ok(active);
  assert.equal(active.id, "diwali");
  assert.equal(active.isActive, true);
  assert.equal(active.isOverridden, false);
});

test("getActiveFestival honors administrator manual override", () => {
  // On an ordinary day, override to bathukamma
  const ordinaryDay = new Date("2026-11-16T06:00:00Z");
  const active = getActiveFestival(ordinaryDay, { overrideFestivalId: "bathukamma" });
  assert.ok(active);
  assert.equal(active.id, "bathukamma");
  assert.equal(active.isOverridden, true);
  assert.ok(active.greeting.includes("Bathukamma"));
});

test("getUpcomingFestivals returns chronologically sorted festivals with countdown", () => {
  const currentDate = new Date("2026-11-16T06:00:00Z");
  const upcoming = getUpcomingFestivals(currentDate, 5);
  assert.ok(upcoming.length > 0);
  assert.ok(upcoming[0].startDate >= "2026-11-16");
  for (let i = 1; i < upcoming.length; i++) {
    assert.ok(upcoming[i].startDate >= upcoming[i - 1].startDate);
  }
  // Guru Nanak Jayanti is 2026-11-24 and Constitution Day is 2026-11-26
  const ids = upcoming.map((u) => u.id);
  assert.ok(ids.includes("guru-nanak-jayanti") || ids.includes("constitution-day"));
});

test("getCalendarOverview produces comprehensive status object", () => {
  const overview = getCalendarOverview(new Date("2026-11-16T06:00:00Z"));
  assert.equal(overview.currentSeason.id, "hemanta");
  assert.ok(overview.upcomingFestivals.length > 0);
  assert.equal(overview.allSeasons.length, 6);
  assert.ok(overview.totalFestivalsCount >= 20);
});
