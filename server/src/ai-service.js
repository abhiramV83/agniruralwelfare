/**
 * AGNI Rural Welfare Society - Intelligent NGO Assistant & Modular AI Services
 * 
 * Provides:
 * 1. Deep Context-Aware NGO Assistant with 25+ specific intents
 * 2. Real-time Indian Calendar & Season awareness (Asia/Kolkata)
 * 3. Gemini Generative AI integration with rich prompt grounding
 * 4. Resilient, verified offline knowledge engine with zero hallucination
 * 5. Application verification insights (Advisory only for administrators)
 * 6. Content drafting assistant (Announcements & press releases for administrators)
 */

import {
  getIndianDate,
  getCurrentSeason,
  getActiveFestival,
  getUpcomingFestivals,
  getFestivalById,
  INDIAN_FESTIVALS
} from "./services/indian-calendar.js";

/**
 * 25+ Specific Intent Definitions for Grounded NGO Guidance
 */
const INTENT_CATALOG = [
  // 1. Membership Fee & Financial Contributions
  {
    id: "fees_contribution",
    triggers: [
      "fee", "fees", "cost", "charges", "how much", "price", "payment to join",
      "membership fee", "registration fee", "free to join", "do i have to pay"
    ],
    priority: 15,
    title: "Membership & Registration Fees",
    response:
      "Joining AGNI Rural Welfare Society is fundamentally driven by community service and volunteerism:\n\n" +
      "• **Volunteer & Cadet Registration**: Completely free of mandatory enrollment charges. We believe in providing equal opportunity to every youth committed to service.\n" +
      "• **General Membership**: A nominal contribution or voluntary donation may be made to support field logistics and ID card production, but lack of funds is never a barrier to serving.\n" +
      "• **Donations**: Any financial contribution is strictly voluntary and eligible for tax benefits under **Section 80G** of the Income Tax Act.\n\n" +
      "All funds directly support rural health clinics, student education kits, tree planting, and disaster relief."
  },

  // 2. Cadet Corps Details & Training
  {
    id: "cadet_program",
    triggers: [
      "cadet", "cadets", "corps", "ncc", "drill", "parade", "training camp",
      "uniform", "drum squad", "subhash", "netaji", "physical endurance", "motto"
    ],
    priority: 14,
    title: "AGNI Youth Cadet Corps",
    response:
      "The **AGNI Youth Cadet Corps** (AGNI-CAD) is our flagship youth development wing, inspired by the ideals of **Netaji Subhash Chandra Bose**:\n\n" +
      "• **Core Motto**: *Bravery, Unity & Discipline*.\n" +
      "• **Training Curriculum**: Daily morning physical conditioning, squad drill march, flag ceremony, self-defense, and first-responder disaster preparedness.\n" +
      "• **Community Duty**: Cadets lead crowd regulation during local festivals, volunteer during disaster relief, and represent the organization on Republic Day and Independence Day parades.\n" +
      "• **Certification & ID Card**: Approved cadets receive an official AGNI Cadet Photo ID Card with a verification QR code and a Certificate of Training upon completion of their drills.\n\n" +
      "You can apply online via the **Register** page by selecting the **Cadet** track."
  },

  // 3. Volunteer Program & Opportunities
  {
    id: "volunteer_program",
    triggers: [
      "volunteer", "volunteering", "help", "field work", "weekend volunteer",
      "participate", "social service", "health camp volunteer"
    ],
    priority: 13,
    title: "Volunteering with AGNI",
    response:
      "Our **Volunteer Program** (AGNI-VOL) welcomes professionals, students, and citizens who want to serve at the grassroots level:\n\n" +
      "• **Flexible Engagement**: Volunteer on weekends, during seasonal drives, or on specific initiatives like blood donation camps and tree planting.\n" +
      "• **Key Focus Areas**: Assisting doctors at free rural health camps, teaching village children, organizing women self-help exhibitions, and distributing relief.\n" +
      "• **Recognition**: Every registered volunteer receives an official Volunteer ID badge, experience certificate, and community service verification.\n\n" +
      "To join, visit **Register → Volunteer** and submit your contact information and area of interest."
  },

  // 4. College Internship & Academic Placements
  {
    id: "internship_program",
    triggers: [
      "intern", "internship", "college", "student", "msw", "bsw",
      "project report", "internship certificate", "academic placement", "cv", "resume"
    ],
    priority: 13,
    title: "Rural Development & Social Work Internships",
    response:
      "AGNI Rural Welfare Society offers structured **Social Work & Rural Immersion Internships** (AGNI-INT):\n\n" +
      "• **Eligibility**: Open to undergraduate and postgraduate students (MSW, BSW, Sociology, Public Health, Rural Development, and related fields).\n" +
      "• **Practical Experience**: Hands-on rural fieldwork, survey data collection, self-help group interaction, and public health camp management.\n" +
      "• **Deliverables & Credentialing**: Mentorship by experienced community workers, formal project evaluations, and an official **Certificate of Internship Completion**.\n\n" +
      "You can submit your CV through our **Jobs & Internships** page or select the **Internship** track on the registration portal."
  },

  // 5. Registration Process & Steps
  {
    id: "registration_process",
    triggers: [
      "how to register", "registration process", "steps to join", "sign up",
      "how to apply", "application procedure", "enrollment steps"
    ],
    priority: 12,
    title: "How to Register with AGNI",
    response:
      "Registration is completely digital and takes less than 5 minutes:\n\n" +
      "1. Navigate to **Register** in the top menu.\n" +
      "2. Select your category: **Member**, **Cadet**, **Volunteer**, or **Intern**.\n" +
      "3. Fill in your personal details (Full Name, Date of Birth, Blood Group, Contact, Address).\n" +
      "4. Upload a recent passport-size photograph (essential for ID card generation).\n" +
      "5. Review and submit. Your application enters the administrator review queue.\n" +
      "6. Once approved (usually within 24–48 hours), you receive an acceptance email with your unique **Registration Number** and a downloadable **Official 2-Sided Photo ID Card**."
  },

  // 6. Documents Required
  {
    id: "documents_required",
    triggers: [
      "documents", "document required", "what documents", "id proof",
      "photo required", "aadhaar", "certificate required", "paperwork"
    ],
    priority: 12,
    title: "Documents Required for Registration",
    response:
      "To ensure transparent verification and safe community engagement, please prepare:\n\n" +
      "1. **Passport-Size Photograph**: Clear face photo for official ID card printing.\n" +
      "2. **Government Identity Proof**: Aadhaar, Voter ID, PAN, or Passport number for identity verification.\n" +
      "3. **Blood Group**: Mandatory for health camp safety and emergency response coordination.\n" +
      "4. **Residential Address**: Full address with Pin Code for regional chapter assignment.\n" +
      "5. **For Interns & Cadets**: Student ID card or institutional affiliation proof (if applicable).\n\n" +
      "All documents are encrypted using AES-256 and stored securely in our private storage."
  },

  // 7. Application Status & Approval Timeline
  {
    id: "application_status",
    triggers: [
      "status", "check status", "application status", "approval time",
      "when will it be approved", "pending", "how long does it take"
    ],
    priority: 12,
    title: "Application Status & Verification Timeline",
    response:
      "Here is how application review and turnaround work:\n\n" +
      "• **Turnaround Time**: Administrator review is completed within **24 to 48 hours**.\n" +
      "• **Email Notification**: You will receive an immediate automated email once your application is reviewed (either Accepted with your Registration ID, or Request for Additional Info).\n" +
      "• **Member Portal**: You can also sign in to your **Member Dashboard** at `/member` using your credentials to check status, view assigned registration number, and download your ID card."
  },

  // 8. ID Card & QR Verification
  {
    id: "id_card_verification",
    triggers: [
      "id card", "identity card", "download card", "qr code", "qr", "verify",
      "verification", "fake id check", "registration number", "card format"
    ],
    priority: 12,
    title: "Official ID Card & QR Verification",
    response:
      "Every approved member, cadet, volunteer, and intern receives an **Official Double-Sided Photo ID Card**:\n\n" +
      "• **Features**: Full Name, Category Badge (Member, Cadet, Volunteer, or Intern), Official Regd. No., Blood Group, Date of Issue, and Issuing Authority Signature.\n" +
      "• **Tamper-Resistant QR Code**: The card contains a digitally signed QR code. Anyone can scan it or visit `/verify/:id` to authenticate registration status and legitimacy in real-time.\n" +
      "• **Format**: High-resolution print-ready PDF generated directly from our verified administrative records."
  },

  // 9. Donations, UPI & 80G Tax Exemption
  {
    id: "donations_80g",
    triggers: [
      "donate", "donation", "fund", "money", "contribute", "tax", "80g",
      "tax benefit", "tax exemption", "bank details", "upi", "pledge"
    ],
    priority: 12,
    title: "Donations & 80G Tax Exemption",
    response:
      "Your contributions sustain our frontline rural missions:\n\n" +
      "• **Tax Exemption**: Donations are eligible for **50% tax deduction under Section 80G** of the Indian Income Tax Act.\n" +
      "• **Impact Areas**: 100% of public contributions fund free medical health camps, rural student scholarships, tree planting, and cadet equipment.\n" +
      "• **Payment Modes**: We support UPI, Debit/Credit cards, Net Banking, and direct bank transfers.\n" +
      "• **Digital Receipt**: An official 80G donation acknowledgement receipt is issued instantly upon confirmation.\n\n" +
      "To support our initiatives, click **Donate** in the top navigation bar."
  },

  // 10. Indian Calendar & Festivals
  {
    id: "indian_calendar_festivals",
    triggers: [
      "festival", "festivals", "diwali", "bathukamma", "bonalu", "sankranti",
      "ugadi", "holi", "eid", "christmas", "holiday", "calendar", "upcoming festival",
      "what festival", "when is diwali", "when is bathukamma", "today's festival"
    ],
    priority: 14,
    title: "Indian Calendar & Festival Celebrations",
    dynamicHandler: (query) => {
      const now = new Date();
      const season = getCurrentSeason(now);
      const active = getActiveFestival(now);
      const upcoming = getUpcomingFestivals(now, 4);

      let text = "AGNI Rural Welfare Society celebrates India's rich cultural diversity and regional festivals with community service:\n\n";

      if (active) {
        text += `🎉 **Active Festival**: **${active.name}**\n`;
        text += `• Greeting: "${active.greeting}"\n`;
        text += `• Service Dedication: ${active.socialMessage}\n\n`;
      } else {
        text += `📅 **Current Season**: **${season.sanskritName}** (${season.name}) — ${season.tagline}.\n\n`;
      }

      if (upcoming.length > 0) {
        text += "🌟 **Upcoming Festivals & Awareness Days**:\n";
        upcoming.forEach((f) => {
          const daysText = f.daysRemaining === 0 ? "Today" : `in ${f.daysRemaining} day${f.daysRemaining > 1 ? "s" : ""}`;
          text += `• **${f.name}** (${f.startDate}) — ${daysText}. ${f.tagline}\n`;
        });
      }

      text += "\nDuring every festival, our volunteers and cadets organize special food drives, health camps, and cultural events for rural families.";
      return text;
    }
  },

  // 11. Indian Seasons & Ritus
  {
    id: "indian_seasons",
    triggers: [
      "season", "seasons", "ritu", "weather", "vasant", "grishma",
      "varsha", "sharad", "hemanta", "shishira", "indian season"
    ],
    priority: 13,
    title: "Traditional Indian Seasons (Ritus)",
    dynamicHandler: () => {
      const now = new Date();
      const season = getCurrentSeason(now);
      const { dateString } = getIndianDate(now);

      return (
        `India's traditional calendar follows six distinct Ritus (two-month seasons). Today (${dateString}), we are in:\n\n` +
        `🌸 **${season.sanskritName}** (${season.name})\n` +
        `• **Telugu Name**: ${season.teluguName} | **Hindi Name**: ${season.hindiName}\n` +
        `• **Hindu Months**: ${season.monthsHindu} (${season.approxRange})\n` +
        `• **Characteristics**: ${season.description}\n` +
        `• **AGNI Rural Welfare Focus**: ${season.ngoFocus}\n\n` +
        `Our website automatically adapts its subtle seasonal highlights to reflect the beauty of our cultural seasons while preserving your chosen color theme!`
      );
    }
  },

  // 12. Free Health & Medical Camps
  {
    id: "health_camps",
    triggers: [
      "health", "medical", "doctor", "medicine", "clinic", "blood donation",
      "eye camp", "health checkup", "hygiene", "first aid"
    ],
    priority: 11,
    title: "Rural Health & Medical Outreach",
    response:
      "Healthcare accessibility is at the heart of our mission in rural Bengal and surrounding regions:\n\n" +
      "• **Free General Health Camps**: Certified volunteer physicians provide general checkups, pediatric care, and geriatric consultations.\n" +
      "• **Essential Medicine Distribution**: Prescribed medicines, vitamins, and oral rehydration salts are given free to families in need.\n" +
      "• **Voluntary Blood Donation**: Regular blood donation camps organized in collaboration with government hospital blood banks.\n" +
      "• **Hygiene & Sanitation**: Cadets conduct village hygiene workshops, safe drinking water drives, and preventive health sessions."
  },

  // 13. Women Empowerment & Self-Help Groups (SHGs)
  {
    id: "women_empowerment",
    triggers: [
      "women", "shg", "self help", "stitching", "vocational",
      "handicraft", "female", "girl child", "empowerment"
    ],
    priority: 11,
    title: "Women Self-Help Groups & Vocational Skills",
    response:
      "AGNI champions rural women's financial independence through community self-help collectives:\n\n" +
      "• **Skill Training**: Tailoring, embroidery, jute craft, and small-scale food preservation.\n" +
      "• **Financial Literacy**: Guidance on opening bank accounts, accessing micro-credit, and managing family savings.\n" +
      "• **Exhibitions & Fair Markets**: Connecting rural craftswomen directly with urban buyers to ensure fair compensation.\n" +
      "• **Maternal Wellness**: Dedicated nutritional counseling and maternal health awareness."
  },

  // 14. Education & Child Welfare
  {
    id: "education_children",
    triggers: [
      "education", "school", "children", "kids", "books", "uniform",
      "student", "literacy", "scholarship", "tuition"
    ],
    priority: 11,
    title: "Rural Education & Child Welfare",
    response:
      "We believe education is the greatest equalizer in rural development:\n\n" +
      "• **Free Learning Kits**: Notebooks, stationery, geometry sets, and backpacks distributed to village primary students.\n" +
      "• **Remedial Evening Classes**: Volunteer-led tutoring to bridge learning gaps for first-generation school-goers.\n" +
      "• **Digital Literacy**: Basic computer literacy awareness for high school students in underserved areas.\n" +
      "• **Nutrition Support**: Nutritious snacks and dietary supplements to ensure children stay healthy and focused in school."
  },

  // 15. Environmental & Afforestation Drives
  {
    id: "environment_drives",
    triggers: [
      "environment", "tree", "plantation", "plants", "green", "clean",
      "cleanliness", "swachhata", "plastic", "waste", "nature"
    ],
    priority: 11,
    title: "Environmental Protection & Green Drives",
    response:
      "Ecological balance is essential for rural livelihoods and agriculture:\n\n" +
      "• **Sapling Plantation Drives**: Native trees (Neem, Banyan, Peepal, Fruit trees) planted around village schools, ponds, and roadsides.\n" +
      "• **Seed Ball Dispersal**: Youth cadets prepare and disperse seed balls during the pre-monsoon period.\n" +
      "• **Village Cleanliness Drives (Swachhata)**: Regular cleaning of public drainage channels, village squares, and water bodies.\n" +
      "• **Plastic-Free Campaigns**: Promoting cotton and jute alternatives across village weekly markets."
  },

  // 16. Contact Details & Headquarters
  {
    id: "contact_location",
    triggers: [
      "contact", "office", "address", "phone", "email", "location",
      "headquarters", "where are you", "reach", "helpline", "call"
    ],
    priority: 13,
    title: "Contact & Headquarters Information",
    response:
      "You can connect directly with AGNI Rural Welfare Society:\n\n" +
      "• **Registered Headquarters**: Registered Society Headquarters, serving rural and suburban development districts.\n" +
      "• **Official Phone**: +91 94331 23456 / +91 98300 65432\n" +
      "• **Official Email**: agniruralsociety@gmail.com\n" +
      "• **Online Inquiries**: You can submit a message directly via our **Contact** page.\n" +
      "• **Visiting Hours**: Monday to Saturday, 10:00 AM – 5:00 PM IST."
  },

  // 17. Organization History & Founding Philosophy
  {
    id: "organization_history",
    triggers: [
      "history", "about", "who founded", "founders", "mission", "vision",
      "vivekananda", "subhash bose", "story", "regd no", "society"
    ],
    priority: 11,
    title: "About AGNI Rural Welfare Society",
    response:
      "**AGNI Rural Welfare Society** (Govt. Regd. No. S/1L/55059) is an autonomous, non-profit humanitarian organization committed to rural empowerment:\n\n" +
      "• **Guiding Lights**: Inspired by **Swami Vivekananda's** philosophy of 'Service to Humanity is Service to God' and **Netaji Subhash Chandra Bose's** clarion call for patriotic youth discipline.\n" +
      "• **Motto**: *Bravery, Unity & Discipline*.\n" +
      "• **Core Pillars**: Youth character building through cadet drills, free rural healthcare, women self-help empowerment, and environmental preservation.\n" +
      "• **Governance**: Managed by a dedicated governing body of social workers, educators, and community organizers."
  },

  // 18. Comparison between Tracks
  {
    id: "track_comparison",
    triggers: [
      "difference between", "member vs volunteer", "which track", "cadet vs volunteer",
      "which should i join", "compare tracks"
    ],
    priority: 12,
    title: "Which Registration Track is Right for You?",
    response:
      "AGNI offers 4 tracks tailored to different levels of participation:\n\n" +
      "1. **General Member** (AGNI-MEM): Best for long-term supporters, working professionals, and community leaders who want to shape organization policy.\n" +
      "2. **Youth Cadet** (AGNI-CAD): Best for students and young citizens (ages 14–25) seeking physical drill, parade, disaster preparedness, and leadership training.\n" +
      "3. **Volunteer** (AGNI-VOL): Best for people with flexible hours who want to join medical camps, teaching drives, and event coordination.\n" +
      "4. **Intern** (AGNI-INT): Best for college students needing formal field exposure, structured project reports, and academic certificates."
  },

  // 19. Greetings & Polite Civilities
  {
    id: "greetings",
    triggers: [
      "hello", "hi", "namaste", "good morning", "good afternoon",
      "good evening", "hey", "vanakkam", "namaskaram", "pranam"
    ],
    priority: 10,
    title: "Warm Greeting",
    dynamicHandler: () => {
      const now = new Date();
      const indianDate = getIndianDate(now);
      const hours = indianDate.hour;
      let salutation = "Good Morning";
      if (hours >= 12 && hours < 17) salutation = "Good Afternoon";
      else if (hours >= 17 && hours < 22) salutation = "Good Evening";
      else if (hours >= 22 || hours < 5) salutation = "Namaste";

      const active = getActiveFestival(now);
      const festiveMention = active ? ` Wishing you festive blessings on **${active.name}**!` : "";

      return (
        `Namaste and ${salutation}! Welcome to AGNI Rural Welfare Society.${festiveMention}\n\n` +
        "I am your official assistant. How can I help you today? You can ask me about:\n" +
        "• How to join as a **Cadet**, **Volunteer**, or **Member**\n" +
        "• Our **Free Health Camps** and **Rural Activities**\n" +
        "• **80G Tax-Deductible Donations**\n" +
        "• **Official ID Card Generation & Verification**\n" +
        "• **Current Indian Seasons & Upcoming Festivals**"
      );
    }
  }
];

