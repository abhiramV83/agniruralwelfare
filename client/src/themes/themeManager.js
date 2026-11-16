/**
 * AGNI Rural Welfare Society - Theme Manager
 * 
 * Manages theme state, priority resolution, localStorage persistence,
 * smart AI recommendations, and clean reversibility to the Original AGNI Theme.
 */

import { INDIAN_SEASONAL_THEMES, getSeasonalThemeById } from "./seasonalThemeConfig.js";
import { INDIAN_FESTIVAL_THEMES, getFestivalThemeById } from "./festivalThemeConfig.js";
import {
  applyThemeLayerToDOM,
  removeThemeLayerFromDOM,
  determineAutoTheme,
  isCurrentModeDark,
  normalizeSeasonId
} from "./themeUtils.js";
import { getUpcomingFestivals, getIndianDate } from "../services/indian-calendar.js";

export const STORAGE_KEYS = {
  MODE: "agni_seasonal_theme_mode", // "auto" | "original" | "manual-seasonal" | "manual-festival"
  THEME_ID: "agni_seasonal_theme_id",
  DISMISSED_REC: "agni_dismissed_theme_rec"
};

/**
 * Reads stored preferences safely from localStorage
 */
export function getStoredThemePreference() {
  if (typeof localStorage === "undefined") {
    return { mode: "auto", id: null };
  }
  try {
    const mode = localStorage.getItem(STORAGE_KEYS.MODE) || "auto";
    const id = localStorage.getItem(STORAGE_KEYS.THEME_ID) || null;
    return { mode, id };
  } catch (_e) {
    return { mode: "auto", id: null };
  }
}

/**
 * Saves theme preferences to localStorage
 */
export function persistThemePreference(mode, id = null) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.MODE, mode);
    if (id) {
      localStorage.setItem(STORAGE_KEYS.THEME_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.THEME_ID);
    }
  } catch (_e) {
    /* safely ignore quota / restricted storage errors */
  }
}

/**
 * Resolves the active theme based on priority hierarchy:
 * 1. Manual user selection ("manual-seasonal" or "manual-festival")
 * 2. User preference for "original" pristine AGNI theme
 * 3. Active festival from Indian calendar (under "auto" mode)
 * 4. Active Indian season from Indian calendar (under "auto" mode)
 * 5. Original AGNI theme
 *
 * @param {string} [requestedMode] 
 * @param {string} [requestedId] 
 * @returns {{ mode: string, type: "seasonal"|"festival"|"original", theme: object|null, name: string }}
 */
export function resolveActiveTheme(requestedMode = null, requestedId = null) {
  const pref = requestedMode !== null
    ? { mode: requestedMode, id: requestedId }
    : getStoredThemePreference();

  // Priority 1: User explicitly requested Original AGNI Theme
  if (pref.mode === "original") {
    return {
      mode: "original",
      type: "original",
      theme: null,
      name: "Original AGNI Theme"
    };
  }

  // Priority 2: Manual seasonal selection
  if (pref.mode === "manual-seasonal" && pref.id) {
    const season = getSeasonalThemeById(pref.id);
    if (season) {
      return {
        mode: "manual-seasonal",
        type: "seasonal",
        theme: season,
        name: season.name
      };
    }
  }

  // Priority 3: Manual festival selection
  if (pref.mode === "manual-festival" && pref.id) {
    const festival = getFestivalThemeById(pref.id);
    if (festival) {
      return {
        mode: "manual-festival",
        type: "festival",
        theme: festival,
        name: festival.name
      };
    }
  }

  // Priority 4: Auto calendar intelligence (active festival or current season)
  const auto = determineAutoTheme();
  return {
    mode: "auto",
    type: auto.type,
    theme: auto.theme,
    name: auto.theme?.name || "Auto Theme",
    autoSource: auto.source,
    activeInfo: auto.activeInfo
  };
}

/**
 * Applies the resolved active theme to the DOM.
 */
export function applyResolvedTheme(resolved = null) {
  const current = resolved || resolveActiveTheme();
  const isDark = isCurrentModeDark();

  if (current.type === "original" || !current.theme) {
    removeThemeLayerFromDOM();
  } else {
    applyThemeLayerToDOM(current.type, current.theme, isDark);
  }

  return current;
}

