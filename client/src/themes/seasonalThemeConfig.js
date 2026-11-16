/**
 * AGNI Rural Welfare Society - 6 Traditional Indian Seasons (Ritus) Theme Configuration
 * 
 * Includes:
 * 1. Vasanta (Spring) - Blooming flowers, fresh botanical green, pastel pinks, floating flower petals
 * 2. Grishma (Summer) - Warm sunshine, solar gold, sky-blue accents, airy refreshing backgrounds
 * 3. Varsha (Monsoon) - Soft rain backgrounds, lush greenery, gentle rain drops, slate teal
 * 4. Sharad (Autumn) - Warm golden harvest, elegant orange accents, drifting golden leaves
 * 5. Hemanta (Pre-Winter) - Earthy copper, morning mist, warm neutrals, cozy comforting atmosphere
 * 6. Shishira (Winter) - Crisp winter azure, subtle falling snow, frosted decorative accents
 */

export const INDIAN_SEASONAL_THEMES = [
  {
    id: "vasanta",
    name: "Spring",
    sanskritName: "Vasanta Ritu (वसन्त)",
    teluguName: "వసంత ఋతువు",
    hindiName: "वसंत ऋतु",
    monthsHindu: "Chaitra - Vaishakha",
    approxRange: "Mid-February to Mid-April",
    icon: "Flower2",
    tagline: "Season of Renewal, Blooms & Youth Vitality",
    description: "The queen of Indian seasons bringing blossoming flora, fresh tender leaves, and vibrant cultural renewal across rural communities.",
    socialFocus: "Afforestation, seed ball dispersal drives, rural eye & health camps, youth leadership orientation.",
    effect: "petals", // Gentle floating floral petals
    colors: {
      primary: "#10b981",
      accent: "#f472b6",
      secondary: "#059669",
      glow: "rgba(16, 185, 129, 0.28)",
      heroGradient: "linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(244, 114, 182, 0.14) 100%)",
      badgeBg: "rgba(16, 185, 129, 0.12)",
      badgeBorder: "rgba(16, 185, 129, 0.35)",
      badgeText: "#059669",
      headerRibbon: "linear-gradient(90deg, #10b981, #f472b6, #059669)",
      cardBorder: "rgba(16, 185, 129, 0.22)",
    },
    darkAdjustments: {
      heroGradient: "linear-gradient(135deg, rgba(6, 78, 59, 0.38) 0%, rgba(131, 24, 67, 0.26) 100%)",
      badgeText: "#6ee7b7",
      glow: "rgba(16, 185, 129, 0.35)",
    },
    // Calendar auto-detection date ranges (Month is 1-indexed)
    startMonth: 2,
    startDay: 19,
    endMonth: 4,
    endDay: 19,
  },
  {
    id: "grishma",
    name: "Summer",
    sanskritName: "Grishma Ritu (ग्रीष्म)",
    teluguName: "గ్రీష్మ ఋతువు",
    hindiName: "ग्रीष्म ऋतु",
    monthsHindu: "Jyeshtha - Ashadha",
    approxRange: "Mid-April to Mid-June",
    icon: "Sun",
    tagline: "Season of Solar Energy, Dedication & Community Hydration",
    description: "The high summer season characterized by intense sunshine, solar warmth, and community resilience.",
    socialFocus: "Free drinking water kiosks (Chalivendram), rural heatwave awareness, oral rehydration campaigns, and animal water troughs.",
    effect: "shimmer", // Subtle solar warm shimmer
    colors: {
      primary: "#f59e0b",
      accent: "#0284c7",
      secondary: "#ea580c",
      glow: "rgba(245, 158, 11, 0.26)",
      heroGradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(2, 132, 199, 0.12) 100%)",
      badgeBg: "rgba(245, 158, 11, 0.12)",
      badgeBorder: "rgba(245, 158, 11, 0.35)",
      badgeText: "#b45309",
      headerRibbon: "linear-gradient(90deg, #f59e0b, #0284c7, #ea580c)",
      cardBorder: "rgba(245, 158, 11, 0.22)",
    },
    darkAdjustments: {
      heroGradient: "linear-gradient(135deg, rgba(120, 53, 15, 0.35) 0%, rgba(12, 74, 110, 0.28) 100%)",
      badgeText: "#fcd34d",
      glow: "rgba(245, 158, 11, 0.32)",
    },
    startMonth: 4,
    startDay: 20,
    endMonth: 6,
    endDay: 21,
  },
  {
    id: "varsha",
    name: "Monsoon",
    sanskritName: "Varsha Ritu (वर्षा)",
    teluguName: "వర్ష ఋతువు",
    hindiName: "वर्षा ऋतु",
    monthsHindu: "Shravana - Bhadrapada",
    approxRange: "Mid-June to Mid-August",
    icon: "CloudRain",
    tagline: "Season of Life-Giving Showers & Green Canopy",
    description: "The monsoon season delivering rejuvenating rainfall that nourishes agriculture, refills reservoirs, and washes the countryside.",
    socialFocus: "Monsoon disaster preparedness, emergency village flood transit, vector-borne disease awareness, and clean drinking water purification.",
    effect: "rain", // Gentle diagonal raindrops
    colors: {
      primary: "#0284c7",
      accent: "#10b981",
      secondary: "#0f766e",
      glow: "rgba(2, 132, 199, 0.28)",
      heroGradient: "linear-gradient(135deg, rgba(2, 132, 199, 0.18) 0%, rgba(16, 185, 129, 0.14) 100%)",
      badgeBg: "rgba(2, 132, 199, 0.12)",
      badgeBorder: "rgba(2, 132, 199, 0.35)",
      badgeText: "#0369a1",
      headerRibbon: "linear-gradient(90deg, #0284c7, #10b981, #0f766e)",
      cardBorder: "rgba(2, 132, 199, 0.22)",
    },
    darkAdjustments: {
      heroGradient: "linear-gradient(135deg, rgba(12, 74, 110, 0.38) 0%, rgba(6, 78, 59, 0.28) 100%)",
      badgeText: "#7dd3fc",
      glow: "rgba(2, 132, 199, 0.35)",
    },
    startMonth: 6,
    startDay: 22,
    endMonth: 8,
    endDay: 22,
  },
  {
    id: "sharad",
    name: "Autumn",
    sanskritName: "Sharad Ritu (शरद्)",
    teluguName: "శరదృతువు",
    hindiName: "शरद ऋतु",
    monthsHindu: "Ashwina - Kartika",
    approxRange: "Mid-August to Mid-October",
    icon: "Sparkles",
    tagline: "Season of Golden Harvests, Clarity & Festivities",
    description: "The serene autumn season of clear sapphire skies, blooming night-jasmine, and the grand festive cycle of Durga Puja, Navratri, and Bathukamma.",
    socialFocus: "Festive clothing and food grains distribution to rural families, artisan livelihood support, community cleanliness (Swachhata) drives.",
    effect: "leaves", // Gentle drifting golden leaves
    colors: {
      primary: "#ea580c",
      accent: "#f59e0b",
      secondary: "#b45309",
      glow: "rgba(234, 88, 12, 0.28)",
      heroGradient: "linear-gradient(135deg, rgba(234, 88, 12, 0.16) 0%, rgba(245, 158, 11, 0.14) 100%)",
      badgeBg: "rgba(234, 88, 12, 0.12)",
      badgeBorder: "rgba(234, 88, 12, 0.35)",
      badgeText: "#c2410c",
      headerRibbon: "linear-gradient(90deg, #ea580c, #f59e0b, #b45309)",
      cardBorder: "rgba(234, 88, 12, 0.22)",
    },
    darkAdjustments: {
      heroGradient: "linear-gradient(135deg, rgba(124, 45, 18, 0.38) 0%, rgba(120, 53, 15, 0.28) 100%)",
      badgeText: "#fdba74",
      glow: "rgba(234, 88, 12, 0.35)",
    },
    startMonth: 8,
    startDay: 23,
    endMonth: 10,
    endDay: 22,
  },
  {
    id: "hemanta",
    name: "Pre-Winter",
    sanskritName: "Hemanta Ritu (हेमन्त)",
    teluguName: "హేమంత ఋతువు",
    hindiName: "हेमंत ऋतु",
    monthsHindu: "Margashirsha - Pausha",
    approxRange: "Mid-October to Mid-December",
    icon: "Flame",
    tagline: "Season of Early Dew, Serenity & Rural Warmth",
    description: "The pleasant transition into winter marked by cooling breezes, golden agricultural harvests, and the festive warmth of Diwali and Deepavali.",
    socialFocus: "Pre-winter health camps, nutrition food kits for rural mothers, agricultural crop loss advisory, youth leadership camps.",
    effect: "mist", // Ambient soft misty particles
    colors: {
      primary: "#b45309",
      accent: "#0d9488",
      secondary: "#d97706",
      glow: "rgba(180, 83, 9, 0.26)",
      heroGradient: "linear-gradient(135deg, rgba(180, 83, 9, 0.16) 0%, rgba(13, 148, 136, 0.14) 100%)",
      badgeBg: "rgba(180, 83, 9, 0.12)",
      badgeBorder: "rgba(180, 83, 9, 0.35)",
      badgeText: "#92400e",
      headerRibbon: "linear-gradient(90deg, #b45309, #d97706, #0d9488)",
      cardBorder: "rgba(180, 83, 9, 0.22)",
    },
    darkAdjustments: {
      heroGradient: "linear-gradient(135deg, rgba(120, 53, 15, 0.36) 0%, rgba(19, 78, 74, 0.28) 100%)",
      badgeText: "#fcd34d",
      glow: "rgba(180, 83, 9, 0.32)",
    },
    startMonth: 10,
    startDay: 23,
    endMonth: 12,
    endDay: 21,
  },
  {
    id: "shishira",
    name: "Winter",
    sanskritName: "Shishira Ritu (शिशिर)",
    teluguName: "శిశిర ఋతువు",
    hindiName: "शिशिर ऋतु",
    monthsHindu: "Magha - Phalguna",
    approxRange: "Mid-December to Mid-February",
    icon: "Snowflake",
    tagline: "Season of Crisp Mornings, Sankranti Harvest & Inner Strength",
    description: "The cool winter season in India marked by crisp mornings, golden harvest sunshine, and agricultural bounty.",
    socialFocus: "Winter blanket distribution drives, warm clothing support for rural elders, and Republic Day youth discipline parades.",
    effect: "snow", // Subtle falling snowflakes
    colors: {
      primary: "#2563eb",
      accent: "#38bdf8",
      secondary: "#059669",
      glow: "rgba(37, 99, 235, 0.26)",
      heroGradient: "linear-gradient(135deg, rgba(37, 99, 235, 0.16) 0%, rgba(56, 189, 248, 0.14) 100%)",
      badgeBg: "rgba(37, 99, 235, 0.12)",
      badgeBorder: "rgba(37, 99, 235, 0.35)",
      badgeText: "#1d4ed8",
      headerRibbon: "linear-gradient(90deg, #2563eb, #38bdf8, #059669)",
      cardBorder: "rgba(37, 99, 235, 0.22)",
    },
    darkAdjustments: {
      heroGradient: "linear-gradient(135deg, rgba(30, 58, 138, 0.38) 0%, rgba(12, 74, 110, 0.28) 100%)",
      badgeText: "#93c5fd",
      glow: "rgba(37, 99, 235, 0.35)",
    },
    startMonth: 12,
    startDay: 22,
    endMonth: 2,
    endDay: 18,
  },
];

/**
 * Returns a seasonal theme by its unique identifier.
 */
export function getSeasonalThemeById(id) {
  if (!id) return INDIAN_SEASONAL_THEMES[0];
  const cleanId = String(id).toLowerCase().trim();
  return (
    INDIAN_SEASONAL_THEMES.find(
      (s) => s.id === cleanId || s.name.toLowerCase() === cleanId
    ) || INDIAN_SEASONAL_THEMES[0]
  );
}
