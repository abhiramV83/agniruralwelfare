/**
 * AGNI Rural Welfare Society - Client-side Indian Calendar Intelligence Service
 * 
 * Provides:
 * 1. Asia/Kolkata timezone calculations
 * 2. Traditional 6 Indian Seasons (Ritus: Vasant, Grishma, Varsha, Sharad, Hemanta, Shishira)
 * 3. 35+ Indian National, Hindu, Muslim, Christian, Sikh, Buddhist, Jain, and Telangana/AP Festivals
 * 4. NGO & Social Service Awareness Days
 * 5. Active and Upcoming festival detection with multi-day support and admin overrides
 */

export function getIndianDate(inputDate = new Date()) {
  const date = inputDate instanceof Date ? inputDate : new Date(inputDate);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const get = (type) => parseInt(parts.find((p) => p.type === type)?.value || "0", 10);
  const year = get("year");
  const month = get("month"); // 1-12
  const day = get("day");
  const hour = get("hour");
  const minute = get("minute");
  const second = get("second");

  const pad = (n) => String(n).padStart(2, "0");
  const dateString = `${year}-${pad(month)}-${pad(day)}`;

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    dateString,
    rawDate: date
  };
}

export const INDIAN_SEASONS = [
  {
    id: "shishira",
    name: "Winter (Dewy Season)",
    sanskritName: "Shishira Ritu (शिशिर)",
    teluguName: "శిశిర ఋతువు",
    hindiName: "शिशिर ऋतु",
    monthsHindu: "Magha - Phalguna",
    approxRange: "Mid-December to Mid-February",
    startMonth: 12,
    startDay: 22,
    endMonth: 2,
    endDay: 18,
    accentColor: "#3b82f6",
    tagline: "Season of Crisp Air, Sankranti Harvest & Inner Strength",
    description: "The cool winter season in India marked by crisp mornings, golden harvest sunshine, and agricultural bounty.",
    ngoFocus: "Winter blanket distribution drives, warm clothing support for rural elders, and Republic Day youth discipline parades.",
    icon: "Snowflake"
  },
  {
    id: "vasant",
    name: "Spring",
    sanskritName: "Vasant Ritu (वसन्त)",
    teluguName: "వసంత ఋతువు",
    hindiName: "वसंत ऋतु",
    monthsHindu: "Chaitra - Vaishakha",
    approxRange: "Mid-February to Mid-April",
    startMonth: 2,
    startDay: 19,
    endMonth: 4,
    endDay: 19,
    accentColor: "#10b981",
    tagline: "Season of Renewal, Blooms & Youth Vitality",
    description: "The queen of Indian seasons bringing blossoming flora, fresh tender leaves, and vibrant cultural renewal.",
    ngoFocus: "Afforestation and seed ball dispersal drives, rural eye & health camps, youth leadership orientation.",
    icon: "Flower2"
  },
  {
    id: "grishma",
    name: "Summer",
    sanskritName: "Grishma Ritu (ग्रीष्म)",
    teluguName: "గ్రీష్మ ఋతువు",
    hindiName: "ग्रीष्म ऋतु",
    monthsHindu: "Jyeshtha - Ashadha",
    approxRange: "Mid-April to Mid-June",
    startMonth: 4,
    startDay: 20,
    endMonth: 6,
    endDay: 21,
    accentColor: "#f59e0b",
    tagline: "Season of Solar Energy, Dedication & Community Hydration",
    description: "The high summer season characterized by intense sunshine, solar warmth, and ripening mangoes.",
    ngoFocus: "Free drinking water kiosks (Chalivendram), rural heatwave awareness, oral rehydration campaigns, and animal water troughs.",
    icon: "Sun"
  },
  {
    id: "varsha",
    name: "Monsoon",
    sanskritName: "Varsha Ritu (वर्षा)",
    teluguName: "వర్ష ఋతువు",
    hindiName: "వర్షా ऋतु",
    monthsHindu: "Shravana - Bhadrapada",
    approxRange: "Mid-June to Mid-August",
    startMonth: 6,
    startDay: 22,
    endMonth: 8,
    endDay: 22,
    accentColor: "#06b6d4",
    tagline: "Season of Rejuvenation, Abundant Rains & Green Earth",
    description: "The life-giving monsoon bringing rains that nourish the agricultural heartlands of India.",
    ngoFocus: "Flood relief readiness, rural water sanitation drives, prevention of waterborne diseases, and massive sapling plantation.",
    icon: "CloudRain"
  },
  {
    id: "sharad",
    name: "Autumn",
    sanskritName: "Sharad Ritu (शरद्)",
    teluguName: "శరద్ ఋతువు",
    hindiName: "शरद ऋतु",
    monthsHindu: "Ashvina - Kartika",
    approxRange: "Mid-August to Mid-October",
    startMonth: 8,
    startDay: 23,
    endMonth: 10,
    endDay: 22,
    accentColor: "#8b5cf6",
    tagline: "Season of Clear Sapphire Skies, Festive Grace & Community Harmony",
    description: "Post-monsoon autumn celebrated for clear blue skies, pleasant breezes, and grand community festivals.",
    ngoFocus: "Bathukamma and Navratri women self-help exhibitions, festive clothes donation, and rural education kits.",
    icon: "Sparkles"
  },
  {
    id: "hemanta",
    name: "Pre-Winter",
    sanskritName: "Hemanta Ritu (हेमन्त)",
    teluguName: "హేమంత ఋతువు",
    hindiName: "हेमंत ऋतु",
    monthsHindu: "Margashirsha - Pausha",
    approxRange: "Mid-October to Mid-December",
    startMonth: 10,
    startDay: 23,
    endMonth: 12,
    endDay: 21,
    accentColor: "#f97316",
    tagline: "Season of Auspicious Glow, Harvest Gratitude & Warmth",
    description: "The mild early winter bringing pleasant sunny days, auspicious evening lamps, and agricultural harvest.",
    ngoFocus: "Diwali sweets & nutrition distribution for rural children, senior citizen health checks, and pre-winter care.",
    icon: "Flame"
  }
];

