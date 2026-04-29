# Serial Dilution Practice

An interactive web app for microbiology students to practice calculating original concentrations (CFU/mL) from serial dilution plate counts. Built for classroom use in a Preliminary Microbiology course.

## What it does

Each problem presents four test tubes — Tube 1 holds the original sample, Tubes 2–4 are stepwise dilutions — along with three petri dishes showing colony counts from each dilution. Students work backward from the countable plate (30–300 colonies) through the dilution series to find the concentration in the original tube.

The dilution factors aren't given. Students determine them from the labeled transfer and diluent volumes shown between tubes. For example, transferring 100 µL into 900 µL of diluent is a 1/10 dilution — students need to recognize that themselves.

Students get three attempts per problem. After a correct answer or three wrong attempts, the app reveals a worked solution showing each stepwise dilution, the cumulative total at each tube, identification of the countable plate, and the final calculation.

## Problem generation

- Dilution factors per step are drawn from a weighted pool: 1/10, 1/100, 1/5, 1/2, and (rarely) 2/3
- 75% of problems are clean log series (every step is 1/10 or 1/100); the remaining 25% mix in the other factors
- Each step picks realistic transfer/diluent volume pairs from a pool that satisfies `transfer / (transfer + diluent) = factor` exactly. All steps in a single problem share a unit (µL or mL)
- Plate volumes are 0.1 mL or 0.5 mL (most common) or 1.0 mL (rare)
- Exactly one of the three plates falls in the 30–300 countable range; rejection sampling regenerates problems that don't satisfy this

## Features

- **Scientific notation toggle** — converts powers-of-ten dilutions to `10⁻ⁿ` form. Choice is saved across refreshes via localStorage.
- **Show equation** — reveals the formula `CFU/mL = (colonies × reciprocal of total dilution) / volume plated`. Hidden by default and not persisted.
- **Built-in calculator** — simple 4-function calculator (with division symbol, sign flip, backspace, and decimal). Floats in the right margin on desktop and follows the user as they scroll. Hidden by default on mobile, shown by default on desktop.
- **Worked solution** — after the problem ends, students see a step-by-step walkthrough: deriving each stepwise factor from the volumes, building cumulative totals tube-by-tube, identifying the countable plate, and plugging into the formula.

## Accessibility

Designed to meet federal accessibility guidelines for higher education (WCAG 2.1 AA / Section 508):

- Skip link at the top of the page for keyboard users
- Semantic landmarks (`<header>`, `<main>`, `<section>` with `aria-labelledby`)
- ARIA labels on tubes, plates, and arrow cells describing transfer volumes and counts
- `aria-live` regions announce attempt count, feedback, and solution updates
- High-contrast brass-yellow focus rings (3px outline, 2px offset) on every interactive element
- Minimum 44px touch targets on calculator keys
- `prefers-reduced-motion` support — animations disabled when the OS setting is on
- Color is never the sole signal (countable plates aren't visually highlighted; students must determine them from counts)

## Architecture

- **Single file** — everything (HTML, CSS, JS, SVG) lives in `index.html`. No build step, no bundler, no package manager.
- **No external dependencies** — three Google Fonts are linked from CDN; everything else is vanilla.
- **Deploys to GitHub Pages** — drop the file at the repo root and enable Pages from `main`.

## Tech notes

- Tube and petri dish illustrations are SVG generated at runtime
- Petri dish colony layouts are seeded by `(plate index, count)` so the same problem renders identically on re-render but different problems get visually distinct dishes
- Layout uses a 7-column equal-width CSS grid (`repeat(7, minmax(0, 1fr))`) for tubes + arrow cells, ensuring the arrows sit at the exact midpoint between tubes regardless of label content
- The arrow inside each arrow cell is positioned via an aspect-ratio aligner that mirrors the tube SVG dimensions, locking the arrow to the tube body's vertical center
- Mobile (≤720px) drops the calculator into normal document flow and switches the diluent label from a pill to compact stacked text so it fits in the narrow tube columns
- `color-scheme: light only` on `:root` opts the page out of iOS Safari's auto-dark-mode inversion

## Fonts

- **Cormorant Garamond** — display (page title and section headings)
- **Inter Tight** — body text and UI
- **JetBrains Mono** — labels, values, and the calculator
