/**
 * Thin wrappers around localStorage that never throw — they fail silently
 * if storage is unavailable (private browsing, disabled cookies, etc).
 *
 * Keys are versioned ("_v1") so a future structural change can introduce
 * a new key without colliding with old saved values.
 */

export const KEYS = {
  sci: "sdp_sci_v1",
  theme: "sdp_theme_v1",
  colorMode: "sdp_color_mode_v1",
};

export function load(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function loadSciMode() {
  return load(KEYS.sci) === "1";
}

export function saveSciMode(on) {
  save(KEYS.sci, on ? "1" : "0");
}
