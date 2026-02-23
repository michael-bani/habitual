/**
 * Behavioral profiling — Phase I analysis.
 *
 * Takes the raw learning data collected during the profiling phase and
 * computes a player profile: per-key reaction times, weakest keys,
 * rhythm interval, anticipation tendency, and miss/false-press rates.
 *
 * This profile is fed into trick selection (tricks.js) to drive the
 * adversarial phase.
 */

import { KEYS } from "../constants.js";
import { avg, stddev } from "../utils.js";

/**
 * Build a player profile from learning-phase data.
 *
 * @param {object} data - Raw learning data collected during Phase I.
 * @param {object} data.reactionTimes   - Per-key arrays of reaction times (ms).
 * @param {object} data.misses          - Per-key miss counts.
 * @param {number} data.earlyPresses    - Total keypresses before window opened.
 * @param {number} data.falsePresses    - Total keypresses with no active prompt.
 * @param {number} data.totalRounds     - Total rounds completed in Phase I.
 * @param {number} data.totalMisses     - Total missed prompts.
 * @param {number[]} data.intervals     - Time between consecutive prompts (ms).
 * @returns {object} Player profile used by the adversarial trick selector.
 */
export function buildProfile(data) {
  const profile = {
    perKeyRT: {},       // avg reaction time per key
    perKeyStddev: {},   // consistency (lower = more robotic)
    weakestKey: null,   // single worst key
    weakestKeys: [],    // top-3 worst keys
    avgRT: 0,
    anticipates: false, // presses before window fully opens
    rhythmInterval: 0,  // detected interval between prompts (ms)
    falsePressRate: 0,  // presses per round with no active prompt
    overallMissRate: 0,
  };

  let allRT = [];
  KEYS.forEach((k) => {
    const times = data.reactionTimes[k] || [];
    profile.perKeyRT[k] = avg(times);
    profile.perKeyStddev[k] = stddev(times);
    allRT = allRT.concat(times);
  });

  profile.avgRT = avg(allRT);

  // Composite weakness score: miss penalty + slow avg RT
  const missWeight = (k) =>
    (data.misses[k] || 0) * 200 + (profile.perKeyRT[k] || profile.avgRT);

  profile.weakestKey = KEYS.reduce((a, b) => (missWeight(b) > missWeight(a) ? b : a));
  profile.weakestKeys = KEYS.slice()
    .sort((a, b) => missWeight(b) - missWeight(a))
    .slice(0, 3);

  profile.anticipates = data.earlyPresses > data.totalRounds * 0.1;
  profile.rhythmInterval = avg(data.intervals);
  profile.falsePressRate = data.falsePresses / Math.max(1, data.totalRounds);
  profile.overallMissRate = data.totalMisses / Math.max(1, data.totalRounds);

  return profile;
}
