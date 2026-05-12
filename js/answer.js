/**
 * Answer checking + end-of-problem UI transitions.
 */

import { state } from "./state.js";
import { config } from "./config.js";
import { parseAnswer, formatNumber, roundToSigFigs } from "./format.js";
import {
  setAttemptsDots,
  setAllCorrect,
  showFeedback,
} from "./render.js";
import { renderSolution } from "./solution.js";

export function checkAnswer() {
  if (state.finished) return;

  const input = document.getElementById("answerInput");
  const raw = input.value;
  const parsed = parseAnswer(raw);

  if (!isFinite(parsed) || parsed <= 0) {
    showFeedback(
      "warning",
      "Please enter a positive number. You can use commas (e.g., <code>1,500,000</code>) or, in scientific mode, an expression like <code>1.5e6</code>.",
    );
    return;
  }

  const target = state.problem.originalCfuPerMl;
  const targetRounded = roundToSigFigs(target, 3);
  const parsedRounded = roundToSigFigs(parsed, 3);
  const relErr = Math.abs(parsedRounded - targetRounded) / targetRounded;
  const correct = relErr <= config.toleranceFraction;

  state.attemptsUsed++;
  setAttemptsDots();

  if (correct) {
    state.finished = true;
    setAllCorrect();
    showFeedback(
      "success",
      `<strong>Correct!</strong> The original concentration was <span class="math">${formatNumber(targetRounded, state.sciMode)} CFU/mL</span>.`,
    );
    renderSolution(state.problem);
    finishUI();
    return;
  }

  const remaining = config.attemptsAllowed - state.attemptsUsed;
  if (remaining > 0) {
    showFeedback(
      "error",
      `<strong>Not quite.</strong> You have <strong>${remaining} attempt${remaining === 1 ? "" : "s"}</strong> left. ` +
      (remaining === 1
        ? `Hint: be sure you used the <em>countable</em> plate and divided by the volume plated.`
        : `Check whether you used the right plate and the correct total dilution factor.`),
    );
  } else {
    state.finished = true;
    showFeedback(
      "error",
      `<strong>Out of attempts.</strong> The correct answer was <span class="math">${formatNumber(targetRounded, state.sciMode)} CFU/mL</span>. Walk through the worked solution below.`,
    );
    renderSolution(state.problem);
    finishUI();
  }
}

function finishUI() {
  document.getElementById("submitBtn").disabled = true;
  document.getElementById("answerInput").disabled = true;
  // Scroll the solution into view (respects reduced motion).
  // Scroll the container itself rather than its first child: template
  // literals start with whitespace, so `firstChild` would be a text node.
  setTimeout(() => {
    const sol = document.getElementById("solutionContainer");
    if (sol && sol.children.length > 0) {
      sol.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, 100);
}