/**
 * Reverts completely to the Original AGNI Theme (no festive/seasonal overlay).
 */
export function returnToOriginalTheme() {
  persistThemePreference("original", null);
  const resolved = {
    mode: "original",
    type: "original",
    theme: null,
    name: "Original AGNI Theme"
  };
  applyResolvedTheme(resolved);
  return resolved;
}

/**
 * Resets the theme to intelligent Auto mode.
 */
export function resetToAutoTheme() {
  persistThemePreference("auto", null);
  return applyResolvedTheme();
}

/**
 * Sets a specific manual Indian Season theme.
 */
export function setManualSeasonTheme(seasonId) {
  const cleanId = normalizeSeasonId(seasonId);
  const season = getSeasonalThemeById(cleanId);
  if (!season) return null;

  persistThemePreference("manual-seasonal", season.id);
  const resolved = {
    mode: "manual-seasonal",
    type: "seasonal",
    theme: season,
    name: season.name
  };
  applyResolvedTheme(resolved);
  return resolved;
}

/**
 * Sets a specific manual Indian Festival theme.
 */
export function setManualFestivalTheme(festivalId) {
  const festival = getFestivalThemeById(festivalId);
  if (!festival) return null;

  persistThemePreference("manual-festival", festival.id);
  const resolved = {
    mode: "manual-festival",
    type: "festival",
    theme: festival,
    name: festival.name
  };
  applyResolvedTheme(resolved);
  return resolved;
}

/**
 * Smart AI-assisted theme recommendation generator.
 * Analyzes approaching festivals and season transitions to suggest relevant themes.
 */
export function getSmartThemeRecommendation(currentResolved = null) {
  const active = currentResolved || resolveActiveTheme();
  let dismissed = null;
  try {
    dismissed = localStorage.getItem(STORAGE_KEYS.DISMISSED_REC);
  } catch (_e) {
    /* ignore */
  }

  // Look ahead up to 10 days for approaching major festivals
  const upcoming = getUpcomingFestivals(new Date(), 3);
  const nearFestival = upcoming.find((u) => u.daysRemaining <= 10);

  if (nearFestival) {
    const festivalTheme = getFestivalThemeById(nearFestival.id);
    if (festivalTheme && active.theme?.id !== festivalTheme.id) {
      const recKey = `festival-${festivalTheme.id}-${getIndianDate().year}`;
      if (dismissed === recKey) return null;

      return {
        id: recKey,
        type: "festival",
        themeId: festivalTheme.id,
        themeName: festivalTheme.name,
        greeting: festivalTheme.greeting,
        message: nearFestival.daysRemaining === 0
          ? `Today is ${festivalTheme.name}! Experience our festive celebration theme.`
          : `${festivalTheme.name} is approaching in ${nearFestival.daysRemaining} days. Celebrate with AGNI!`,
        actionLabel: `Apply ${festivalTheme.name} Theme`,
        targetTheme: festivalTheme
      };
    }
  }

  // If in original or manual mode, recommend experiencing the current Indian season
  if (active.mode !== "auto") {
    const auto = determineAutoTheme();
    if (auto.theme && auto.theme.id !== active.theme?.id) {
      const recKey = `season-${auto.theme.id}-${getIndianDate().month}`;
      if (dismissed === recKey) return null;

      return {
        id: recKey,
        type: auto.type,
        themeId: auto.theme.id,
        themeName: auto.theme.name,
        greeting: auto.theme.tagline,
        message: `Currently in ${auto.theme.name} (${auto.theme.sanskritName || "Ritu"}). Enhance your experience with seasonal ambiance.`,
        actionLabel: `Enable ${auto.theme.name} Theme`,
        targetTheme: auto.theme
      };
    }
  }

  return null;
}

/**
 * Dismisses a recommendation so it does not persistently prompt the user.
 */
export function dismissRecommendation(recommendationId) {
  if (!recommendationId || typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.DISMISSED_REC, recommendationId);
  } catch (_e) {
    /* ignore */
  }
}
