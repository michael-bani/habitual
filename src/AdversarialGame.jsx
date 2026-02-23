import { useState, useEffect, useRef, useCallback } from "react";

import { KEYS, LEARNING_ROUNDS, COMBO_KEYS } from "./constants.js";
import { clamp } from "./utils.js";
import { buildProfile, selectTrick, selectComboForAttack } from "./ai/index.js";
import { css } from "./styles.js";

import IntroScreen from "./components/IntroScreen.jsx";
import TransitionScreen from "./components/TransitionScreen.jsx";
import GameOver from "./components/GameOver.jsx";
import GameScreen from "./components/GameScreen.jsx";

const INITIAL_LEARNING_DATA = () => ({
  reactionTimes: { A: [], S: [], D: [], F: [], J: [], K: [], L: [] },
  misses: { A: 0, S: 0, D: 0, F: 0, J: 0, K: 0, L: 0 },
  earlyPresses: 0,
  falsePresses: 0,
  totalRounds: 0,
  totalMisses: 0,
  intervals: [],
});

export default function AdversarialGame() {
  // ─── Screen routing ───────────────────────────────────────────────────────
  const [screen, setScreen] = useState("intro"); // intro | learning | transition | adversarial | gameover

  // ─── Score / stats ────────────────────────────────────────────────────────
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [round, setRound] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [aiExploits, setAiExploits] = useState(0);

  // ─── Per-round prompt state ───────────────────────────────────────────────
  const [promptState, setPromptState] = useState("waiting"); // waiting | active | result
  const [currentKey, setCurrentKey] = useState(null);
  const [currentCombo, setCurrentCombo] = useState(null);
  const [isCombo, setIsCombo] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1);
  const [feedback, setFeedback] = useState({ msg: "", type: "" });
  const [promptBoxState, setPromptBoxState] = useState("");
  const [trickReveal, setTrickReveal] = useState("");
  const [currentTrick, setCurrentTrick] = useState(null);
  const [decoyKey, setDecoyKey] = useState(null);

  // ─── AI / profile state ───────────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [aiLastAction, setAiLastAction] = useState("");

  // ─── Refs (mutable game state that must not trigger re-renders) ───────────
  const learningData = useRef(INITIAL_LEARNING_DATA());
  const timers = useRef({});
  const promptStartTime = useRef(0);
  const lastPromptTime = useRef(0);
  const windowMs = useRef(800);
  const expectedKeys = useRef(null);   // Set of keys player must press; null = fake prompt
  const pressedInCombo = useRef(new Set());
  const gameActive = useRef(false);
  const roundRef = useRef(0);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const aiExploitsRef = useRef(0);
  const currentPhase = useRef("learning");
  const profileRef = useRef(null);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const clearTimers = () => {
    Object.values(timers.current).forEach((t) => clearTimeout(t));
    timers.current = {};
  };

  const showFeedback = (msg, type, duration = 800) => {
    setFeedback({ msg, type });
    clearTimeout(timers.current.feedback);
    timers.current.feedback = setTimeout(() => setFeedback({ msg: "", type: "" }), duration);
  };

  // ─── Round lifecycle ──────────────────────────────────────────────────────
  const scheduleNextRound = useCallback((delay) => {
    clearTimeout(timers.current.next);
    timers.current.next = setTimeout(() => {
      if (!gameActive.current) return;
      startPrompt();
    }, delay);
  }, []);

  const endRound = useCallback(
    (result) => {
      // result: 'hit' | 'miss' | 'timeout' | 'fake_avoided' | 'fake_fail' | 'early'
      clearTimeout(timers.current.window);
      setPromptState("result");
      expectedKeys.current = null;
      pressedInCombo.current = new Set();

      if (result === "hit") {
        const rt = Date.now() - promptStartTime.current;
        const k = currentKey;
        hitsRef.current++;
        setHits((h) => h + 1);
        comboRef.current++;
        setCombo((c) => {
          const nc = c + 1;
          if (nc > maxCombo) setMaxCombo(nc);
          return nc;
        });
        const pts = 100 + comboRef.current * 20;
        scoreRef.current += pts;
        setScore((s) => s + pts);
        setPromptBoxState("success");
        showFeedback(`+${pts}  ${rt}ms`, "hit");

        if (currentPhase.current === "learning" && k) {
          learningData.current.reactionTimes[k].push(rt);
          if (lastPromptTime.current) {
            learningData.current.intervals.push(Date.now() - lastPromptTime.current);
          }
          lastPromptTime.current = Date.now();
        }
      } else if (result === "miss" || result === "timeout") {
        missesRef.current++;
        setMisses((m) => m + 1);
        comboRef.current = 0;
        setCombo(0);
        setPromptBoxState("fail");
        showFeedback("MISS", "miss");
        if (currentPhase.current === "learning" && currentKey) {
          learningData.current.misses[currentKey] =
            (learningData.current.misses[currentKey] || 0) + 1;
          learningData.current.totalMisses++;
        }
      } else if (result === "fake_avoided") {
        setPromptBoxState("");
        showFeedback("NICE — FAKE", "hit");
      } else if (result === "fake_fail") {
        aiExploitsRef.current++;
        setAiExploits((a) => a + 1);
        missesRef.current++;
        setMisses((m) => m + 1);
        comboRef.current = 0;
        setCombo(0);
        setPromptBoxState("fail");
        showFeedback("GOT YOU", "miss");
      } else if (result === "early") {
        missesRef.current++;
        setMisses((m) => m + 1);
        comboRef.current = 0;
        setCombo(0);
        setPromptBoxState("fail");
        showFeedback("TOO EARLY", "early");
        if (currentPhase.current === "learning") learningData.current.earlyPresses++;
      }

      const newRound = roundRef.current + 1;
      roundRef.current = newRound;
      setRound(newRound);
      learningData.current.totalRounds++;

      // Phase I complete → build profile, go to transition screen
      if (currentPhase.current === "learning" && newRound >= LEARNING_ROUNDS) {
        clearTimers();
        gameActive.current = false;
        setTimeout(() => {
          const p = buildProfile(learningData.current);
          setProfile(p);
          profileRef.current = p;
          setScreen("transition");
        }, 1200);
        return;
      }

      // Phase II complete → game over
      if (currentPhase.current === "adversarial" && newRound >= LEARNING_ROUNDS + 30) {
        clearTimers();
        gameActive.current = false;
        setTimeout(() => setScreen("gameover"), 1200);
        return;
      }

      scheduleNextRound(900 + Math.random() * 400);
    },
    [currentKey, maxCombo, scheduleNextRound]
  );

  // ─── Prompt activation ────────────────────────────────────────────────────
  const activatePrompt = (key, combo, window) => {
    if (!combo) {
      setCurrentKey(key);
      expectedKeys.current = new Set([key]);
    } else {
      setCurrentCombo(combo);
      setCurrentKey(combo[0]);
      expectedKeys.current = new Set(combo);
    }
    setPromptState("active");
    setPromptBoxState("active");
    promptStartTime.current = Date.now();
    setTimeLeft(1);

    // Animate the timer fill
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 1 - elapsed / window);
      setTimeLeft(remaining);
      if (remaining > 0) {
        timers.current.timerAnim = requestAnimationFrame(tick);
      }
    };
    timers.current.timerAnim = requestAnimationFrame(tick);

    timers.current.window = setTimeout(() => {
      if (expectedKeys.current && expectedKeys.current.size > 0) {
        endRound("timeout");
      }
    }, window);
  };

  const startPrompt = useCallback(() => {
    if (!gameActive.current) return;

    setDecoyKey(null);
    setTrickReveal("");
    setCurrentTrick(null);
    setPromptBoxState("");

    const phase = currentPhase.current;
    const p = profileRef.current;
    let chosenKey = KEYS[Math.floor(Math.random() * KEYS.length)];
    let chosenCombo = null;
    let trick = null;
    let window = 750;
    let preDelay = 0;

    if (phase === "adversarial" && p) {
      trick = selectTrick(p, roundRef.current - LEARNING_ROUNDS);
      setCurrentTrick(trick);

      switch (trick) {
        case "target_weak": {
          const pool = p.weakestKeys;
          chosenKey = pool[Math.floor(Math.random() * Math.min(2, pool.length))];
          window = clamp(p.perKeyRT[chosenKey] * 0.85 || 650, 400, 700);
          setAiLastAction(`targeting your weak key: ${chosenKey}`);
          break;
        }
        case "patience_trap": {
          preDelay = 600 + Math.random() * 400;
          window = clamp(p.avgRT * 0.75, 350, 600);
          setAiLastAction("patience trap: extended delay to catch anticipation");
          break;
        }
        case "rhythm_break": {
          const breakType = Math.random() > 0.5 ? 0.3 : 2.2;
          preDelay = Math.max(0, p.rhythmInterval * breakType - 900);
          setAiLastAction("rhythm disruption detected");
          break;
        }
        case "fake_prompt":
          break; // handled below
        case "decoy_flash": {
          const decoy = KEYS.filter((k) => k !== chosenKey)[Math.floor(Math.random() * 6)];
          setDecoyKey(decoy);
          setCurrentKey(decoy);
          preDelay = 160;
          setAiLastAction(`decoy flash: ${decoy} → ${chosenKey}`);
          break;
        }
        case "combo_attack": {
          chosenCombo = selectComboForAttack(p);
          window = clamp(p.avgRT * 1.2, 600, 1000);
          setAiLastAction(`combo attack: ${chosenCombo?.join("+")} — your weak combos`);
          break;
        }
        case "window_shrink": {
          window = clamp(p.avgRT * 0.7, 300, 550);
          setAiLastAction(`window shrinked to ${Math.round(window)}ms — your avg is ${Math.round(p.avgRT)}ms`);
          break;
        }
      }
    }

    windowMs.current = window;

    // ── Fake prompt ──────────────────────────────────────────────────────────
    if (trick === "fake_prompt") {
      setCurrentKey(chosenKey);
      setIsCombo(false);
      setCurrentCombo(null);
      expectedKeys.current = null; // null = fake; pressing is punished
      setPromptState("active");
      setPromptBoxState("fake");
      promptStartTime.current = Date.now();
      setTimeLeft(1);
      setTrickReveal("fake prompt");
      setAiLastAction("fake prompt: press = punished, wait = rewarded");

      const fakeDuration = 200 + Math.random() * 250;
      timers.current.window = setTimeout(() => {
        if (expectedKeys.current === null) {
          setCurrentKey(null);
          setDecoyKey(null);
          setPromptState("result");
          aiExploitsRef.current++;
          setAiExploits((a) => a + 1);
          roundRef.current++;
          setRound((r) => r + 1);
          showFeedback("FAKE — DODGED", "fake");
          setPromptBoxState("");
          learningData.current.totalRounds++;
          scheduleNextRound(800);
        }
      }, fakeDuration);
      return;
    }

    // ── Decoy flash ──────────────────────────────────────────────────────────
    if (trick === "decoy_flash") {
      setCurrentKey(chosenKey);
      setIsCombo(false);
      setCurrentCombo(null);
      setPromptState("active");
      setPromptBoxState("");
      promptStartTime.current = Date.now() + preDelay;

      timers.current.decoy = setTimeout(() => {
        setDecoyKey(null);
        setCurrentKey(chosenKey);
        setPromptBoxState("active");
        expectedKeys.current = new Set([chosenKey]);
        promptStartTime.current = Date.now();
        setTimeLeft(1);

        timers.current.window = setTimeout(() => {
          if (expectedKeys.current?.size > 0) {
            endRound("timeout");
          }
        }, window);
      }, preDelay);
      return;
    }

    // ── Standard prompt (with optional pre-delay for patience_trap) ──────────
    if (chosenCombo) {
      setCurrentCombo(chosenCombo);
      setCurrentKey(chosenCombo[0]);
      setIsCombo(true);
      expectedKeys.current = new Set(chosenCombo);
    } else {
      setCurrentKey(chosenKey);
      setCurrentCombo(null);
      setIsCombo(false);
    }

    if (preDelay > 0) {
      setPromptState("waiting");
      timers.current.patience = setTimeout(() => {
        activatePrompt(chosenKey, chosenCombo, window);
      }, preDelay);
    } else {
      activatePrompt(chosenKey, chosenCombo, window);
    }
  }, [endRound, scheduleNextRound]);

  // ─── Input handling ───────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e) => {
      if (screen !== "learning" && screen !== "adversarial") return;
      const key = e.key.toUpperCase();
      if (!KEYS.includes(key)) return;
      e.preventDefault();

      // Pressing during a fake prompt = punished
      if (promptState === "active" && expectedKeys.current === null) {
        clearTimeout(timers.current.window);
        endRound("fake_fail");
        setTrickReveal("fake prompt — you fell for it");
        return;
      }

      if (promptState === "active" && expectedKeys.current) {
        if (expectedKeys.current.has(key)) {
          pressedInCombo.current.add(key);
          if (pressedInCombo.current.size >= expectedKeys.current.size) {
            clearTimeout(timers.current.window);
            cancelAnimationFrame(timers.current.timerAnim);
            endRound("hit");
            if (currentTrick) setTrickReveal(`beat: ${currentTrick.replace(/_/g, " ")}`);
          }
        }
      } else if (promptState === "waiting") {
        endRound("early");
      } else {
        if (currentPhase.current === "learning") learningData.current.falsePresses++;
        showFeedback("no prompt active", "miss", 600);
      }
    },
    [screen, promptState, endRound, currentTrick]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  // ─── Game start helpers ───────────────────────────────────────────────────
  const resetSessionState = () => {
    roundRef.current = 0;
    scoreRef.current = 0;
    comboRef.current = 0;
    hitsRef.current = 0;
    missesRef.current = 0;
    aiExploitsRef.current = 0;
    setRound(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHits(0);
    setMisses(0);
    setAiExploits(0);
    setFeedback({ msg: "", type: "" });
    setPromptState("waiting");
    setCurrentKey(null);
    setCurrentCombo(null);
    setDecoyKey(null);
    setPromptBoxState("");
  };

  const startGame = (phase) => {
    clearTimers();
    resetSessionState();
    currentPhase.current = phase;
    gameActive.current = true;
    setScreen(phase);
    scheduleNextRound(1200);
  };

  const startAdversarial = () => {
    clearTimers();
    resetSessionState();
    roundRef.current = LEARNING_ROUNDS;
    setRound(LEARNING_ROUNDS);
    currentPhase.current = "adversarial";
    gameActive.current = true;
    setScreen("adversarial");
    scheduleNextRound(1400);
  };

  const handleRestart = () => {
    learningData.current = INITIAL_LEARNING_DATA();
    setProfile(null);
    profileRef.current = null;
    setScreen("intro");
  };

  // ─── Derived display values ───────────────────────────────────────────────
  const learningProgress = Math.min(1, round / LEARNING_ROUNDS);
  const advRound = Math.max(0, round - LEARNING_ROUNDS);
  const advProgress = Math.min(1, advRound / 30);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className="game-root">
        <div className="scanlines" />
        <div className="grid-bg" />
        <div className="corner-decoration tl" />
        <div className="corner-decoration tr" />
        <div className="corner-decoration bl" />
        <div className="corner-decoration br" />

        {screen === "intro" && <IntroScreen onStart={startGame} />}

        {(screen === "learning" || screen === "adversarial") && (
          <GameScreen
            phase={screen}
            score={score}
            combo={combo}
            round={round}
            advRound={advRound}
            learningProgress={learningProgress}
            advProgress={advProgress}
            promptState={promptState}
            promptBoxState={promptBoxState}
            currentKey={currentKey}
            currentCombo={currentCombo}
            isCombo={isCombo}
            decoyKey={decoyKey}
            timeLeft={timeLeft}
            feedback={feedback}
            trickReveal={trickReveal}
            aiExploits={aiExploits}
            profile={profile}
            aiLastAction={aiLastAction}
            targetKeys={expectedKeys.current}
            keyMisses={learningData.current.misses}
          />
        )}

        {screen === "transition" && profile && (
          <TransitionScreen profile={profile} onStart={startAdversarial} />
        )}

        {screen === "gameover" && (
          <GameOver
            score={score}
            hits={hits}
            misses={misses}
            maxCombo={maxCombo}
            aiExploits={aiExploits}
            profile={profile}
            onRestart={handleRestart}
          />
        )}
      </div>
    </>
  );
}
