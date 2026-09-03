/**
 * Centralized design tokens for the portfolio desktop environment.
 * 
 * Strict rule: All visual components must derive colors, spacing, borders,
 * shadows, and timing from these tokens to avoid arbitrary magic values scattered in JSX.
 */

export const tokens = {
  surfaces: {
    desktop: "#090b10",
    surface: "#10141d",
    surfaceRaised: "#151a24",
    surfaceOverlay: "#1a202c",
    surfaceHover: "rgba(255, 255, 255, 0.05)",
    surfaceActive: "rgba(255, 255, 255, 0.08)",
    surfaceSelected: "rgba(106, 152, 255, 0.12)",
    taskbar: "rgba(13, 16, 23, 0.88)",
    window: "rgba(16, 20, 29, 0.96)",
    windowHeader: "rgba(19, 24, 35, 0.98)",
    chip: "rgba(255, 255, 255, 0.04)",
  },
  borders: {
    subtle: "rgba(255, 255, 255, 0.06)",
    default: "rgba(255, 255, 255, 0.11)",
    highlight: "rgba(255, 255, 255, 0.18)",
    focus: "rgba(106, 152, 255, 0.65)",
    selected: "rgba(106, 152, 255, 0.4)",
  },
  text: {
    primary: "#eef1f8",
    secondary: "#a3acc2",
    muted: "#66728a",
    subtle: "#485368",
    inverse: "#090b10",
  },
  accent: {
    base: "#6a98ff",
    hover: "#82aaff",
    muted: "rgba(106, 152, 255, 0.14)",
    border: "rgba(106, 152, 255, 0.32)",
    glow: "rgba(106, 152, 255, 0.25)",
  },
  status: {
    online: "#34d399",
    idle: "#fbbf24",
    muted: "#64748b",
  },
  shadows: {
    sm: "0 1px 2px rgba(0, 0, 0, 0.4)",
    md: "0 4px 12px rgba(0, 0, 0, 0.5)",
    lg: "0 12px 32px rgba(0, 0, 0, 0.65)",
    window: "0 24px 64px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.08)",
    windowActive: "0 28px 72px -8px rgba(0, 0, 0, 0.82), 0 0 0 1px rgba(106, 152, 255, 0.25)",
    taskbar: "0 -4px 20px rgba(0, 0, 0, 0.45), 0 -1px 0 rgba(255, 255, 255, 0.06)",
    iconSelected: "0 0 0 1px rgba(106, 152, 255, 0.4), 0 4px 16px rgba(0, 0, 0, 0.4)",
  },
  radius: {
    xs: "4px",
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },
  timing: {
    fast: "150ms cubic-bezier(0.16, 1, 0.3, 1)",
    normal: "220ms cubic-bezier(0.16, 1, 0.3, 1)",
    smooth: "320ms cubic-bezier(0.16, 1, 0.3, 1)",
  },
} as const;

export type DesignTokens = typeof tokens;
