/**
 * Loads the instructor-facing config from ../config.js, fills in any
 * missing keys with sane defaults, and re-exports a frozen object that
 * the rest of the app imports.
 */
import userConfig from "../config.js";

const DEFAULTS = {
  appTitle: "Serial Dilution Practice",
  courseName: "",
  instructorName: "",

  attemptsAllowed: 3,
  toleranceFraction: 0.02,
  countableRange: [30, 300],

  cleanLogProbability: 0.75,

  factorPool: [
    { factor: 1 / 10,  label: "1/10",  weight: 40 },
    { factor: 1 / 100, label: "1/100", weight: 25 },
    { factor: 1 / 5,   label: "1/5",   weight: 18 },
    { factor: 1 / 2,   label: "1/2",   weight: 15 },
    { factor: 2 / 3,   label: "2/3",   weight: 6  },
  ],

  volumePool: [
    { value: 0.1, weight: 50 },
    { value: 0.5, weight: 45 },
    { value: 1.0, weight: 5  },
  ],

  unitPool: [
    { value: "µL", weight: 60 },
    { value: "mL", weight: 40 },
  ],

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

  defaultTheme: "lab-paper",
  defaultColorMode: "system",
  showCalculatorOnDesktop: true,
};

const merged = { ...DEFAULTS, ...(userConfig || {}) };

export const config = Object.freeze(merged);
export const [MIN_COUNTABLE, MAX_COUNTABLE] = config.countableRange;
