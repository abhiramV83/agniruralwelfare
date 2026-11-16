import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from "react";
import {
  Palette,
  Sparkles,
  RotateCcw,
  Check,
  Search,
  X,
  SlidersHorizontal,
  Calendar,
  Layers,
  ChevronRight,
  Info
} from "lucide-react";
import { INDIAN_SEASONAL_THEMES, getSeasonalThemeById } from "./seasonalThemeConfig.js";
import { INDIAN_FESTIVAL_THEMES, getFestivalThemeById, filterFestivalThemes } from "./festivalThemeConfig.js";
import {
  resolveActiveTheme,
  applyResolvedTheme,
  returnToOriginalTheme,
  resetToAutoTheme,
  setManualSeasonTheme,
  setManualFestivalTheme,
  getSmartThemeRecommendation,
  dismissRecommendation
} from "./themeManager.js";
import { isCurrentModeDark } from "./themeUtils.js";

const SeasonalThemeContext = createContext(null);

export function useSeasonalTheme() {
  const ctx = useContext(SeasonalThemeContext);
  if (!ctx) {
    throw new Error("useSeasonalTheme must be used within a SeasonalThemeProvider");
  }
  return ctx;
}

export function SeasonalThemeProvider({ children }) {
  const [activeTheme, setActiveTheme] = useState(() => resolveActiveTheme());
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [effectsEnabled, setEffectsEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem("agni_festive_effects_enabled");
      return stored !== "false";
    } catch (_e) {
      return true;
    }
  });

  // Re-apply and sync on mount
  useEffect(() => {
    const resolved = applyResolvedTheme();
    setActiveTheme(resolved);

    // Check smart recommendation
    const rec = getSmartThemeRecommendation(resolved);
    setRecommendation(rec);

    // Watch for base theme mode switches (Light/Dark subthemes)
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "data-theme-mode") {
          applyResolvedTheme();
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const handleReturnToOriginal = useCallback(() => {
    const res = returnToOriginalTheme();
    setActiveTheme(res);
    setRecommendation(getSmartThemeRecommendation(res));
  }, []);

  const handleResetToAuto = useCallback(() => {
    const res = resetToAutoTheme();
    setActiveTheme(res);
    setRecommendation(getSmartThemeRecommendation(res));
  }, []);

  const handleSetSeason = useCallback((seasonId) => {
    const res = setManualSeasonTheme(seasonId);
    if (res) {
      setActiveTheme(res);
      setRecommendation(getSmartThemeRecommendation(res));
    }
  }, []);

  const handleSetFestival = useCallback((festivalId) => {
    const res = setManualFestivalTheme(festivalId);
    if (res) {
      setActiveTheme(res);
      setRecommendation(getSmartThemeRecommendation(res));
    }
  }, []);

  const handleApplyRecommendation = useCallback((rec) => {
    if (!rec) return;
    if (rec.type === "festival") {
      handleSetFestival(rec.themeId);
    } else if (rec.type === "seasonal") {
      handleSetSeason(rec.themeId);
    }
    setRecommendation(null);
    dismissRecommendation(rec.id);
  }, [handleSetFestival, handleSetSeason]);

  const handleDismissRecommendation = useCallback((recId) => {
    dismissRecommendation(recId);
    setRecommendation(null);
  }, []);

  const toggleEffects = useCallback(() => {
    setEffectsEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("agni_festive_effects_enabled", String(next));
      } catch (_e) {}
      return next;
    });
  }, []);

  const value = {
    activeTheme,
    mode: activeTheme.mode,
    type: activeTheme.type,
    theme: activeTheme.theme,
    name: activeTheme.name,
    isSelectorOpen,
    openSelector: () => setIsSelectorOpen(true),
    closeSelector: () => setIsSelectorOpen(false),
    returnToOriginal: handleReturnToOriginal,
    resetToAuto: handleResetToAuto,
    setSeason: handleSetSeason,
    setFestival: handleSetFestival,
    recommendation,
    applyRecommendation: handleApplyRecommendation,
    dismissRecommendation: handleDismissRecommendation,
    effectsEnabled,
    toggleEffects
  };

  return (
    <SeasonalThemeContext.Provider value={value}>
      {children}
      {effectsEnabled && <SeasonalAmbienceCanvas effect={activeTheme.theme?.effect} />}
      <SmartThemeRecommendationBanner />
      <ThemeSelectorModal />
    </SeasonalThemeContext.Provider>
  );
}

