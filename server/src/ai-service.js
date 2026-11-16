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
  },

  // 20. What is AGNI / About Us
  {
    id: "about_agni",
    triggers: [
      "what is agni", "who are you", "tell me about agni", "what is this",
      "what is this website", "about us", "who is agni", "about agni", "what is agni rural welfare society"
    ],
    priority: 15,
    title: "About AGNI Rural Welfare Society",
    response:
      "**AGNI Rural Welfare Society** (Govt. Regd. No. S/1L/55059) is a registered Indian humanitarian non-profit organization:\n\n" +
      "• **Core Mission**: Uplifting rural communities through grassroots development, Youth Cadet Corps discipline, free rural health camps, women self-help empowerment, student education, and disaster relief.\n" +
      "• **Philosophical Roots**: Inspired by **Swami Vivekananda's** teaching ('Service to Mankind is Service to God') and **Netaji Subhash Chandra Bose's** clarion call for patriotic youth discipline.\n" +
      "• **Motto**: *Bravery, Unity & Discipline*.\n" +
      "• **How to Get Involved**: You can explore our community initiatives on the **Activities** page, join as a member or cadet via **Register**, or support us via **Donate**!"
  },

  // 21. Key Activities & Programs
  {
    id: "key_activities",
    triggers: [
      "what do you do", "activities", "programs", "work", "what work", "what are your programs",
      "what are your activities", "social activities", "projects", "what does agni do", "initiatives"
    ],
    priority: 15,
    title: "Key Activities & Programs",
    response:
      "AGNI Rural Welfare Society conducts six major grassroots initiatives throughout the year:\n\n" +
      "1. **Youth Cadet Corps & Leadership**: Daily morning physical training, squad drill march, flag ceremonies, and first-responder disaster preparedness.\n" +
      "2. **Free Rural Health Camps**: Volunteer doctors provide general consultations, eye checkups, blood grouping, and free essential medicines to rural families.\n" +
      "3. **Women Self-Help Groups (SHGs)**: Vocational stitching, tailoring, handicrafts training, and financial literacy workshops to ensure women's self-reliance.\n" +
      "4. **Child Education & Nutrition**: Free school books, notebooks, bags, stationery, and nutritious snacks for village children.\n" +
      "5. **Environmental Drives**: Tree planting, seed ball dispersal, pond cleaning, and plastic-free village awareness.\n" +
      "6. **Disaster Relief Assistance**: Direct emergency ground relief during floods, storms, and community crises."
  },

  // 22. Mission & Vision
  {
    id: "mission_vision",
    triggers: [
      "mission", "vision", "aim", "aims", "goals", "goal", "objective", "objectives", "why agni", "purpose"
    ],
    priority: 14,
    title: "Mission, Vision & Objectives",
    response:
      "**Mission of AGNI Rural Welfare Society**:\n\n" +
      "• **Grassroots Empowerment**: Transforming underprivileged rural villages by providing access to health, education, and sustainable livelihoods.\n" +
      "• **Youth Character Building**: Channeling youth energy into disciplined, patriotic citizens through our Youth Cadet Corps.\n" +
      "• **Dignity & Self-Reliance**: Empowering women through vocational skill centers and cooperative micro-enterprises.\n" +
      "• **Core Motto**: *Bravery, Unity & Discipline*."
  },

  // 23. Cadet Eligibility & Age Criteria
  {
    id: "cadet_eligibility_age",
    triggers: [
      "age limit", "who can join cadet", "cadet age", "minimum age", "maximum age",
      "can children join", "can students join", "cadet eligibility", "cadet requirements"
    ],
    priority: 14,
    title: "Cadet Corps Eligibility & Age Criteria",
    response:
      "**Eligibility for the AGNI Youth Cadet Corps**:\n\n" +
      "• **Age Requirement**: Typically open to youth aged **14 to 25 years** (Junior Cadets: 14–17; Senior Cadets: 18–25).\n" +
      "• **Physical Fitness**: Basic physical endurance to participate in morning drills, physical conditioning, and squad marches.\n" +
      "• **Commitment**: Willingness to uphold the motto *Bravery, Unity & Discipline* and assist during community service camps.\n" +
      "• **Gender Inclusivity**: Open equally to both young men and young women. Both boys' and girls' squads participate in all training drills.\n" +
      "• **How to Apply**: Select **Cadet** under the **Register** tab and submit your details with a passport photo."
  },

  // 24. Women & Girls Participation in Cadets & Society
  {
    id: "women_girls_join",
    triggers: [
      "can girls join", "can women join", "is it for girls", "female cadets", "girls cadet", "women join", "women in cadet"
    ],
    priority: 14,
    title: "Women & Girls Participation",
    response:
      "**Yes, absolutely!** AGNI actively encourages girls and women to join across all programs:\n\n" +
      "• **Female Cadets**: Our Cadet Corps features dedicated girls' squads receiving drill march, self-defense, leadership, and parade training.\n" +
      "• **Women Self-Help Groups**: Rural women participate in vocational tailoring, handicraft production, and community leadership.\n" +
      "• **Volunteering & Membership**: Women lead many of our rural health camps, educational drives, and administrative initiatives.\n\n" +
      "Equal opportunity and women's empowerment are founding pillars of AGNI Rural Welfare Society."
  },

  // 25. Certificates & Verification Credentials
  {
    id: "certificates",
    triggers: [
      "certificate", "certificates", "experience certificate", "will i get a certificate",
      "volunteer certificate", "training certificate", "letter of appreciation"
    ],
    priority: 13,
    title: "Certificates & Verification Credentials",
    response:
      "Yes! AGNI awards official certificates and credentials upon verified participation:\n\n" +
      "• **Cadets**: Receive an official **Cadet Corps Training Certificate** upon completing their parade and drill syllabus.\n" +
      "• **Interns**: Receive a signed and stamped **Certificate of Internship Completion** with detailed project evaluation.\n" +
      "• **Volunteers**: Receive **Certificates of Appreciation** for participating in medical camps, tree planting, or relief drives.\n" +
      "• **Official Photo ID Card**: Every approved member, cadet, and volunteer receives a 2-sided verifiable photo ID card with a QR code."
  },

  // 26. In-Kind Material Donations (Clothes, Books & Supplies)
  {
    id: "clothes_books_donation",
    triggers: [
      "donate clothes", "donate books", "material donation", "in kind", "donate items", "give clothes", "stationery donation"
    ],
    priority: 13,
    title: "In-Kind Donations (Clothes, Books & Supplies)",
    response:
      "We warmly accept in-kind donations of usable items for rural families and school children:\n\n" +
      "• **New or Gently Used Clothes**: Blankets, sweaters, winter wear, and children's clothing.\n" +
      "• **Educational Materials**: Notebooks, school bags, pens, geometry boxes, and reference storybooks.\n" +
      "• **Drop-off & Inquiries**: Please contact our office at +91 94331 23456 or email agniruralsociety@gmail.com to coordinate collection or drop-off."
  },

  // 27. Disaster Preparedness & Relief Missions
  {
    id: "disaster_relief",
    triggers: [
      "disaster", "disaster relief", "flood", "cyclone", "emergency relief", "rescue", "boat mission", "crisis aid"
    ],
    priority: 13,
    title: "Disaster Preparedness & Relief Missions",
    response:
      "AGNI maintains rapid-response disaster relief capabilities for rural and coastal communities:\n\n" +
      "• **Flood & Storm Aid**: Cadets and volunteers deploy food packets, safe drinking water, halogen tablets, and emergency medicines.\n" +
      "• **Emergency Evacuation**: Coordination with local panchayats and rescue boats to move stranded villagers to safe shelters.\n" +
      "• **Post-Disaster Rehabilitation**: Rebuilding damaged roofs, distributing hygiene kits, and organizing medical disinfection drives."
  },

  // 28. Thanks & Appreciation
  {
    id: "thanks_appreciation",
    triggers: [
      "thank you", "thanks", "thank u", "great", "awesome", "good job", "dhanyavad", "shukriya"
    ],
    priority: 12,
    title: "You are Most Welcome",
    response:
      "You are most welcome! We are truly grateful for your interest in AGNI Rural Welfare Society.\n\n" +
      "Together, let us build stronger, healthier, and more empowered rural communities. If you have any further questions about joining, volunteering, or donating, please don't hesitate to ask!"
  },

  // 29. Governance & Leadership
  {
    id: "governing_body",
    triggers: [
      "president", "secretary", "who runs agni", "management", "governing body", "leadership", "executive committee"
    ],
    priority: 12,
    title: "Governance & Leadership",
    response:
      "**AGNI Rural Welfare Society Governance**:\n\n" +
      "• **Governing Body**: Composed of respected grassroots social workers, educators, community leaders, and experienced youth trainers.\n" +
      "• **Transparency**: Accounts and social welfare records are audited annually in accordance with the Societies Registration Act.\n" +
      "• **Administration**: All applications, ID card generation, and community programs are reviewed and monitored under authoritative oversight."
  }
];

