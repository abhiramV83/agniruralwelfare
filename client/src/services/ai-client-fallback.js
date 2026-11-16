/**
 * AGNI Rural Welfare Society - Client-Side Resilient AI Answering Engine
 * 
 * Guarantees that even under network interruption or offline status,
 * the user receives an intelligent, specific, non-repetitive response to every inquiry.
 */

import { getCurrentSeason, getActiveFestival, getUpcomingFestivals } from "./indian-calendar.js";

const CLIENT_KNOWLEDGE = [
  {
    triggers: ["fee", "fees", "cost", "charges", "how much", "pay", "price", "free"],
    title: "Membership & Registration Fees",
    response:
      "Joining AGNI Rural Welfare Society is fundamentally non-commercial and service-oriented:\n\n" +
      "• **Volunteer & Cadet Registration**: Completely free of mandatory fees. Every youth dedicated to service is welcome.\n" +
      "• **General Membership**: Nominal voluntary contributions support ID card generation and field logistics, but lack of funds is never a barrier.\n" +
      "• **Donations**: Strictly voluntary and eligible for **Section 80G** tax exemption."
  },
  {
    triggers: ["what is agni", "who are you", "about agni", "about us", "who is agni", "what is this", "tell me about agni"],
    title: "About AGNI Rural Welfare Society",
    response:
      "**AGNI Rural Welfare Society** (Govt. Regd. No. S/1L/55059) is a registered Indian non-profit organization:\n\n" +
      "• **Our Mission**: Transforming rural communities through youth cadet training, free healthcare, women self-help collectives, student education, and disaster relief.\n" +
      "• **Guiding Lights**: Inspired by Swami Vivekananda ('Serving humanity is serving God') and Netaji Subhash Chandra Bose.\n" +
      "• **Core Motto**: *Bravery, Unity & Discipline*."
  },
  {
    triggers: ["cadet", "corps", "ncc", "drill", "parade", "training", "drum squad", "subhash", "netaji"],
    title: "AGNI Youth Cadet Corps",
    response:
      "The **AGNI Youth Cadet Corps** (AGNI-CAD) trains young citizens in physical endurance, squad drill, ceremonial parade, and disaster response:\n\n" +
      "• **Activities**: Morning physical conditioning, ceremonial march, self-defense, and flag ceremonies.\n" +
      "• **Community Role**: Regulating crowds during festivals, volunteering in health camps, and emergency relief.\n" +
      "• **ID & Certificate**: Approved cadets receive an official AGNI Cadet Photo ID Card with a QR verification code and training credentials."
  },
  {
    triggers: ["volunteer", "volunteering", "help", "field work", "weekend"],
    title: "Volunteer Opportunities",
    response:
      "Our **Volunteer Program** (AGNI-VOL) welcomes everyone who wants to make a tangible grassroots impact:\n\n" +
      "• **Flexible Timing**: Join on weekends, during seasonal drives, or for specific events.\n" +
      "• **Key Initiatives**: Assisting doctors at rural medical camps, teaching village children, and organizing relief distribution.\n" +
      "• **Recognition**: Registered volunteers receive official ID badges and certificates of appreciation."
  },
  {
    triggers: ["intern", "internship", "college", "student", "msw", "bsw", "project", "cv"],
    title: "Social Work & Rural Internships",
    response:
      "AGNI offers structured **Rural Development Internships** (AGNI-INT) for college students:\n\n" +
      "• **Field Exposure**: Hands-on rural immersion, survey research, and community project management.\n" +
      "• **Credentialing**: Formal project guidance and an official **Certificate of Internship Completion**.\n" +
      "• **How to Apply**: Submit your CV via **Jobs & Internships** or apply under the **Internship** registration track."
  },
  {
    triggers: ["document", "documents", "id proof", "photo", "aadhaar", "required to register"],
    title: "Documents Required for Registration",
    response:
      "To register online, please prepare:\n\n" +
      "1. **Passport-size Photograph**: Needed for your official 2-sided Photo ID Card.\n" +
      "2. **Government ID Proof**: Aadhaar, Voter ID, PAN, or Passport number.\n" +
      "3. **Blood Group**: Vital for health and emergency coordination.\n" +
      "4. **Address Proof**: Full address with Pin Code.\n" +
      "5. **Student ID**: Required only if applying for an Internship or Cadet Corps."
  },
  {
    triggers: ["status", "check status", "approval", "how long", "pending", "approved"],
    title: "Application Status & Review Timeline",
    response:
      "• **Review Timeline**: Applications are verified by our administrator within **24 to 48 hours**.\n" +
      "• **Email Confirmation**: You will receive an immediate automated email with your official **Registration Number** once approved.\n" +
      "• **Member Dashboard**: You can sign in to your dashboard anytime to track status and download your verified ID card."
  },
  {
    triggers: ["id card", "qr code", "verify", "verification", "download card"],
    title: "Official ID Card & QR Verification",
    response:
      "Every approved member, cadet, volunteer, and intern receives an **Official Double-Sided Photo ID Card**:\n\n" +
      "• Features your assigned Registration Number (e.g., ARWS-...), photograph, blood group, and validity dates.\n" +
      "• Includes a tamper-resistant QR code that scans directly to our public portal at `/verify/:id` to authenticate legitimacy instantly."
  },
  {
    triggers: ["donate", "donation", "fund", "80g", "tax", "upi", "money", "contribute"],
    title: "Donations & 80G Tax Exemption",
    response:
      "Donations directly fund rural medical camps, student education kits, tree planting, and youth cadet gear:\n\n" +
      "• **Tax Benefit**: Eligible for **50% deduction under Section 80G** of the Income Tax Act.\n" +
      "• **Modes**: UPI, Net Banking, Credit/Debit cards, and direct bank transfers.\n" +
      "• **Instant Receipt**: An official 80G digital receipt is issued for every contribution."
  },
  {
    triggers: ["what do you do", "activities", "programs", "work", "projects", "initiatives"],
    title: "Key Activities & Programs",
    response:
      "AGNI Rural Welfare Society conducts active grassroots programs throughout the year:\n\n" +
      "• **Youth Cadet Corps**: Daily physical drills, ceremonial parades, and disaster preparedness.\n" +
      "• **Free Rural Health Camps**: General medical checkups, eye tests, and free medicine distribution.\n" +
      "• **Women Self-Help Collectives**: Tailoring, handicrafts, and micro-savings guidance.\n" +
      "• **Child Welfare & Education**: Free book distribution, uniforms, and evening study classes.\n" +
      "• **Environmental Drives**: Tree planting, seed ball dispersal, and village sanitation.\n" +
      "• **Disaster Relief**: Direct relief missions during floods and emergency crises."
  },
  {
    triggers: ["contact", "office", "address", "phone", "email", "location", "headquarters", "sonarpur"],
    title: "Contact & Headquarters",
    response:
      "You can connect directly with our headquarters:\n\n" +
      "• **Registered Headquarters**: Registered Society Headquarters, serving rural and suburban development regions.\n" +
      "• **Phone**: +91 94331 23456 / +91 98300 65432\n" +
      "• **Email**: agniruralsociety@gmail.com\n" +
      "• **Visiting Hours**: Monday to Saturday, 10:00 AM – 5:00 PM IST."
  },
  {
    triggers: ["festival", "festivals", "diwali", "bathukamma", "bonalu", "sankranti", "ugadi", "holi", "eid", "christmas"],
    title: "Indian Festivals & Celebrations",
    dynamic: () => {
      const active = getActiveFestival();
      const season = getCurrentSeason();
      const upcoming = getUpcomingFestivals(new Date(), 3);

      let text = "AGNI celebrates India's vibrant cultural occasions with community service:\n\n";
      if (active) {
        text += `🎉 **Active Festival Today**: **${active.name}**\n• Greeting: "${active.greeting}"\n• Service Focus: ${active.socialMessage}\n\n`;
      } else {
        text += `📅 **Current Season**: **${season.sanskritName}** (${season.name}) — ${season.tagline}.\n\n`;
      }
      if (upcoming.length > 0) {
        text += "🌟 **Upcoming Festivals**:\n";
        upcoming.forEach((f) => {
          const days = f.daysRemaining === 0 ? "Today" : `in ${f.daysRemaining} days`;
          text += `• **${f.name}** (${f.startDate}) — ${days}.\n`;
        });
      }
      return text;
    }
  },
  {
    triggers: ["season", "ritu", "seasons", "weather", "vasant", "grishma", "varsha", "sharad", "hemanta", "shishira"],
    title: "Traditional Indian Season (Ritu)",
    dynamic: () => {
      const season = getCurrentSeason();
      return (
        `We are currently in **${season.sanskritName}** (${season.name})!\n\n` +
        `• **Telugu Name**: ${season.teluguName} | **Hindi Name**: ${season.hindiName}\n` +
        `• **Months**: ${season.monthsHindu} (${season.approxRange})\n` +
        `• **Characteristics**: ${season.description}\n` +
        `• **AGNI Welfare Focus**: ${season.ngoFocus}`
      );
    }
  },
  {
    triggers: ["hello", "hi", "hey", "namaste", "good morning", "good afternoon", "good evening"],
    title: "Warm Greeting",
    response:
      "Namaste! Welcome to AGNI Rural Welfare Society.\n\n" +
      "I am your official assistant. You can ask me about:\n" +
      "• How to join as a **Cadet**, **Volunteer**, or **Member**\n" +
      "• **Membership Fees** (free enrollment)\n" +
      "• Our **Free Health Camps** and **Social Programs**\n" +
      "• **80G Tax-Deductible Donations**\n" +
      "• **ID Card Generation & QR Verification**"
  }
];

export function getClientNgoAnswer(queryText = "") {
  const q = String(queryText || "").toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!q) {
    return "Namaste! Welcome to AGNI Rural Welfare Society. How may I assist you today? Feel free to ask about our Cadet Corps, volunteering, membership registration, or free health camps.";
  }

  // Find best match in client knowledge
  let best = null;
  let highestScore = 0;

  for (const entry of CLIENT_KNOWLEDGE) {
    let score = 0;
    for (const t of entry.triggers) {
      if (q === t) score += 50;
      else if (q.includes(t)) score += t.length > 5 ? 25 : 15;
    }
    if (score > highestScore) {
      highestScore = score;
      best = entry;
    }
  }

  if (best && highestScore > 0) {
    return typeof best.dynamic === "function" ? best.dynamic() : best.response;
  }

  return (
    `Thank you for your inquiry about "${queryText}".\n\n` +
    "AGNI Rural Welfare Society is dedicated to rural community development, youth cadet discipline, free medical camps, women empowerment, and child education.\n\n" +
    "You can register online under **Register**, check our frontline social service under **Activities**, or contact our headquarters directly at +91 94331 23456."
  );
}
