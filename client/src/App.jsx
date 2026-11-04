import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  NavLink,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Menu, X, ArrowUpRight, ChevronDown, Heart, Sun, Moon, House, Info, Images, UsersRound, BriefcaseBusiness, Mail, FileText, HandHeart, HandHelping } from "lucide-react";
import { copy as c, Action, replaceSiteCopy } from "./components";
import { subscribeSession, refreshSession, api, setSession } from "./api";
import {
  Home,
  About,
  Volunteer,
  GalleryPage,
  Membership,
  Documentation,
  Supporters,
  Contact,
  ComingSoon,
} from "./pages";
import {
  AuthPage,
  Donate,
  InternshipForm,
  Enrollment,
  Member,
  Verify,
  Admin,
} from "./workflows";
import { AuthContext, useAuth } from "./auth-context";
import { ToastProvider } from "./toast-context";
const navIcons = {
  "/": House,
  "/about": Info,
  "/gallery": Images,
  "/membership": UsersRound,
  "/jobs": BriefcaseBusiness,
  "/contact": Mail,
  "/documentation": FileText,
  "/supporters": HandHeart,
  "/volunteer": HandHelping,
};
function Protected({ admin = false, children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <p className="container loading" role="status">
        {c.demo.loading}
      </p>
    );
  if (!user) return <Navigate to={admin ? "/admin/login" : "/login"} replace />;
  if (admin && user.role !== "admin") return <Navigate to="/member" replace />;
  return children;
}
class Boundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="container page">
        <h1>{c.demo.genericError}</h1>
        <a className="button" href="/">
          {c.demo.home}
        </a>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [menu, setMenu] = useState(false),
    [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "light"),
    [, setContentVersion] = useState(0);
  const location = useLocation();
  const primaryLinks = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    { label: "Activities", to: "/gallery" },
    { label: "Membership", to: "/membership" },
    { label: "Jobs & Internships", to: "/jobs" },
    { label: "Contact", to: "/contact" },
  ];
  const moreLinks = [
    { label: "Documentation", to: "/documentation" },
    { label: "Supporters", to: "/supporters" },
    { label: "Volunteer", to: "/volunteer" },
  ];
  const [scrolled, setScrolled] = useState(false);
  const [sectionFocus, setSectionFocus] = useState(location.pathname);
  const [footerVisible, setFooterVisible] = useState(false);
  const mobileDonateHidden = footerVisible || ["/donate", "/login", "/register", "/admin/login", "/admin", "/member", "/enroll", "/internship"].includes(location.pathname);
  useEffect(() => {
    let live = true;
    api("/site-content").then(({ content }) => {
      if (!live || !content) return;
      replaceSiteCopy(content);
      setContentVersion((version) => version + 1);
    }).catch(() => {});
    return () => { live = false; };
  }, []);
  useEffect(() => {
    const unsub = subscribeSession(setUser);
    refreshSession().finally(() => setLoading(false));
    return unsub;
  }, []);
  useEffect(() => {
    const applyTheme = (next) => {
      document.documentElement.dataset.theme = next;
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "dark" ? "#070d11" : "#f2f0e8");
      setTheme(next);
    };
    let stored = null;
    try { stored = localStorage.getItem("agni-theme"); } catch { /* Storage may be unavailable. */ }
    if (stored === "dark" || stored === "light") applyTheme(stored);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const followSystem = (event) => {
      let preference = null;
      try { preference = localStorage.getItem("agni-theme"); } catch { /* Follow system if storage is unavailable. */ }
      if (preference !== "dark" && preference !== "light") applyTheme(event.matches ? "dark" : "light");
    };
    media.addEventListener?.("change", followSystem);
    return () => media.removeEventListener?.("change", followSystem);
  }, []);
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.add("theme-transition");
    document.documentElement.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "dark" ? "#070d11" : "#f2f0e8");
    setTheme(next);
    try { localStorage.setItem("agni-theme", next); } catch { /* Theme remains active for this visit. */ }
    window.setTimeout(() => document.documentElement.classList.remove("theme-transition"), 240);
  }
  const ThemeButton = ({ mobile = false }) => <button type="button" className={`theme-toggle${mobile ? " mobile-theme-toggle" : ""}`} onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} aria-pressed={theme === "dark"} title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
    <span className="theme-icon" aria-hidden="true">{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</span>{mobile && <span>{theme === "dark" ? "Light theme" : "Dark theme"}</span>}
  </button>;
  useEffect(() => {
    setMenu(false);
    document.querySelector(".nav-more")?.removeAttribute("open");
    window.scrollTo({ top: 0, behavior: "instant" });
    document.getElementById("main")?.focus({ preventScroll: true });
    document.title = `${c.nav.find((n) => n.to === location.pathname)?.label || c.brand.name} · ${c.brand.name}`;
  }, [location.pathname]);
  useEffect(() => {
    const disclosure = document.querySelector(".nav-more");
    if (!disclosure) return;
    const closeOnOutsideClick = (event) => {
      if (!disclosure.contains(event.target)) disclosure.removeAttribute("open");
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && disclosure.open) {
        disclosure.removeAttribute("open");
        disclosure.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("click", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("click", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    if (location.pathname !== "/") {
      setSectionFocus(location.pathname);
      return;
    }
    const sections = [...document.querySelectorAll("[data-scroll-nav]")];
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const marker = window.innerHeight * 0.38;
        const current = sections.find((section) => {
          const rect = section.getBoundingClientRect();
          return rect.top <= marker && rect.bottom > marker;
        }) || sections[0];
        setSectionFocus(current?.dataset.scrollNav || "/");
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, [location.pathname]);
  useEffect(() => {
    document.body.classList.toggle("menu-open", menu);
    return () => document.body.classList.remove("menu-open");
  }, [menu]);
  useEffect(() => {
    const footer = document.querySelector(".site-footer");
    if (!footer) return;
    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);
  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } finally {
      setSession(null);
    }
  }
  return (
    <ToastProvider>
    <AuthContext.Provider value={{ user, loading, logout }}>
      <a href="#main" className="skip-link">
        {c.demo.skipContent}
      </a>
      <div className="ambient" aria-hidden="true" />
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="header-inner">
          <Link className="wordmark" to="/">
            <img src="/assets/logo.png" alt="" />
            <span>{c.brand.name}</span>
          </Link>
          <button
            className="icon-button menu-button"
            aria-label={c.demo.menu}
            aria-expanded={menu}
            aria-controls="primary-nav"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
            <span className="sr-only">{menu ? "Close menu" : "Open menu"}</span>
          </button>
          <nav
            id="primary-nav"
            className={menu ? "open" : ""}
            aria-label="Primary"
          >
            {primaryLinks.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === "/"} className={({ isActive }) => (location.pathname === "/" ? sectionFocus === n.to : isActive) ? "active" : ""} onClick={() => setMenu(false)}>
                {(() => { const Icon = navIcons[n.to]; return <><Icon size={16} aria-hidden="true" /><span>{n.label}</span></>; })()}
              </NavLink>
            ))}
            <details className={`nav-more ${moreLinks.some((n) => n.to === location.pathname) ? "active" : ""}`}>
              <summary aria-label="More pages">More <ChevronDown size={15} /></summary>
              <div className="more-menu">
                {moreLinks.map((n) => (
                  <NavLink key={n.to} to={n.to} onClick={(event) => { setMenu(false); event.currentTarget.closest("details")?.removeAttribute("open"); }}>{(() => { const Icon = navIcons[n.to]; return <><Icon size={16} aria-hidden="true" /><span>{n.label}</span></>; })()}</NavLink>
                ))}
              </div>
            </details>
            <div className="mobile-nav-actions">
              <ThemeButton mobile />
              <Link className="button secondary" to="/login" onClick={() => setMenu(false)}>Login</Link>
              <Link className="button" to="/donate" onClick={() => setMenu(false)}>Donate</Link>
            </div>
          </nav>
          <div className="header-actions">
            <ThemeButton />
            <Link className="button secondary" to="/login">Login</Link>
            <Link className="button" to="/donate">Donate</Link>
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <Boundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/jobs" element={<ComingSoon />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route path="/supporters" element={<Supporters />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<AuthPage />} />
            <Route
              path="/register"
              element={<AuthPage initialTab="Register" />}
            />
            <Route
              path="/admin/login"
              element={<AuthPage initialTab="Admin" />}
            />
            <Route path="/internship" element={<InternshipForm />} />
            <Route
              path="/enroll"
              element={<Protected><Enrollment /></Protected>}
            />
            <Route
              path="/member"
              element={
                <Protected>
                  <Member />
                </Protected>
              }
            />
            <Route
              path="/admin"
              element={
                <Protected admin>
                  <Admin />
                </Protected>
              }
            />
            <Route path="/verify/:id" element={<Verify />} />
            <Route
              path="*"
              element={
                <div className="container page">
                  <h1>{c.demo.notFound}</h1>
                  <Action to="/">{c.demo.home}</Action>
                </div>
              }
            />
          </Routes>
        </Boundary>
      </main>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-brand">
            <img src="/assets/logo.png" alt="" />
            <div><strong>{c.brand.name}</strong><span>{c.brand.tagline}</span></div>
          </div>
          <div className="footer-links">
            <strong>Quick links</strong>
            <Link to="/about">About</Link><Link to="/gallery">Activities</Link><Link to="/membership">Membership</Link><Link to="/contact">Contact</Link>
          </div>
          <div className="footer-contact">
            <strong>{c.contact.heading}</strong>
            <a href={`tel:${c.contact.phone.replaceAll(" ", "")}`}>{c.contact.phone}</a>
            <a href={`mailto:${c.contact.email}`}>{c.contact.email}</a>
          </div>
          <p className="footer-copyright">{c.brand.footer}</p>
          <p className="footer-permission">{c.brand.permission}</p>
          {user && (
            <div className="session-links">
              <Link to={user.role === "admin" ? "/admin" : "/member"}>
                {user.role === "admin" ? c.demo.admin : "My account"}
                <ArrowUpRight size={15} />
              </Link>
              <button onClick={logout}>{c.demo.logout}</button>
            </div>
          )}
        </div>
      </footer>
      {!mobileDonateHidden && <Link className="mobile-donate" to="/donate" aria-label="Donate"><Heart size={20} aria-hidden="true" /><span className="sr-only">Donate</span></Link>}
      <button className={`back-top ${scrolled ? "visible" : ""}`} type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })}>↑</button>
    </AuthContext.Provider>
    </ToastProvider>
  );
}