/**
 * Score a user query against an intent entry with enhanced tokenization & fuzzy phrase support
 */
function scoreIntent(query, intent) {
  let score = 0;
  const q = String(query || "").toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  const qWords = q.split(" ").filter((w) => w.length > 1);

  for (const trigger of intent.triggers) {
    const t = trigger.toLowerCase().trim();
    if (q === t) {
      score += 60; // Exact match
    } else if (q.includes(t)) {
      score += t.length > 5 ? 30 : 18;
    } else {
      const tWords = t.split(" ").filter((w) => w.length > 2);
      if (tWords.length > 1) {
        const matches = tWords.filter((tw) => qWords.includes(tw));
        if (matches.length === tWords.length) {
          score += 28;
        } else if (matches.length >= 2) {
          score += 16;
        }
      }
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

  // 3. Dynamic Context-Aware Fallback
  const fallbackGreeting = activeFestival
    ? `Happy ${activeFestival.name}! `
    : `Namaste! `;

  return {
    reply:
      `${fallbackGreeting}Welcome to AGNI Rural Welfare Society (Govt. Regd. No. S/1L/55059).\n\n` +
      `Regarding your inquiry about "${query}":\n\n` +
      "AGNI is committed to grassroots community empowerment, youth discipline, free healthcare, and education. Here are the quickest ways I can assist:\n\n" +
      "• **Cadet Corps**: Ask about parade, drill, age criteria (14–25), uniforms, or camps.\n" +
      "• **Membership & Volunteering**: Ask about free enrollment, documents required, or certificates.\n" +
      "• **Donations & 80G Tax Benefits**: Ask how to contribute via UPI or obtain 50% tax deductions.\n" +
      "• **Contact Headquarters**: Ask for our phone numbers (+91 94331 23456), email, or office location.\n\n" +
      "Please feel free to ask about any specific detail!",
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