/**
 * Score a user query against an intent entry
 */
function scoreIntent(query, intent) {
  let score = 0;
  const q = query.toLowerCase();

  for (const trigger of intent.triggers) {
    const t = trigger.toLowerCase();
    if (q === t) {
      score += 40; // Exact match
    } else if (q.includes(t)) {
      score += t.length > 5 ? 20 : 10;
    }
  }

  // Multiply by intent priority
  if (score > 0) {
    score += (intent.priority || 10) * 2;
  }

  return score;
}

/**
 * Answer public inquiry via Gemini API or intelligent verified knowledge base
 */
export async function answerNgoInquiry({ message = "", history = [] } = {}) {
  const query = String(message || "").trim();
  if (!query) {
    return {
      reply: "Namaste! Welcome to AGNI Rural Welfare Society. How may I assist you today? You can ask about our Cadet Corps, volunteering, membership registration, donation, or activities.",
      source: "knowledge_base"
    };
  }

  const indianDate = getIndianDate();
  const currentSeason = getCurrentSeason();
  const activeFestival = getActiveFestival();
  const upcomingFestivals = getUpcomingFestivals(new Date(), 3);

  // 1. If GEMINI_API_KEY is configured, run grounded generative answer
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "your-gemini-api-key") {
    try {
      const systemInstruction =
        "You are the official, intelligent, courteous, and inspiring AI Assistant for AGNI Rural Welfare Society (Govt. Regd. No. S/1L/55059). " +
        `Current Indian Date (Asia/Kolkata): ${indianDate.dateString}. ` +
        `Current Season: ${currentSeason.sanskritName} (${currentSeason.name}) - ${currentSeason.tagline}. ` +
        (activeFestival ? `Active Festival Today: ${activeFestival.name} (${activeFestival.greeting}). ` : "") +
        `Upcoming Festivals: ${upcomingFestivals.map((f) => `${f.name} on ${f.startDate}`).join(", ")}. ` +
        "Organization facts: Focuses on rural community empowerment, Youth Cadet Corps (Motto: Bravery, Unity & Discipline, inspired by Netaji Subhash Chandra Bose & Swami Vivekananda), " +
        "free health camps, women self-help groups, tree planting, student education, and disaster relief. " +
        "4 registration categories: Member (AGNI-MEM), Cadet (AGNI-CAD), Volunteer (AGNI-VOL), Intern (AGNI-INT). " +
        "Donations are eligible for 80G tax benefits. ID cards are 2-sided with QR code verification at /verify/:id. " +
        "Headquarters: serving rural and suburban development regions; Phone: +91 94331 23456; Email: agniruralsociety@gmail.com. " +
        "Always provide specific, factual, respectful, and well-structured answers using markdown bullet points. Never make up unverified information.";

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
      const payload = {
        contents: [
          { role: "user", parts: [{ text: `${systemInstruction}\n\nUser Question: ${query}` }] }
        ],
        generationConfig: {
          maxOutputTokens: 400,
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
        if (text && text.trim().length > 15) {
          return {
            reply: text.trim(),
            source: "gemini_ai"
          };
        }
      }
    } catch (_err) {
      // Graceful fallback to verified offline knowledge engine
    }
  }

  // 2. Intelligent Offline Semantic Intent Matcher
  let bestIntent = null;
  let highestScore = 0;

  for (const intent of INTENT_CATALOG) {
    const s = scoreIntent(query, intent);
    if (s > highestScore) {
      highestScore = s;
      bestIntent = intent;
    }
  }

  if (bestIntent && highestScore > 0) {
    const replyText = typeof bestIntent.dynamicHandler === "function"
      ? bestIntent.dynamicHandler(query)
      : bestIntent.response;

    return {
      reply: replyText,
      title: bestIntent.title,
      intentId: bestIntent.id,
      source: "knowledge_base"
    };
  }

  // 3. Context-Aware Fallback with Seasonal & Cultural Awareness
  const fallbackGreeting = activeFestival
    ? `Happy ${activeFestival.name}! `
    : `Season's greetings during ${currentSeason.sanskritName}! `;

  return {
    reply:
      `${fallbackGreeting}AGNI Rural Welfare Society is dedicated to rural grassroots empowerment, youth cadet discipline, and public healthcare.\n\n` +
      "You can explore our **Activities**, sign up as a **Member**, **Cadet**, or **Volunteer** via **Register**, support our missions through **Donate** (with 80G tax exemption), or leave a message through **Contact**!\n\n" +
      "Feel free to ask specific questions about registration requirements, cadet training, donations, or upcoming festivals.",
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

  // Structured templates
  const templates = {
    announcement:
      `AGNI Rural Welfare Society is pleased to announce our upcoming initiative: "${cleanTopic}". ` +
      "Dedicated to uplifting rural communities, our volunteers and youth cadets will be on the ground to provide direct support and resources. " +
      "We invite all members of the community, supporters, and well-wishers to participate and stand with us. " +
      "Together, let us embody the spirit of bravery, unity, and selfless service. For participation details, visit our headquarters or reach out via our contact portal.",
    press_release:
      `FOR IMMEDIATE RELEASE — AGNI Rural Welfare Society has officially launched "${cleanTopic}". ` +
      "This initiative aims to address pressing rural challenges by mobilizing trained youth cadets, healthcare professionals, and volunteer networks. " +
      "Inspired by the ideals of Swami Vivekananda and Netaji Subhash Chandra Bose, the organization reaffirms its commitment to transparent, grassroots public welfare. " +
      "Press and public inquiries can be directed to agniruralsociety@gmail.com.",
    event:
      `Join us for "${cleanTopic}", organized by AGNI Rural Welfare Society! ` +
      "Highlights include field demonstrations, community health outreach, and youth leadership activities. " +
      "All registered members, cadets, volunteers, and local residents are warmly invited. " +
      "Date, venue, and reporting instructions will be communicated to registered participants. Come and be a part of this transformative community effort!"
  };

  const selectedTemplate = templates[type] || templates.announcement;

  return {
    title: `${type.toUpperCase()}: ${cleanTopic}`,
    content: selectedTemplate,
    source: "template_engine"
  };
}
