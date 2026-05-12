/**
 * Serial Dilution Practice — Instructor Configuration
 * ----------------------------------------------------
 * Edit the values below to tune the app for your course.
 *
 * No build step is required — save this file, reload the browser, and the
 * app picks up the new settings. Anything you leave undefined falls back
 * to the in-app defaults (see js/config.js), so it's safe to remove keys
 * you don't care about.
 *
 * The full set of theme keys is:
 *   Light  →  "lab-paper", "clean-slate", "hc-light"
 *   Dark   →  "lab-slate", "midnight",    "hc-dark"
 * "hc-light" and "hc-dark" meet WCAG 2.1 AAA contrast.
 */
export default {
  // ============================================================
  // Branding (optional — leave as "" to hide)
  // ============================================================
  appTitle: "Serial Dilution Practice",
  courseName: "",        // e.g. "BIOL 2420 — Preliminary Microbiology"
  instructorName: "",    // e.g. "Dr. R. Koch"

  // ============================================================
  // Gameplay
  // ============================================================
  // How many guesses students get before the worked solution reveals.
  attemptsAllowed: 3,

  // Accept answers within ± this fraction of the true value.
  // 0.02 = ±2%. Bump to 0.05 for early-semester forgiveness.
  toleranceFraction: 0.02,

  // The "countable" colony range on a plate. Plates outside this are
  // labeled TFTC (too few) or TNTC (too many) — students must identify
  // the countable plate themselves.
  countableRange: [30, 300],

  // ============================================================
  // Problem generation
  // ============================================================
  // Fraction of problems where every step is 1/10 or 1/100 (a clean
  // log-decade series). The rest use the mixed factorPool below.
  cleanLogProbability: 0.75,

  // Dilution factors used when a problem goes "mixed". Higher weight =
  // appears more often. The exact `factor` value must match the `label`
  // (label is what students see).
  factorPool: [
    { factor: 1 / 10,  label: "1/10",  weight: 40 },
    { factor: 1 / 100, label: "1/100", weight: 25 },
    { factor: 1 / 5,   label: "1/5",   weight: 18 },
    { factor: 1 / 2,   label: "1/2",   weight: 15 },
    { factor: 2 / 3,   label: "2/3",   weight: 6  },
  ],

  // Plated volumes (mL) and how often each is chosen.
  // 0.1 and 0.5 mL are typical spread-plate volumes; 1.0 mL is rarer.
  volumePool: [
    { value: 0.1, weight: 50 },
    { value: 0.5, weight: 45 },
    { value: 1.0, weight: 5  },
  ],

  // The unit used across all three dilution steps in a problem (µL or mL).
  // All steps share one unit per problem so the numbers are consistent.
  unitPool: [
    { value: "µL", weight: 60 },
    { value: "mL", weight: 40 },
  ],

  // For each dilution factor, the realistic [transfer, diluent] volume
  // pairs that satisfy transfer / (transfer + diluent) = factor.
  // Keep the units consistent within each block.
  stepVolumes: {
    "µL": {
      "1/10":  [[100, 900], [10, 90], [200, 1800], [50, 450]],
      "1/100": [[10, 990], [100, 9900]],
      "1/5":   [[100, 400], [200, 800], [50, 200]],
      "1/2":   [[500, 500], [100, 100], [200, 200], [1000, 1000]],
      "2/3":   [[200, 100], [400, 200], [1000, 500]],
    },
    "mL": {
      "1/10":  [[1, 9], [0.5, 4.5], [2, 18]],
      "1/100": [[0.1, 9.9], [1, 99]],
      "1/5":   [[1, 4], [2, 8]],
      "1/2":   [[1, 1], [0.5, 0.5], [2, 2]],
      "2/3":   [[2, 1], [1, 0.5]],
    },
  },

  // ============================================================
  // Appearance defaults
  // ============================================================
  // First-load theme if the student has not picked one yet.
  // One of: lab-paper, clean-slate, hc-light, lab-slate, midnight, hc-dark
  defaultTheme: "lab-paper",

  // First-load color mode: "light", "dark", or "system".
  // "system" follows the student's OS preference.
  defaultColorMode: "system",

  // Whether the calculator opens automatically on desktop. Students can
  // still toggle it on mobile; this only affects desktop's auto-show.
  showCalculatorOnDesktop: true,
};
