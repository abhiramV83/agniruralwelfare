/**
 * AGNI Rural Welfare Society - Modular AI Services
 * 
 * Provides:
 * 1. NGO Assistant (Public visitor inquiries & guidance)
 * 2. Application Verification Insights (Advisory only for administrators)
 * 3. Content Drafting Assistant (Announcements & events for administrators)
 * 
 * Secure design:
 * - Uses GEMINI_API_KEY when configured; seamlessly falls back to offline verified NGO knowledge base
 * - Never transmits sensitive personal data to external APIs
 * - AI suggestions are strictly advisory; human administrator retains 100% authoritative control
 */

const KNOWLEDGE_BASE = [
  {
    triggers: ["join", "register", "apply", "membership", "how to join", "enroll", "member"],
    title: "Joining AGNI Rural Welfare Society",
    response: "You can join AGNI Rural Welfare Society through 4 distinct categories:\n\n" +
      "1. **General Member** (AGNI-MEM): For community workers and long-term supporters.\n" +
      "2. **Cadet Corps** (AGNI-CAD): Youth leadership, drill training, disaster preparedness, and physical discipline.\n" +
      "3. **Volunteer** (AGNI-VOL): Event coordinators, field activists, and health camp supporters.\n" +
      "4. **Internship** (AGNI-INT): Students seeking practical rural social work and community development experience.\n\n" +
      "To apply, click **Register** in the top navigation, select your category, and submit your details. After administrator verification, an official 2-sided Photo ID Card with a QR verification code will be issued."
  },
  {
    triggers: ["cadet", "corps", "ncc", "training", "drill", "parade"],
    title: "AGNI Youth Cadet Corps",
    response: "The AGNI Cadet Corps trains rural youth in leadership, physical endurance, ceremonial parade, and disaster relief response. Inspired by the patriotic ideals of Netaji Subhash Chandra Bose and Swami Vivekananda, cadets participate in community protection, national day parades, and emergency assistance. Approved cadets receive an official AGNI Cadet ID Card and training certification."
  },
  {
    triggers: ["donate", "donation", "fund", "money", "contribute", "tax", "80g", "pledge"],
    title: "Donations & 80G Tax Exemption",
    response: "Your financial contributions directly support rural education kits, medical relief camps, tree plantation, and cadet training gear. Donations are eligible for tax exemption under Section 80G of the Indian Income Tax Act. You can make a pledge or donation directly via our **Donate** page, and an official acknowledgement receipt will be issued."
  },
  {
    triggers: ["activity", "activities", "programs", "work", "what do you do", "medical", "plantation", "relief"],
    title: "Key Activities & Programs",
    response: "AGNI Rural Welfare Society actively conducts:\n\n" +
      "• **Cadet & Youth Development**: Field transit drills, drum squads, and physical conditioning.\n" +
      "• **Free Rural Health Camps**: General medicine checkups, blood grouping, and wellness drives.\n" +
      "• **Women Self-Help Groups**: Skill development, handicraft training, and financial literacy.\n" +
      "• **Student Nutrition & Education**: Free book distribution, school uniforms, and nutrition support.\n" +
      "• **Environmental Drives**: Afforestation and village sanitation awareness.\n" +
      "• **Disaster Relief Assistance**: Direct ground aid during floods, storms, and emergencies."
  },
  {
    triggers: ["id card", "card", "qr", "verify", "verification"],
    title: "Official ID Card & Verification",
    response: "Every verified member, cadet, volunteer, and intern receives an official 2-sided PDF ID card featuring their official Registration Number, validity dates, photograph, blood group, emergency contact, and a tamper-resistant QR code. Anyone can scan the QR code or visit our **/verify/:id** portal to authenticate registration legitimacy instantly."
  },
  {
    triggers: ["contact", "office", "phone", "email", "address", "reach", "location"],
    title: "Contact & Headquarters",
    response: "You can reach AGNI Rural Welfare Society through:\n\n" +
      "• **Email**: agniruralsociety@gmail.com\n" +
      "• **Phone**: +91 94331 23456 / +91 98300 65432\n" +
      "• **Office**: Registered Society Headquarters, serving rural and suburban development regions.\n" +
      "• **Online**: Submit inquiries directly through our **Contact** page for swift response."
  },
  {
    triggers: ["subhash", "vivekananda", "history", "about", "mission", "vision"],
    title: "About AGNI Rural Welfare Society",
    response: "AGNI Rural Welfare Society was founded with the mission of transforming rural communities through grassroots empowerment, youth discipline, and selfless service. Guided by Netaji Subhash Chandra Bose's call for selfless duty and Swami Vivekananda's message of service to humanity ('Serving mankind is serving God'), AGNI bridges the gap between rural potential and modern opportunity."
  }
];

