/**
 * AGNI Rural Welfare Society - 8 Multi-Theme Auto-Rotation Engine with Subthemes
 * 
 * 4 Normal Themes:
 * 1. Emerald Grove (Botanical Leaf Green & Warm Ivory Light)
 * 2. Midnight Forest (Nocturnal Forest Obsidian & Mint Glow Dark)
 * 3. Terracotta Earth (Warm Indian Clay, Desert Sandstone & Earth Ember Light)
 * 4. Ocean Breeze (Crisp Ocean Azure & Marine Blue Light)
 * 
 * 4 AI Themes:
 * 5. Cyber Jade AI (Luminous Neural Matrix & Neon Jade Dark)
 * 6. Neural Violet AI (Quantum Deep Space & Nebula Violet Dark)
 * 7. Synthwave Solar AI (Radiant Cyber Sunset & Solar Amber Core Dark)
 * 8. Arctic Quantum AI (Crystalline Glacier Cyan & Hologram Dark)
 * 
 * Seamless Auto-Rotation:
 * Whenever the user opens the website, the next theme in the sequence is automatically applied
 * to the entire website without any intrusive theme picker or list of themes.
 * 
 * Light & Dark Subthemes:
 * Adjacent [ Light | Dark ] buttons allow switching between the tailored lighter and darker
 * variations of the CURRENT active theme (each retaining its distinctive theme colors).
 */

export const THEMES = [
  // 1. Normal Theme 1: Emerald Grove
  {
    id: "emerald-grove",
    name: "Emerald Grove",
    category: "normal",
    mode: "light",
    accentColor: "#059669",
    bgPreview: "#f4f3ec",
    tagline: "Botanical Leaf Green & Warm Ivory"
  },
  // 2. Normal Theme 2: Midnight Forest
  {
    id: "midnight-forest",
    name: "Midnight Forest",
    category: "normal",
    mode: "dark",
    accentColor: "#10b981",
    bgPreview: "#071013",
    tagline: "Nocturnal Forest Obsidian & Mint Glow"
  },
  // 3. Normal Theme 3: Terracotta Earth (Warm Indian clay and desert sandstone)
  {
    id: "terracotta-earth",
    name: "Terracotta Earth",
    category: "normal",
    mode: "light",
    accentColor: "#c2410c",
    bgPreview: "#fdf6ee",
    tagline: "Warm Indian Clay & Desert Sandstone"
  },
  // 4. Normal Theme 4: Ocean Breeze
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    category: "normal",
    mode: "light",
    accentColor: "#0284c7",
    bgPreview: "#f0f7fb",
    tagline: "Crisp Ocean Azure & Marine Blue"
  },
  // 5. AI Theme 1: Cyber Jade AI
  {
    id: "cyber-jade-ai",
    name: "Cyber Jade AI",
    category: "ai",
    mode: "dark",
    accentColor: "#00ff9d",
    bgPreview: "#030806",
    tagline: "Neural Matrix & Neon Jade"
  },
  // 6. AI Theme 2: Neural Violet AI
  {
    id: "neural-violet-ai",
    name: "Neural Violet AI",
    category: "ai",
    mode: "dark",
    accentColor: "#a855f7",
    bgPreview: "#080411",
    tagline: "Quantum Deep Space & Nebula Violet"
  },
  // 7. AI Theme 3: Synthwave Solar AI
  {
    id: "synthwave-solar-ai",
    name: "Synthwave Solar AI",
    category: "ai",
    mode: "dark",
    accentColor: "#f59e0b",
    bgPreview: "#0c070d",
    tagline: "Cyber Sunset & Solar Core"
  },
  // 8. AI Theme 4: Arctic Quantum AI
  {
    id: "arctic-quantum-ai",
    name: "Arctic Quantum AI",
    category: "ai",
    mode: "dark",
    accentColor: "#00e5ff",
    bgPreview: "#040a12",
    tagline: "Crystalline Glacier & Hyper Cyan"
  }
];

export function getThemeById(id) {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

/**
 * Gets the current subtheme mode: "light" or "dark".
 */
export function getCurrentSubthemeMode(themeFallback = null) {
  try {
    const stored = localStorage.getItem("agni_subtheme_mode");
    if (stored === "light" || stored === "dark") return stored;
  } catch (_e) {
    /* storage unavailable */
  }
  const domMode = document.documentElement.dataset.themeMode;
  if (domMode === "light" || domMode === "dark") return domMode;
  return themeFallback || "dark";
}

/**
 * Sets the subtheme mode to "light" or "dark" and persists the choice.
 */
export function setSubthemeMode(mode) {
  const cleanMode = mode === "light" ? "light" : "dark";
  try {
    localStorage.setItem("agni_subtheme_mode", cleanMode);
  } catch (_e) {
    /* storage unavailable */
  }
  const currentTheme = getCurrentTheme();
  applyThemeToDOM(currentTheme, cleanMode);
  return cleanMode;
}

/**
 * Gets the current theme from DOM attributes or resolves the next rotation theme.
 */
export function getCurrentTheme() {
  const currentId = document.documentElement.dataset.theme;
  if (currentId) {
    const found = THEMES.find((t) => t.id === currentId);
    if (found) return found;
  }
  return rotateToNextTheme();
}

/**
 * Automatically advances to the next theme in the sequence of 8 themes
 * and applies it immediately to the DOM.
 */
export function rotateToNextTheme() {
  let nextIndex = 0;
  try {
    const stored = localStorage.getItem("agni_theme_rotation_idx");
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed)) {
        nextIndex = (parsed + 1) % THEMES.length;
      }
    }
    localStorage.setItem("agni_theme_rotation_idx", nextIndex.toString());
  } catch (_e) {
    nextIndex = 0;
  }

  const selectedTheme = THEMES[nextIndex] || THEMES[0];
  // On auto-rotation, check if the user previously set a subtheme mode or default to theme's mode
  const mode = getCurrentSubthemeMode(selectedTheme.mode);
  applyThemeToDOM(selectedTheme, mode);
  return selectedTheme;
}

/**
 * Applies a theme object and subtheme mode to the DOM root and updates meta tags.
 */
export function applyThemeToDOM(theme, explicitMode = null) {
  if (!theme || !theme.id) return;
  const root = document.documentElement;

  const mode = explicitMode || getCurrentSubthemeMode(theme.mode);

  root.dataset.theme = theme.id;
  root.dataset.themeMode = mode;
  root.dataset.themeCategory = theme.category;
  root.dataset.themeAi = theme.category === "ai" ? "true" : "false";

  // Support legacy class helpers for backward compatibility
  if (mode === "light") {
    root.classList.remove("theme-dark");
    root.classList.add("theme-light");
  } else {
    root.classList.remove("theme-light");
    root.classList.add("theme-dark");
  }

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", mode === "light" ? (theme.category === "ai" ? "#edfdf5" : "#f4f3ec") : theme.bgPreview);
  }
}
