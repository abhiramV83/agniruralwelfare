import { test } from "node:test";
import assert from "node:assert/strict";
import { config } from "../src/config.js";

test("config fails loudly when JWT_ACCESS_SECRET is missing", () => {
  const oldSecret = process.env.JWT_ACCESS_SECRET;
  delete process.env.JWT_ACCESS_SECRET;
  try {
    assert.throws(() => config(), /JWT_ACCESS_SECRET/);
  } finally {
    process.env.JWT_ACCESS_SECRET = oldSecret;
  }
});

test("config fails loudly when JWT_ACCESS_SECRET is weak, default, or too short", () => {
  const oldSecret = process.env.JWT_ACCESS_SECRET;
  for (const weak of ["secret", "changeme", "short", "default123456789012345678901234567890", "replace-with-a-random-secret-of-at-least-32-characters"]) {
    process.env.JWT_ACCESS_SECRET = weak;
    try {
      assert.throws(() => config(), /JWT_ACCESS_SECRET/);
    } finally {
      process.env.JWT_ACCESS_SECRET = oldSecret;
    }
  }
});

test("config fails loudly when MONGODB_URI is missing or invalid", () => {
  const oldUri = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;
  try {
    assert.throws(() => config(), /MONGODB_URI/);
  } finally {
    process.env.MONGODB_URI = oldUri;
  }
});

test("config fails loudly when FIELD_ENCRYPTION_KEY is missing or invalid", () => {
  const oldKey = process.env.FIELD_ENCRYPTION_KEY;
  process.env.FIELD_ENCRYPTION_KEY = "weak-short-key";
  try {
    assert.throws(() => config(), /FIELD_ENCRYPTION_KEY/);
  } finally {
    process.env.FIELD_ENCRYPTION_KEY = oldKey;
  }
});

