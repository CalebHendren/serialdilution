/**
 * Simple 4-function calculator widget. Hidden by default on mobile,
 * auto-shown on desktop. State is local to this module and not
 * persisted across refreshes.
 */

const calc = {
  display: "0",
  previous: null,
  operator: null,
  justEvaluated: false,
  replaceNext: true,
};

function formatCalcNum(n) {
  if (!isFinite(n)) return "Error";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs > 1e12 || abs < 1e-6)) {
    return n.toExponential(6)
      .replace(/(\.\d*?)0+e/, "$1e")
      .replace(/\.e/, "e")
      .replace(/e\+?/, "e");
  }
  return String(parseFloat(n.toPrecision(12)));
}

function calcRender() {
  const root = document.getElementById("calculatorContainer");
  if (root.hidden) return;
  const dispEl = root.querySelector(".calc-display-val");
  const histEl = root.querySelector(".calc-history");
  if (dispEl) dispEl.textContent = calc.display;
  if (histEl) {
    histEl.textContent = (calc.previous !== null && calc.operator)
      ? `${formatCalcNum(calc.previous)} ${calc.operator}`
      : "";
  }
  root.querySelectorAll(".calc-key.op").forEach(btn => {
    btn.classList.toggle(
      "active",
      calc.operator !== null && btn.dataset.op === calc.operator && calc.replaceNext,
    );
  });
}

function calcInputDigit(d) {
  if (calc.justEvaluated) {
    calc.display = (d === ".") ? "0." : d;
    calc.previous = null;
    calc.operator = null;
    calc.justEvaluated = false;
    calc.replaceNext = false;
  } else if (calc.replaceNext) {
    calc.display = (d === ".") ? "0." : d;
    calc.replaceNext = false;
  } else {
    if (d === ".") {
      if (!calc.display.includes(".")) calc.display += ".";
    } else {
      if (calc.display.replace(/[-.]/g, "").length < 14) {
        calc.display = (calc.display === "0") ? d : (calc.display + d);
      }
    }
  }
  calcRender();
}

function calcSetOperator(op) {
  const current = parseFloat(calc.display);
  if (calc.operator !== null && !calc.replaceNext) {
    const r = calcEvaluate(calc.previous, current, calc.operator);
    calc.display = formatCalcNum(r);
    calc.previous = r;
  } else {
    calc.previous = current;
  }
  calc.operator = op;
  calc.replaceNext = true;
  calc.justEvaluated = false;
  calcRender();
}

function calcEvaluate(a, b, op) {
  switch (op) {
    case "+": return a + b;
    case "−": return a - b;
    case "×": return a * b;
    case "/": return b === 0 ? NaN : a / b;
    default: return b;
  }
}

function calcEqual() {
  if (calc.operator === null || calc.previous === null) return;
  const current = parseFloat(calc.display);
  const r = calcEvaluate(calc.previous, current, calc.operator);
  calc.display = formatCalcNum(r);
  calc.previous = null;
  calc.operator = null;
  calc.justEvaluated = true;
  calc.replaceNext = true;
  calcRender();
}

export function calcClear() {
  calc.display = "0";
  calc.previous = null;
  calc.operator = null;
  calc.justEvaluated = false;
  calc.replaceNext = true;
  calcRender();
}

function calcBackspace() {
  if (calc.justEvaluated || calc.replaceNext) {
    calcClear();
    return;
  }
  if (calc.display.length <= 1 ||
      (calc.display.length === 2 && calc.display.startsWith("-"))) {
    calc.display = "0";
    calc.replaceNext = true;
  } else {
    calc.display = calc.display.slice(0, -1);
  }
  calcRender();
}

function calcSignFlip() {
  if (calc.display === "0") return;
  calc.display = calc.display.startsWith("-")
    ? calc.display.slice(1)
    : "-" + calc.display;
  calcRender();
}

export function renderCalculator() {
  const c = document.getElementById("calculatorContainer");
  c.hidden = false;
  c.innerHTML = `
    <div class="calculator" role="region" aria-label="Calculator">
      <div class="calc-header">
        <span class="calc-title">Calculator</span>
        <button type="button" class="calc-close" aria-label="Hide calculator" data-act="close">✕</button>
      </div>
      <div class="calc-history" aria-hidden="true"></div>
      <div class="calc-display" aria-live="polite" aria-atomic="true">
        <span class="calc-display-val">0</span>
      </div>
      <div class="calc-keys">
        <button type="button" class="calc-key fn" data-act="clear" aria-label="Clear">AC</button>
        <button type="button" class="calc-key fn" data-act="sign" aria-label="Toggle sign">±</button>
        <button type="button" class="calc-key fn" data-act="back" aria-label="Backspace">⌫</button>
        <button type="button" class="calc-key op" data-op="/" aria-label="Divide">÷</button>

        <button type="button" class="calc-key" data-digit="7">7</button>
        <button type="button" class="calc-key" data-digit="8">8</button>
        <button type="button" class="calc-key" data-digit="9">9</button>
        <button type="button" class="calc-key op" data-op="×" aria-label="Multiply">×</button>

        <button type="button" class="calc-key" data-digit="4">4</button>
        <button type="button" class="calc-key" data-digit="5">5</button>
        <button type="button" class="calc-key" data-digit="6">6</button>
        <button type="button" class="calc-key op" data-op="−" aria-label="Subtract">−</button>

        <button type="button" class="calc-key" data-digit="1">1</button>
        <button type="button" class="calc-key" data-digit="2">2</button>
        <button type="button" class="calc-key" data-digit="3">3</button>
        <button type="button" class="calc-key op" data-op="+" aria-label="Add">+</button>

        <button type="button" class="calc-key zero" data-digit="0">0</button>
        <button type="button" class="calc-key" data-digit=".">.</button>
        <button type="button" class="calc-key eq" data-act="eq" aria-label="Equals">=</button>
      </div>
    </div>`;

  c.querySelectorAll(".calc-key").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.digit !== undefined) calcInputDigit(btn.dataset.digit);
      else if (btn.dataset.op !== undefined) calcSetOperator(btn.dataset.op);
      else if (btn.dataset.act === "eq") calcEqual();
      else if (btn.dataset.act === "clear") calcClear();
      else if (btn.dataset.act === "back") calcBackspace();
      else if (btn.dataset.act === "sign") calcSignFlip();
    });
  });

  const closeBtn = c.querySelector(".calc-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      clearCalculator();
      const calcBtn = document.getElementById("calculatorBtn");
      if (calcBtn) calcBtn.textContent = "Show calculator";
    });
  }

  calcRender();
  document.body.classList.add("calc-shown");
}

export function clearCalculator() {
  const c = document.getElementById("calculatorContainer");
  c.hidden = true;
  c.innerHTML = "";
  document.body.classList.remove("calc-shown");
}
