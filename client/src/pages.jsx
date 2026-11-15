import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ArrowDownRight,
  BriefcaseBusiness,
  Images,
  Sparkles,
  Phone,
  Mail,
  HeartHandshake,
  HeartPulse,
  ShoppingBasket,
  Leaf,
  Trophy,
  LifeBuoy,
  Sprout,
  Play,
  Pause,
  X,
  LayoutGrid,
  Tv,
  HandHelping,
  Send,
  Star,
  MessageSquare,
} from "lucide-react";
import {
  copy as c,
  Reveal,
  Action,
  Modal,
  TextBlocks,
  ImageTranscript,
} from "./components";
import { api } from "./api";
import { useSuccessPopup, useConfirmationDialog } from "./success-popup-context";
export function Welcome() {
  return (
    <div className="container">
      <div className="welcome">
        <span className="status-dot" />
        {c.brand.welcome}
        <span className="welcome-line" />
      </div>
    </div>
  );
}
export function Page({ title, intro, children, className = "" }) {
  return (
    <section className={`container page ${className}`}>
      <Reveal className="page-heading">
        <span className="eyebrow">Agni Rural Welfare Society</span>
        <h1 className="page-title"><img src="/assets/logo.png" alt="" aria-hidden="true" />{title}</h1>
        {intro && <p>{intro}</p>}
      </Reveal>
      {children}
    </section>
  );
}
function Poster({ type, apply = true, applyTo = "/volunteer" }) {
  const mapping = {
    ncc: ["image54.jpg", c.volunteer.nccHeading, c.imageText.ncc],
    fund: ["image55.jpg", c.home.fundraising, c.imageText.fundraising],
    donate: ["image53.jpg", c.home.supportHeading, c.imageText.donation],
  };
  const [file, alt, text] = mapping[type];
  return (
    <div className={`poster poster-${type}`}>
      <img src={`/assets/original/${file}`} alt={alt} loading="lazy" />
      <ImageTranscript text={text} />
      {apply && (
        <Action
          to={type === "donate" ? "/donate" : applyTo}
          className={type === "donate" ? "" : "secondary"}
        >
          {type === "donate" ? c.home.donate : c.home.apply}
        </Action>
      )}
    </div>
  );
}
export function Home() {
  // Continuous moving motion photos prominently featuring Netaji Subhash Chandra Bose and Swami Vivekananda
  const heroMovingPhotos = [
    { src: "/assets/original/subhash_chandra_bose.jpg", title: "Netaji Subhash Chandra Bose" },
    { src: "/assets/original/image3.jpg", title: "Social Service Outreach Announcement" },
    { src: "/assets/original/image17.jpg", title: "Naval Officers Observation" },
    { src: "/assets/original/image19.jpg", title: "Cadet Drum Squad at Vidyasagar Setu" },
    { src: "/assets/original/image43.jpg", title: "Women Welfare Self-Help Group" },
    { src: "/assets/original/image21.jpg", title: "Commanding Officers Briefing" },
    { src: "/assets/original/swami_vivekananda.jpg", title: "Swami Vivekananda" },
    { src: "/assets/original/image10.jpg", title: "Rural Student Nutrition Distribution" },
    { src: "/assets/original/image30.jpg", title: "Cadet Battalion Assembly Ground" },
    { src: "/assets/original/image14.jpg", title: "Youth Cadet Corps Field Transit" },
    { src: "/assets/original/image18.jpg", title: "Ceremonial Pipe & Drum Band" },
    { src: "/assets/original/image48.jpg", title: "Village Women Welfare Festive Drive" },
    { src: "/assets/original/image16.jpg", title: "Indian Navy & Armed Forces Review" },
    { src: "/assets/original/image1.jpg", title: "Emergency Relief Boat Mission" },
  ];

  return (
    <>
      <div className="hero-shell">
        <section
          className="hero clean-slideshow hero-moving-motion"
          data-scroll-nav="/"
          aria-label="Agni Rural Welfare Society"
        >
          {/* Continuous Moving Motion Ribbon: glides continuously without stopping or pausing */}
          <div className="hero-motion-viewport" aria-hidden="true">
            <div className="hero-motion-track">
              {[...heroMovingPhotos, ...heroMovingPhotos].map((photo, idx) => (
                <div key={idx} className="hero-ribbon-item">
                  <img
                    src={photo.src}
                    alt={photo.title}
                    loading={idx < 6 ? "eager" : "lazy"}
                    className="hero-ribbon-img"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Light, subtle transparent overlay so images remain bright and vibrant */}
          <div className="hero-overlay hero-overlay-bright" aria-hidden="true" />

          {/* Hero Content - floating directly over slideshow without any background card */}
          <div className="hero-content">
            <h1 className="hero-main-heading">Spreading Joy Through Social Service</h1>
            <p className="hero-subtitle">Together, We Can Make a Difference!</p>
            <p className="hero-description">
              Join AGNI Rural Welfare Society in building a better future through education, healthcare, environmental protection, community development, and support for underprivileged people. Every small contribution creates a meaningful change in someone&apos;s life.
            </p>
          </div>

          {/* Scroll Down Button */}
          <a
            className="icon-button hero-scroll"
            href="#support"
            aria-label={c.home.supportHeading}
          >
            <ArrowDownRight />
          </a>
        </section>
      </div>
      <section id="support" data-scroll-nav="/gallery" className="container split support-section">
        <Reveal className="support-copy">
          <span className="eyebrow">Community support</span>
          <h2 className="icon-heading"><HeartHandshake aria-hidden="true" />{c.home.supportHeading}</h2>
          <p className="lead">{c.home.supportSubtitle}</p>
          {c.home.supportParagraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p className="contact-line">{c.home.contact}</p>
        </Reveal>
        <Reveal>
          <Poster type="donate" />
        </Reveal>
      </section>
      <section className="feature-section" data-scroll-nav="/jobs">
        <div className="container split">
          <Reveal>
            <Poster type="ncc" />
          </Reveal>
          <Reveal className="feature-copy">
            <span className="eyebrow">Join our team</span>
            <h2 className="icon-heading"><BriefcaseBusiness aria-hidden="true" />{c.home.recruitment}</h2>
            <p className="lead">{c.home.recruitmentSubtitle}</p>
            <Action to="/jobs">{c.home.more}</Action>
          </Reveal>
        </div>
      </section>
      <section className="container split fund-section" data-scroll-nav="/jobs">
        <Reveal className="feature-copy">
          <span className="eyebrow">Opportunities</span>
          <h2 className="icon-heading"><HeartPulse aria-hidden="true" />{c.home.fundraising}</h2>
          <Action to="/volunteer#fundraising">{c.home.more}</Action>
        </Reveal>
        <Reveal>
          <Poster type="fund" />
        </Reveal>
      </section>
    </>
  );
}
export function About() {
  const activityIcons = [HeartHandshake, HeartPulse, ShoppingBasket, Leaf, Trophy, LifeBuoy, Sprout];
  return (
    <Page title={c.about.heading} className="prose-page">
      <div className="about-lead">
        <span className="about-lead-mark" aria-hidden="true"><HeartHandshake size={26} /></span>
        <p>{c.about.paragraphs[0]}</p>
      </div>
      <div className="about-story-grid" aria-label="Our organization story">
        {c.about.paragraphs.slice(1).map((p, index) => (
          <article className={`about-story-card ${index === 0 ? "wide" : ""}`} key={p}>
            <span className="about-story-index">{String(index + 1).padStart(2, "0")}</span>
            <p>{p}</p>
          </article>
        ))}
      </div>
      <section className="about-activities">
        <span className="eyebrow">Our work</span>
        <h2 className="icon-heading"><Sparkles aria-hidden="true" />{c.about.activitiesHeading}</h2>
        <div className="activity-cards">
          {c.about.activities.map((text, index) => {
            const Icon = activityIcons[index % activityIcons.length];
            return <article className="activity-card glass" key={text}><Icon size={23} aria-hidden="true" /><p>{text}</p></article>;
          })}
        </div>
      </section>
      <div className="about-closing">
        {c.about.closing.map((p) => <p key={p}>{p}</p>)}
      </div>
    </Page>
  );
}
export function Volunteer() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash)
      requestAnimationFrame(() =>
        document.querySelector(hash)?.scrollIntoView(),
      );
  }, []);
  return (
    <>
      <Welcome />
      <section className="container split volunteer-section" id="ncc">
        <Reveal>
          <Poster type="ncc" applyTo="/internship" />
        </Reveal>
        <Reveal className="prose">
          <h1>{c.volunteer.nccHeading}</h1>
          <p className="lead">{c.volunteer.nccSubtitle}</p>
          <TextBlocks blocks={c.volunteer.nccBlocks} />
        </Reveal>
      </section>
      <section className="container split volunteer-section" id="fundraising">
        <Reveal className="prose">
          <h2>{c.volunteer.fundHeading}</h2>
          <p className="lead">{c.volunteer.fundSubtitle}</p>
          <TextBlocks blocks={c.volunteer.fundBlocks} />
        </Reveal>
        <Reveal>
          <Poster type="fund" applyTo="/internship" />
        </Reveal>
      </section>
    </>
  );
}
export function GalleryPage() {
  // Requirement 2: Independent view modes ("slideshow" by default, or "grid")
  const [galleryViewMode, setGalleryViewMode] = useState("slideshow");
  const [activitiesViewMode, setActivitiesViewMode] = useState("slideshow");

  // Independent slideshow indices for Gallery and Activities
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [activitiesIndex, setActivitiesIndex] = useState(0);

  // Lightbox modal state for larger preview with previous/next navigation
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [currentList, setCurrentList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const galleryList = c.gallery.galleryImages || [];
  const activitiesList = c.gallery.activitiesImages || [];
  const galleryCount = galleryList.length;
  const activitiesCount = activitiesList.length;
  const totalCount = galleryCount + activitiesCount;

  // Gallery slideshow navigation
  const prevGallerySlide = () => {
    if (!galleryList.length) return;
    setGalleryIndex((i) => (i - 1 + galleryList.length) % galleryList.length);
  };
  const nextGallerySlide = () => {
    if (!galleryList.length) return;
    setGalleryIndex((i) => (i + 1) % galleryList.length);
  };

  // Activities slideshow navigation
  const prevActivitiesSlide = () => {
    if (!activitiesList.length) return;
    setActivitiesIndex((i) => (i - 1 + activitiesList.length) % activitiesList.length);
  };
  const nextActivitiesSlide = () => {
    if (!activitiesList.length) return;
    setActivitiesIndex((i) => (i + 1) % activitiesList.length);
  };

  // Lightbox modal handlers
  const openLightbox = (photo, list, index) => {
    setSelectedPhoto(photo);
    setCurrentList(list);
    setCurrentIndex(index);
  };

  const handlePrev = () => {
    if (!currentList.length) return;
    const nextIdx = (currentIndex - 1 + currentList.length) % currentList.length;
    setCurrentIndex(nextIdx);
    setSelectedPhoto(currentList[nextIdx]);
  };

  const handleNext = () => {
    if (!currentList.length) return;
    const nextIdx = (currentIndex + 1) % currentList.length;
    setCurrentIndex(nextIdx);
    setSelectedPhoto(currentList[nextIdx]);
  };

  useEffect(() => {
    if (!selectedPhoto) return;
    const onKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedPhoto, currentIndex, currentList]);

  const currentGalleryPhoto = galleryList[galleryIndex] || galleryList[0];
  const currentActivityPhoto = activitiesList[activitiesIndex] || activitiesList[0];

  return (
    <Page
      title={c.gallery.heading || "Gallery & Activities"}
      intro="Explore our organizational moments, youth cadet corps training, ceremonial events, and rural community welfare programs."
      className="centered"
    >
      {/* Accurate Counts & Summary Stats Bar */}
      <Reveal className="gallery-stats-bar">
        <div className="gallery-stat-pill">
          <strong>{totalCount}</strong>
          <span>Total Original Photos</span>
        </div>
        <div className="gallery-stat-pill">
          <strong>{galleryCount}</strong>
          <span>Gallery Photographs</span>
        </div>
        <div className="gallery-stat-pill">
          <strong>{activitiesCount}</strong>
          <span>Activities Photographs</span>
        </div>
      </Reveal>

      {/* SECTION 1: GALLERY & ORGANIZATIONAL MOMENTS */}
      <section className="gallery-section-group" aria-label="Gallery & Organizational Moments">
        <Reveal className="gallery-section-header">
          <div className="gallery-section-title-row">
            <h2 className="icon-heading">
              <Images aria-hidden="true" />
              Gallery &amp; Organizational Moments
            </h2>
            <div className="section-actions-row">
              <span className="section-count-badge">
                {galleryCount} Photographs
              </span>
              <button
                type="button"
                className="section-view-toggle-btn"
                onClick={() => setGalleryViewMode((mode) => (mode === "slideshow" ? "grid" : "slideshow"))}
                aria-label={galleryViewMode === "slideshow" ? "Switch Gallery to Grid View" : "Switch Gallery to Slideshow View"}
              >
                {galleryViewMode === "slideshow" ? (
                  <>
                    <LayoutGrid size={15} aria-hidden="true" />
                    <span>Grid View</span>
                  </>
                ) : (
                  <>
                    <Play size={15} aria-hidden="true" />
                    <span>Slideshow View</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="gallery-section-desc">
            General organizational moments, youth cadet corps field training, ceremonial pipe &amp; drum band performances, armed forces mentorship, national tricolor flag drills, and awards ceremonies.
          </p>
        </Reveal>

        {galleryViewMode === "slideshow" ? (
          /* Default Framed Slideshow: 1. Image -> 2. Centered Prev/Next Buttons -> 3. Progress Bar -> 4. Image Counter */
          <div className="slideshow-viewer-block">
            <div
              className="slideshow-large-frame"
              onClick={() => currentGalleryPhoto && openLightbox(currentGalleryPhoto, galleryList, galleryIndex)}
              role="button"
              tabIndex={0}
              aria-label={currentGalleryPhoto ? `Open photo ${currentGalleryPhoto.title} in full view` : "Gallery photo"}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (currentGalleryPhoto) openLightbox(currentGalleryPhoto, galleryList, galleryIndex);
                }
              }}
            >
              <div className="slideshow-image-container">
                <AnimatePresence mode="wait">
                  {currentGalleryPhoto && (
                    <motion.img
                      key={currentGalleryPhoto.src}
                      src={currentGalleryPhoto.src}
                      alt={currentGalleryPhoto.description || currentGalleryPhoto.title}
                      className="slideshow-large-image"
                      initial={{ opacity: 0, scale: 0.985 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.985 }}
                      transition={{ duration: 0.28 }}
                    />
                  )}
                </AnimatePresence>
                <span className="expand-icon" aria-hidden="true">
                  <Maximize2 size={18} />
                </span>
              </div>
              {currentGalleryPhoto && (
                <div className="slideshow-caption-bar">
                  <div className="slideshow-meta-tags">
                    <span className="slideshow-category-badge">{currentGalleryPhoto.category}</span>
                    <span className="slideshow-filename-badge">{currentGalleryPhoto.filename}</span>
                  </div>
                  <h3 className="slideshow-caption-heading">{currentGalleryPhoto.title}</h3>
                  {currentGalleryPhoto.description && (
                    <p className="slideshow-caption-text">{currentGalleryPhoto.description}</p>
                  )}
                </div>
              )}
            </div>

            {/* 2. Previous and Next buttons centered horizontally directly BELOW the image */}
            <div className="slideshow-nav-row">
              <button
                type="button"
                className="slideshow-green-btn prev-btn"
                onClick={prevGallerySlide}
                aria-label="Previous gallery photograph"
              >
                <ChevronLeft size={20} aria-hidden="true" />
                <span>Previous</span>
              </button>
              <button
                type="button"
                className="slideshow-green-btn next-btn"
                onClick={nextGallerySlide}
                aria-label="Next gallery photograph"
              >
                <span>Next</span>
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>

            {/* 3. Horizontal progress bar below the buttons */}
            <div
              className="slideshow-progress-bar"
              role="progressbar"
              aria-valuenow={galleryIndex + 1}
              aria-valuemin={1}
              aria-valuemax={galleryCount || 1}
              aria-label="Gallery slideshow progress"
            >
              <span
                className="slideshow-progress-fill"
                style={{ width: `${((galleryIndex + 1) / (galleryCount || 1)) * 100}%` }}
              />
            </div>

            {/* 4. Centered image counter below the progress bar */}
            <div className="slideshow-image-counter" aria-live="polite">
              <span className="counter-current">{galleryIndex + 1}</span>
              <span className="counter-divider">/</span>
              <span className="counter-total">{galleryCount}</span>
            </div>
          </div>
        ) : (
          /* Grid View: ALL 31 images line by line in a responsive grid */
          <div className="gallery-photo-grid">
            {galleryList.map((item, idx) => (
              <article
                key={item.filename || item.src}
                className="gallery-photo-card glass"
                onClick={() => openLightbox(item, galleryList, idx)}
                tabIndex={0}
                role="button"
                aria-label={`View ${item.title}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openLightbox(item, galleryList, idx);
                  }
                }}
              >
                <div className="photo-card-media">
                  <img
                    className="photo-card-img"
                    src={item.src}
                    alt={item.description || item.title}
                    loading="lazy"
                  />
                  <span className="photo-category-pill">{item.category}</span>
                  <div className="photo-card-overlay">
                    <Maximize2 size={18} />
                    <span>View Photo</span>
                  </div>
                </div>
                <div className="photo-card-body">
                  <span className="photo-filename-tag">{item.filename}</span>
                  <h3 className="photo-card-title">{item.title}</h3>
                  <p className="photo-card-desc">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: ACTIVITIES & SOCIAL PROGRAMS */}
      <section className="gallery-section-group activities-group" aria-label="Activities & Social Programs">
        <Reveal className="gallery-section-header">
          <div className="gallery-section-title-row">
            <h2 className="icon-heading">
              <HandHelping aria-hidden="true" />
              Activities &amp; Social Programs
            </h2>
            <div className="section-actions-row">
              <span className="section-count-badge activities-badge">
                {activitiesCount} Photographs
              </span>
              <button
                type="button"
                className="section-view-toggle-btn"
                onClick={() => setActivitiesViewMode((mode) => (mode === "slideshow" ? "grid" : "slideshow"))}
                aria-label={activitiesViewMode === "slideshow" ? "Switch Activities to Grid View" : "Switch Activities to Slideshow View"}
              >
                {activitiesViewMode === "slideshow" ? (
                  <>
                    <LayoutGrid size={15} aria-hidden="true" />
                    <span>Grid View</span>
                  </>
                ) : (
                  <>
                    <Play size={15} aria-hidden="true" />
                    <span>Slideshow View</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="gallery-section-desc">
            Social welfare initiatives, student nutrition and clothes distribution, flood and disaster relief in the Sundarbans, women self-help support, and rural community welfare drives.
          </p>
        </Reveal>

        {activitiesViewMode === "slideshow" ? (
          /* Default Framed Slideshow: 1. Image -> 2. Centered Prev/Next Buttons -> 3. Progress Bar -> 4. Image Counter */
          <div className="slideshow-viewer-block">
            <div
              className="slideshow-large-frame"
              onClick={() => currentActivityPhoto && openLightbox(currentActivityPhoto, activitiesList, activitiesIndex)}
              role="button"
              tabIndex={0}
              aria-label={currentActivityPhoto ? `Open photo ${currentActivityPhoto.title} in full view` : "Activities photo"}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (currentActivityPhoto) openLightbox(currentActivityPhoto, activitiesList, activitiesIndex);
                }
              }}
            >
              <div className="slideshow-image-container">
                <AnimatePresence mode="wait">
                  {currentActivityPhoto && (
                    <motion.img
                      key={currentActivityPhoto.src}
                      src={currentActivityPhoto.src}
                      alt={currentActivityPhoto.description || currentActivityPhoto.title}
                      className="slideshow-large-image"
                      initial={{ opacity: 0, scale: 0.985 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.985 }}
                      transition={{ duration: 0.28 }}
                    />
                  )}
                </AnimatePresence>
                <span className="expand-icon" aria-hidden="true">
                  <Maximize2 size={18} />
                </span>
              </div>
              {currentActivityPhoto && (
                <div className="slideshow-caption-bar">
                  <div className="slideshow-meta-tags">
                    <span className="slideshow-category-badge">{currentActivityPhoto.category}</span>
                    <span className="slideshow-filename-badge">{currentActivityPhoto.filename}</span>
                  </div>
                  <h3 className="slideshow-caption-heading">{currentActivityPhoto.title}</h3>
                  {currentActivityPhoto.description && (
                    <p className="slideshow-caption-text">{currentActivityPhoto.description}</p>
                  )}
                </div>
              )}
            </div>

            {/* 2. Previous and Next buttons centered horizontally directly BELOW the image */}
            <div className="slideshow-nav-row">
              <button
                type="button"
                className="slideshow-green-btn prev-btn"
                onClick={prevActivitiesSlide}
                aria-label="Previous activity photograph"
              >
                <ChevronLeft size={20} aria-hidden="true" />
                <span>Previous</span>
              </button>
              <button
                type="button"
                className="slideshow-green-btn next-btn"
                onClick={nextActivitiesSlide}
                aria-label="Next activity photograph"
              >
                <span>Next</span>
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>

            {/* 3. Horizontal progress bar below the buttons */}
            <div
              className="slideshow-progress-bar"
              role="progressbar"
              aria-valuenow={activitiesIndex + 1}
              aria-valuemin={1}
              aria-valuemax={activitiesCount || 1}
              aria-label="Activities slideshow progress"
            >
              <span
                className="slideshow-progress-fill"
                style={{ width: `${((activitiesIndex + 1) / (activitiesCount || 1)) * 100}%` }}
              />
            </div>

            {/* 4. Centered image counter below the progress bar */}
            <div className="slideshow-image-counter" aria-live="polite">
              <span className="counter-current">{activitiesIndex + 1}</span>
              <span className="counter-divider">/</span>
              <span className="counter-total">{activitiesCount}</span>
            </div>
          </div>
        ) : (
          /* Grid View: ALL 16 images line by line in a responsive grid */
          <div className="gallery-photo-grid">
            {activitiesList.map((item, idx) => (
              <article
                key={item.filename || item.src}
                className="gallery-photo-card glass"
                onClick={() => openLightbox(item, activitiesList, idx)}
                tabIndex={0}
                role="button"
                aria-label={`View ${item.title}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openLightbox(item, activitiesList, idx);
                  }
                }}
              >
                <div className="photo-card-media">
                  <img
                    className="photo-card-img"
                    src={item.src}
                    alt={item.description || item.title}
                    loading="lazy"
                  />
                  <span className="photo-category-pill">{item.category}</span>
                  <div className="photo-card-overlay">
                    <Maximize2 size={18} />
                    <span>View Photo</span>
                  </div>
                </div>
                <div className="photo-card-body">
                  <span className="photo-filename-tag">{item.filename}</span>
                  <h3 className="photo-card-title">{item.title}</h3>
                  <p className="photo-card-desc">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* LIGHTBOX MODAL FOR LARGER PREVIEW */}
      {selectedPhoto && (
        <Modal
          title={selectedPhoto.title}
          onClose={() => setSelectedPhoto(null)}
        >
          <div className="lightbox-modal-content">
            {/* 1. Large framed image viewer */}
            <div className="lightbox-image-container">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedPhoto.src}
                  src={selectedPhoto.src}
                  alt={selectedPhoto.description || selectedPhoto.title}
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.25 }}
                />
              </AnimatePresence>
            </div>
            <div className="lightbox-info-pane">
              <div className="lightbox-meta-row">
                <span className="lightbox-category">{selectedPhoto.category}</span>
                <span className="lightbox-filename">{selectedPhoto.filename}</span>
              </div>
              <p className="lightbox-desc">{selectedPhoto.description}</p>
            </div>

            {/* 2. Previous and Next buttons centered horizontally directly BELOW the image, on the same row, with equal spacing */}
            <div className="slideshow-nav-row">
              <button
                type="button"
                className="slideshow-green-btn prev-btn"
                onClick={handlePrev}
                aria-label="Previous photograph"
              >
                <ChevronLeft size={20} aria-hidden="true" />
                <span>Previous</span>
              </button>
              <button
                type="button"
                className="slideshow-green-btn next-btn"
                onClick={handleNext}
                aria-label="Next photograph"
              >
                <span>Next</span>
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>

            {/* 3. Horizontal progress bar below the buttons */}
            <div
              className="slideshow-progress-bar"
              role="progressbar"
              aria-valuenow={currentIndex + 1}
              aria-valuemin={1}
              aria-valuemax={currentList.length}
              aria-label="Slideshow progress"
            >
              <span
                className="slideshow-progress-fill"
                style={{ width: `${((currentIndex + 1) / currentList.length) * 100}%` }}
              />
            </div>

            {/* 4. Centered image counter below the progress bar */}
            <div className="slideshow-image-counter" aria-live="polite">
              <span className="counter-current">{currentIndex + 1}</span>
              <span className="counter-divider">/</span>
              <span className="counter-total">{currentList.length}</span>
            </div>
          </div>
        </Modal>
      )}
    </Page>
  );
}
export function Membership() {
  return (
    <Page title={c.membership.heading} className="centered">
      {c.membership.paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <Reveal className="membership-image">
        <img src="/assets/original/image12.png" alt={c.membership.chartTitle} />
        <div className="sr-only">
          <p>{c.membership.columns.join(", ")}</p>
          {c.membership.rows.map((r, i) => (
            <p key={i}>{r.join(", ")}</p>
          ))}
        </div>
      </Reveal>
      <h3 className="icon-heading"><HeartHandshake aria-hidden="true" />{c.membership.benefits}</h3>
      <p>{c.membership.benefitsText}</p>
      <p>
        <em>{c.membership.terms}</em>
      </p>
    </Page>
  );
}
export function Documentation() {
  const d = c.documentation;
  return (
    <Page title={d.heading} intro={d.rule}>
      <div className="documentation glass">
        <h2 className="centered">{d.subheading}</h2>
        <dl>
          {d.rows.map(([n, label, value]) => (
            <div className="document-row" key={n}>
              <dt>
                <small>{n}</small>
                {label}
              </dt>
              <dd className="preserve-lines">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="document-prose">
          <h3>9. {d.subheading}</h3>
          {d.order.map((t) => (
            <p key={t}>{t}</p>
          ))}
          <h3>10. {d.conditionsHeading}</h3>
          <ul>
            {d.conditions.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <h3>{d.authorityLabel}</h3>
          <p className="preserve-lines">{d.authority}</p>
        </div>
      </div>
      <div className="approval-signature">
        <img src="/assets/original/image68.png" alt={d.signatureAlt} />
        <ImageTranscript text={c.imageText.signature} />
      </div>
      <div className="certificate-grid">
        {d.certificates.map((im, i) => (
          <Reveal key={im.src}>
            <img {...im} loading="lazy" />
            <ImageTranscript
              text={i === 0 ? c.imageText.society : c.imageText.csr}
            />
          </Reveal>
        ))}
      </div>
    </Page>
  );
}
export function Supporters() {
  return (
    <Page title={c.supporters.heading} className="centered short-page">
      {c.supporters.paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <div className="supporter-logos">
        {c.supporters.links.map(({ href, ...im }) => (
          <a key={href} href={href} target="_blank" rel="noopener noreferrer">
            <img {...im} />
          </a>
        ))}
      </div>
    </Page>
  );
}
export function Contact() {
  const { showConfirmation, showSuccessPopup } = useConfirmationDialog();
  const [tab, setTab] = useState("contact"); // "contact" | "feedback"
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!fullName.trim()) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!message.trim()) {
      setFormError("Please write your message or feedback.");
      return;
    }

    setSubmitting(true);
    try {
      const isFeedback = tab === "feedback";
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        category: isFeedback ? "feedback" : "contact",
        subject: subject.trim() || (isFeedback ? "User Feedback" : "General Inquiry"),
        message: message.trim(),
        rating: isFeedback ? rating : undefined,
      };

      const res = await api("/contact", {
        method: "POST",
        body: payload,
      });

      showSuccessPopup({
        heading: isFeedback ? "Your Voice Matters!" : "Message Received Successfully!",
        message: isFeedback
          ? "Thank you for sharing your valuable feedback. We appreciate your contribution to improving our organization."
          : "Thank you for reaching out to AGNI Rural Welfare Society. Our team appreciates your message and will review it promptly.",
        category: isFeedback ? "feedback" : "contact",
        referenceId: res.reference || null,
        applicantName: fullName.trim(),
        details: [
          { label: "Category", value: isFeedback ? "Feedback Submission" : "Contact Inquiry" },
          { label: "Email Address", value: email.trim() },
          ...(isFeedback ? [{ label: "Satisfaction Rating", value: `${rating} / 5 Stars` }] : []),
        ],
      });

      // Reset form
      setFullName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setFormError(err.message || "Failed to send message. Please try again.");
      showConfirmation({
        type: "error",
        title: "Submission Failed",
        message: err.message || "We could not deliver your message at this time. Please try again.",
        actionText: "Try Again",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page
      title={c.contact.heading}
      intro={c.contact.intro}
      className="centered short-page"
    >
      <div className="contact-card glass" style={{ marginBottom: "2rem" }}>
        <p>
          <Phone size={18} />
          <strong>{c.contact.phoneLabel}</strong>
          <a href={`tel:${c.contact.phone.replaceAll(" ", "")}`}>
            {c.contact.phone}
          </a>
        </p>
        <p>
          <Mail size={18} />
          <strong>{c.contact.emailLabel}</strong>
          <a href={`mailto:${c.contact.email}`}>{c.contact.email}</a>
        </p>
      </div>

      {/* Interactive Contact & Feedback Form */}
      <div className="glass application-card" style={{ maxWidth: "600px", margin: "0 auto", textAlign: "left" }}>
        <div className="tab-bar" style={{ marginBottom: "1.5rem" }}>
          <button
            type="button"
            className={tab === "contact" ? "active" : ""}
            onClick={() => setTab("contact")}
          >
            <Mail size={15} style={{ verticalAlign: "middle", marginRight: "6px" }} />
            Send a Message
          </button>
          <button
            type="button"
            className={tab === "feedback" ? "active" : ""}
            onClick={() => setTab("feedback")}
          >
            <MessageSquare size={15} style={{ verticalAlign: "middle", marginRight: "6px" }} />
            Share Feedback
          </button>
        </div>

        <h3 style={{ margin: "0 0 0.5rem" }}>
          {tab === "contact" ? "Get in Touch With Our Society" : "We Value Your Feedback & Suggestions"}
        </h3>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 1.25rem" }}>
          {tab === "contact"
            ? "Submit your queries, volunteer interest, or partnership inquiries directly to our administration."
            : "Tell us about your experience, community observations, or ideas to help us serve society better."}
        </p>

        {formError && (
          <div style={{ padding: "10px 14px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.35)", borderRadius: "8px", color: "#ef4444", fontSize: "13px", marginBottom: "1rem" }}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid single" style={{ gap: "1rem" }}>
            <div className="field">
              <label htmlFor="contact-name">Full Name *</label>
              <input
                id="contact-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="field">
                <label htmlFor="contact-email">Email Address *</label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="contact-phone">Phone Number</label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 00000 00000"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="contact-subject">
                {tab === "contact" ? "Subject / Department" : "Feedback Topic"}
              </label>
              <input
                id="contact-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={tab === "contact" ? "e.g., General Inquiry, Volunteering, Education Camp" : "e.g., Website Experience, Outreach Program"}
              />
            </div>

            {tab === "feedback" && (
              <div className="field">
                <label>Overall Rating</label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        color: star <= rating ? "#f59e0b" : "var(--text-muted)",
                      }}
                      title={`${star} Star${star > 1 ? "s" : ""}`}
                    >
                      <Star size={24} fill={star <= rating ? "#f59e0b" : "transparent"} />
                    </button>
                  ))}
                  <span style={{ fontSize: "13px", fontWeight: "600", marginLeft: "8px" }}>
                    {rating === 5 ? "Excellent" : rating === 4 ? "Very Good" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
                  </span>
                </div>
              </div>
            )}

            <div className="field">
              <label htmlFor="contact-message">
                {tab === "contact" ? "Your Message *" : "Your Feedback & Suggestions *"}
              </label>
              <textarea
                id="contact-message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={tab === "contact" ? "Write your message here..." : "Share your feedback, ideas, or suggestions..."}
                required
              />
            </div>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <Action className="full-width" disabled={submitting}>
              <Send size={16} />
              {submitting ? "Sending..." : tab === "contact" ? "Send Message" : "Submit Feedback"}
            </Action>
          </div>
        </form>
      </div>
    </Page>
  );
}
export function ComingSoon() {
  return (
    <div className="container coming-soon">
      <span className="status-dot" />
      <h1>{c.comingSoon}</h1>
    </div>
  );
}