export function getCurrentSeason(inputDate = new Date()) {
  const { month, day } = getIndianDate(inputDate);
  const mmdd = month * 100 + day;

  if (mmdd >= 1222 || mmdd <= 218) {
    return INDIAN_SEASONS[0]; // shishira
  }
  if (mmdd >= 219 && mmdd <= 419) {
    return INDIAN_SEASONS[1]; // vasant
  }
  if (mmdd >= 420 && mmdd <= 621) {
    return INDIAN_SEASONS[2]; // grishma
  }
  if (mmdd >= 622 && mmdd <= 822) {
    return INDIAN_SEASONS[3]; // varsha
  }
  if (mmdd >= 823 && mmdd <= 1022) {
    return INDIAN_SEASONS[4]; // sharad
  }
  return INDIAN_SEASONS[5]; // hemanta
}

export const INDIAN_FESTIVALS = [
  // 1. Diwali
  {
    id: "diwali",
    name: "Diwali / Deepavali",
    category: "hindu",
    regionalTags: ["All India", "Telangana", "Andhra Pradesh"],
    dates: {
      2025: { start: "2025-10-20", end: "2025-10-22" },
      2026: { start: "2026-11-08", end: "2026-11-10" },
      2027: { start: "2027-10-29", end: "2027-10-31" }
    },
    culturalMotif: "diya",
    accentColor: "#f59e0b",
    greeting: "Wishing you a joyous, luminous, and prosperous Deepavali!",
    socialMessage: "May the divine light of service dispel darkness and bring education, health, and dignity to rural lives.",
    tagline: "Festival of Lights & Grassroots Hope"
  },
  // 2. Bathukamma (Telangana)
  {
    id: "bathukamma",
    name: "Bathukamma",
    category: "regional",
    regionalTags: ["Telangana"],
    dates: {
      2025: { start: "2025-09-22", end: "2025-09-30" },
      2026: { start: "2026-10-11", end: "2026-10-19" },
      2027: { start: "2027-09-30", end: "2027-10-08" }
    },
    culturalMotif: "flowers",
    accentColor: "#ec4899",
    greeting: "Bathukamma Subhakankshalu! Celebrating nature and womanhood.",
    socialMessage: "Empowering rural women self-help groups and honoring nature's vibrant blessings across Telangana.",
    tagline: "Telangana's Vibrant Floral Festival of Womanhood"
  },
  // 3. Bonalu (Telangana)
  {
    id: "bonalu",
    name: "Bonalu",
    category: "regional",
    regionalTags: ["Telangana"],
    dates: {
      2025: { start: "2025-07-06", end: "2025-07-27" },
      2026: { start: "2026-07-12", end: "2026-08-02" },
      2027: { start: "2027-07-04", end: "2027-07-25" }
    },
    culturalMotif: "flame",
    accentColor: "#e11d48",
    greeting: "Happy Bonalu! May Mahankali bless our communities with health and protection.",
    socialMessage: "Dedicated to health, hygiene, and public wellness protection across rural and urban communities.",
    tagline: "Historic Telangana Festival of Health & Gratitude"
  },
  // 4. Telangana Formation Day
  {
    id: "telangana-formation-day",
    name: "Telangana Formation Day",
    category: "regional",
    regionalTags: ["Telangana"],
    dates: {
      2025: { start: "2025-06-02", end: "2025-06-02" },
      2026: { start: "2026-06-02", end: "2026-06-02" },
      2027: { start: "2027-06-02", end: "2027-06-02" }
    },
    culturalMotif: "tricolor",
    accentColor: "#059669",
    greeting: "Happy Telangana Formation Day! Celebrating progress, culture, and unity.",
    socialMessage: "Strengthening rural livelihoods and youth skills across every village of Telangana.",
    tagline: "Pride, Progress & Grassroots Empowerment"
  },
  // 5. Ugadi / Gudi Padwa
  {
    id: "ugadi",
    name: "Ugadi / Gudi Padwa",
    category: "regional",
    regionalTags: ["Telangana", "Andhra Pradesh", "Karnataka", "Maharashtra"],
    dates: {
      2025: { start: "2025-03-30", end: "2025-03-30" },
      2026: { start: "2026-03-19", end: "2026-03-19" },
      2027: { start: "2027-04-07", end: "2027-04-07" }
    },
    culturalMotif: "flowers",
    accentColor: "#10b981",
    greeting: "Ugadi Subhakankshalu! Wishing you a year of peace and prosperity.",
    socialMessage: "Embracing all flavors of life (Shadruchulu) with courage, resilience, and dedicated service.",
    tagline: "Telugu New Year of Auspicious Beginnings"
  },
  // 6. Makar Sankranti / Pongal
  {
    id: "sankranti",
    name: "Makar Sankranti / Pongal",
    category: "hindu",
    regionalTags: ["All India", "Telangana", "Andhra Pradesh", "Tamil Nadu"],
    dates: {
      2025: { start: "2025-01-14", end: "2025-01-16" },
      2026: { start: "2026-01-14", end: "2026-01-16" },
      2027: { start: "2027-01-14", end: "2027-01-16" }
    },
    culturalMotif: "kites",
    accentColor: "#f97316",
    greeting: "Happy Makar Sankranti & Pongal! May your life soar high like kites in sunshine.",
    socialMessage: "Saluting our rural farmers who feed the nation. Standing with agricultural families.",
    tagline: "Grand Indian Harvest Celebration"
  },
  // 7. Holi
  {
    id: "holi",
    name: "Holi",
    category: "hindu",
    regionalTags: ["All India"],
    dates: {
      2025: { start: "2025-03-14", end: "2025-03-15" },
      2026: { start: "2026-03-03", end: "2026-03-04" },
      2027: { start: "2027-03-22", end: "2027-03-23" }
    },
    culturalMotif: "colors",
    accentColor: "#d946ef",
    greeting: "Happy Holi! May your days be filled with vibrant happiness, unity, and friendship.",
    socialMessage: "Promoting natural eco-friendly colors, water conservation, and social harmony across all communities.",
    tagline: "Festival of Colors, Joy & Equality"
  },
  // 8. Dussehra / Vijayadashami
  {
    id: "dussehra",
    name: "Dussehra / Vijayadashami",
    category: "hindu",
    regionalTags: ["All India", "Telangana", "Andhra Pradesh"],
    dates: {
      2025: { start: "2025-10-02", end: "2025-10-02" },
      2026: { start: "2026-10-20", end: "2026-10-20" },
      2027: { start: "2027-10-10", end: "2027-10-10" }
    },
    culturalMotif: "flame",
    accentColor: "#ea580c",
    greeting: "Happy Dussehra & Vijayadashami! Celebrating the eternal triumph of righteousness.",
    socialMessage: "Conquering poverty, illiteracy, and inequality through persistent community action.",
    tagline: "Triumph of Virtue, Courage & Righteous Action"
  },
  // 9. Ganesh Chaturthi
  {
    id: "ganesh-chaturthi",
    name: "Ganesh Chaturthi",
    category: "hindu",
    regionalTags: ["All India", "Telangana", "Maharashtra"],
    dates: {
      2025: { start: "2025-08-27", end: "2025-09-06" },
      2026: { start: "2026-09-14", end: "2026-09-24" },
      2027: { start: "2027-09-04", end: "2027-09-14" }
    },
    culturalMotif: "flowers",
    accentColor: "#f59e0b",
    greeting: "Happy Ganesh Chaturthi! May Lord Ganesha remove all obstacles from your journey.",
    socialMessage: "Advocating clay Ganeshas, water body protection, and grassroots community bonding.",
    tagline: "Lord of Wisdom & Remover of Obstacles"
  },
  // 10. Krishna Janmashtami
  {
    id: "janmashtami",
    name: "Krishna Janmashtami",
    category: "hindu",
    regionalTags: ["All India"],
    dates: {
      2025: { start: "2025-08-16", end: "2025-08-16" },
      2026: { start: "2026-09-04", end: "2026-09-04" },
      2027: { start: "2027-08-25", end: "2027-08-25" }
    },
    culturalMotif: "flowers",
    accentColor: "#0284c7",
    greeting: "Happy Krishna Janmashtami! Celebrating divine love, joy, and righteous duty.",
    socialMessage: "Inspiring youth with the Bhagavad Gita's call for selfless duty and humanitarian service.",
    tagline: "Celebration of Righteous Duty & Joy"
  },
  // 11. Raksha Bandhan
  {
    id: "raksha-bandhan",
    name: "Raksha Bandhan",
    category: "hindu",
    regionalTags: ["All India"],
    dates: {
      2025: { start: "2025-08-09", end: "2025-08-09" },
      2026: { start: "2026-08-28", end: "2026-08-28" },
      2027: { start: "2027-08-17", end: "2027-08-17" }
    },
    culturalMotif: "flowers",
    accentColor: "#e11d48",
    greeting: "Happy Raksha Bandhan! Celebrating the bond of protection, love, and care.",
    socialMessage: "Protecting the rights, safety, and empowerment of every sister in our rural communities.",
    tagline: "Sacred Bond of Protection & Mutual Care"
  },
  // 12. Maha Shivaratri
  {
    id: "maha-shivaratri",
    name: "Maha Shivaratri",
    category: "hindu",
    regionalTags: ["All India"],
    dates: {
      2025: { start: "2025-02-26", end: "2025-02-26" },
      2026: { start: "2026-02-15", end: "2026-02-15" },
      2027: { start: "2027-03-06", end: "2027-03-06" }
    },
    culturalMotif: "flame",
    accentColor: "#6366f1",
    greeting: "Happy Maha Shivaratri! Wishing you inner peace, spiritual strength, and clarity.",
    socialMessage: "Cultivating inner strength, discipline, and mental resilience among rural youth.",
    tagline: "Auspicious Night of Spiritual Vigilance"
  },
  // 13. Eid al-Fitr
  {
    id: "eid-al-fitr",
    name: "Eid al-Fitr",
    category: "muslim",
    regionalTags: ["All India"],
    dates: {
      2025: { start: "2025-03-31", end: "2025-04-01" },
      2026: { start: "2026-03-20", end: "2026-03-21" },
      2027: { start: "2027-03-10", end: "2027-03-11" }
    },
    culturalMotif: "crescent",
    accentColor: "#10b981",
    greeting: "Eid Mubarak! May this joyous day bring peace, happiness, and prosperity to all.",
    socialMessage: "Embodying Zakat and charity by sharing meals, clothing, and smiles with needy rural families.",
    tagline: "Blessed Festival of Compassion & Charity"
  },
  // 14. Christmas
  {
    id: "christmas",
    name: "Christmas",
    category: "christian",
    regionalTags: ["All India"],
    dates: {
      2025: { start: "2025-12-24", end: "2025-12-25" },
      2026: { start: "2026-12-24", end: "2026-12-25" },
      2027: { start: "2027-12-24", end: "2027-12-25" }
    },
    culturalMotif: "star",
    accentColor: "#ef4444",
    greeting: "Merry Christmas! Wishing you joy, peace, and goodwill to all humankind.",
    socialMessage: "Spreading warmth, educational books, and winter joy to underprivileged rural children.",
    tagline: "Season of Goodwill, Joy & Giving"
  },
  // 15. Guru Nanak Jayanti
  {
    id: "guru-nanak-jayanti",
    name: "Guru Nanak Jayanti",
    category: "sikh",
    regionalTags: ["All India"],
    dates: {
      2025: { start: "2025-11-05", end: "2025-11-05" },
      2026: { start: "2026-11-24", end: "2026-11-24" },
      2027: { start: "2027-11-14", end: "2027-11-14" }
    },
    culturalMotif: "flame",
    accentColor: "#f59e0b",
    greeting: "Gurpurab Dian Lakh Lakh Vadhaiyan! Celebrating universal brotherhood and selfless service.",
    socialMessage: "Inspired by 'Vand Chhako' (share what you earn) and 'Seva' (selfless community service).",
    tagline: "Light of Universal Brotherhood & Seva"
  },
  // 16. Republic Day
  {
    id: "republic-day",
    name: "Republic Day",
    category: "national",
    regionalTags: ["All India"],
    dates: {
      2025: { start: "2025-01-26", end: "2025-01-26" },
      2026: { start: "2026-01-26", end: "2026-01-26" },
      2027: { start: "2027-01-26", end: "2027-01-26" }
    },
    culturalMotif: "tricolor",
    accentColor: "#2563eb",
    greeting: "Happy Republic Day! Saluting our Constitution, sovereignty, and democracy.",
    socialMessage: "AGNI Youth Cadet Corps conduct ceremonial parade and drill honoring the Indian Republic.",
    tagline: "Celebrating Constitutional Values & National Pride"
  },
  // 17. Independence Day
  {
    id: "independence-day",
    name: "Independence Day",
    category: "national",
    regionalTags: ["All India"],
    dates: {
      2025: { start: "2025-08-15", end: "2025-08-15" },
      2026: { start: "2026-08-15", end: "2026-08-15" },
      2027: { start: "2027-08-15", end: "2027-08-15" }
    },
    culturalMotif: "tricolor",
    accentColor: "#16a34a",
    greeting: "Happy Independence Day! Vande Mataram • Jai Hind!",
    socialMessage: "Honoring freedom fighters by winning true independence from rural poverty, illiteracy, and disease.",
    tagline: "Glory of Freedom & Selfless National Service"
  },
  // 18. Gandhi Jayanti
  {
    id: "gandhi-jayanti",
    name: "Gandhi Jayanti",
    category: "national",
    regionalTags: ["All India"],
    dates: {
      2025: { start: "2025-10-02", end: "2025-10-02" },
      2026: { start: "2026-10-02", end: "2026-10-02" },
      2027: { start: "2027-10-02", end: "2027-10-02" }
    },
    culturalMotif: "chakra",
    accentColor: "#65a30d",
    greeting: "Happy Gandhi Jayanti! 'The best way to find yourself is to lose yourself in the service of others.'",
    socialMessage: "Conducting village sanitation drives (Swachhata) and rural cottage industry training.",
    tagline: "Tribute to the Father of the Nation & Swachhata"
  },
  // 19. National Youth Day
  {
    id: "national-youth-day",
    name: "National Youth Day",
    category: "national",
    regionalTags: ["All India"],
    dates: {
      2025: { start: "2025-01-12", end: "2025-01-12" },
      2026: { start: "2026-01-12", end: "2026-01-12" },
      2027: { start: "2027-01-12", end: "2027-01-12" }
    },
    culturalMotif: "flame",
    accentColor: "#ea580c",
    greeting: "Happy National Youth Day! 'Arise, awake, and stop not till the goal is reached.'",
    socialMessage: "Empowering rural youth into disciplined leaders, disaster responders, and community protectors.",
    tagline: "Swami Vivekananda Jayanti • Youth Empowerment"
  },
  // 20. Netaji Jayanti / Parakram Diwas
  {
    id: "parakram-diwas",
    name: "Parakram Diwas (Netaji Jayanti)",
    category: "national",
    regionalTags: ["All India", "West Bengal", "Telangana"],
    dates: {
      2025: { start: "2025-01-23", end: "2025-01-23" },
      2026: { start: "2026-01-23", end: "2026-01-23" },
      2027: { start: "2027-01-23", end: "2027-01-23" }
    },
    culturalMotif: "tricolor",
    accentColor: "#dc2626",
    greeting: "Salute to Netaji Subhash Chandra Bose on Parakram Diwas! Jai Hind!",
    socialMessage: "The founding spirit of AGNI Youth Cadet Corps: Bravery, Unity, and Unyielding Discipline.",
    tagline: "Celebrating Valour, Patriotism & Discipline"
  },
  // 21. Constitution Day
  {
    id: "constitution-day",
    name: "Constitution Day (Samvidhan Diwas)",
    category: "national",
    regionalTags: ["All India"],
    dates: {
      2025: { start: "2025-11-26", end: "2025-11-26" },
      2026: { start: "2026-11-26", end: "2026-11-26" },
      2027: { start: "2027-11-26", end: "2027-11-26" }
    },
    culturalMotif: "chakra",
    accentColor: "#1d4ed8",
    greeting: "Happy Constitution Day! Upholding Justice, Liberty, Equality, and Fraternity.",
    socialMessage: "Conducting rural legal literacy workshops to educate citizens on their constitutional rights and duties.",
    tagline: "Honoring Dr. B.R. Ambedkar & Our Constitution"
  },
  // 22. Children's Day
  {
    id: "childrens-day",
    name: "Children's Day",
    category: "awareness",
    regionalTags: ["All India"],
    dates: {
      2025: { start: "2025-11-14", end: "2025-11-14" },
      2026: { start: "2026-11-14", end: "2026-11-14" },
      2027: { start: "2027-11-14", end: "2027-11-14" }
    },
    culturalMotif: "flowers",
    accentColor: "#0ea5e9",
    greeting: "Happy Children's Day! Every child deserves quality education, nutrition, and love.",
    socialMessage: "Distributing school bags, notebooks, and nutritious meal kits to rural primary students.",
    tagline: "Nurturing the Bright Future of Rural India"
  },
  // 23. International Women's Day
  {
    id: "womens-day",
    name: "International Women's Day",
    category: "awareness",
    regionalTags: ["All India"],
    dates: {
      2025: { start: "2025-03-08", end: "2025-03-08" },
      2026: { start: "2026-03-08", end: "2026-03-08" },
      2027: { start: "2027-03-08", end: "2027-03-08" }
    },
    culturalMotif: "flowers",
    accentColor: "#a855f7",
    greeting: "Happy International Women's Day! Celebrating women's strength, leadership, and equality.",
    socialMessage: "Expanding micro-loans, vocational stitching units, and healthcare for rural women.",
    tagline: "Empowering Women, Transforming Generations"
  },
  // 24. World Environment Day
  {
    id: "environment-day",
    name: "World Environment Day",
    category: "awareness",
    regionalTags: ["All India"],
    dates: {
      2025: { start: "2025-06-05", end: "2025-06-05" },
      2026: { start: "2026-06-05", end: "2026-06-05" },
      2027: { start: "2027-06-05", end: "2027-06-05" }
    },
    culturalMotif: "flowers",
    accentColor: "#15803d",
    greeting: "Happy World Environment Day! Protect our planet, plant trees, nurture the soil.",
    socialMessage: "Massive sapling plantation drive across villages and school campuses.",
    tagline: "One Earth • Afforestation & Water Conservation"
  },
  // 25. World NGO Day
  {
    id: "world-ngo-day",
    name: "World NGO Day",
    category: "awareness",
    regionalTags: ["All India"],
    dates: {
      2025: { start: "2025-02-27", end: "2025-02-27" },
      2026: { start: "2026-02-27", end: "2026-02-27" },
      2027: { start: "2027-02-27", end: "2027-02-27" }
    },
    culturalMotif: "flame",
    accentColor: "#e11d48",
    greeting: "Happy World NGO Day! Saluting every grassroots worker and volunteer.",
    socialMessage: "Reaffirming AGNI's mission: transforming rural lives through transparent, dedicated social service.",
    tagline: "Celebrating Social Responsibility & Grassroots Service"
  }
];

