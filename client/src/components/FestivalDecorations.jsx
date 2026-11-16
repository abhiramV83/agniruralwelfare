import React, { useState, useEffect } from "react";
import { X, Sparkles, Calendar, ChevronRight } from "lucide-react";
import { api } from "../api";
import { getCalendarOverview } from "../services/indian-calendar";

/**
 * Cultural SVG Motifs for Indian Festivals
 */
function DiyaMotifSvg() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2C12 2 9 6.5 9 8.5C9 10.1569 10.3431 11.5 12 11.5C13.6569 11.5 15 10.1569 15 8.5C15 6.5 12 2 12 2Z" fill="#ffedd5" stroke="#ea580c" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4 14C4 18.4183 7.58172 22 12 22C16.4183 22 20 18.4183 20 14H4Z" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M2 14H22" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1.5" fill="#f97316" />
    </svg>
  );
}

function FlowersMotifSvg() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill="#fde047" stroke="#ca8a04" strokeWidth="1.2" />
      <path d="M12 2C13.5 5 15.5 6 18 6C15.5 8 15 10.5 16 13.5C13.5 12.5 11 13.5 9 16C9 13 7.5 11.5 5 12C7.5 10.5 8 8 7 5.5C9.5 7 11.5 6 12 2Z" fill="#f43f5e" opacity="0.85" />
      <circle cx="12" cy="6" r="2.5" fill="#f472b6" />
      <circle cx="17" cy="9" r="2.5" fill="#ec4899" />
      <circle cx="16" cy="15" r="2.5" fill="#fb7185" />
      <circle cx="8" cy="15" r="2.5" fill="#fb923c" />
      <circle cx="7" cy="9" r="2.5" fill="#e879f9" />
    </svg>
  );
}

function KitesMotifSvg() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2L20 10L12 18L4 10L12 2Z" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 2V18" stroke="#c2410c" strokeWidth="1.2" />
      <path d="M4 10C8 13 16 13 20 10" stroke="#c2410c" strokeWidth="1.2" />
      <path d="M12 18L10 22H14L12 18Z" fill="#ea580c" />
    </svg>
  );
}

function ColorsMotifSvg() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="7" cy="8" r="4" fill="#38bdf8" opacity="0.8" />
      <circle cx="17" cy="9" r="4.5" fill="#ec4899" opacity="0.8" />
      <circle cx="12" cy="16" r="5" fill="#facc15" opacity="0.8" />
      <circle cx="12" cy="11" r="2.5" fill="#a855f7" />
    </svg>
  );
}

function TricolorMotifSvg() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="3" y="4" width="18" height="5" rx="1" fill="#ff9933" />
      <rect x="3" y="9" width="18" height="5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
      <rect x="3" y="14" width="18" height="5" rx="1" fill="#138808" />
      <circle cx="12" cy="11.5" r="2" fill="none" stroke="#000080" strokeWidth="0.9" />
    </svg>
  );
}

function CrescentMotifSvg() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C15.0693 21 17.7712 19.4616 19.3879 17.1065C15.228 17.3486 11.597 13.9859 11.597 9.8C11.597 6.94273 13.2084 4.45781 15.5684 3.20015C14.459 3.06889 13.2508 3 12 3Z" fill="#a7f3d0" stroke="#059669" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M18 5L18.7 6.8L20.5 7L19.1 8.2L19.6 10L18 9L16.4 10L16.9 8.2L15.5 7L17.3 6.8L18 5Z" fill="#34d399" />
    </svg>
  );
}

function StarMotifSvg() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2L14.8 8.5L22 9.2L16.5 14L18.2 21L12 17.2L5.8 21L7.5 14L2 9.2L9.2 8.5L12 2Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function FlameMotifSvg() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 2C12 2 15 6 15 9C15 10.5 14 12 12 13C10 12 9 10.5 9 9C9 6 12 2 12 2Z" fill="#f97316" />
      <path d="M12 6C16 11 18 14 18 17C18 20.3137 15.3137 23 12 23C8.68629 23 6 20.3137 6 17C6 14 8 11 12 6Z" fill="#ea580c" opacity="0.8" />
    </svg>
  );
}

function ChakraMotifSvg() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="#2563eb" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2" fill="#2563eb" />
      <path d="M12 3V21M3 12H21M5.6 5.6L18.4 18.4M5.6 18.4L18.4 5.6" stroke="#2563eb" strokeWidth="1" />
    </svg>
  );
}

const MOTIF_COMPONENTS = {
  diya: DiyaMotifSvg,
  flowers: FlowersMotifSvg,
  kites: KitesMotifSvg,
  colors: ColorsMotifSvg,
  tricolor: TricolorMotifSvg,
  crescent: CrescentMotifSvg,
  star: StarMotifSvg,
  flame: FlameMotifSvg,
  chakra: ChakraMotifSvg,
};

/**
 * Dynamic Indian Festival Announcement Banner Component
 */
export function FestiveBanner() {
  const [calendarData, setCalendarData] = useState(() => getCalendarOverview());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api("/calendar/status")
      .then((res) => {
        if (isMounted && res) {
          setCalendarData(res);
        }
      })
      .catch(() => {
        // Safe offline fallback already present in state
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const activeFestival = calendarData?.activeFestival;
  const isEnabled = calendarData?.settings?.enableFestiveBanner !== false;
  const customMessage = calendarData?.settings?.customMessage || "";

  // If no active festival, or feature disabled, or dismissed by user
  if (!activeFestival || !isEnabled || dismissed) {
    return null;
  }

  const MotifComponent = MOTIF_COMPONENTS[activeFestival.culturalMotif] || DiyaMotifSvg;

  return (
    <aside
      className="festive-banner-root"
      role="region"
      aria-label={`Festival Greeting: ${activeFestival.name}`}
    >
      <div className="festive-banner">
        <div className="festive-banner-inner">
          <div className="festive-banner-content">
            <div
              className={`festive-motif-badge motif-${activeFestival.culturalMotif || "diya"}`}
              aria-hidden="true"
            >
              <MotifComponent />
            </div>
            <div className="festive-text-wrap">
              <div className="festive-headline">
                <span className="festive-greeting-text">{activeFestival.greeting}</span>
                <span className="festive-name-tag">{activeFestival.name}</span>
              </div>
              <div className="festive-message" title={activeFestival.socialMessage}>
                {activeFestival.socialMessage}
              </div>
              {customMessage && (
                <div className="festive-custom-alert">
                  📢 <strong>Notice:</strong> {customMessage}
                </div>
              )}
            </div>
          </div>
          <div className="festive-actions">
            <button
              type="button"
              className="festive-dismiss-btn"
              onClick={() => setDismissed(true)}
              aria-label="Dismiss festival announcement"
              title="Dismiss for this session"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
