/**
 * Problem lifecycle: generate a fresh problem and reset all UI to its
 * starting state.
 */

import { state } from "./state.js";
import { generateProblem } from "./problem.js";
import {
  renderTubes,
  renderPlates,
  renderProblemText,
  setAttemptsDots,
  clearFeedback,
} from "./render.js";
import { clearSolution } from "./solution.js";
import { clearEquation } from "./equation.js";
import { calcClear } from "./calculator.js";

export function newProblem() {
  state.problem = generateProblem();
  state.attemptsUsed = 0;
  state.finished = false;

  document.getElementById("answerInput").value = "";
  document.getElementById("answerInput").disabled = false;
  document.getElementById("submitBtn").disabled = false;
  setAttemptsDots();
  clearFeedback();
  clearSolution();

  // Equation hides on every new problem (matches its "not saved" semantics)
  clearEquation();
  const eqBtn = document.getElementById("equationBtn");
  if (eqBtn) eqBtn.textContent = "Show equation";

  // Calculator state persists across problems within a session — students
  // often want to keep using it. Just clear its display.
  if (!document.getElementById("calculatorContainer").hidden) {
    calcClear();
  }

  renderProblemText();
  renderTubes(state.problem);
  renderPlates(state.problem);
}