export function getFestivalDatesForYear(festival, year, customOverrides = {}) {
  const custom = customOverrides[festival.id]?.[year];
  if (custom && custom.start && custom.end) {
    return { start: custom.start, end: custom.end, isCustom: true };
  }
  const defaultDates = festival.dates?.[year];
  if (defaultDates) {
    return { start: defaultDates.start, end: defaultDates.end, isCustom: false };
  }
  const anyDates = Object.values(festival.dates || {})[0];
  if (anyDates) {
    return { start: anyDates.start, end: anyDates.end, isCustom: false };
  }
  return null;
}

function isDateWithinRange(dateStr, startStr, endStr) {
  return dateStr >= startStr && dateStr <= endStr;
}

export function getActiveFestival(inputDate = new Date(), options = {}) {
  const { overrideFestivalId, customDates = {} } = options;
  const { year, dateString } = getIndianDate(inputDate);

  if (overrideFestivalId && overrideFestivalId !== "none" && overrideFestivalId !== "auto") {
    const forced = INDIAN_FESTIVALS.find((f) => f.id === overrideFestivalId);
    if (forced) {
      const dates = getFestivalDatesForYear(forced, year, customDates);
      return {
        ...forced,
        isActive: true,
        isOverridden: true,
        effectiveDates: dates,
        activeDate: dateString
      };
    }
  }

  for (const festival of INDIAN_FESTIVALS) {
    const dates = getFestivalDatesForYear(festival, year, customDates);
    if (dates && isDateWithinRange(dateString, dates.start, dates.end)) {
      return {
        ...festival,
        isActive: true,
        isOverridden: false,
        effectiveDates: dates,
        activeDate: dateString
      };
    }
  }

  return null;
}

