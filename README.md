# Serial Dilution Practice

An interactive web app for microbiology students to practice calculating original concentrations (CFU/mL) from serial dilution plate counts. Built for classroom use in a Preliminary Microbiology course.

## What it does

Each problem presents four test tubes — Tube 1 holds the original sample, Tubes 2–4 are stepwise dilutions — along with three petri dishes showing colony counts from each dilution. Students work backward from the countable plate (30–300 colonies) through the dilution series to find the concentration in the original tube.

The dilution factors aren't given. Students determine them from the labeled transfer and diluent volumes shown between tubes. For example, transferring 100 µL into 900 µL of diluent is a 1/10 dilution — students need to recognize that themselves.

Students get three attempts per problem (configurable). After a correct answer or three wrong attempts, the app reveals a worked solution showing each stepwise dilution, the cumulative total at each tube, identification of the countable plate, and the final calculation.

## Quick start

```
# From the repo root, serve over http (modules need it):
python3 -m http.server 8000
# Then open http://localhost:8000
```

Deploys unchanged to GitHub Pages — push the repo and enable Pages from `main`.

## Configuring the app (instructors)

Open `config.js` in the repo root. Every classroom-relevant knob lives there:

| Key | What it does |
|---|---|
| `appTitle` | Page title and header. Defaults to "Serial Dilution Practice". |
| `courseName` / `instructorName` | Optional banner under the subtitle. |
| `attemptsAllowed` | Attempts per problem before the solution reveals. Default 3. |
| `toleranceFraction` | ± acceptance band around the true answer. Default 0.02 (±2%). |
| `countableRange` | The "countable plate" range. Default `[30, 300]`. |
| `cleanLogProbability` | Fraction of problems where every step is 1/10 or 1/100. Default 0.75. |
| `factorPool` | Dilution factors + weights used in mixed problems. |
| `volumePool` | Plated volumes (mL) + weights. |
| `unitPool` | µL vs mL weighting for the per-problem unit. |
| `stepVolumes` | Realistic [transfer, diluent] pairs for each factor and unit. |
| `defaultTheme` | First-load theme key. See **Themes** below. |
| `defaultColorMode` | `"light"`, `"dark"`, or `"system"` (follows OS). |
| `showCalculatorOnDesktop` | Whether the calculator auto-opens on desktop. |

Edit, save, reload — no build step.

## Themes

Six themes ship out of the box. All meet WCAG 2.1 AA contrast; the two High Contrast themes meet AAA.

| Key | Mode | Notes |
|---|---|---|
| `lab-paper` | light | Warm cream, deep teal, oxblood — the original lab-notebook aesthetic (default). |
| `clean-slate` | light | Clinical white background, slate text, blue-teal accent. |
| `hc-light` | light | Near-white background, near-black text, deep navy/burgundy. AAA. |
| `lab-slate` | dark | Warm dark blue-gray paper, cream text, muted teal/coral. Paired with `lab-paper`. |
| `midnight` | dark | Deep navy, soft sky text, electric teal/amber. Paired with `clean-slate`. |
| `hc-dark` | dark | Pure black background, pure white text, bright brass focus. AAA. |

Two controls live in the page toolbar:

- **Theme** — a native `<select>` listing all six themes, grouped Light / Dark.
- **Light/Dark toggle** — flips to the paired theme (lab-paper ↔ lab-slate, clean-slate ↔ midnight, hc-light ↔ hc-dark).

Choices persist via `localStorage`. With no saved choice, the page follows the OS `prefers-color-scheme` setting and continues listening for mid-session changes until the student picks a theme manually.

## Features

- **Scientific notation toggle** — converts powers-of-ten dilutions to `10⁻ⁿ` form. Choice is saved across refreshes.
- **Show equation** — reveals the formula `CFU/mL = (colonies × reciprocal of total dilution) / volume plated`. Hidden by default and not persisted.
- **Built-in calculator** — simple 4-function calculator (with division symbol, sign flip, backspace, and decimal). Floats in the right margin on desktop; in-flow on mobile.
- **Worked solution** — after the problem ends, students see a step-by-step walkthrough: deriving each stepwise factor from the volumes, building cumulative totals tube-by-tube, identifying the countable plate, and plugging into the formula.

## Accessibility

