/**
 * Shared mutable app state. Imported by modules that need to read or
 * update problem-lifecycle state.
 */
export const state = {
  problem: null,        // current problem object
  attemptsUsed: 0,
  finished: false,
  sciMode: false,
};
