/**
 * Problem generation. Builds a complete serial-dilution problem with:
 *   - 3 step dilution factors (clean log series 75% of the time, mixed otherwise)
 *   - cumulative dilution per tube
 *   - exactly one countable plate (rejection-samples until satisfied)
 *   - realistic transfer/diluent volume pairs that exactly satisfy each factor
 */

import { config, MIN_COUNTABLE, MAX_COUNTABLE } from "./config.js";
import { pickWeighted, pickRandom, randInt } from "./utils.js";
import { roundToSigFigs } from "./format.js";

export function generateProblem(depth = 0) {
  const cleanLog = Math.random() < config.cleanLogProbability;
  const stepFactors = [];
  const stepLabels = [];

  if (cleanLog) {
    for (let i = 0; i < 3; i++) {
      if (Math.random() < 0.5) {
        stepFactors.push(1 / 10);
        stepLabels.push("1/10");
      } else {
        stepFactors.push(1 / 100);
        stepLabels.push("1/100");
      }
    }
  } else {
    for (let i = 0; i < 3; i++) {
      const pick = pickWeighted(config.factorPool);
      stepFactors.push(pick.factor);
      stepLabels.push(pick.label);
    }
  }

  const cumulative = [1];
  for (let i = 0; i < 3; i++) {
    cumulative.push(cumulative[cumulative.length - 1] * stepFactors[i]);
  }

  const countableTubeIdx = randInt(1, 3);
  const sharedVolume = pickWeighted(config.volumePool).value;
  const plateVolumes = [sharedVolume, sharedVolume, sharedVolume];
  const countableCount = randInt(MIN_COUNTABLE, MAX_COUNTABLE);

  const cVol = plateVolumes[countableTubeIdx - 1];
  let originalCfuPerMl = countableCount / (cumulative[countableTubeIdx] * cVol);
  originalCfuPerMl = parseFloat(roundToSigFigs(originalCfuPerMl, 3).toPrecision(12));

  const computeCount = (tubeIdx, vol) =>
    originalCfuPerMl * cumulative[tubeIdx] * vol;

  let counts = [
    computeCount(1, plateVolumes[0]),
    computeCount(2, plateVolumes[1]),
    computeCount(3, plateVolumes[2]),
  ];
  counts = counts.map(c => Math.round(c));

  const countablePlateIndices = counts
    .map((c, i) => (c >= MIN_COUNTABLE && c <= MAX_COUNTABLE) ? i : -1)
    .filter(i => i !== -1);

  if (countablePlateIndices.length !== 1 ||
      countablePlateIndices[0] !== countableTubeIdx - 1) {
    if (depth < 50) return generateProblem(depth + 1);
  }

  const stepUnit = pickWeighted(config.unitPool).value;
  const stepVolumes = stepLabels.map(lbl => {
    const pool = config.stepVolumes[stepUnit][lbl];
    const [transfer, diluent] = pickRandom(pool);
    return { transfer, diluent, unit: stepUnit };
  });

  const solutionPlateIdx = countableTubeIdx - 1;

  return {
    stepFactors,
    stepLabels,
    stepVolumes,
    cumulative,
    plateVolumes,
    counts,
    solutionPlateIdx,
    originalCfuPerMl,
  };
}
