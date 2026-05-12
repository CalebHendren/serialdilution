/**
 * Entry point. Wires every DOM control to its module and kicks off
 * the first problem.
 */

import { state } from "./state.js";
import { config } from "./config.js";
import { loadSciMode, saveSciMode } from "./storage.js";
import { newProblem } from "./lifecycle.js";
import { checkAnswer } from "./answer.js";
import { renderSolution } from "./solution.js";
import { renderEquation, clearEquation } from "./equation.js";
import { renderCalculator, clearCalculator } from "./calculator.js";
import { initTheme, setTheme, toggleMode, THEMES, getCurrentTheme } from "./theme.js";

function applyBranding() {
  if (config.appTitle && config.appTitle !== "Serial Dilution Practice") {
    document.title = config.appTitle;
    const h1Main = document.querySelector("h1");
    if (h1Main) h1Main.textContent = config.appTitle;
  }
  const tagEl = document.getElementById("courseTag");
  if (tagEl) {
    const bits = [];
    if (config.courseName) bits.push(config.courseName);
    if (config.instructorName) bits.push(config.instructorName);
    if (bits.length) {
      tagEl.textContent = bits.join(" · ");
      tagEl.hidden = false;
    }
  }
}

function buildThemeSelect() {
  const select = document.getElementById("themeSelect");
  if (!select) return;

  const lightGroup = document.createElement("optgroup");
  lightGroup.label = "Light";
  const darkGroup = document.createElement("optgroup");
  darkGroup.label = "Dark";

  for (const t of THEMES) {
    const opt = document.createElement("option");
    opt.value = t.key;
    opt.textContent = t.label;
    (t.mode === "dark" ? darkGroup : lightGroup).appendChild(opt);
  }
  select.appendChild(lightGroup);
  select.appendChild(darkGroup);
}

function syncToolbarToTheme({ theme }) {
  const select = document.getElementById("themeSelect");
  if (select && select.value !== theme) select.value = theme;

  const toggleBtn = document.getElementById("modeToggleBtn");
  if (toggleBtn) {
    const isDark = document.documentElement.getAttribute("data-color-mode") === "dark";
    toggleBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
  }
}

function init() {
  applyBranding();
  buildThemeSelect();

  const initial = initTheme(syncToolbarToTheme);
  syncToolbarToTheme({ theme: initial.theme });

  state.sciMode = loadSciMode();

  const sciCheckbox = document.getElementById("sciCheckbox");
  const sciToggleEl = document.getElementById("sciToggle");
  sciCheckbox.checked = state.sciMode;
  if (state.sciMode) sciToggleEl.classList.add("on");

  sciCheckbox.addEventListener("change", () => {
    state.sciMode = sciCheckbox.checked;
    saveSciMode(state.sciMode);
    sciToggleEl.classList.toggle("on", state.sciMode);
    if (state.problem && state.finished) {
      renderSolution(state.problem);
    }
    document.getElementById("answerInput").placeholder =
      state.sciMode ? "e.g., 1.5e6" : "e.g., 1,500,000";
  });
  document.getElementById("answerInput").placeholder =
    state.sciMode ? "e.g., 1.5e6" : "e.g., 1,500,000";

  document.getElementById("newProblemBtn").addEventListener("click", newProblem);
  document.getElementById("submitBtn").addEventListener("click", checkAnswer);

  document.getElementById("answerInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!state.finished) checkAnswer();
    }
  });

  // Equation toggle
  const eqBtn = document.getElementById("equationBtn");
  eqBtn.addEventListener("click", () => {
    const c = document.getElementById("equationContainer");
    if (c.hidden) {
      renderEquation();
      eqBtn.textContent = "Hide equation";
    } else {
      clearEquation();
      eqBtn.textContent = "Show equation";
    }
  });

  // Calculator toggle
  const calcBtn = document.getElementById("calculatorBtn");
  calcBtn.addEventListener("click", () => {
    const c = document.getElementById("calculatorContainer");
    if (c.hidden) {
      renderCalculator();
      calcBtn.textContent = "Hide calculator";
    } else {
      clearCalculator();
      calcBtn.textContent = "Show calculator";
    }
  });

  // Theme selector
  const themeSelect = document.getElementById("themeSelect");
  if (themeSelect) {
    themeSelect.value = getCurrentTheme();
    themeSelect.addEventListener("change", () => {
      setTheme(themeSelect.value);
    });
  }

  // Light/dark mode toggle
  const modeBtn = document.getElementById("modeToggleBtn");
  if (modeBtn) {
    modeBtn.addEventListener("click", toggleMode);
  }

  // Auto-show on desktop (per config)
  const isDesktop = window.matchMedia("(min-width: 721px)").matches;
  if (isDesktop && config.showCalculatorOnDesktop) {
    renderCalculator();
    calcBtn.textContent = "Hide calculator";
  }

  newProblem();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
