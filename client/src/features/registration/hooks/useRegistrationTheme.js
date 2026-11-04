import { useEffect } from "react";

const themeTokenNames = ["--bg", "--surface", "--surface-elevated", "--border", "--text", "--text-muted", "--primary", "--accent", "--on-primary", "--photo-text", "--photo-accent", "--success", "--danger", "--overlay", "--shadow", "--glow", "--amber", "--radius", "--input-bg", "--input-border", "--registration-border", "--focus-ring", "--info-bg", "--info-border", "--info-text", "--warning-bg", "--warning-border", "--warning-text", "--success-bg", "--success-border", "--success-text", "--danger-bg", "--danger-border", "--hero-start", "--hero-mid", "--hero-end"];

export function useRegistrationTheme(frame) {
  useEffect(() => {
    const syncTheme = () => {
      const styles = getComputedStyle(document.documentElement);
      const tokens = Object.fromEntries(themeTokenNames.map((name) => [name, styles.getPropertyValue(name).trim()]));
      frame.current?.contentWindow?.postMessage({ type: "app-theme", theme: document.documentElement.dataset.theme || "light", tokens }, "*");
    };
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const currentFrame = frame.current;
    currentFrame?.addEventListener("load", syncTheme);
    syncTheme();
    return () => { observer.disconnect(); currentFrame?.removeEventListener("load", syncTheme); };
  }, [frame]);
}
