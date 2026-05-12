/**
 * Runtime-generated SVG: dilution tubes, transfer arrows, petri dishes.
 *
 * Colors are referenced via CSS custom properties so the same SVG
 * markup re-themes automatically when [data-theme] changes on <html>.
 * Inline `style="fill: var(--name)"` and `stroke="var(--name)"` both
 * work when the SVG is injected via innerHTML.
 */

import { mulberry32 } from "./utils.js";

/**
 * Draw a single dilution tube.
 *   fillLevel: 0..1 — how full the tube looks
 *   colorVar:  CSS variable name for the liquid color (e.g. "--tube-color-1")
 */
export function tubeSVG(fillLevel = 0.62, colorVar = "--tube-color-1") {
  const interiorTop = 9;
  const interiorBottom = 141;
  const liquidTop = interiorTop + (1 - fillLevel) * (interiorBottom - interiorTop);
  const uid = Math.random().toString(36).slice(2, 9);

  return `
    <svg class="tube-svg" viewBox="0 0 60 150" aria-hidden="true">
      <defs>
        <clipPath id="tubeClip-${uid}">
          <path d="M 13 9 L 13 121 Q 13 141 30 141 Q 47 141 47 121 L 47 9 Z"/>
        </clipPath>
      </defs>
      <ellipse cx="30" cy="146" rx="14" ry="3" style="fill: var(--tube-shadow)"/>
      <path d="M 12 8 L 12 122 Q 12 142 30 142 Q 48 142 48 122 L 48 8 Z"
            style="fill: var(--tube-glass-fill); stroke: var(--tube-glass-stroke)"
            stroke-width="1.5"
            stroke-linejoin="round"/>
      <rect x="10" y="${liquidTop.toFixed(2)}" width="40" height="${(150 - liquidTop).toFixed(2)}"
            style="fill: var(${colorVar})"
            fill-opacity="0.55"
            clip-path="url(#tubeClip-${uid})"/>
      <ellipse cx="30" cy="${liquidTop.toFixed(2)}" rx="17" ry="2.5"
               style="fill: var(${colorVar})"
               fill-opacity="0.85"/>
      <path d="M 16 16 L 16 110"
            style="stroke: var(--tube-glass-highlight)"
            stroke-width="2" stroke-linecap="round" fill="none"/>
      <ellipse cx="30" cy="8" rx="18" ry="3.5" fill="none"
               style="stroke: var(--tube-glass-stroke)"
               stroke-width="1.5"/>
      <ellipse cx="30" cy="8" rx="15" ry="2" style="fill: var(--tube-rim-shadow)"/>
    </svg>`;
}

export function arrowSVG() {
  return `<svg viewBox="0 0 30 14" fill="none" aria-hidden="true">
    <path d="M2 7 H26 M21 2 L26 7 L21 12" stroke="currentColor"
          stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

/**
 * Draw a petri dish with `n` colonies scattered.
 * For very large counts (> ~500), draw a "lawn" texture instead of dots,
 * since rendering thousands of dots is slow and visually unhelpful.
 */
export function plateSVG(n, plateIdx) {
  const W = 130, cx = W / 2, cy = W / 2, R = 56;
  const seed = plateIdx * 1000 + n;
  const rng = mulberry32(seed);

  let colonies = "";
  const isLawn = n > 500;
  const renderCount = isLawn ? 0 : Math.min(n, 400);

  for (let i = 0; i < renderCount; i++) {
    const u = rng();
    const r = Math.sqrt(u) * (R - 6);
    const theta = rng() * Math.PI * 2;
    const x = cx + r * Math.cos(theta);
    const y = cy + r * Math.sin(theta);
    const sz = 1.4 + rng() * 1.2;
    const op = 0.78 + rng() * 0.22;
    colonies += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${sz.toFixed(1)}" style="fill: var(--colony-fill); stroke: var(--colony-stroke)" stroke-width="0.4" fill-opacity="${op.toFixed(2)}"/>`;
  }

  const lawnOverlay = isLawn
    ? `<circle cx="${cx}" cy="${cy}" r="${R - 6}" style="fill: var(--colony-fill)" fill-opacity="0.85"/>
       <circle cx="${cx}" cy="${cy}" r="${R - 6}" fill="url(#lawnPattern${plateIdx})" fill-opacity="0.6"/>`
    : "";

  return `
    <svg class="plate-svg" viewBox="0 0 ${W} ${W}" aria-hidden="true">
      <defs>
        <radialGradient id="agarGrad${plateIdx}" cx="40%" cy="40%" r="60%">
          <stop offset="0%" style="stop-color: var(--agar-grad-1)"/>
          <stop offset="100%" style="stop-color: var(--agar-grad-2)"/>
        </radialGradient>
        <pattern id="lawnPattern${plateIdx}" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" style="fill: var(--colony-fill)" fill-opacity="0.8"/>
          <circle cx="5" cy="4" r="1.0" style="fill: var(--colony-fill)" fill-opacity="0.7"/>
        </pattern>
      </defs>
      <ellipse cx="${cx}" cy="${cy + R + 4}" rx="${R}" ry="4" style="fill: var(--dish-shadow)"/>
      <circle cx="${cx}" cy="${cy}" r="${R + 2}" style="fill: var(--plate-wall-fill); stroke: var(--plate-wall-stroke)" stroke-width="1"/>
      <circle cx="${cx}" cy="${cy}" r="${R - 2}" fill="url(#agarGrad${plateIdx})"/>
      <ellipse cx="${cx - R * 0.35}" cy="${cy - R * 0.35}" rx="${R * 0.4}" ry="${R * 0.18}" style="fill: var(--agar-shine)"/>
      ${lawnOverlay}
      ${colonies}
    </svg>`;
}
