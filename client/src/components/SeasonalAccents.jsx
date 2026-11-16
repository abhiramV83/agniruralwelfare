import React, { useState, useEffect, useRef } from "react";
import { Flower2, Sun, CloudRain, Sparkles, Flame, Snowflake, Info, X } from "lucide-react";
import { api } from "../api";
import { getCurrentSeason, getCalendarOverview } from "../services/indian-calendar";

const SEASON_ICONS = {
  Flower2,
  Sun,
  CloudRain,
  Sparkles,
  Flame,
  Snowflake,
};

/**
 * Custom React hook to synchronize current Indian Season with the document root
 */
export function useCurrentSeason() {
  const [calendarData, setCalendarData] = useState(() => getCalendarOverview());

  useEffect(() => {
    let isMounted = true;
    api("/calendar/status")
      .then((res) => {
        if (isMounted && res) {
          setCalendarData(res);
        }
      })
      .catch(() => {
        // Safe offline fallback in state
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const season = calendarData?.currentSeason || getCurrentSeason();

  // Apply season accent to document root without altering base theme
  useEffect(() => {
    if (!season || !season.id) return;
    const root = document.documentElement;
    root.dataset.season = season.id;
    root.style.setProperty("--season-accent", season.accentColor || "#10b981");
  }, [season]);

  return { season, calendarData };
}

/**
 * Interactive Seasonal Indicator Chip in the Header / Navigation
 */
export function SeasonalIndicatorChip() {
  const { season } = useCurrentSeason();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef(null);

  const Icon = SEASON_ICONS[season.icon] || Sparkles;

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="seasonal-chip-wrapper" style={{ position: "relative", display: "inline-block" }} ref={popoverRef}>
      <button
        type="button"
        className="seasonal-indicator-chip"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={`Indian Season: ${season.sanskritName} • Click for details`}
      >
        <span className="seasonal-icon-wrapper" aria-hidden="true">
          <Icon size={14} />
        </span>
        <span className="seasonal-label-text">{season.sanskritName}</span>
      </button>

      {open && (
        <div
          className="seasonal-tooltip-popover"
          role="dialog"
          aria-label="Indian Season Information"
        >
          <div className="seasonal-popover-header">
            <div>
              <h4 className="seasonal-popover-title">{season.sanskritName}</h4>
              <span className="seasonal-popover-telugu">{season.teluguName} • {season.name}</span>
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{ padding: "4px", minWidth: "auto" }}
            >
              <X size={15} />
            </button>
          </div>
          <div className="seasonal-popover-body">
            <div>
              <strong>Hindu Months:</strong> {season.monthsHindu}
            </div>
            <div>
              <strong>Time of Year:</strong> {season.approxRange}
            </div>
            <p style={{ margin: "4px 0", fontSize: "0.76rem" }}>
              {season.description}
            </p>
            <div className="seasonal-popover-focus">
              <strong>AGNI Community Focus:</strong> {season.ngoFocus}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
