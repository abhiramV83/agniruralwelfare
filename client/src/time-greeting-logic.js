/**
 * Evaluates time-of-day greeting and welcoming message based on the hour:
 * - Morning: 5:00 AM – 11:59 AM (hours 5 - 11)
 * - Afternoon: 12:00 PM – 4:59 PM (hours 12 - 16)
 * - Evening: 5:00 PM – 9:59 PM (hours 17 - 21)
 * - Night: 10:00 PM – 4:59 AM (hours 22 - 23, 0 - 4)
 */
export function getTimeGreeting(now = new Date()) {
  const dateObj = now instanceof Date ? now : new Date(now);
  const hours = dateObj.getHours();

  if (hours >= 5 && hours < 12) {
    return {
      period: "morning",
      salutation: "Good Morning",
      headline: "Good Morning! Welcome to Agni Rural Welfare Society",
      welcomeMessage:
        "Wishing you a bright and inspiring morning. Together, let us serve our community with courage, compassion, and discipline.",
      shortMessage:
        "Wishing you an inspiring morning of purpose, service, and hope.",
      tagline: "A fresh morning dedicated to uplifting rural communities.",
      badge: "Morning Welcome",
      iconName: "Sunrise",
    };
  } else if (hours >= 12 && hours < 17) {
    return {
      period: "afternoon",
      salutation: "Good Afternoon",
      headline: "Good Afternoon! Welcome to Agni Rural Welfare Society",
      welcomeMessage:
        "Empowering rural youth and strengthening families through education, healthcare, and community development. Thank you for standing with our mission today.",
      shortMessage:
        "Empowering communities and inspiring youth through active social service.",
      tagline: "Serving society with responsibility, courage, and discipline.",
      badge: "Afternoon Welcome",
      iconName: "Sun",
    };
  } else if (hours >= 17 && hours < 22) {
    return {
      period: "evening",
      salutation: "Good Evening",
      headline: "Good Evening! Luminous Warmth & Serenity from AGNI",
      welcomeMessage:
        "As twilight gently settles over our villages, we celebrate the tireless courage, unity, and selfless service of our volunteers and cadets. Wishing you an inspiring, peaceful, and radiant evening.",
      shortMessage:
        "Lighting lamps of compassion, courage, and selfless service as dusk gently descends.",
      tagline: "Radiating warmth, dignity, and tireless grassroots community care.",
      badge: "Radiant Evening",
      iconName: "Sunset",
    };
  } else {
    return {
      period: "night",
      salutation: "Good Evening",
      headline: "Welcome to Agni Rural Welfare Society",
      welcomeMessage:
        "Dedicated around the clock to community welfare, youth leadership, and humanitarian aid. Serving society with unwavering dedication.",
      shortMessage:
        "Dedicated round the clock to community welfare, youth, and society.",
      tagline: "Serving society with responsibility, day and night.",
      badge: "Night Welcome",
      iconName: "Moon",
    };
  }
}