Designed to meet federal accessibility guidelines for higher education (WCAG 2.1 AA / Section 508):

- Skip link at the top of the page for keyboard users.
- Semantic landmarks (`<header>`, `<main>`, `<section>` with `aria-labelledby`).
- ARIA labels on tubes, plates, and arrow cells describing transfer volumes and counts.
- `aria-live` regions announce attempt count, feedback, solution updates, and theme changes.
- High-contrast brass-yellow focus rings (3px outline, 2px offset) on every interactive element, with theme-specific focus colors that maintain ≥3:1 contrast against every theme background.
- Minimum 44×44px touch targets on all buttons, toggles, and calculator keys (WCAG 2.5.5).
- All body text meets ≥4.5:1 contrast on every theme. `hc-light` and `hc-dark` exceed 7:1 (WCAG AAA).
- `prefers-reduced-motion` support — animations disabled when the OS setting is on.
- Color is never the sole signal (countable plates aren't visually highlighted; students must determine them from counts).
- The theme controls use native `<select>` and `<button>` elements, fully keyboard-operable, with associated labels and `aria-pressed`.

## Architecture

```
serialdilution/
├── index.html         # slim shell — landmarks, controls, module loads
├── config.js          # instructor config (edit this)
├── README.md
├── LICENSE
├── styles/
│   ├── tokens.css         non-color design tokens
│   ├── themes.css         6 theme variants — color tokens only
│   ├── base.css           resets, body, skip link, focus, reduced motion
│   ├── header.css         site header + toolbar + theme controls
│   ├── layout.css         main grid + .card + problem statement
│   ├── tubes.css          dilution tubes row
│   ├── plates.css         petri plates row
│   ├── answer.css         answer input, attempts dots, feedback
│   ├── buttons.css        .btn variants — 44px touch targets
│   ├── solution.css       worked solution, dilution table, derivation list, equation reveal
│   ├── calculator.css     floating calculator
│   └── responsive.css     mobile overrides
└── js/                # ES modules, no build step
    ├── main.js            entry — DOM wiring + init
    ├── config.js          merges user config with defaults
    ├── state.js           shared mutable state
    ├── storage.js         localStorage wrappers
    ├── utils.js           random pickers, gcd, seeded RNG
    ├── format.js          number formatting, parsing, sci notation
    ├── problem.js         problem generation (uses config pools)
    ├── svg.js             tube/arrow/plate SVG generators — themed via CSS vars
    ├── render.js          DOM render for tubes, plates, attempts, feedback
    ├── equation.js        equation reveal panel
    ├── calculator.js      4-function calculator widget
    ├── solution.js        worked solution renderer
    ├── answer.js          answer parsing + tolerance check
    ├── lifecycle.js       new-problem reset
    └── theme.js           theme registry, light/dark toggle, persistence
```

- **No build step** — ES modules and `<link>`/`<script type="module">` only.
- **No external dependencies** — three Google Fonts are linked from CDN; everything else is vanilla.
- **Deploys to GitHub Pages** — push and enable Pages from `main`.

Because ES modules require http(s), the app does not work when opened via `file://`. Run a local server (`python3 -m http.server`) during development, or deploy to Pages.

## Tech notes

- Tube and petri dish illustrations are SVG generated at runtime. All colors flow through CSS custom properties so themes re-skin the SVGs without touching JS.
- Petri dish colony layouts are seeded by `(plate index, count)` so the same problem renders identically on re-render but different problems get visually distinct dishes.
- Layout uses a 7-column equal-width CSS grid (`repeat(7, minmax(0, 1fr))`) for tubes + arrow cells, ensuring the arrows sit at the exact midpoint between tubes regardless of label content.
- The arrow inside each arrow cell is positioned via an aspect-ratio aligner that mirrors the tube SVG dimensions, locking the arrow to the tube body's vertical center.
- Mobile (≤720px) drops the calculator into normal document flow and switches the diluent label from a pill to compact stacked text so it fits in the narrow tube columns.
- The theme system uses `[data-theme="..."]` on `<html>` for the named theme plus `[data-color-mode="light|dark"]` for the resolved mode (the latter drives `color-scheme` so browser-native widgets match).

## Fonts

- **Cormorant Garamond** — display (page title and section headings)
- **Inter Tight** — body text and UI
- **JetBrains Mono** — labels, values, and the calculator
