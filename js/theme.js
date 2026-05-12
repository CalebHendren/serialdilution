/**
 * Theme + color-mode controller.
 *
 * Two concepts:
 *   - `theme`      → one of the six named themes (e.g. "lab-paper").
 *                    Drives [data-theme] on <html> and the look of the page.
 *   - `colorMode`  → "light" | "dark" | "system". When "system" we resolve
 *                    via prefers-color-scheme and continue listening for
 *                    changes. The resolved value is written to
 *                    [data-color-mode] on <html> so browser-native widgets
 *                    (scrollbars, native form controls) match.
 *
 * Themes are paired so the light/dark toggle has a sensible partner:
 *   lab-paper   ↔ lab-slate
 *   clean-slate ↔ midnight
 *   hc-light    ↔ hc-dark
 */

import { config } from "./config.js";
import { KEYS, load, save } from "./storage.js";

export const THEMES = [
  { key: "lab-paper",   label: "Lab Paper",     mode: "light" },
  { key: "clean-slate", label: "Clean Slate",   mode: "light" },
  { key: "hc-light",    label: "High Contrast (AAA)", mode: "light" },
  { key: "lab-slate",   label: "Lab Slate",     mode: "dark"  },
  { key: "midnight",    label: "Midnight",      mode: "dark"  },
  { key: "hc-dark",     label: "High Contrast (AAA)", mode: "dark"  },
];

const PAIRS = {
  "lab-paper":   "lab-slate",
  "lab-slate":   "lab-paper",
  "clean-slate": "midnight",
  "midnight":    "clean-slate",
  "hc-light":    "hc-dark",
  "hc-dark":     "hc-light",
};

const THEME_KEYS = new Set(THEMES.map(t => t.key));

function modeOf(themeKey) {
  return THEMES.find(t => t.key === themeKey)?.mode ?? "light";
}

function resolveSystemMode() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function defaultThemeForMode(mode) {
  if (config.defaultTheme && modeOf(config.defaultTheme) === mode) {
    return config.defaultTheme;
  }
  return mode === "dark" ? "lab-slate" : "lab-paper";
}

/**
 * Compute the theme + mode to apply on first load.
 * Honors any saved values; otherwise falls back to config defaults.
 */
function resolveInitial() {
  const savedTheme = load(KEYS.theme);
  const savedMode  = load(KEYS.colorMode);

  if (savedTheme && THEME_KEYS.has(savedTheme)) {
    return { theme: savedTheme, mode: modeOf(savedTheme), source: "saved" };
  }

  const desired = savedMode || config.defaultColorMode || "system";
  const resolvedMode = desired === "system" ? resolveSystemMode() : desired;
  return {
    theme: defaultThemeForMode(resolvedMode),
    mode: resolvedMode,
    source: desired === "system" ? "system" : "config",
  };
}

let currentTheme = null;
let currentMode = null;
let listeningToSystem = false;
let onChangeCb = null;

function applyToDOM(theme, mode) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-color-mode", mode);
}

function announce(theme) {
  const announcer = document.getElementById("themeAnnouncer");
  if (announcer) {
    const label = THEMES.find(t => t.key === theme)?.label ?? theme;
    announcer.textContent = `Theme: ${label}`;
  }
}

export function setTheme(themeKey, { announce: shouldAnnounce = true } = {}) {
  if (!THEME_KEYS.has(themeKey)) return;
  currentTheme = themeKey;
  currentMode = modeOf(themeKey);
  applyToDOM(currentTheme, currentMode);
  save(KEYS.theme, currentTheme);
  save(KEYS.colorMode, currentMode);
  if (shouldAnnounce) announce(currentTheme);
  if (onChangeCb) onChangeCb({ theme: currentTheme, mode: currentMode });
}

export function toggleMode() {
  const partner = PAIRS[currentTheme] || defaultThemeForMode(currentMode === "dark" ? "light" : "dark");
  setTheme(partner);
}

export function getCurrentTheme() { return currentTheme; }
export function getCurrentMode()  { return currentMode; }

/**
 * Initialize theme system. Must be called once on startup.
 * `onChange` receives `{ theme, mode }` whenever the theme changes
 * (used to keep the toolbar's select/toggle in sync).
 */
export function initTheme(onChange) {
  onChangeCb = onChange || null;
  const { theme, mode, source } = resolveInitial();
  currentTheme = theme;
  currentMode = mode;
  applyToDOM(theme, mode);

  // If we're following the system pref (no saved choice yet), keep
  // listening so a mid-session OS change flips the page.
  if (source === "system") {
    listeningToSystem = true;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (!listeningToSystem) return;
      // Only react if user still has no saved theme.
      if (load(KEYS.theme)) {
        listeningToSystem = false;
        return;
      }
      const newMode = e.matches ? "dark" : "light";
      const newTheme = defaultThemeForMode(newMode);
      currentTheme = newTheme;
      currentMode = newMode;
      applyToDOM(newTheme, newMode);
      if (onChangeCb) onChangeCb({ theme: newTheme, mode: newMode });
    };
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else if (mq.addListener) mq.addListener(handler); // older Safari
  }

  return { theme, mode };
}
