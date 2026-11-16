import { test } from "node:test";
import assert from "node:assert/strict";
import { answerNgoInquiry, getApplicationAiInsights, draftContentForAdmin } from "../src/ai-service.js";

test("answerNgoInquiry provides specific, distinct responses for different user questions", async () => {
  // 1. Membership fees
  const resFee = await answerNgoInquiry({ message: "What is the membership fee to join?" });
  assert.equal(resFee.intentId, "fees_contribution");
  assert.ok(resFee.reply.includes("free of mandatory enrollment charges") || resFee.reply.includes("nominal contribution"));
  assert.ok(!resFee.reply.includes("AGNI Rural Welfare Society was founded with the mission of"));

  // 2. Cadet Corps
  const resCadet = await answerNgoInquiry({ message: "What training do cadets receive in drill and parade?" });
  assert.equal(resCadet.intentId, "cadet_program");
  assert.ok(resCadet.reply.includes("Bravery, Unity & Discipline"));
  assert.ok(resCadet.reply.includes("Netaji Subhash Chandra Bose"));

  // 3. Volunteering
  const resVol = await answerNgoInquiry({ message: "Can I volunteer on weekends for health camps?" });
  assert.equal(resVol.intentId, "volunteer_program");
  assert.ok(resVol.reply.includes("Flexible Engagement") || resVol.reply.includes("Volunteer Program"));

  // 4. College Internship
  const resInt = await answerNgoInquiry({ message: "Can MSW students apply for a rural internship project?" });
  assert.equal(resInt.intentId, "internship_program");
  assert.ok(resInt.reply.includes("MSW") || resInt.reply.includes("Academic Placements"));

  // 5. Documents required
  const resDocs = await answerNgoInquiry({ message: "What documents and photo do I need to register?" });
  assert.equal(resDocs.intentId, "documents_required");
  assert.ok(resDocs.reply.includes("Passport-Size Photograph"));
  assert.ok(resDocs.reply.includes("Blood Group"));

  // 6. Application review status
  const resStatus = await answerNgoInquiry({ message: "How long does application status approval take?" });
  assert.equal(resStatus.intentId, "application_status");
  assert.ok(resStatus.reply.includes("24 to 48 hours"));

  // 7. ID Card & QR Verification
  const resCard = await answerNgoInquiry({ message: "How does the QR code verify my ID card?" });
  assert.equal(resCard.intentId, "id_card_verification");
  assert.ok(resCard.reply.includes("/verify/:id"));

  // 8. 80G Tax Exemption
  const resTax = await answerNgoInquiry({ message: "Is my donation eligible for 80G tax deduction?" });
  assert.equal(resTax.intentId, "donations_80g");
  assert.ok(resTax.reply.includes("80G"));
  assert.ok(resTax.reply.includes("50% tax deduction"));

  // 9. Indian Festivals
  const resFest = await answerNgoInquiry({ message: "Which upcoming Indian festival or holiday is next?" });
  assert.equal(resFest.intentId, "indian_calendar_festivals");
  assert.ok(resFest.reply.includes("Upcoming Festivals") || resFest.reply.includes("Active Festival"));

  // 10. Indian Seasons
  const resSeason = await answerNgoInquiry({ message: "What traditional Indian season or Ritu is it right now?" });
  assert.equal(resSeason.intentId, "indian_seasons");
  assert.ok(resSeason.reply.includes("Ritu"));

  // 11. Health & Medical camps
  const resHealth = await answerNgoInquiry({ message: "Tell me about your free medical health checkup camps" });
  assert.equal(resHealth.intentId, "health_camps");
  assert.ok(resHealth.reply.includes("General Health Camps"));

  // 12. Office & Contact
  const resContact = await answerNgoInquiry({ message: "Where is the registered headquarters office and phone number?" });
  assert.equal(resContact.intentId, "contact_location");
  assert.ok(resContact.reply.includes("+91 94331 23456"));

  // 13. Polite greeting
  const resGreeting = await answerNgoInquiry({ message: "Good morning! Hello there" });
  assert.equal(resGreeting.intentId, "greetings");
  assert.ok(resGreeting.reply.includes("Namaste"));

  // 14. What is AGNI?
  const resAbout = await answerNgoInquiry({ message: "What is AGNI and what does it stand for?" });
  assert.equal(resAbout.intentId, "about_agni");
  assert.ok(resAbout.reply.includes("AGNI Rural Welfare Society"));
  assert.ok(resAbout.reply.includes("S/1L/55059"));

  // 15. What do you do? (Activities & Programs)
  const resAct = await answerNgoInquiry({ message: "What do you do and what are your main activities?" });
  assert.equal(resAct.intentId, "key_activities");
  assert.ok(resAct.reply.includes("Free Rural Health Camps"));
  assert.ok(resAct.reply.includes("Youth Cadet Corps"));

  // 16. Can girls join?
  const resGirls = await answerNgoInquiry({ message: "Can girls join the cadet corps?" });
  assert.equal(resGirls.intentId, "women_girls_join");
  assert.ok(resGirls.reply.includes("Yes, absolutely"));

  // 17. Cadet age limit
  const resAge = await answerNgoInquiry({ message: "What is the age limit to join the cadet corps?" });
  assert.equal(resAge.intentId, "cadet_eligibility_age");
  assert.ok(resAge.reply.includes("14 to 25 years"));

  // 18. Certificates
  const resCert = await answerNgoInquiry({ message: "Will I get a certificate after completing my training or volunteering?" });
  assert.equal(resCert.intentId, "certificates");
  assert.ok(resCert.reply.includes("Certificate"));

  // 19. Mission & Vision
  const resMiss = await answerNgoInquiry({ message: "What is the mission and vision of AGNI?" });
  assert.equal(resMiss.intentId, "mission_vision");
  assert.ok(resMiss.reply.includes("Grassroots Empowerment"));

  // 20. Clothes & Books donation
  const resClothes = await answerNgoInquiry({ message: "Can I donate clothes and books for rural kids?" });
  assert.equal(resClothes.intentId, "clothes_books_donation");
  assert.ok(resClothes.reply.includes("usable items"));

  // 21. Thanks
  const resThanks = await answerNgoInquiry({ message: "Thank you for the information!" });
  assert.equal(resThanks.intentId, "thanks_appreciation");
  assert.ok(resThanks.reply.includes("most welcome"));
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