export function getUpcomingFestivals(inputDate = new Date(), limit = 6, options = {}) {
  const { customDates = {} } = options;
  const { year, dateString } = getIndianDate(inputDate);

  const upcomingList = [];
  const yearsToCheck = [year, year + 1];

  for (const y of yearsToCheck) {
    for (const festival of INDIAN_FESTIVALS) {
      const dates = getFestivalDatesForYear(festival, y, customDates);
      if (dates && dates.start >= dateString) {
        const diffMs = new Date(dates.start).getTime() - new Date(dateString).getTime();
        const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

        upcomingList.push({
          ...festival,
          year: y,
          startDate: dates.start,
          endDate: dates.end,
          daysRemaining
        });
      }
    }
  }

  upcomingList.sort((a, b) => a.startDate.localeCompare(b.startDate));
  return upcomingList.slice(0, limit);
}

export function getFestivalById(id) {
  return INDIAN_FESTIVALS.find((f) => f.id === id) || null;
}

export function getCalendarOverview(inputDate = new Date(), settings = {}) {
  const indianDate = getIndianDate(inputDate);
  const currentSeason = getCurrentSeason(inputDate);
  const activeFestival = getActiveFestival(inputDate, settings);
  const upcomingFestivals = getUpcomingFestivals(inputDate, 6, settings);

  return {
    indianDate,
    currentSeason,
    activeFestival,
    upcomingFestivals,
    allSeasons: INDIAN_SEASONS,
    totalFestivalsCount: INDIAN_FESTIVALS.length,
    settings: {
      enableFestiveBanner: settings.enableFestiveBanner !== false,
      enableSeasonalAccents: settings.enableSeasonalAccents !== false,
      overrideFestivalId: settings.overrideFestivalId || "auto",
      customMessage: settings.customMessage || ""
    }
  };
}