/**
 * High-performance 60fps canvas that renders delicate, ambient seasonal motes.
 * Fully transparent, click-through, respects prefers-reduced-motion, and consumes negligible CPU.
 */
export function SeasonalAmbienceCanvas({ effect }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!effect || effect === "none") return;
    if (typeof window === "undefined") return;

    // Respect user accessibility preference
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = null;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle types
    const particleCount = effect === "rain" ? 40 : 25;
    const particles = [];

    const isDark = isCurrentModeDark();

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(effect, width, height, isDark));
    }

    function createParticle(eff, w, h, dark) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      let size, speedX, speedY, opacity, color, angle, rotSpeed;

      switch (eff) {
        case "petals": // Spring / Vasanta
          size = Math.random() * 6 + 4;
          speedX = (Math.random() - 0.5) * 0.8;
          speedY = Math.random() * 0.9 + 0.5;
          opacity = Math.random() * 0.45 + 0.25;
          color = Math.random() > 0.4 ? "rgba(244, 114, 182," : "rgba(251, 207, 232,";
          angle = Math.random() * Math.PI * 2;
          rotSpeed = (Math.random() - 0.5) * 0.02;
          break;
        case "rain": // Monsoon / Varsha
          size = Math.random() * 12 + 10;
          speedX = 0.8;
          speedY = Math.random() * 4 + 5;
          opacity = Math.random() * 0.35 + 0.15;
          color = dark ? "rgba(56, 189, 248," : "rgba(2, 132, 199,";
          angle = 0;
          rotSpeed = 0;
          break;
        case "leaves": // Autumn / Sharad
          size = Math.random() * 8 + 5;
          speedX = (Math.random() - 0.5) * 0.9;
          speedY = Math.random() * 0.8 + 0.4;
          opacity = Math.random() * 0.5 + 0.25;
          color = Math.random() > 0.5 ? "rgba(234, 88, 12," : "rgba(245, 158, 11,";
          angle = Math.random() * Math.PI * 2;
          rotSpeed = (Math.random() - 0.5) * 0.03;
          break;
        case "snow": // Winter / Shishira
          size = Math.random() * 3.5 + 1.5;
          speedX = (Math.random() - 0.5) * 0.5;
          speedY = Math.random() * 0.7 + 0.4;
          opacity = Math.random() * 0.5 + 0.3;
          color = dark ? "rgba(224, 242, 254," : "rgba(186, 230, 253,";
          angle = 0;
          rotSpeed = 0;
          break;
        case "tricolor": // Republic / Independence
          size = Math.random() * 4 + 2;
          speedX = (Math.random() - 0.5) * 0.6;
          speedY = -(Math.random() * 0.7 + 0.3); // Floats upward gently
          opacity = Math.random() * 0.5 + 0.25;
          const choice = Math.random();
          color = choice < 0.33 ? "rgba(255, 153, 51," : choice < 0.66 ? "rgba(255, 255, 255," : "rgba(19, 136, 8,";
          angle = Math.random() * Math.PI * 2;
          rotSpeed = (Math.random() - 0.5) * 0.02;
          break;
        case "colors": // Holi
          size = Math.random() * 5 + 3;
          speedX = (Math.random() - 0.5) * 0.8;
          speedY = Math.random() * 0.6 + 0.3;
          opacity = Math.random() * 0.45 + 0.2;
          const holiColors = [
            "rgba(244, 63, 94,",
            "rgba(234, 179, 8,",
            "rgba(16, 185, 129,",
            "rgba(14, 165, 233,",
            "rgba(168, 85, 247,"
          ];
          color = holiColors[Math.floor(Math.random() * holiColors.length)];
          angle = Math.random() * Math.PI * 2;
          rotSpeed = (Math.random() - 0.5) * 0.02;
          break;
        case "shimmer":
        case "mist":
        default: // Soft ambient glows / diyas
          size = Math.random() * 3 + 1.5;
          speedX = (Math.random() - 0.5) * 0.4;
          speedY = -(Math.random() * 0.5 + 0.2);
          opacity = Math.random() * 0.4 + 0.2;
          color = dark ? "rgba(245, 158, 11," : "rgba(217, 119, 6,";
          angle = 0;
          rotSpeed = 0;
          break;
      }

      return { x, y, size, speedX, speedY, opacity, color, angle, rotSpeed };
    }

    let isVisible = true;
    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    function render() {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.angle += p.rotSpeed;

        // Wrap around boundaries
        if (p.speedY > 0 && p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        } else if (p.speedY < 0 && p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        if (p.angle !== 0) ctx.rotate(p.angle);

        ctx.fillStyle = `${p.color} ${p.opacity})`;

        if (effect === "rain") {
          ctx.strokeStyle = `${p.color} ${p.opacity})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(p.speedX * 2, p.size);
          ctx.stroke();
        } else if (effect === "petals" || effect === "leaves") {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [effect]);

  if (!effect || effect === "none") return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.8
      }}
    />
  );
}

/**
 * Discreet smart theme recommendation floating bar
 */
export function SmartThemeRecommendationBanner() {
  const { recommendation, applyRecommendation, dismissRecommendation } = useSeasonalTheme();

  if (!recommendation) return null;

  return (
    <aside
      className="festive-rec-banner"
      role="region"
      aria-label="Seasonal Theme Suggestion"
    >
      <div className="festive-rec-content">
        <span className="festive-rec-icon" aria-hidden="true">
          <Sparkles size={16} />
        </span>
        <div className="festive-rec-text">
          <strong className="festive-rec-title">{recommendation.themeName}</strong>
          <span className="festive-rec-desc">{recommendation.message}</span>
        </div>
        <div className="festive-rec-actions">
          <button
            type="button"
            className="festive-rec-apply-btn"
            onClick={() => applyRecommendation(recommendation)}
          >
            {recommendation.actionLabel}
          </button>
          <button
            type="button"
            className="festive-rec-dismiss-btn"
            onClick={() => dismissRecommendation(recommendation.id)}
            title="Dismiss suggestion"
            aria-label="Dismiss recommendation"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

/**
 * Compact Header Action Pill that shows current active season/festival
 * and opens the Theme Selector on click.
 */
export function SeasonalThemePill() {
  const { activeTheme, openSelector } = useSeasonalTheme();

  const isOriginal = activeTheme.mode === "original";
  const label = isOriginal ? "AGNI Theme" : activeTheme.name;

  return (
    <button
      type="button"
      onClick={openSelector}
      className={`seasonal-theme-pill ${isOriginal ? "is-original" : "is-festive"}`}
      title="Customize Indian Seasons & Festival Theme"
      aria-label={`Current Theme: ${label}. Click to customize season or festival theme.`}
    >
      <Palette size={14} className="seasonal-pill-icon" />
      <span className="seasonal-pill-text">{label}</span>
      <span className="seasonal-pill-tag">
        {activeTheme.mode === "auto" ? "Auto" : isOriginal ? "Clean" : "Custom"}
      </span>
    </button>
  );
}

/**
 * Comprehensive Modal allowing visitors and admins to preview and apply
 * all 6 Indian seasons (Ritus) or 35+ Indian festival themes, with an instant
 * "Return to Original AGNI Theme" button.
 */
export function ThemeSelectorModal() {
  const {
    activeTheme,
    isSelectorOpen,
    closeSelector,
    returnToOriginal,
    resetToAuto,
    setSeason,
    setFestival,
    effectsEnabled,
    toggleEffects
  } = useSeasonalTheme();

  const [activeTab, setActiveTab] = useState("seasons"); // "seasons" | "festivals"
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Close on Escape key
  useEffect(() => {
    if (!isSelectorOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeSelector();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelectorOpen, closeSelector]);

  if (!isSelectorOpen) return null;

  const categories = [
    "All",
    "National",
    "Hindu",
    "Muslim",
    "Christian",
    "Sikh",
    "Buddhist",
    "Jain",
    "Regional & Harvest"
  ];

  const filteredFestivals = filterFestivalThemes(selectedCategory, searchQuery);

  return (
    <div
      className="festive-modal-backdrop"
      onClick={closeSelector}
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-modal-title"
    >
      <div
        className="festive-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="festive-modal-header">
          <div className="festive-modal-heading-group">
            <div className="festive-modal-badge">
              <Sparkles size={14} />
              <span>Cultural & Seasonal Experience</span>
            </div>
            <h2 id="theme-modal-title" className="festive-modal-title">
              Indian Seasonal & Festival Theme Engine
            </h2>
            <p className="festive-modal-subtitle">
              Transform the website atmosphere across Indian Ritus, sacred traditions, and national days while preserving core functionality.
            </p>
          </div>

          <div className="festive-modal-header-actions">
            {/* Instant Return to Original AGNI Theme */}
            <button
              type="button"
              className={`festive-return-original-btn ${activeTheme.mode === "original" ? "is-active" : ""}`}
              onClick={returnToOriginal}
              title="Revert to Pristine AGNI Theme without festive overlays"
            >
              <RotateCcw size={15} />
              <span>Return to Original AGNI Theme</span>
              {activeTheme.mode === "original" && <Check size={14} className="ml-1" />}
            </button>

            <button
              type="button"
              className="festive-modal-close-btn"
              onClick={closeSelector}
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Status Strip & AI Auto Switch */}
        <div className="festive-status-bar">
          <div className="festive-status-info">
            <span className="festive-status-label">Active Experience:</span>
            <strong className="festive-status-value">
              {activeTheme.mode === "original" ? "Original AGNI Base Theme" : activeTheme.name}
            </strong>
            <span className="festive-status-mode-pill">
              {activeTheme.mode === "auto" ? "AI Auto (Calendar Synced)" : activeTheme.mode === "original" ? "Original" : "Manual Selection"}
            </span>
          </div>

          <div className="festive-status-toggles">
            <button
              type="button"
              className={`festive-auto-sync-btn ${activeTheme.mode === "auto" ? "is-active" : ""}`}
              onClick={resetToAuto}
              title="Automatically match today's festival or Indian Ritu"
            >
              <Calendar size={14} />
              <span>Auto-Sync with Indian Calendar</span>
              {activeTheme.mode === "auto" && <Check size={13} />}
            </button>

            <label className="festive-effect-toggle" title="Toggle ambient canvas particles">
              <input
                type="checkbox"
                checked={effectsEnabled}
                onChange={toggleEffects}
              />
              <span>Ambient Motifs</span>
            </label>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="festive-tabs-bar">
          <button
            type="button"
            className={`festive-tab-btn ${activeTab === "seasons" ? "is-active" : ""}`}
            onClick={() => setActiveTab("seasons")}
          >
            <Layers size={16} />
            <span>6 Traditional Indian Seasons (Ritus)</span>
          </button>
          <button
            type="button"
            className={`festive-tab-btn ${activeTab === "festivals" ? "is-active" : ""}`}
            onClick={() => setActiveTab("festivals")}
          >
            <Sparkles size={16} />
            <span>35+ Indian Festival Themes</span>
          </button>
        </div>

        {/* Tab 1: 6 Traditional Indian Seasons */}
        {activeTab === "seasons" && (
          <div className="festive-tab-pane">
            <p className="festive-pane-desc">
              Experience the 6 classical Indian Ritus as documented in Vedic and classical tradition, with tailored colors, social welfare focus, and delicate ambient particles.
            </p>

            <div className="festive-seasons-grid">
              {INDIAN_SEASONAL_THEMES.map((season) => {
                const isSelected = activeTheme.type === "seasonal" && activeTheme.theme?.id === season.id;
                return (
                  <div
                    key={season.id}
                    className={`festive-theme-card ${isSelected ? "is-selected" : ""}`}
                    style={{ "--card-accent": season.colors.primary }}
                  >
                    <div className="festive-card-header">
                      <div className="festive-card-color-swatch" style={{ background: season.colors.headerRibbon }} />
                      <div className="festive-card-title-group">
                        <h4 className="festive-card-title">{season.name}</h4>
                        <span className="festive-card-sanskrit">{season.sanskritName}</span>
                      </div>
                      {isSelected && (
                        <span className="festive-card-badge">
                          <Check size={13} /> Active
                        </span>
                      )}
                    </div>

                    <p className="festive-card-tagline">{season.tagline}</p>
                    <div className="festive-card-meta">
                      <span className="festive-card-range">{season.approxRange}</span>
                      <span className="festive-card-effect-tag">Effect: {season.effect}</span>
                    </div>

                    <p className="festive-card-social">
                      <strong>AGNI Focus:</strong> {season.socialFocus}
                    </p>

                    <button
                      type="button"
                      className="festive-card-apply-btn"
                      onClick={() => setSeason(season.id)}
                    >
                      {isSelected ? "Currently Active" : `Apply ${season.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: 35+ Indian Festival Themes */}
        {activeTab === "festivals" && (
          <div className="festive-tab-pane">
            <div className="festive-festivals-controls">
              {/* Category Pills */}
              <div className="festive-category-pills">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`festive-cat-pill ${selectedCategory === cat ? "is-active" : ""}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="festive-search-wrap">
                <Search size={16} className="festive-search-icon" />
                <input
                  type="text"
                  placeholder="Search festival (e.g. Diwali, Eid, Christmas, Pongal, Baisakhi)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="festive-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="festive-search-clear"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="festive-festivals-grid">
              {filteredFestivals.length === 0 ? (
                <div className="festive-empty-state">
                  <Info size={28} />
                  <p>No festivals found matching "{searchQuery}". Try searching for another festival.</p>
                </div>
              ) : (
                filteredFestivals.map((fest) => {
                  const isSelected = activeTheme.type === "festival" && activeTheme.theme?.id === fest.id;
                  return (
                    <div
                      key={fest.id}
                      className={`festive-theme-card ${isSelected ? "is-selected" : ""}`}
                      style={{ "--card-accent": fest.colors.primary }}
                    >
                      <div className="festive-card-header">
                        <div className="festive-card-color-swatch" style={{ background: fest.colors.headerRibbon }} />
                        <div className="festive-card-title-group">
                          <h4 className="festive-card-title">{fest.name}</h4>
                          <span className="festive-card-category">{fest.category}</span>
                        </div>
                        {isSelected && (
                          <span className="festive-card-badge">
                            <Check size={13} /> Active
                          </span>
                        )}
                      </div>

                      <div className="festive-card-greeting-badge">
                        <span>"{fest.greeting}"</span>
                      </div>

                      <p className="festive-card-social">
                        {fest.socialMessage}
                      </p>

                      <div className="festive-card-meta">
                        <span className="festive-card-motif">Motif: {fest.culturalMotif || "Celebration"}</span>
                        <span className="festive-card-effect-tag">Effect: {fest.effect || "glow"}</span>
                      </div>

                      <button
                        type="button"
                        className="festive-card-apply-btn"
                        onClick={() => setFestival(fest.id)}
                      >
                        {isSelected ? "Currently Active" : `Apply ${fest.name} Theme`}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="festive-modal-footer">
          <p className="festive-footer-note">
            Themes are applied as non-destructive overlays and can be reverted at any time without resetting forms or user data.
          </p>
          <button
            type="button"
            className="festive-modal-done-btn"
            onClick={closeSelector}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
