import { useEffect } from "react";

const themeTokenNames = [
  "--bg",
  "--surface",
  "--surface-elevated",
  "--border",
  "--text",
  "--text-muted",
  "--primary",
  "--accent",
  "--on-primary",
  "--photo-text",
  "--photo-accent",
  "--success",
  "--danger",
  "--overlay",
  "--shadow",
  "--glow",
  "--amber",
  "--radius",
  "--input-bg",
  "--input-border",
  "--registration-border",
  "--focus-ring",
  "--info-bg",
  "--info-border",
  "--info-text",
  "--warning-bg",
  "--warning-border",
  "--warning-text",
  "--success-bg",
  "--success-border",
  "--success-text",
  "--danger-bg",
  "--danger-border",
  "--hero-start",
  "--hero-mid",
  "--hero-end",
  "--festive-primary",
  "--festive-accent",
  "--festive-secondary",
  "--festive-glow",
  "--festive-badge-bg",
  "--festive-badge-border",
  "--festive-badge-text",
  "--festive-card-border"
];

export function useRegistrationTheme(frame) {
  useEffect(() => {
    const syncTheme = () => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      const tokens = Object.fromEntries(
        themeTokenNames.map((name) => [name, styles.getPropertyValue(name).trim()])
      );
      const mode = root.dataset.themeMode || (root.classList.contains("theme-dark") ? "dark" : "light");
      const themeId = root.dataset.theme || "emerald-grove";
      const isDark = mode === "dark";

      // Ensure critical form contrast variables have reliable fallbacks
      if (!tokens["--text"]) {
        tokens["--text"] = isDark ? "#f8fafc" : "#0f172a";
      }
      if (!tokens["--input-bg"]) {
        tokens["--input-bg"] = isDark ? "#112821" : "#ffffff";
      }
      if (!tokens["--input-border"]) {
        tokens["--input-border"] = isDark ? "rgba(52, 211, 153, 0.4)" : "#cbd5e1";
      }

      frame.current?.contentWindow?.postMessage(
        {
          type: "app-theme",
          theme: mode,
          mode,
          themeId,
          isDark,
          tokens
        },
        "*"
      );
    };

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        "data-theme",
        "data-theme-mode",
        "data-seasonal-theme",
        "data-festival-theme",
        "class",
        "style"
      ]
    });

    const handleThemeEvent = () => syncTheme();
    window.addEventListener("agni-theme-layer-changed", handleThemeEvent);
    window.addEventListener("storage", handleThemeEvent);

    const currentFrame = frame.current;
    currentFrame?.addEventListener("load", syncTheme);

    syncTheme();
    const t = setTimeout(syncTheme, 150);

    return () => {
      clearTimeout(t);
      observer.disconnect();
      window.removeEventListener("agni-theme-layer-changed", handleThemeEvent);
      window.removeEventListener("storage", handleThemeEvent);
      currentFrame?.removeEventListener("load", syncTheme);
    };
  }, [frame]);
}
