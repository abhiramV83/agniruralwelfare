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
  const reduced = useReducedMotion(),
    [slide, setSlide] = useState(0);
  const [containedImage, setContainedImage] = useState(false);
  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(
      () => setSlide((s) => (s + 1) % c.home.images.length),
      3000,
    );
    return () => clearInterval(timer);
  }, [reduced]);
  return (
    <>
      <div className="hero-shell">
        <section className={`hero${containedImage ? " hero-contained" : ""}`} data-scroll-nav="/" aria-label={c.home.heading}>
          <motion.img
            key={slide}
            className={`hero-image${containedImage ? " hero-image-contained" : ""}`}
            src={c.home.images[slide]}
            alt=""
            onLoad={(event) => {
              const image = event.currentTarget;
              setContainedImage(image.naturalHeight > 0 && image.naturalWidth / image.naturalHeight < 1.3);
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.45 }}
          />
          <div className="hero-shade" />
          <div className="hero-copy">
            <h1 className="home-title"><img src="/assets/logo.png" alt="" aria-hidden="true" />{c.home.heading}</h1>
            <p>{c.home.subtitle}</p>
            <div className="hero-actions">
              <Action to="/donate">{c.home.donate}</Action>
              <Action to="/membership" className="secondary">Become a Member</Action>
            </div>
          </div>
          <div className="hero-bottom">
            <a
              className="icon-button hero-scroll"
              href="#support"
              aria-label={c.home.supportHeading}
            >
              <ArrowDownRight />
            </a>
          </div>
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
  const [images, setImages] = useState(c.gallery.images),
    [index, setIndex] = useState(0),
    [lightbox, setLightbox] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    api("/gallery")
      .then((data) => {
        if (data.length)
          setImages([
            ...c.gallery.images,
            ...data.filter(
              (im) =>
                !c.gallery.images.some((original) => original.src === im.src) &&
                !im.src.startsWith("/assets/gallery-"),
            ),
          ]);
      })
      .catch(() => {});
  }, []);
  function change(delta) {
    setIndex((i) => (i + delta + images.length) % images.length);
  }
  const image = images[index];
  return (
    <Page
      title={c.gallery.heading}
      intro={c.gallery.intro}
      className="centered"
    >
      <Reveal>
        <h2 className="icon-heading"><Images aria-hidden="true" />{c.gallery.subheading}</h2>
        {c.gallery.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </Reveal>
      <Reveal className="gallery-card glass">
        <button
          type="button"
          className="gallery-open"
          aria-label={c.demo.lightbox}
          onClick={() => setLightbox(true)}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={image.src}
              src={image.src}
              alt={image.alt}
              initial={{ opacity: reduced ? 1 : 0, x: reduced ? 0 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: reduced ? 1 : 0 }}
              transition={{ duration: 0.25 }}
            />
          </AnimatePresence>
          <span className="expand-icon">
            <Maximize2 size={20} />
          </span>
        </button>
        <div className="gallery-progress">
          <span style={{ width: `${((index + 1) / images.length) * 100}%` }} />
        </div>
        <p className="gallery-count" aria-live="polite">
          {index + 1} / {images.length}
        </p>
      </Reveal>
      <div className="gallery-buttons">
        <Action onClick={() => change(-1)} className="secondary">
          {c.gallery.previous}
        </Action>
        <Action onClick={() => change(1)} className="secondary">
          {c.gallery.next}
        </Action>
      </div>
      {c.demo.galleryNote && <p className="demo-note">{c.demo.galleryNote}</p>}
      {lightbox && (
        <Modal title={c.gallery.heading} onClose={() => setLightbox(false)}>
          <img className="lightbox-image" src={image.src} alt={image.alt} />
          <div className="gallery-buttons">
            <Action onClick={() => change(-1)}>{c.gallery.previous}</Action>
            <Action onClick={() => change(1)}>{c.gallery.next}</Action>
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
  return (
    <Page
      title={c.contact.heading}
      intro={c.contact.intro}
      className="centered short-page"
    >
      <div className="contact-card glass">
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
