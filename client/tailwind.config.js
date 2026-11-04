export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        elevated: "var(--surface-elevated)",
        border: "var(--border)",
        text: "var(--text)",
        muted: "var(--text-muted)",
        primary: "var(--primary)",
        accent: "var(--accent)",
        success: "var(--success)",
        danger: "var(--danger)",
        info: "var(--info-text)",
        warning: "var(--warning-text)",
        registrationBorder: "var(--registration-border)",
      },
    },
  },
  plugins: [],
};