/**
 * Answer public inquiry via Gemini API or verified knowledge base fallback
 */
export async function answerNgoInquiry({ message = "", history = [] } = {}) {
  const query = String(message || "").trim().toLowerCase();
  if (!query) {
    return {
      reply: "Hello! Welcome to AGNI Rural Welfare Society. How may I assist you today? You can ask about our Cadet Corps, volunteering, membership registration, donation, or activities.",
      source: "knowledge_base"
    };
  }

  // 1. If GEMINI_API_KEY is configured, attempt intelligent generation
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "your-gemini-api-key") {
    try {
      const systemInstruction = 
        "You are the official helpful AI Assistant for AGNI Rural Welfare Society, a registered Indian NGO. " +
        "Key facts about AGNI: Focuses on rural community empowerment, Youth Cadet Corps, women self-help groups, free health camps, tree plantation, student education, and disaster relief. " +
        "Offers 4 registration tracks: Member (AGNI-MEM), Cadet (AGNI-CAD), Volunteer (AGNI-VOL), Intern (AGNI-INT). " +
        "Donations are eligible for 80G tax benefits. ID cards have QR code verification at /verify/:id. " +
        "Inspired by Netaji Subhash Chandra Bose and Swami Vivekananda. " +
        "Be courteous, concise, inspiring, and professional. Guide users to relevant site sections.";

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
      const payload = {
        contents: [
          { role: "user", parts: [{ text: `${systemInstruction}\n\nUser Question: ${message}` }] }
        ],
        generationConfig: {
          maxOutputTokens: 350,
          temperature: 0.3
        }
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000)
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 10) {
          return {
            reply: text.trim(),
            source: "gemini_ai"
          };
        }
      }
    } catch (_err) {
      // Graceful fallback to verified offline knowledge base
    }
  }

  // 2. Verified Offline Knowledge Base Matcher
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.triggers.some((t) => query.includes(t))) {
      return {
        reply: entry.response,
        title: entry.title,
        source: "knowledge_base"
      };
    }
  }

  // Default helpful response
  return {
    reply: "AGNI Rural Welfare Society is dedicated to grassroots rural development, youth cadet training, women empowerment, and healthcare outreach. You can explore our **Activities**, join via **Register**, support us via **Donate**, or leave a message through **Contact**!",
    source: "knowledge_base"
  };
}

/**
 * Generate advisory verification insights for an application (Admin only)
 */
export function getApplicationAiInsights(application = {}, existingList = []) {
  const data = application.data || application || {};
  const fullName = data.fullName || data.name || application.fullName || "Applicant";
  const email = data.email || data.memberEmail || application.email || "";
  const phone = data.phone || data.mobile || data.contactNumber || "";
  const category = application.category || data.category || data.applicationType || "Member";
  const address = data.address || data.residentialAddress || "";
  const bloodGroup = data.bloodGroup || "";
  const hasPhoto = Boolean(data.photo || application.photo || (application.attachments && application.attachments.length > 0));

  // Completeness score
  const checks = [
    { label: "Full Name Provided", pass: Boolean(fullName && fullName.length >= 3) },
    { label: "Valid Email Address", pass: Boolean(email && email.includes("@")) },
    { label: "Contact Phone Number", pass: Boolean(phone && String(phone).replace(/\D/g, "").length >= 10) },
    { label: "Residential Address", pass: Boolean(address && address.length >= 5) },
    { label: "Applicant Photograph", pass: hasPhoto },
    { label: "Blood Group Specified", pass: Boolean(bloodGroup) }
  ];

  const passedCount = checks.filter((c) => c.pass).length;
  const completenessPercent = Math.round((passedCount / checks.length) * 100);
  const missingFields = checks.filter((c) => !c.pass).map((c) => c.label);

  // Duplicate checks against existing records
  const currentId = String(application._id || "");
  const duplicates = existingList.filter((other) => {
    const oId = String(other._id || "");
    if (oId && oId === currentId) return false;
    const oEmail = other.email || other.data?.email || other.data?.memberEmail || "";
    const oPhone = other.phone || other.data?.phone || other.data?.mobile || "";
    const emailMatch = email && oEmail && email.toLowerCase() === oEmail.toLowerCase();
    const phoneMatch = phone && oPhone && String(phone).replace(/\D/g, "") === String(oPhone).replace(/\D/g, "");
    return emailMatch || phoneMatch;
  });

  const potentialDuplicates = duplicates.map((d) => ({
    id: d._id,
    name: d.fullName || d.data?.fullName || "Existing Applicant",
    registrationId: d.registrationId || d.officialRegNumber || "Pending",
    status: d.status || "pending"
  }));

  // Summary & Recommendation
  let recommendation = "Ready for Verification: All core identification fields are complete.";
  if (potentialDuplicates.length > 0) {
    recommendation = "Attention Required: Potential duplicate applicant record found with matching contact details. Verify identity before approval.";
  } else if (!hasPhoto) {
    recommendation = "Advisory: Photograph not detected. Official ID card generation requires an applicant photograph.";
  } else if (completenessPercent < 70) {
    recommendation = "Advisory: Critical details missing. Contact applicant for clarification before approval.";
  }

  return {
    applicantName: fullName,
    category,
    completenessPercent,
    checks,
    missingFields,
    hasDuplicates: potentialDuplicates.length > 0,
    potentialDuplicates,
    recommendation,
    advisoryNotice: "This analysis is an AI-assisted advisory summary to support admin review. Final acceptance and registration authority resides strictly with the administrator."
  };
}

