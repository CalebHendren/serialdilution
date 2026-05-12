/**
 * Number formatting + parsing helpers used throughout the UI and
 * solution rendering. Handles scientific notation, sig-fig rounding,
 * comma grouping, Unicode superscript exponents, and fraction display.
 */

export function toSuperscript(num) {
  const map = {
    "-": "⁻", "+": "", "0": "⁰", "1": "¹", "2": "²", "3": "³",
    "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  };
  return String(num).split("").map(c => map[c] ?? c).join("");
}

export function roundToSigFigs(n, sig) {
  if (n === 0) return 0;
  const d = Math.ceil(Math.log10(Math.abs(n)));
  const power = sig - d;
  const factor = Math.pow(10, power);
  return Math.round(n * factor) / factor;
}

export function formatNumber(n, sciMode, sigFigs = 3) {
  if (!isFinite(n)) return "—";

  if (sciMode) {
    const exp = n.toExponential(sigFigs - 1);
    const m = exp.match(/^(-?\d+(?:\.\d+)?)e([+-]?\d+)$/);
    if (!m) return exp;
    const mantissa = m[1];
    const exponent = parseInt(m[2], 10);
    return `${mantissa} × 10${toSuperscript(exponent)}`;
  }

  const rounded = roundToSigFigs(n, sigFigs);
  if (rounded >= 1000) {
    return Math.round(rounded).toLocaleString("en-US");
  }
  return rounded.toLocaleString("en-US", { maximumFractionDigits: 3 });
}

/**
 * Parse a user-entered answer. Accepts: plain "1200000", "1,200,000",
 * "1.2e6", "1.2 × 10^6", "1.2 x 10^6", "1.2*10^6". Sci forms work even
 * when sci mode is off.
 */
export function parseAnswer(raw) {
  if (typeof raw !== "string") return NaN;
  let s = raw.trim();
  if (!s) return NaN;
  s = s.replace(/,/g, "").replace(/\s+/g, "");
  s = s.replace(/×10\^?/gi, "e").replace(/x10\^?/gi, "e").replace(/\*10\^?/gi, "e");
  s = s.replace(/E/g, "e");
  return Number(s);
}

/**
 * Format a transfer/diluent volume — strips trailing zeros after the
 * decimal point ("9.0" → "9"), keeps significant decimals.
 */
export function formatVol(v) {
  if (Number.isInteger(v)) return v.toLocaleString("en-US");
  return parseFloat(v.toFixed(3)).toLocaleString("en-US", {
    maximumFractionDigits: 3,
  });
}

/**
 * If `intVal` is a clean power of 10 (10, 100, 1000, …), return its
 * exponent. Otherwise return null.
 */
export function powerOfTenExponent(intVal) {
  if (intVal <= 0) return null;
  const log = Math.log10(intVal);
  const r = Math.round(log);
  if (Math.abs(log - r) < 1e-9 && Math.pow(10, r) === intVal) return r;
  return null;
}

/**
 * Format a stepwise dilution label for use in a "× FACTOR" context.
 * In sci mode, drops the redundant "1 ×" mantissa: "× 1 × 10⁻²" →
 * "× 10⁻²".
 */
export function formatStepLabel(lbl, sci) {
  if (!sci) return lbl;
  const [n, d] = lbl.split("/").map(Number);
  if (n === 1) {
    const exp = powerOfTenExponent(d);
    if (exp !== null && exp > 0) {
      return `10${toSuperscript(-exp)}`;
    }
  }
  return lbl;
}

/**
 * Format a fraction for standalone display (e.g. solution-table cells).
 * Power-of-ten denominators become "1 × 10⁻ⁿ" in sci mode.
 */
export function formatFractionForSolution(num, den, sci) {
  if (sci && num === 1) {
    const exp = powerOfTenExponent(den);
    if (exp !== null && exp > 0) {
      return `1 × 10${toSuperscript(-exp)}`;
    }
  }
  const denStr = den.toLocaleString("en-US");
  if (num === 1) return `1/${denStr}`;
  return `${num}/${denStr}`;
}

/**
 * Format a plain number, sci-mode aware. Small integers (<1000) stay
 * plain; larger values use scientific notation when sci mode is on.
 */
export function formatPlainNumber(n, sci) {
  if (!sci) return n.toLocaleString("en-US");
  const isInteger = Math.abs(n - Math.round(n)) < 1e-9;
  const r = Math.round(n);
  if (isInteger && r < 1000) return r.toLocaleString("en-US");
  return formatNumber(n, true);
}
