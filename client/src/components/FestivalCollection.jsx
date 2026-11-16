import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Sparkles,
  Search,
  Download,
  Share2,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  CheckCircle2,
  Info,
  Heart,
  Globe,
  Tag,
  ArrowRight,
} from "lucide-react";
import {
  FESTIVAL_COLLECTION,
  FESTIVAL_CATEGORIES,
  filterFestivals,
  getFestivalById,
  getCategoryCounts,
} from "../data/festivals";
import { drawFestivalPoster, FestivalPosterCanvas } from "./FestivalPosterCanvas";
import { getActiveFestival } from "../services/indian-calendar";

export function FestivalCollection() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFestivalId, setActiveFestivalId] = useState(() => {
    const live = getActiveFestival();
    return live?.id && getFestivalById(live.id) ? live.id : "diwali";
  });

  // Modal / Lightbox preview state
  const [previewModalFestival, setPreviewModalFestival] = useState(null);

  // Scoped Festival Notification State (Strictly isolated to this module)
  const [festivalToast, setFestivalToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showFestivalToast = (message, type = "success") => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setFestivalToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setFestivalToast(null);
    }, 4500);
  };

  // Filtered festivals list
  const filteredFestivals = useMemo(() => {
    return filterFestivals({ category: selectedCategory, searchQuery });
  }, [selectedCategory, searchQuery]);

  // Active selected festival details
  const currentFestival = useMemo(() => {
    return getFestivalById(activeFestivalId) || filteredFestivals[0] || FESTIVAL_COLLECTION[0];
  }, [activeFestivalId, filteredFestivals]);

  const categoryCounts = useMemo(() => getCategoryCounts(), []);

  // Handle poster open
  const handleOpenPoster = (festival) => {
    setPreviewModalFestival(festival);
    setActiveFestivalId(festival.id);
    showFestivalToast(festival.posterOpenedMessage, "info");
  };

  // Handle download
  const handleDownloadPoster = (festival) => {
    try {
      const tempCanvas = document.createElement("canvas");
      drawFestivalPoster(tempCanvas, festival);
      const dataUrl = tempCanvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `AGNI-${festival.id}-celebration-poster.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showFestivalToast(festival.downloadSuccessMessage, "success");
    } catch (err) {
      console.error("Poster download error:", err);
      showFestivalToast("Poster download temporarily unavailable. Please try again.", "error");
    }
  };

  // Handle share
  const handleShareFestival = async (festival) => {
    const shareText = `${festival.shareMessage}\n\nExplore official posters on: ${window.location.origin}/festivals`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${festival.greetingTitle} – AGNI Rural Welfare Society`,
          text: shareText,
          url: `${window.location.origin}/festivals`,
        });
        showFestivalToast(festival.shareSuccessMessage, "success");
        return;
      } catch (e) {
        if (e.name === "AbortError") return; // user cancelled share sheet
      }
    }

    // Fallback: Copy to clipboard
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        showFestivalToast(`Copied ${festival.name} wishes to clipboard! ${festival.shareSuccessMessage}`, "success");
      } else {
        showFestivalToast(festival.shareSuccessMessage, "success");
      }
    } catch {
      showFestivalToast(festival.shareSuccessMessage, "success");
    }
  };

  // Modal Next / Prev Navigation
  const handleModalNav = (direction) => {
    if (!previewModalFestival) return;
    const currentIndex = FESTIVAL_COLLECTION.findIndex((f) => f.id === previewModalFestival.id);
    if (currentIndex === -1) return;

    let nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0) nextIndex = FESTIVAL_COLLECTION.length - 1;
    if (nextIndex >= FESTIVAL_COLLECTION.length) nextIndex = 0;

    const nextFestival = FESTIVAL_COLLECTION[nextIndex];
    setPreviewModalFestival(nextFestival);
    setActiveFestivalId(nextFestival.id);
    showFestivalToast(nextFestival.posterOpenedMessage, "info");
  };

  // Close modal on Escape
  useEffect(() => {
    if (!previewModalFestival) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setPreviewModalFestival(null);
      if (e.key === "ArrowLeft") handleModalNav("prev");
      if (e.key === "ArrowRight") handleModalNav("next");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewModalFestival]);

  return (
    <div className="festival-collection-module" aria-label="Indian Festival Collection">
      {/* Scoped Minimal Confirmation Toast */}
      {festivalToast && (
        <div
          className={`festival-toast-banner toast-${festivalToast.type}`}
          role="status"
          aria-live="polite"
        >
          <div className="festival-toast-inner">
            <span className="festival-toast-icon">
              {festivalToast.type === "success" ? <CheckCircle2 size={16} /> : <Info size={16} />}
            </span>
            <span className="festival-toast-text">{festivalToast.message}</span>
            <button
              type="button"
              className="festival-toast-close"
              onClick={() => setFestivalToast(null)}
              aria-label="Dismiss message"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="festival-module-header">
        <div className="festival-header-badge">
          <Sparkles size={14} aria-hidden="true" />
          <span>Cultural Intelligence &amp; Festive Collection</span>
        </div>
        <h1 className="festival-main-title">Indian Festival Collection</h1>
        <p className="festival-main-subtitle">
          Experience the vibrant tapestry of Indian celebrations. Discover festival greetings, cultural traditions,
          inspirational welfare initiatives, and downloadable high-resolution posters from AGNI Rural Welfare Society.
        </p>
      </header>

      {/* Search and Category Filter Toolbar */}
      <section className="festival-filter-toolbar" aria-label="Search and filter Indian festivals">
        <div className="festival-search-box">
          <Search size={18} className="search-icon" aria-hidden="true" />
          <input
            type="text"
            className="festival-search-input"
            placeholder="Search by festival name, greeting (e.g. Diwali, Eid, Pongal), or traditions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search festivals"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="festival-category-pills" role="tablist" aria-label="Festival categories">
          {FESTIVAL_CATEGORIES.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
            const count = categoryCounts[cat.id] || (cat.id === "all" ? categoryCounts.all : 0);
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`category-pill ${isActive ? "active" : ""}`}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  showFestivalToast(`Displaying ${cat.label} festivals.`, "info");
                }}
              >
                <span>{cat.label}</span>
                <span className="category-pill-count">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* FEATURED / SELECTED FESTIVAL SPOTLIGHT */}
      {currentFestival && (
        <section
          className="festival-spotlight-card"
          style={{
            borderColor: "color-mix(in srgb, var(--primary) 25%, var(--border))",
          }}
          aria-label={`Featured: ${currentFestival.name}`}
        >
          <div className="spotlight-grid">
            {/* Left: Interactive Canvas Poster */}
            <div className="spotlight-poster-pane">
              <FestivalPosterCanvas
                festival={currentFestival}
                onDownloadSuccess={() => showFestivalToast(currentFestival.downloadSuccessMessage, "success")}
              />
              <div className="spotlight-poster-actions">
                <button
                  type="button"
                  className="button"
                  style={{ flex: "1 1 auto", padding: "10px 18px", fontSize: "14px" }}
                  onClick={() => handleOpenPoster(currentFestival)}
                >
                  <Maximize2 size={16} />
                  <span>Preview Large Poster</span>
                </button>
                <button
                  type="button"
                  className="button secondary"
                  style={{ padding: "10px 16px" }}
                  onClick={() => handleDownloadPoster(currentFestival)}
                  title={`Download official ${currentFestival.name} poster`}
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  className="button secondary"
                  style={{ padding: "10px 16px" }}
                  onClick={() => handleShareFestival(currentFestival)}
                  title={`Share ${currentFestival.name} greetings`}
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Right: Detailed Festival Intelligence & Meaning */}
            <div className="spotlight-info-pane">
              <div className="spotlight-meta-header">
                <span className="spotlight-category-tag">
                  <Tag size={12} />
                  {currentFestival.category} Celebration
                </span>
                <span className="spotlight-year-dates">
                  <Calendar size={12} />
                  Upcoming: {currentFestival.dates?.[2026]?.start || "Annual Tradition"}
                </span>
              </div>

              <h2 className="spotlight-greeting-title" style={{ color: currentFestival.theme?.accentColor || "var(--primary)" }}>
                {currentFestival.greetingTitle}
              </h2>
              <h3 className="spotlight-festival-name">{currentFestival.name}</h3>

              <p className="spotlight-welcome-lead">{currentFestival.welcomeMessage}</p>

              <div className="spotlight-detail-block">
                <h4>Cultural &amp; Spiritual Significance</h4>
                <p>{currentFestival.culturalSignificance}</p>
              </div>

              <div className="spotlight-detail-block">
                <h4>Traditional Celebrations</h4>
                <p>{currentFestival.traditionalCelebrations}</p>
              </div>

              <div className="spotlight-quote-box">
                <Heart size={16} className="quote-heart-icon" />
                <div>
                  <strong>AGNI Community Welfare Commitment:</strong>
                  <p>{currentFestival.inspirationalMessage}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FESTIVAL POSTERS GALLERY GRID */}
      <section className="festival-gallery-section" aria-label="Browse All Festival Posters">
        <div className="festival-gallery-header-row">
          <div>
            <h3 className="festival-gallery-title">
              Explore Festival Celebration Posters ({filteredFestivals.length})
            </h3>
            <p className="festival-gallery-subtitle">
              Click on any festival card to view its rich significance, preview the high-resolution poster, or download it.
            </p>
          </div>
        </div>

        {filteredFestivals.length === 0 ? (
          <div className="festival-empty-state">
            <Search size={36} className="empty-search-icon" />
            <h4>No festivals found matching "{searchQuery}"</h4>
            <p>Try searching for Diwali, Eid, Christmas, Pongal, Bathukamma, or clear your filters.</p>
            <button
              type="button"
              className="button secondary"
              style={{ marginTop: "12px" }}
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="festival-cards-grid">
            {filteredFestivals.map((festival) => {
              const isSelected = festival.id === currentFestival?.id;
              return (
                <article
                  key={festival.id}
                  className={`festival-card ${isSelected ? "is-selected" : ""}`}
                  onClick={() => {
                    setActiveFestivalId(festival.id);
                    showFestivalToast(festival.posterOpenedMessage, "info");
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${festival.name} - ${festival.greetingTitle}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveFestivalId(festival.id);
                      showFestivalToast(festival.posterOpenedMessage, "info");
                    }
                  }}
                >
                  <div className="festival-card-top-row">
                    <span className="festival-card-badge">{festival.category}</span>
                    <span className="festival-card-date">
                      {festival.dates?.[2026]?.start ? `2026: ${festival.dates[2026].start}` : "Annual"}
                    </span>
                  </div>

                  <div className="festival-card-heading-block">
                    <h4 className="festival-card-greeting" style={{ color: festival.theme?.accentColor || "var(--primary)" }}>
                      {festival.greetingTitle}
                    </h4>
                    <h5 className="festival-card-name">{festival.name}</h5>
                  </div>

                  <p className="festival-card-desc">{festival.shortDescription}</p>

                  <div className="festival-card-footer">
                    <button
                      type="button"
                      className="festival-card-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPoster(festival);
                      }}
                      title={`Preview large ${festival.name} poster`}
                    >
                      <Maximize2 size={13} />
                      <span>Poster Preview</span>
                    </button>

                    <button
                      type="button"
                      className="festival-card-action-btn secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPoster(festival);
                      }}
                      title={`Download ${festival.name} poster`}
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* FULLSCREEN / LIGHTBOX PREVIEW MODAL */}
      {previewModalFestival && (
        <div
          className="festival-modal-backdrop"
          onClick={() => setPreviewModalFestival(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${previewModalFestival.greetingTitle} Poster Preview`}
        >
          <div
            className="festival-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{
              borderColor: previewModalFestival.theme?.accentColor || "var(--primary)",
            }}
          >
            {/* Modal Header */}
            <div className="festival-modal-header">
              <div className="modal-header-titles">
                <span className="modal-category-tag">{previewModalFestival.category} Celebration</span>
                <h3 className="modal-festival-title">
                  {previewModalFestival.greetingTitle} – {previewModalFestival.name}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setPreviewModalFestival(null)}
                aria-label="Close poster preview"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Canvas Render */}
            <div className="festival-modal-body">
              <FestivalPosterCanvas
                festival={previewModalFestival}
                onDownloadSuccess={() => showFestivalToast(previewModalFestival.downloadSuccessMessage, "success")}
              />
              <p className="modal-caption-text">{previewModalFestival.posterCaption}</p>
            </div>

            {/* Modal Footer Controls */}
            <div className="festival-modal-footer">
              <div className="modal-nav-buttons">
                <button
                  type="button"
                  className="modal-nav-btn"
                  onClick={() => handleModalNav("prev")}
                  aria-label="Previous festival"
                  title="Previous festival (Left Arrow)"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  className="modal-nav-btn"
                  onClick={() => handleModalNav("next")}
                  aria-label="Next festival"
                  title="Next festival (Right Arrow)"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="modal-action-buttons">
                <button
                  type="button"
                  className="button"
                  style={{ padding: "9px 18px", fontSize: "14px" }}
                  onClick={() => handleDownloadPoster(previewModalFestival)}
                >
                  <Download size={15} />
                  <span>Download High-Res PNG</span>
                </button>
                <button
                  type="button"
                  className="button secondary"
                  style={{ padding: "9px 16px", fontSize: "14px" }}
                  onClick={() => handleShareFestival(previewModalFestival)}
                >
                  <Share2 size={15} />
                  <span>Share Wishes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