/**
 * Draft announcements and event descriptions for administrators
 */
export async function draftContentForAdmin({ type = "announcement", topic = "", tone = "inspiring" } = {}) {
  const cleanTopic = String(topic || "").trim() || "Rural Community Welfare Drive";

  // Check Gemini if available
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "your-gemini-api-key") {
    try {
      const prompt = `Write a professional, inspiring ${type} for AGNI Rural Welfare Society on the topic: "${cleanTopic}". Tone: ${tone}. Include a warm greeting, purpose of the initiative, impact, and a clear call to action. Keep it under 200 words.`;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.4 }
        }),
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) {
        const data = await res.json();
        const drafted = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (drafted && drafted.trim().length > 20) {
          return {
            title: `${type.toUpperCase()}: ${cleanTopic}`,
            content: drafted.trim(),
            source: "gemini_ai"
          };
        }
      }
    } catch (_err) {
      // Fall through to template generator
    }
  }

  // High quality structured templates
  const templates = {
    announcement: {
      title: `Official Announcement: ${cleanTopic}`,
      content: `AGNI Rural Welfare Society is pleased to announce our upcoming initiative: ${cleanTopic}.\n\n` +
        `As part of our continuous commitment to rural empowerment and youth development, this program will mobilize our cadet corps, volunteers, and local community leaders to deliver tangible grassroots support.\n\n` +
        `All registered members and volunteers are invited to participate. For schedules, coordination details, and registration, please connect with the administrative office.`
    },
    event: {
      title: `Event Notice: ${cleanTopic}`,
      content: `You are cordially invited to participate in the ${cleanTopic} organized by AGNI Rural Welfare Society.\n\n` +
        `• Objective: Community upliftment, youth engagement, and practical welfare delivery.\n` +
        `• Participants: AGNI Cadets, Volunteers, General Members, and Local Residents.\n` +
        `• Highlights: Fieldwork sessions, awareness seminars, and community fellowship.\n\n` +
        `Join hands with us to turn inspiration into action. Service to humanity is service to the nation.`
    },
    social: {
      title: `Social Update: ${cleanTopic}`,
      content: `Empowering communities from the grassroots up! 🌾✨\n\n` +
        `AGNI Rural Welfare Society is actively rolling out "${cleanTopic}" to create lasting positive impact across rural sectors. Every step forward is powered by the dedication of our cadets and volunteers.\n\n` +
        `Learn more, volunteer, or support our mission at our official portal.\n\n` +
        `#AgniRuralWelfare #RuralEmpowerment #SocialService #CommunityFirst #YouthCadets`
    },
    campaign: {
      title: `Campaign Appeal: ${cleanTopic}`,
      content: `Dear Friends and Well-Wishers,\n\n` +
        `Today, we launch our dedicated welfare appeal: ${cleanTopic}. Every contribution directly touches lives in underprivileged rural communities—providing essential educational materials, healthcare support, and youth leadership training.\n\n` +
        `All donations are eligible for tax relief under Section 80G of the Income Tax Act. Together, we can build a stronger, self-reliant rural society.`
    }
  };

  const selected = templates[type] || templates.announcement;
  return {
    title: selected.title,
    content: selected.content,
    source: "template_engine"
  };
}

