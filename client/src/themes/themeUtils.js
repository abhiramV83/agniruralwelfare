/**
 * AGNI Rural Welfare Society - Theme Utilities
 * 
 * Provides DOM-level layer application, CSS custom property injection,
 * clean removal for "Original AGNI Theme", and automated calendar detection.
 */

import { INDIAN_SEASONAL_THEMES, getSeasonalThemeById } from "./seasonalThemeConfig.js";
import { INDIAN_FESTIVAL_THEMES, getFestivalThemeById } from "./festivalThemeConfig.js";
import { getActiveFestival, getCurrentSeason, getIndianDate } from "../services/indian-calendar.js";

const FESTIVE_CSS_VARIABLES = [
  "--festive-primary",
  "--festive-accent",
  "--festive-secondary",
  "--festive-glow",
  "--festive-hero-gradient",
  "--festive-badge-bg",
  "--festive-badge-border",
  "--festive-badge-text",
  "--festive-header-ribbon",
  "--festive-card-border",
  "--festive-active"
];

/**
 * Checks if the current document is set to dark mode
 */
export function isCurrentModeDark() {
  if (typeof document === "undefined") return true;
  const root = document.documentElement;
  return root.dataset.themeMode === "dark" || root.classList.contains("theme-dark");
}

/**
 * Resolves colors for a given theme, taking dark-mode adjustments into account
 */
export function resolveThemeColors(theme, isDark = false) {
  if (!theme || !theme.colors) return null;
  const base = { ...theme.colors };
  if (isDark && theme.darkAdjustments) {
    return {
      ...base,
      ...theme.darkAdjustments
    };
  }
  return base;
}

/**
 * Applies a seasonal or festival theme layer to the DOM non-destructively.
 * Base theme data attributes (data-theme, data-theme-mode) are completely preserved.
 *
 * @param {"seasonal"|"festival"|"original"} type 
 * @param {object} theme - Theme configuration object
 * @param {boolean} [isDark] - Optional dark mode flag (defaults to current DOM state)
 */
export function applyThemeLayerToDOM(type, theme, isDark = null) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  if (type === "original" || !theme || !theme.id) {
    removeThemeLayerFromDOM();
    return;
  }

  const darkMode = isDark !== null ? isDark : isCurrentModeDark();
  const colors = resolveThemeColors(theme, darkMode);

  if (type === "seasonal") {
    delete root.dataset.festivalTheme;
    root.dataset.seasonalTheme = theme.id;
  } else if (type === "festival") {
    delete root.dataset.seasonalTheme;
    root.dataset.festivalTheme = theme.id;
  }

  root.dataset.festiveEffect = theme.effect || "none";

  if (colors) {
    root.style.setProperty("--festive-primary", colors.primary || "#059669");
    root.style.setProperty("--festive-accent", colors.accent || "#10b981");
    root.style.setProperty("--festive-secondary", colors.secondary || "#047857");
    root.style.setProperty("--festive-glow", colors.glow || "rgba(16, 185, 129, 0.28)");
    root.style.setProperty("--festive-hero-gradient", colors.heroGradient || "none");
    root.style.setProperty("--festive-badge-bg", colors.badgeBg || "rgba(16, 185, 129, 0.12)");
    root.style.setProperty("--festive-badge-border", colors.badgeBorder || "rgba(16, 185, 129, 0.35)");
    root.style.setProperty("--festive-badge-text", colors.badgeText || colors.primary || "#059669");
    root.style.setProperty("--festive-header-ribbon", colors.headerRibbon || colors.primary || "#059669");
    root.style.setProperty("--festive-card-border", colors.cardBorder || "rgba(16, 185, 129, 0.22)");
    root.style.setProperty("--festive-active", "1");
  }

  // Dispatch custom event so listeners (e.g. canvas particles) can react immediately
  try {
    const event = new CustomEvent("agni-theme-layer-changed", {
      detail: {
        type,
        id: theme.id,
        name: theme.name,
        effect: theme.effect || "none",
        isDark: darkMode
      }
    });
    window.dispatchEvent(event);
  } catch (_e) {
    /* safely ignore SSR / restricted window contexts */
  }
}

/**
 * Removes all seasonal and festival overlay styling, reverting the DOM
 * to the original, pristine AGNI theme.
 */
export function removeThemeLayerFromDOM() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  delete root.dataset.seasonalTheme;
  delete root.dataset.festivalTheme;
  delete root.dataset.festiveEffect;

  FESTIVE_CSS_VARIABLES.forEach((v) => {
    root.style.removeProperty(v);
  });

  try {
    const event = new CustomEvent("agni-theme-layer-changed", {
      detail: {
        type: "original",
        id: null,
        name: "Original AGNI Theme",
        effect: "none",
        isDark: isCurrentModeDark()
      }
    });
    window.dispatchEvent(event);
  } catch (_e) {
    /* safely ignore SSR */
  }
}

/**
 * Normalizes season IDs between indian-calendar.js and seasonalThemeConfig.js
 */
export function normalizeSeasonId(id) {
  if (!id) return "vasanta";
  const clean = String(id).toLowerCase().trim();
  if (clean === "vasant") return "vasanta";
  return clean;
}

/**
 * Determines the automatic theme based on Indian calendar intelligence:
 * 1. Active festival check
 * 2. Active regional season check
 *
 * @param {Date|string} [inputDate] 
 * @returns {{ type: "festival"|"seasonal", theme: object, source: string, activeInfo: object }}
 */
export function determineAutoTheme(inputDate = new Date()) {
  const activeFestival = getActiveFestival(inputDate);
  if (activeFestival) {
    // Try exact match or fuzzy match
    let matchedTheme = getFestivalThemeById(activeFestival.id);
    if (!matchedTheme) {
      const q = activeFestival.name.toLowerCase();
      matchedTheme = INDIAN_FESTIVAL_THEMES.find(
        (f) => f.name.toLowerCase() === q || q.includes(f.name.toLowerCase())
      );
    }
    if (matchedTheme) {
      return {
        type: "festival",
        theme: matchedTheme,
        source: "auto-festival",
        activeInfo: activeFestival
      };
    }
  }

  // Fallback to active Indian season
  const currentSeason = getCurrentSeason(inputDate);
  const normalizedId = normalizeSeasonId(currentSeason?.id);
  const matchedSeason = getSeasonalThemeById(normalizedId);

  return {
    type: "seasonal",
    theme: matchedSeason || INDIAN_SEASONAL_THEMES[0],
    source: "auto-seasonal",
    activeInfo: currentSeason
  };
}

