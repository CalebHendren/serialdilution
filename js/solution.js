/**
 * Worked-solution renderer. Builds a five-step walkthrough:
 *   1. Derive each stepwise dilution from the labeled volumes
 *   2. Multiply across to get the total dilution per tube
 *   3. Identify the countable plate
 *   4. Plug into the formula
 *   5. Solve
 */

import { state } from "./state.js";
import { config, MIN_COUNTABLE, MAX_COUNTABLE } from "./config.js";
import { gcd } from "./utils.js";
import {
  formatNumber,
  formatVol,
  formatStepLabel,
  formatFractionForSolution,
  formatPlainNumber,
  roundToSigFigs,
} from "./format.js";
import { newProblem } from "./lifecycle.js";

export function renderSolution(problem) {
  const c = document.getElementById("solutionContainer");
  const sci = state.sciMode;

  const sIdx = problem.solutionPlateIdx;
  const tubeIdx = sIdx + 2;
  const colonies = problem.counts[sIdx];
  const vol = problem.plateVolumes[sIdx];

  // Cumulative dilution as exact fractions (no float drift) by multiplying
  // numerator/denominator integers from each step's "p/q" label.
  const totalsByStep = [];
  let runNum = 1, runDen = 1;
  for (let i = 0; i < problem.stepLabels.length; i++) {
    const [n, d] = problem.stepLabels[i].split("/").map(Number);
    runNum *= n;
    runDen *= d;
    const g = gcd(runNum, runDen);
    totalsByStep.push({ num: runNum / g, den: runDen / g });
  }

  const derivationRows = problem.stepVolumes.map((sv, i) => {
    const total = sv.transfer + sv.diluent;
    const factorDisplay = formatStepLabel(problem.stepLabels[i], sci);
    return `
      <li class="deriv-step">
        <div class="deriv-pair">
          <span class="deriv-label">Tube ${i + 1} <span aria-hidden="true">→</span> Tube ${i + 2}</span>
        </div>
        <div class="deriv-math">
          <span class="deriv-frac" aria-label="${formatVol(sv.transfer)} ${sv.unit} transferred over ${formatVol(total)} ${sv.unit} total">
            <span class="num">${formatVol(sv.transfer)} ${sv.unit}</span>
            <span class="den">${formatVol(sv.transfer)} ${sv.unit} + ${formatVol(sv.diluent)} ${sv.unit}</span>
          </span>
          <span class="deriv-eq" aria-hidden="true">=</span>
          <span class="deriv-frac">
            <span class="num">${formatVol(sv.transfer)}</span>
            <span class="den">${formatVol(total)}</span>
          </span>
          <span class="deriv-eq" aria-hidden="true">=</span>
          <span class="deriv-result">${factorDisplay}</span>
        </div>
      </li>`;
  }).join("");

  const tubeRows = [];
  tubeRows.push(`
    <tr class="dil-row">
      <th scope="row" class="dil-rowhead">
        <span class="dil-tube-num">Tube 1</span>
        <span class="dil-tube-tag">Original</span>
      </th>
      <td class="dil-cell stepwise">
        <span class="dil-dash" aria-label="no dilution applied">—</span>
      </td>
      <td class="dil-cell total">
        <span class="dil-value">1</span>
        <span class="dil-tube-tag" style="margin-left: 0.5rem;">undiluted</span>
      </td>
    </tr>`);
  for (let i = 0; i < 3; i++) {
    const stepLbl = formatStepLabel(problem.stepLabels[i], sci);
    const t = totalsByStep[i];
    const totalValue = formatFractionForSolution(t.num, t.den, sci);
    const chain = problem.stepLabels.slice(0, i + 1)
      .map(l => formatStepLabel(l, sci))
      .join(' <span class="dil-times" aria-hidden="true">×</span> ');
    const totalCellInner = (i === 0)
      ? `<span class="dil-value">${totalValue}</span>`
      : `<span class="dil-multiplication">${chain}</span>
         <span class="dil-equals" aria-hidden="true">=</span>
         <span class="dil-value">${totalValue}</span>`;
    tubeRows.push(`
      <tr class="dil-row">
        <th scope="row" class="dil-rowhead">
          <span class="dil-tube-num">Tube ${i + 2}</span>
        </th>
        <td class="dil-cell stepwise">
          <span class="dil-times-prefix" aria-hidden="true">×</span>
          <span class="dil-value">${stepLbl}</span>
        </td>
        <td class="dil-cell total">
          ${totalCellInner}
        </td>
      </tr>`);
  }

  const tubeTotals = totalsByStep[tubeIdx - 2];
  const totalDilutionLabel = formatFractionForSolution(tubeTotals.num, tubeTotals.den, sci);
  const reciprocal = tubeTotals.den / tubeTotals.num;
  const reciprocalLabel = formatPlainNumber(reciprocal, sci);

  const result = (colonies * reciprocal) / vol;
  const displayResult = roundToSigFigs(result, 3);
  const fmt = (n) => formatNumber(n, sci);
  const volLabel = `${vol} mL`;

  c.innerHTML = `
    <div class="solution" role="region" aria-labelledby="solutionHead">
      <div class="solution-header">
        <h3 id="solutionHead">Worked solution</h3>
        <button type="button" class="btn btn-ghost" id="newProblemFromSolution">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8a5 5 0 0 1 8.5-3.5L13 6"/><path d="M13 2v4h-4"/><path d="M13 8a5 5 0 0 1-8.5 3.5L3 10"/><path d="M3 14v-4h4"/></svg>
          Try another
        </button>
      </div>

      <div class="solution-answer">
        Original concentration in Tube 1 = <strong>${fmt(displayResult)} CFU/mL</strong>
      </div>

      <div class="step">
        <span class="step-num">1</span>
        <div class="step-title">Find each stepwise dilution from the volumes</div>
        <div class="step-body">
          For each transfer, the dilution factor is the volume of sample moved divided by the total final volume in the receiving tube (transfer + diluent already there):
          <ul class="deriv-list">
            ${derivationRows}
          </ul>
        </div>
      </div>

      <div class="step">
        <span class="step-num">2</span>
        <div class="step-title">Multiply across to get the total dilution at each tube</div>
        <div class="step-body">
          Each stepwise dilution multiplies the next. The total dilution at any tube is the product of every stepwise factor up to that tube:
          <div class="dil-table-wrap">
            <table class="dil-table" aria-label="Stepwise and total dilution at each tube">
              <thead>
                <tr>
                  <th scope="col" class="dil-colhead"></th>
                  <th scope="col" class="dil-colhead">Stepwise dilution</th>
                  <th scope="col" class="dil-colhead">Total dilution</th>
                </tr>
              </thead>
              <tbody>
                ${tubeRows.join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="step">
        <span class="step-num">3</span>
        <div class="step-title">Identify the countable plate</div>
        <div class="step-body">
          The countable plate (between ${MIN_COUNTABLE} and ${MAX_COUNTABLE} colonies) is the one from
          <strong>Tube ${tubeIdx}</strong>: <span class="math">${colonies.toLocaleString("en-US")}</span> colonies on <span class="math">${volLabel}</span> plated.
          That tube has a total dilution of <span class="math">${totalDilutionLabel}</span>.
        </div>
      </div>

      <div class="step">
        <span class="step-num">4</span>
        <div class="step-title">Plug into the formula</div>
        <div class="step-body">
          <span class="math">CFU/mL = (colonies × reciprocal of total dilution) / volume plated</span><br>
          <span class="math">CFU/mL = (${colonies.toLocaleString("en-US")} × ${reciprocalLabel}) / ${vol}</span>
        </div>
      </div>

      <div class="step">
        <span class="step-num">5</span>
        <div class="step-title">Solve</div>
        <div class="step-body">
          <span class="math">CFU/mL = ${formatPlainNumber(colonies * reciprocal, sci)} / ${vol}</span><br>
          <span class="math">CFU/mL = ${fmt(displayResult)}</span>
        </div>
      </div>
    </div>
  `;

  const tryAnotherBtn = document.getElementById("newProblemFromSolution");
  if (tryAnotherBtn) {
    tryAnotherBtn.addEventListener("click", newProblem);
  }
}

export function clearSolution() {
  document.getElementById("solutionContainer").innerHTML = "";
}
