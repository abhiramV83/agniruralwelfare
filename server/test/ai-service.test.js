import { test } from "node:test";
import assert from "node:assert/strict";
import { answerNgoInquiry, getApplicationAiInsights, draftContentForAdmin } from "../src/ai-service.js";

test("answerNgoInquiry provides accurate knowledge base response without API key", async () => {
  const res1 = await answerNgoInquiry({ message: "How can I join the cadet corps?" });
  assert.ok(res1.reply);
  assert.ok(res1.reply.includes("Cadet"));
  assert.equal(res1.source, "knowledge_base");

  const res2 = await answerNgoInquiry({ message: "Are donations eligible for 80G tax benefits?" });
  assert.ok(res2.reply.includes("80G"));

  const res3 = await answerNgoInquiry({ message: "Tell me about your ID cards and verification" });
  assert.ok(res3.reply.includes("ID card") || res3.reply.includes("QR"));
});

test("getApplicationAiInsights evaluates completeness and detects potential duplicates safely", () => {
  const sampleApp = {
    _id: "app123",
    fullName: "Rohan Sharma",
    category: "Cadet",
    data: {
      fullName: "Rohan Sharma",
      email: "rohan@example.com",
      phone: "9876543210",
      address: "123 Village Lane",
      bloodGroup: "B+",
      photo: "photo-present"
    }
  };

  const existingList = [
    {
      _id: "app999",
      fullName: "Rohan S.",
      email: "rohan@example.com",
      phone: "9876543210",
      status: "accepted",
      registrationId: "AGNI-CAD-2026-0001"
    }
  ];

  const insights = getApplicationAiInsights(sampleApp, existingList);
  assert.equal(insights.applicantName, "Rohan Sharma");
  assert.equal(insights.completenessPercent, 100);
  assert.equal(insights.hasDuplicates, true);
  assert.equal(insights.potentialDuplicates.length, 1);
  assert.ok(insights.advisoryNotice.includes("Final acceptance and registration authority resides strictly with the administrator"));
});

test("draftContentForAdmin produces structured, reviewable content drafts", async () => {
  const draft = await draftContentForAdmin({
    type: "announcement",
    topic: "Annual Health & Blood Donation Camp",
    tone: "inspiring"
  });

  assert.ok(draft.title.includes("Annual Health"));
  assert.ok(draft.content.includes("AGNI Rural Welfare Society"));
  assert.ok(draft.source === "template_engine" || draft.source === "gemini_ai");
});

