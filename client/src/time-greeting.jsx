import React, { useState, useEffect } from "react";
import { Sunrise, Sun, Sunset, Moon } from "lucide-react";
import { getTimeGreeting } from "./time-greeting-logic.js";

export { getTimeGreeting };

const iconComponents = {
  Sunrise,
  Sun,
  Sunset,
  Moon,
};

/**
 * Custom React hook that evaluates the time-of-day greeting and updates automatically every 30 seconds.
 */
export function useTimeGreeting() {
  const [greeting, setGreeting] = useState(() => {
    const raw = getTimeGreeting();
    return { ...raw, Icon: iconComponents[raw.iconName] || Sun };
  });

  useEffect(() => {
    const update = () => {
      const raw = getTimeGreeting();
      setGreeting({ ...raw, Icon: iconComponents[raw.iconName] || Sun });
    };
    const interval = setInterval(update, 30000); // Re-check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return greeting;
}

/**
 * Top website announcement banner with dynamic time greeting and inspiring welcome message.
 */
export function TopGreetingBanner() {
  const { salutation, shortMessage, Icon, period } = useTimeGreeting();
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      setCurrentTime(
        d.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside
      className={`top-greeting-banner period-${period}`}
      role="region"
      aria-label="Welcome greeting"
    >
      <div className="top-greeting-inner">
        <div className="top-greeting-left">
          <span className="greeting-badge">
            <Icon size={14} className="greeting-icon" aria-hidden="true" />
            <span className="greeting-salutation">{salutation}!</span>
          </span>
          <span className="greeting-message">
            Welcome to Agni Rural Welfare Society — {shortMessage}
          </span>
        </div>
        <div className="top-greeting-right">
          {currentTime && (
            <span className="greeting-clock" title="Your Local Time">
              <span className="clock-pulse-dot" aria-hidden="true" />
              <span>{currentTime}</span>
            </span>
          )}
          <span className="greeting-motto">Bravery, Unity &amp; Discipline</span>
        </div>
      </div>
    </aside>
  );
}

/**
 * Hero greeting pill component for the main landing page.
 */
export function HeroGreetingPill() {
  const { salutation, shortMessage, Icon, period } = useTimeGreeting();

  return (
    <div
      className={`hero-greeting-pill period-${period}`}
      role="status"
      aria-label={`Greeting: ${salutation}`}
    >
      <span className="hero-greeting-icon-wrapper">
        <Icon size={16} className="hero-greeting-icon" aria-hidden="true" />
      </span>
      <span className="hero-greeting-salutation">{salutation}!</span>
      <span className="hero-greeting-separator" aria-hidden="true">·</span>
      <span className="hero-greeting-text">{shortMessage}</span>
    </div>
  );
}
