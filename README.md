# HABITUAL — Adversarial Reflex Engine

A browser game that watches how you play, builds a behavioral model of you, and then uses that model to cheat against you.

## Concept

The game runs in two phases:

**Phase I — Profiling (20 rounds)**
The system observes your keypresses silently. It records per-key reaction times, detects rhythm patterns, notes which keys you miss most, and tracks whether you tend to press early.

**Phase II — Adversarial (30 rounds)**
The AI deploys targeted tricks derived from your Phase I profile. It's not random — it knows your average RT, your weakest key, and whether you have a rhythm. It exploits all of it.

---

## How the AI works

This is classical behavioral modeling — no neural nets. The AI builds a statistical profile from raw observations and selects tricks via weighted random sampling.

### Player Profiling — [`src/ai/profile.js`](src/ai/profile.js)

`buildProfile(data)` takes the raw learning data and computes:

| Signal | How it's used |
|---|---|
| Per-key avg reaction time | Identifies slow keys to target |
| Per-key stddev | Detects consistent vs. erratic presses |
| Miss rate per key | Weights the "weakest key" score |
| Early press rate | Enables `patience_trap` trick |
| Inter-prompt intervals | Enables `rhythm_break` trick |
| False press rate | Enables `fake_prompt` for disciplined players |

### Trick Selection — [`src/ai/tricks.js`](src/ai/tricks.js)

`selectTrick(profile, round)` returns one of seven tricks via weighted sampling. Each trick is only added to the pool if the player's profile actually supports it:

| Trick | Condition | What it does |
|---|---|---|
| `target_weak` | Always | Prompts weakest keys, window scaled to their slow RT |
| `patience_trap` | Anticipation detected | Long pre-delay then very short window |
| `rhythm_break` | Rhythm detected | Deliberately mis-times the prompt interval |
| `fake_prompt` | Low false-press rate | Shows then cancels a prompt; pressing = punished |
| `decoy_flash` | Round > 5 | Flashes wrong key for 160ms then switches to real target |
| `combo_attack` | Round > 8 | Two-key combo using the player's weakest keys |
| `window_shrink` | Always | Shrinks window to ~70% of player's avg RT |

---

## Project structure

```
src/
├── ai/                        # All ML/AI logic — isolated here
│   ├── profile.js             #   buildProfile() — Phase I behavioral analysis
│   ├── tricks.js              #   selectTrick() — Phase II adversarial selection
│   └── index.js               #   re-exports
│
├── components/
│   ├── IntroScreen.jsx        # Title / rule explanation screen
│   ├── TransitionScreen.jsx   # Profile reveal between phases
│   ├── GameOver.jsx           # End-of-game stats
│   ├── GameScreen.jsx         # In-game panel (prompt, timer, key grid)
│   └── AIPanel.jsx            # Live AI profile sidebar (adversarial phase)
│
├── constants.js               # KEYS, LEARNING_ROUNDS, COMBO_KEYS
├── styles.js                  # All CSS (injected as a style tag)
├── utils.js                   # avg(), stddev(), clamp()
└── AdversarialGame.jsx        # Root component — all game state & hooks

adversarial-game.jsx           # Original single-file version (reference)
```

---

## Usage

Drop `src/AdversarialGame.jsx` (and its sibling directories) into any React project and render:

```jsx
import AdversarialGame from "./src/AdversarialGame.jsx";

export default function App() {
  return <AdversarialGame />;
}
```

Works with Vite, CRA, or any bundler that handles JSX and ES modules.

**Keys:** `A S D F J K L`

---

## Extending the AI

**New trick:**
1. Add an entry to the `TRICKS` map in [`src/ai/tricks.js`](src/ai/tricks.js) with `enabled()` and `weight()` functions.
2. Add a `case` for it in the `startPrompt()` switch in [`src/AdversarialGame.jsx`](src/AdversarialGame.jsx).
3. If the trick needs a new player signal, add the measurement to [`src/ai/profile.js`](src/ai/profile.js).

**Different profiling signals:**
All behavioral data collection happens in `endRound()` inside `AdversarialGame.jsx`. The shape of the learning data object is defined by `INITIAL_LEARNING_DATA` and consumed by `buildProfile()`.
