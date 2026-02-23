/**
 * Adversarial trick selection — Phase II decision making.
 *
 * Given the player profile built in Phase I, this module decides which trick
 * to deploy each round. Tricks are selected via weighted random sampling so
 * the AI varies its approach while still exploiting detected weaknesses.
 *
 * Each trick type maps to handling logic in AdversarialGame.jsx (startPrompt).
 * To add a new trick:
 *   1. Add it to the TRICKS map below with a weight function.
 *   2. Handle its `type` string in the startPrompt switch.
 *   3. If it needs new player signals, add them to buildProfile() in profile.js.
 */

import { COMBO_KEYS } from "../constants.js";

/**
 * Trick definitions.
 * Each entry is { enabled(profile, round) → bool, weight(profile) → number }.
 * Disabled tricks are excluded from the pool entirely.
 */
const TRICKS = {
  // Always available — target the player's statistically weakest keys.
  target_weak: {
    enabled: () => true,
    weight: () => 3,
  },

  // Exploits players who anticipate prompts (press early).
  // Adds a long pre-delay then shrinks the active window.
  patience_trap: {
    enabled: (profile) => profile.anticipates,
    weight: () => 4,
  },

  // Deliberately breaks the player's detected timing rhythm.
  rhythm_break: {
    enabled: (profile) => profile.rhythmInterval > 0,
    weight: () => 3,
  },

  // Shows a prompt then yanks it. Pressing = punished. Waiting = rewarded.
  // Only enabled for low-false-press players (disciplined players who trust prompts).
  fake_prompt: {
    enabled: (profile) => profile.falsePressRate < 0.05,
    weight: () => 2,
  },

  // Briefly flashes the wrong key, then switches to the real target.
  decoy_flash: {
    enabled: (_profile, round) => round > 5,
    weight: () => 2,
  },

  // Combo prompt using the player's weakest keys specifically.
  combo_attack: {
    enabled: (_profile, round) => round > 8,
    weight: () => 2,
  },

  // Shrinks the press window below the player's average reaction time.
  window_shrink: {
    enabled: () => true,
    weight: () => 2,
  },
};

/**
 * Select a trick for the current adversarial round.
 *
 * @param {object} profile - Player profile from buildProfile().
 * @param {number} round   - Current adversarial round (0-indexed).
 * @returns {string} Trick type key.
 */
export function selectTrick(profile, round) {
  const pool = Object.entries(TRICKS)
    .filter(([, t]) => t.enabled(profile, round))
    .map(([type, t]) => ({ type, weight: t.weight(profile) }));

  const totalWeight = pool.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * totalWeight;
  for (const t of pool) {
    r -= t.weight;
    if (r <= 0) return t.type;
  }
  return pool[0].type;
}

/**
 * Pick the combo to use for a combo_attack trick.
 * Prefers combos that involve the player's weakest keys.
 *
 * @param {object} profile - Player profile.
 * @returns {string[]} Two-key combo array.
 */
export function selectComboForAttack(profile) {
  const weak = profile.weakestKeys.slice(0, 2);
  const preferred = COMBO_KEYS.filter((c) => c.some((k) => weak.includes(k)));
  const pool = preferred.length > 0 ? preferred : COMBO_KEYS;
  return pool[Math.floor(Math.random() * pool.length)];
}
