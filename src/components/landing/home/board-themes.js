// The landing board's two looks, as CSS variables the board's classes read: light (the page's) and the app's dark.

export const BOARD_THEMES = {
  light: {
    "--b-frame": "#efeee9",
    "--b-panel": "#fafaf8",
    "--b-rail": "#ffffff",
    "--b-card": "#ffffff",
    "--b-ink": "#111111",
    "--b-ink2": "rgba(0,0,0,0.55)",
    "--b-ink3": "rgba(0,0,0,0.35)",
    "--b-icon": "#71717a",
    "--b-fill": "rgba(0,0,0,0.04)",
    "--b-fill2": "rgba(0,0,0,0.06)",
    "--b-line": "rgba(0,0,0,0.25)",
  },
  dark: {
    "--b-frame": "#141414",
    "--b-panel": "#1e1e1e",
    "--b-rail": "#000000",
    "--b-card": "#1e1e1e",
    "--b-ink": "#ffffff",
    "--b-ink2": "rgba(255,255,255,0.6)",
    "--b-ink3": "rgba(255,255,255,0.4)",
    "--b-icon": "#d4d4d4",
    "--b-fill": "rgba(255,255,255,0.05)",
    "--b-fill2": "rgba(255,255,255,0.08)",
    "--b-line": "rgba(255,255,255,0.4)",
  },
};
