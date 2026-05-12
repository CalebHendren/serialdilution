/**
 * DOM rendering for tubes, plates, problem statement, attempts dots,
 * and inline feedback messages.
 */

import { state } from "./state.js";
import { config } from "./config.js";
import { tubeSVG, arrowSVG, plateSVG } from "./svg.js";
import { formatVol } from "./format.js";

/* The four tube-progression colors live in CSS (theme tokens); the JS
   just hands the SVG generator the corresponding variable name. */
const TUBE_COLOR_VARS = [
  "--tube-color-1",
  "--tube-color-2",
  "--tube-color-3",
  "--tube-color-4",
];

export function renderTubes(problem) {
  const row = document.getElementById("tubesRow");
  row.innerHTML = "";

  const fills = [0.78, 0.68, 0.66, 0.64];

  for (let i = 0; i < 4; i++) {
    const cell = document.createElement("div");
    cell.className = "tube-cell";

    const labelTop = `Tube ${i + 1}`;
    const labelSub = i === 0 ? "Original" : "";

    let diluentBadge = "";
    if (i >= 1) {
      const sv = problem.stepVolumes[i - 1];
      diluentBadge = `
        <span class="diluent" aria-label="${formatVol(sv.diluent)} ${sv.unit} of diluent in this tube before transfer">
          <span class="dil-amt">${formatVol(sv.diluent)} ${sv.unit}</span>
          <span class="dil-tag">diluent</span>
        </span>`;
    }

    const ariaLabel = i === 0
      ? "Tube 1, original undiluted sample"
      : `Tube ${i + 1}, contains ${formatVol(problem.stepVolumes[i - 1].diluent)} ${problem.stepVolumes[i - 1].unit} diluent before transfer`;
    cell.setAttribute("aria-label", ariaLabel);

    cell.innerHTML = `
      ${tubeSVG(fills[i], TUBE_COLOR_VARS[i])}
      <div class="tube-label">
        <span class="tube-name">${labelTop}</span>
        ${labelSub ? `<span class="tube-sub">${labelSub}</span>` : ""}
        ${diluentBadge}
      </div>
    `;
    row.appendChild(cell);

    if (i < 3) {
      const sv = problem.stepVolumes[i];
      const arrowCell = document.createElement("div");
      arrowCell.className = "arrow-cell";
      arrowCell.setAttribute(
        "aria-label",
        `${formatVol(sv.transfer)} ${sv.unit} transferred from tube ${i + 1} to tube ${i + 2}`,
      );
      arrowCell.innerHTML = `
        <div class="arrow-aligner">
          <div class="dilution-arrow" aria-hidden="true">
            ${arrowSVG()}
            <span class="dilution-factor">
              <span class="lbl">transfer</span>
              <span class="amt">${formatVol(sv.transfer)} ${sv.unit}</span>
            </span>
          </div>
        </div>
      `;
      row.appendChild(arrowCell);
    }
  }
}

export function renderPlates(problem) {
  const row = document.getElementById("platesRow");
  row.innerHTML = "";

  const addEmpty = (cls) => {
    const e = document.createElement("div");
    e.className = cls;
    e.setAttribute("aria-hidden", "true");
    row.appendChild(e);
  };

  addEmpty("plate-cell spacer");

  for (let i = 0; i < 3; i++) {
    addEmpty("arrow-spacer");

    const cell = document.createElement("div");
    cell.className = "plate-cell";

    const count = problem.counts[i];
    const vol = problem.plateVolumes[i];
    const countLabel = `${count.toLocaleString("en-US")} colonies`;
    const ariaLabel = `Plate from Tube ${i + 2}: ${count} colonies on ${vol} mL plated.`;

    cell.innerHTML = `
      ${plateSVG(count, i)}
      <div class="plate-info" aria-label="${ariaLabel}">
        <strong>${countLabel}</strong>
        <span class="vol">${vol} mL plated</span>
      </div>
    `;
    row.appendChild(cell);
  }
}

export function renderProblemText() {
  const el = document.getElementById("problemBody");
  el.innerHTML =
    `A bacterial sample in <strong>Tube 1</strong> was serially diluted into <strong>Tubes 2 – 4</strong>. ` +
    `For each step, the labeled <em>transfer volume</em> was moved from one tube into the <em>diluent</em> already present in the next tube. ` +
    `A measured volume from each dilution was then spread onto an agar plate. After incubation, you obtain the colony counts shown below. ` +
    `<strong>What was the original concentration in CFU/mL in Tube 1?</strong>`;
}

export function setAttemptsDots() {
  const total = config.attemptsAllowed;
  const container = document.getElementById("attemptsDots");
  // Rebuild dots so the count matches config.attemptsAllowed.
  if (container.children.length !== total) {
    container.innerHTML = "";
    for (let i = 0; i < total; i++) {
      const dot = document.createElement("span");
      dot.className = "attempt-dot";
      container.appendChild(dot);
    }
  }
  const dots = container.querySelectorAll(".attempt-dot");
  dots.forEach((dot, i) => {
    dot.classList.remove("used", "correct");
    if (i < state.attemptsUsed) dot.classList.add("used");
  });
  const remaining = total - state.attemptsUsed;
  container.setAttribute(
    "aria-label",
    `${remaining} attempt${remaining === 1 ? "" : "s"} remaining`,
  );
}

export function setAllCorrect() {
  const dots = document.querySelectorAll(".attempt-dot");
  dots.forEach(dot => {
    dot.classList.remove("used");
    dot.classList.add("correct");
  });
  document.getElementById("attemptsDots")
    .setAttribute("aria-label", "Correct answer submitted.");
}

export function clearFeedback() {
  document.getElementById("feedbackContainer").innerHTML = "";
}

export function showFeedback(type, message) {
  const c = document.getElementById("feedbackContainer");
  const iconHTML = type === "success"
    ? `<svg class="feedback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 L9 17 L4 12"/></svg>`
    : type === "error"
    ? `<svg class="feedback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M15 9 L9 15 M9 9 L15 15"/></svg>`
    : `<svg class="feedback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 L22 20 H2 Z"/><path d="M12 10 V14 M12 17 V17.01"/></svg>`;
  c.innerHTML = `<div class="feedback ${type}" role="alert">${iconHTML}<div>${message}</div></div>`;
}
