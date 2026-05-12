/**
 * The "Show equation" reveal panel — a static formula display the student
 * can toggle on for a hint without giving away the worked solution.
 */

export function renderEquation() {
  const c = document.getElementById("equationContainer");
  c.hidden = false;
  c.innerHTML = `
    <div class="equation-block">
      <div class="eq-label">Equation</div>
      <div class="eq-formula">
        CFU/mL in original tube
        &nbsp;=&nbsp;
        <span class="eq-fraction">
          <span class="num">colonies on countable plate × (1 / total dilution)</span>
          <span class="den">volume plated (mL)</span>
        </span>
      </div>
      <p style="margin: 0.65rem 0 0; font-size: 0.85rem; color: var(--ink-soft);">
        Equivalently: divide the colonies by the volume plated, then multiply by the inverse of the total dilution factor used to make that tube.
      </p>
    </div>`;
}

export function clearEquation() {
  const c = document.getElementById("equationContainer");
  c.hidden = true;
  c.innerHTML = "";
}
