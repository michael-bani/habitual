import { useState, useEffect, useRef, useCallback } from "react";

const KEYS = ["A", "S", "D", "F", "J", "K", "L"];
const LEARNING_ROUNDS = 20;
const COMBO_KEYS = [["A","S"],["S","D"],["D","F"],["J","K"],["K","L"],["A","F"],["J","L"]];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Bebas+Neue&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: #080c0a; }

  .game-root {
    min-height: 100vh;
    background: #080c0a;
    color: #c8ffd4;
    font-family: 'Share Tech Mono', monospace;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    user-select: none;
  }

  .scanlines {
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.15) 2px,
      rgba(0,0,0,0.15) 4px
    );
    pointer-events: none;
    z-index: 100;
  }

  .grid-bg {
    position: fixed;
    inset: 0;
    background-image: 
      linear-gradient(rgba(0,255,80,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,80,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  .corner-decoration {
    position: fixed;
    width: 60px; height: 60px;
    border-color: rgba(0,255,80,0.3);
    border-style: solid;
  }
  .corner-decoration.tl { top: 20px; left: 20px; border-width: 2px 0 0 2px; }
  .corner-decoration.tr { top: 20px; right: 20px; border-width: 2px 2px 0 0; }
  .corner-decoration.bl { bottom: 20px; left: 20px; border-width: 0 0 2px 2px; }
  .corner-decoration.br { bottom: 20px; right: 20px; border-width: 0 2px 2px 0; }

  .main-area {
    display: flex;
    gap: 40px;
    align-items: flex-start;
    z-index: 10;
  }

  /* Intro screen */
  .intro {
    text-align: center;
    max-width: 520px;
    z-index: 10;
  }

  .game-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 72px;
    letter-spacing: 8px;
    line-height: 1;
    background: linear-gradient(135deg, #00ff50, #00c840, #80ffb0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 8px;
  }

  .game-subtitle {
    font-size: 11px;
    letter-spacing: 4px;
    color: rgba(200,255,212,0.4);
    margin-bottom: 40px;
    text-transform: uppercase;
  }

  .intro-desc {
    font-size: 13px;
    line-height: 1.8;
    color: rgba(200,255,212,0.7);
    margin-bottom: 40px;
    border: 1px solid rgba(0,255,80,0.15);
    padding: 24px;
    background: rgba(0,255,80,0.03);
  }

  .phase-badges {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-bottom: 40px;
  }

  .phase-badge {
    padding: 8px 16px;
    font-size: 11px;
    letter-spacing: 2px;
    border: 1px solid;
    text-transform: uppercase;
  }

  .phase-badge.learn { border-color: rgba(0,200,255,0.4); color: rgba(0,200,255,0.8); background: rgba(0,200,255,0.05); }
  .phase-badge.adv { border-color: rgba(255,60,60,0.4); color: rgba(255,100,100,0.8); background: rgba(255,60,60,0.05); }

  .start-btn {
    background: transparent;
    border: 2px solid #00ff50;
    color: #00ff50;
    font-family: 'Share Tech Mono', monospace;
    font-size: 15px;
    letter-spacing: 4px;
    padding: 14px 48px;
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.15s;
    position: relative;
  }

  .start-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: #00ff50;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.15s;
  }

  .start-btn span { position: relative; z-index: 1; }

  .start-btn:hover { color: #080c0a; }
  .start-btn:hover::before { transform: scaleX(1); }

  /* Game panel */
  .game-panel {
    width: 380px;
  }

  .hud-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    font-size: 11px;
    letter-spacing: 2px;
    color: rgba(200,255,212,0.5);
  }

  .hud-val {
    font-size: 22px;
    color: #c8ffd4;
    display: block;
    letter-spacing: 1px;
  }

  .phase-label {
    padding: 4px 12px;
    font-size: 10px;
    letter-spacing: 3px;
    border: 1px solid;
    text-transform: uppercase;
  }

  .phase-label.learning { border-color: rgba(0,200,255,0.5); color: rgba(0,200,255,0.9); }
  .phase-label.adversarial { border-color: rgba(255,60,60,0.5); color: rgba(255,100,100,0.9); animation: pulse-red 1s ease-in-out infinite; }

  @keyframes pulse-red {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* Prompt display */
  .prompt-box {
    width: 380px;
    height: 280px;
    border: 1px solid rgba(0,255,80,0.2);
    background: rgba(0,255,80,0.02);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    margin-bottom: 16px;
    overflow: hidden;
  }

  .prompt-box.active { border-color: rgba(0,255,80,0.6); }
  .prompt-box.fake { border-color: rgba(255,160,0,0.6); }
  .prompt-box.fail { border-color: rgba(255,60,60,0.6); background: rgba(255,60,60,0.04); }
  .prompt-box.success { border-color: rgba(0,255,80,0.9); background: rgba(0,255,80,0.06); }

  .waiting-text {
    font-size: 11px;
    letter-spacing: 3px;
    color: rgba(200,255,212,0.2);
    text-transform: uppercase;
  }

  .waiting-dots {
    animation: blink 1.2s step-end infinite;
  }

  @keyframes blink { 50% { opacity: 0; } }

  .key-display {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 140px;
    line-height: 1;
    letter-spacing: 4px;
    color: #00ff50;
    text-shadow: 0 0 40px rgba(0,255,80,0.5), 0 0 80px rgba(0,255,80,0.2);
    transition: all 0.05s;
  }

  .key-display.combo {
    font-size: 72px;
    color: #ffb000;
    text-shadow: 0 0 40px rgba(255,176,0,0.5);
  }

  .key-display.fake-flash {
    color: #ff3c3c;
    text-shadow: 0 0 40px rgba(255,60,60,0.5);
  }

  .key-label {
    font-size: 11px;
    letter-spacing: 3px;
    margin-top: 12px;
    color: rgba(200,255,212,0.4);
  }

  /* Timer bar */
  .timer-track {
    width: 100%;
    height: 4px;
    background: rgba(200,255,212,0.08);
    margin-bottom: 16px;
    position: relative;
    overflow: hidden;
  }

  .timer-fill {
    height: 100%;
    background: #00ff50;
    transition: width linear;
    position: relative;
  }

  .timer-fill::after {
    content: '';
    position: absolute;
    right: 0;
    top: -2px;
    width: 8px;
    height: 8px;
    background: #00ff50;
    box-shadow: 0 0 10px #00ff50;
    border-radius: 50%;
  }

  .timer-fill.danger { background: #ff3c3c; }
  .timer-fill.danger::after { background: #ff3c3c; box-shadow: 0 0 10px #ff3c3c; }

  /* Key grid */
  .key-grid {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-bottom: 20px;
  }

  .key-chip {
    width: 44px; height: 44px;
    border: 1px solid rgba(200,255,212,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: rgba(200,255,212,0.3);
    position: relative;
    transition: all 0.1s;
  }

  .key-chip.target {
    border-color: #00ff50;
    color: #00ff50;
    background: rgba(0,255,80,0.1);
    box-shadow: 0 0 16px rgba(0,255,80,0.3);
  }

  .key-chip.combo-target {
    border-color: #ffb000;
    color: #ffb000;
    background: rgba(255,176,0,0.1);
    box-shadow: 0 0 16px rgba(255,176,0,0.3);
  }

  .key-chip.weak {
    border-color: rgba(255,60,60,0.4);
    color: rgba(255,100,100,0.4);
  }

  .weakness-bar {
    position: absolute;
    bottom: 0; left: 0;
    height: 2px;
    background: #ff3c3c;
    transition: width 0.5s;
  }

  /* Feedback */
  .feedback {
    text-align: center;
    font-size: 12px;
    letter-spacing: 2px;
    height: 20px;
    text-transform: uppercase;
    transition: opacity 0.2s;
  }

  .feedback.hit { color: #00ff50; }
  .feedback.miss { color: #ff3c3c; }
  .feedback.early { color: #ffb000; }
  .feedback.fake { color: #ff6b00; }

  /* AI Analysis panel */
  .ai-panel {
    width: 220px;
    border: 1px solid rgba(255,60,60,0.2);
    background: rgba(255,0,0,0.02);
    padding: 20px;
    font-size: 11px;
    line-height: 1.6;
  }

  .ai-panel-title {
    font-size: 10px;
    letter-spacing: 3px;
    color: rgba(255,100,100,0.7);
    border-bottom: 1px solid rgba(255,60,60,0.15);
    padding-bottom: 10px;
    margin-bottom: 14px;
    text-transform: uppercase;
  }

  .ai-stat {
    margin-bottom: 12px;
  }

  .ai-stat-label {
    color: rgba(200,255,212,0.35);
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  .ai-stat-val {
    color: rgba(255,150,150,0.9);
    font-size: 13px;
  }

  .ai-exploit {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid rgba(255,60,60,0.15);
    font-size: 10px;
    color: rgba(255,100,100,0.6);
    line-height: 1.7;
  }

  .ai-exploit strong {
    color: rgba(255,100,100,0.9);
    display: block;
    margin-bottom: 4px;
    font-size: 11px;
    letter-spacing: 1px;
  }

  /* Trick reveal */
  .trick-reveal {
    position: absolute;
    top: 8px; right: 8px;
    font-size: 9px;
    letter-spacing: 1px;
    color: rgba(255,100,100,0.7);
    text-transform: uppercase;
    padding: 3px 8px;
    border: 1px solid rgba(255,60,60,0.3);
    background: rgba(255,0,0,0.06);
    max-width: 200px;
    text-align: right;
    line-height: 1.4;
  }

  /* Combo display */
  .combo-display {
    position: absolute;
    top: 8px; left: 8px;
    font-size: 10px;
    letter-spacing: 2px;
    color: rgba(255,176,0,0.7);
    text-transform: uppercase;
  }

  /* Transition screen */
  .transition-screen {
    text-align: center;
    z-index: 10;
    max-width: 480px;
  }

  .transition-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 52px;
    letter-spacing: 6px;
    color: #ff3c3c;
    margin-bottom: 24px;
    text-shadow: 0 0 40px rgba(255,60,60,0.4);
    animation: glitch 0.4s infinite;
  }

  @keyframes glitch {
    0%, 100% { transform: none; }
    20% { transform: skewX(-2deg) translateX(2px); }
    40% { transform: skewX(1deg) translateX(-2px); }
    60% { transform: translateX(1px); }
  }

  .profile-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 28px;
    text-align: left;
  }

  .profile-item {
    border: 1px solid rgba(255,60,60,0.2);
    padding: 12px;
    background: rgba(255,0,0,0.03);
  }

  .profile-item-label {
    font-size: 9px;
    letter-spacing: 2px;
    color: rgba(200,255,212,0.3);
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .profile-item-val {
    font-size: 15px;
    color: rgba(255,120,120,0.9);
  }

  .profile-item-detail {
    font-size: 10px;
    color: rgba(200,255,212,0.4);
    margin-top: 2px;
  }

  .adv-btn {
    background: transparent;
    border: 2px solid #ff3c3c;
    color: #ff3c3c;
    font-family: 'Share Tech Mono', monospace;
    font-size: 13px;
    letter-spacing: 4px;
    padding: 12px 40px;
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.15s;
    position: relative;
  }

  .adv-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: #ff3c3c;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.15s;
  }

  .adv-btn span { position: relative; z-index: 1; }
  .adv-btn:hover { color: #080c0a; }
  .adv-btn:hover::before { transform: scaleX(1); }

  /* Game over */
  .gameover {
    text-align: center;
    z-index: 10;
    max-width: 480px;
  }

  .gameover-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 80px;
    letter-spacing: 8px;
    line-height: 1;
    margin-bottom: 8px;
  }

  .final-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin: 28px 0;
  }

  .stat-box {
    border: 1px solid rgba(200,255,212,0.12);
    padding: 16px 8px;
    text-align: center;
  }

  .stat-box-val {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 36px;
    letter-spacing: 2px;
    display: block;
    margin-bottom: 4px;
  }

  .stat-box-val.green { color: #00ff50; }
  .stat-box-val.red { color: #ff3c3c; }
  .stat-box-val.yellow { color: #ffb000; }

  .stat-box-label {
    font-size: 9px;
    letter-spacing: 2px;
    color: rgba(200,255,212,0.3);
    text-transform: uppercase;
  }

  .progress-track {
    width: 100%;
    height: 2px;
    background: rgba(200,255,212,0.08);
    margin-top: 2px;
  }

  .progress-fill {
    height: 100%;
    background: rgba(0,200,255,0.5);
    transition: width 0.3s;
  }
`;

// Utility
const avg = arr => arr.length ? arr.reduce((a,b) => a+b, 0) / arr.length : 0;
const stddev = arr => {
  if (arr.length < 2) return 0;
  const m = avg(arr);
  return Math.sqrt(arr.reduce((s,v) => s + (v-m)**2, 0) / arr.length);
};
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// Build player profile from learning data
function buildProfile(data) {
  const profile = {
    perKeyRT: {},       // avg reaction time per key
    perKeyStddev: {},   // consistency per key
    weakestKey: null,
    avgRT: 0,
    anticipates: false, // presses before window fully open
    rhythmInterval: 0,  // detected interval between prompts
    falsePressRate: 0,  // presses with no active prompt
    overallMissRate: 0,
    streakBehavior: 0,  // slower after long streaks?
  };

  let allRT = [];
  KEYS.forEach(k => {
    const times = data.reactionTimes[k] || [];
    profile.perKeyRT[k] = avg(times);
    profile.perKeyStddev[k] = stddev(times);
    allRT = allRT.concat(times);
  });

  profile.avgRT = avg(allRT);

  // Find weakest key (highest avg RT or most misses)
  const missWeight = k => (data.misses[k] || 0) * 200 + (profile.perKeyRT[k] || profile.avgRT);
  profile.weakestKey = KEYS.reduce((a, b) => missWeight(b) > missWeight(a) ? b : a);
  profile.weakestKeys = KEYS.slice().sort((a,b) => missWeight(b) - missWeight(a)).slice(0, 3);

  profile.anticipates = data.earlyPresses > data.totalRounds * 0.1;
  profile.rhythmInterval = avg(data.intervals);
  profile.falsePressRate = data.falsePresses / Math.max(1, data.totalRounds);
  profile.overallMissRate = data.totalMisses / Math.max(1, data.totalRounds);

  return profile;
}

// Adversarial trick selection
function selectTrick(profile, round) {
  const tricks = [];

  // Always available
  tricks.push({ type: 'target_weak', weight: 3 });

  if (profile.anticipates) tricks.push({ type: 'patience_trap', weight: 4 });
  if (profile.rhythmInterval > 0) tricks.push({ type: 'rhythm_break', weight: 3 });
  if (profile.falsePressRate < 0.05) tricks.push({ type: 'fake_prompt', weight: 2 });
  if (round > 5) tricks.push({ type: 'decoy_flash', weight: 2 });
  if (round > 8) tricks.push({ type: 'combo_attack', weight: 2 });
  tricks.push({ type: 'window_shrink', weight: 2 });

  const totalWeight = tricks.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * totalWeight;
  for (const t of tricks) {
    r -= t.weight;
    if (r <= 0) return t.type;
  }
  return tricks[0].type;
}

export default function AdversarialGame() {
  const [screen, setScreen] = useState('intro'); // intro | learning | transition | adversarial | gameover
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [round, setRound] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [aiExploits, setAiExploits] = useState(0);

  // Game state
  const [promptState, setPromptState] = useState('waiting'); // waiting | active | result
  const [currentKey, setCurrentKey] = useState(null);
  const [currentCombo, setCurrentCombo] = useState(null);
  const [isCombo, setIsCombo] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1);
  const [feedback, setFeedback] = useState({ msg: '', type: '' });
  const [promptBoxState, setPromptBoxState] = useState('');
  const [trickReveal, setTrickReveal] = useState('');
  const [currentTrick, setCurrentTrick] = useState(null);
  const [profile, setProfile] = useState(null);
  const [aiLastAction, setAiLastAction] = useState('');
  const [decoyKey, setDecoyKey] = useState(null);

  // Learning data
  const learningData = useRef({
    reactionTimes: { A:[], S:[], D:[], F:[], J:[], K:[], L:[] },
    misses: { A:0, S:0, D:0, F:0, J:0, K:0, L:0 },
    earlyPresses: 0,
    falsePresses: 0,
    totalRounds: 0,
    totalMisses: 0,
    intervals: [],
  });

  const timers = useRef({});
  const promptStartTime = useRef(0);
  const lastPromptTime = useRef(0);
  const windowMs = useRef(800);
  const expectedKeys = useRef(null); // set of keys to press
  const pressedInCombo = useRef(new Set());
  const waitingForRelease = useRef(false);
  const gameActive = useRef(false);
  const roundRef = useRef(0);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const aiExploitsRef = useRef(0);
  const currentPhase = useRef('learning');
  const profileRef = useRef(null);

  const clearTimers = () => {
    Object.values(timers.current).forEach(t => clearTimeout(t));
    timers.current = {};
  };

  const showFeedback = (msg, type, duration = 800) => {
    setFeedback({ msg, type });
    clearTimeout(timers.current.feedback);
    timers.current.feedback = setTimeout(() => setFeedback({ msg: '', type: '' }), duration);
  };

  const scheduleNextRound = useCallback((delay) => {
    clearTimeout(timers.current.next);
    timers.current.next = setTimeout(() => {
      if (!gameActive.current) return;
      startPrompt();
    }, delay);
  }, []);

  const endRound = useCallback((result) => {
    // result: 'hit' | 'miss' | 'fake_avoided' | 'fake_fail' | 'early'
    clearTimeout(timers.current.window);
    setPromptState('result');
    expectedKeys.current = null;
    pressedInCombo.current = new Set();

    if (result === 'hit') {
      const rt = Date.now() - promptStartTime.current;
      const k = currentKey;
      hitsRef.current++;
      setHits(h => h + 1);
      comboRef.current++;
      setCombo(c => {
        const nc = c + 1;
        if (nc > maxCombo) setMaxCombo(nc);
        return nc;
      });
      const pts = 100 + comboRef.current * 20;
      scoreRef.current += pts;
      setScore(s => s + pts);
      setPromptBoxState('success');
      showFeedback(`+${pts}  ${rt}ms`, 'hit');

      if (currentPhase.current === 'learning' && k) {
        learningData.current.reactionTimes[k].push(rt);
        if (lastPromptTime.current) {
          learningData.current.intervals.push(Date.now() - lastPromptTime.current);
        }
        lastPromptTime.current = Date.now();
      }
    } else if (result === 'miss' || result === 'timeout') {
      missesRef.current++;
      setMisses(m => m + 1);
      comboRef.current = 0;
      setCombo(0);
      setPromptBoxState('fail');
      showFeedback('MISS', 'miss');
      if (currentPhase.current === 'learning' && currentKey) {
        learningData.current.misses[currentKey] = (learningData.current.misses[currentKey] || 0) + 1;
        learningData.current.totalMisses++;
      }
    } else if (result === 'fake_avoided') {
      setPromptBoxState('');
      showFeedback('NICE — FAKE', 'hit');
    } else if (result === 'fake_fail') {
      aiExploitsRef.current++;
      setAiExploits(a => a + 1);
      missesRef.current++;
      setMisses(m => m + 1);
      comboRef.current = 0;
      setCombo(0);
      setPromptBoxState('fail');
      showFeedback('GOT YOU', 'miss');
    } else if (result === 'early') {
      missesRef.current++;
      setMisses(m => m + 1);
      comboRef.current = 0;
      setCombo(0);
      setPromptBoxState('fail');
      showFeedback('TOO EARLY', 'early');
      if (currentPhase.current === 'learning') learningData.current.earlyPresses++;
    }

    const newRound = roundRef.current + 1;
    roundRef.current = newRound;
    setRound(newRound);
    learningData.current.totalRounds++;

    if (currentPhase.current === 'learning' && newRound >= LEARNING_ROUNDS) {
      clearTimers();
      gameActive.current = false;
      setTimeout(() => {
        const p = buildProfile(learningData.current);
        setProfile(p);
        profileRef.current = p;
        setScreen('transition');
      }, 1200);
      return;
    }

    if (currentPhase.current === 'adversarial' && newRound >= LEARNING_ROUNDS + 30) {
      clearTimers();
      gameActive.current = false;
      setTimeout(() => setScreen('gameover'), 1200);
      return;
    }

    scheduleNextRound(900 + Math.random() * 400);
  }, [currentKey, maxCombo, scheduleNextRound]);

  const startPrompt = useCallback(() => {
    if (!gameActive.current) return;

    setDecoyKey(null);
    setTrickReveal('');
    setCurrentTrick(null);
    setPromptBoxState('');

    const phase = currentPhase.current;
    const p = profileRef.current;
    let chosenKey = KEYS[Math.floor(Math.random() * KEYS.length)];
    let chosenCombo = null;
    let trick = null;
    let window = 750;
    let preDelay = 0; // extra delay before activating

    if (phase === 'adversarial' && p) {
      trick = selectTrick(p, roundRef.current - LEARNING_ROUNDS);
      setCurrentTrick(trick);

      switch (trick) {
        case 'target_weak': {
          // pick from weakest keys
          const pool = p.weakestKeys;
          chosenKey = pool[Math.floor(Math.random() * Math.min(2, pool.length))];
          window = clamp(p.perKeyRT[chosenKey] * 0.85 || 650, 400, 700);
          setAiLastAction(`targeting your weak key: ${chosenKey}`);
          break;
        }
        case 'patience_trap': {
          // long delay then short window — exploits anticipation
          preDelay = 600 + Math.random() * 400;
          window = clamp(p.avgRT * 0.75, 350, 600);
          setAiLastAction('patience trap: extended delay to catch anticipation');
          break;
        }
        case 'rhythm_break': {
          // break expected rhythm with very short or very long delay before prompt
          const expectedInterval = p.rhythmInterval;
          const breakType = Math.random() > 0.5 ? 0.3 : 2.2;
          preDelay = Math.max(0, expectedInterval * breakType - 900);
          setAiLastAction('rhythm disruption detected');
          break;
        }
        case 'fake_prompt': {
          // show prompt then yank it — if you press, you lose
          trick = 'fake_prompt';
          break;
        }
        case 'decoy_flash': {
          // flash wrong key for 150ms then show real one
          const decoy = KEYS.filter(k => k !== chosenKey)[Math.floor(Math.random() * 6)];
          setDecoyKey(decoy);
          setCurrentKey(decoy);
          preDelay = 160;
          setAiLastAction(`decoy flash: ${decoy} → ${chosenKey}`);
          break;
        }
        case 'combo_attack': {
          // use a combo involving weakest keys
          const weak = p.weakestKeys.slice(0, 2);
          const comboOpt = COMBO_KEYS.filter(c => c.some(k => weak.includes(k)));
          chosenCombo = comboOpt.length > 0
            ? comboOpt[Math.floor(Math.random() * comboOpt.length)]
            : COMBO_KEYS[Math.floor(Math.random() * COMBO_KEYS.length)];
          window = clamp(p.avgRT * 1.2, 600, 1000);
          setAiLastAction(`combo attack: ${chosenCombo?.join('+')} — your weak combos`);
          break;
        }
        case 'window_shrink': {
          window = clamp(p.avgRT * 0.7, 300, 550);
          setAiLastAction(`window shrinked to ${Math.round(window)}ms — your avg is ${Math.round(p.avgRT)}ms`);
          break;
        }
      }
    }

    windowMs.current = window;

    if (trick === 'fake_prompt') {
      // Show prompt, then remove it
      const fakeKey = chosenKey;
      setCurrentKey(fakeKey);
      setIsCombo(false);
      setCurrentCombo(null);
      expectedKeys.current = null; // null = fake, pressing = bad
      setPromptState('active');
      setPromptBoxState('fake');
      promptStartTime.current = Date.now();
      setTimeLeft(1);
      setTrickReveal('fake prompt');
      setAiLastAction('fake prompt: press = punished, wait = rewarded');

      // Cancel after short time
      const fakeDuration = 200 + Math.random() * 250;
      timers.current.window = setTimeout(() => {
        // If expectedKeys still null (not pressed) = fake was avoided
        if (expectedKeys.current === null) {
          setCurrentKey(null);
          setDecoyKey(null);
          setPromptState('result');
          aiExploitsRef.current++;
          setAiExploits(a => a + 1);
          roundRef.current++;
          setRound(r => r + 1);
          showFeedback('FAKE — DODGED', 'fake');
          setPromptBoxState('');
          learningData.current.totalRounds++;
          scheduleNextRound(800);
        }
      }, fakeDuration);
      return;
    }

    // Handle decoy flash
    if (trick === 'decoy_flash') {
      setCurrentKey(chosenKey);
      setIsCombo(false);
      setCurrentCombo(null);
      setPromptState('active');
      setPromptBoxState('');
      promptStartTime.current = Date.now() + preDelay;

      // After preDelay, switch to real key
      timers.current.decoy = setTimeout(() => {
        setDecoyKey(null);
        setCurrentKey(chosenKey);
        setPromptBoxState('active');
        expectedKeys.current = new Set([chosenKey]);
        promptStartTime.current = Date.now();
        setTimeLeft(1);

        timers.current.window = setTimeout(() => {
          if (expectedKeys.current?.size > 0) {
            endRound('timeout');
          }
        }, window);
      }, preDelay);
      return;
    }

    // Standard prompt (possibly with preDelay for patience trap)
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
      // Show placeholder then activate
      setPromptState('waiting');
      timers.current.patience = setTimeout(() => {
        activatePrompt(chosenKey, chosenCombo, window);
      }, preDelay);
    } else {
      activatePrompt(chosenKey, chosenCombo, window);
    }
  }, [endRound, scheduleNextRound]);

  const activatePrompt = (key, combo, window) => {
    if (!combo) {
      setCurrentKey(key);
      expectedKeys.current = new Set([key]);
    } else {
      setCurrentCombo(combo);
      setCurrentKey(combo[0]);
      expectedKeys.current = new Set(combo);
    }
    setPromptState('active');
    setPromptBoxState('active');
    promptStartTime.current = Date.now();
    setTimeLeft(1);

    // Animate timer
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
        endRound('timeout');
      }
    }, window);
  };

  const handleKeyDown = useCallback((e) => {
    if (screen !== 'learning' && screen !== 'adversarial') return;
    const key = e.key.toUpperCase();
    if (!KEYS.includes(key)) return;
    e.preventDefault();

    // Fake prompt check — pressing on fake = punished
    if (promptState === 'active' && expectedKeys.current === null) {
      // Was a fake — they pressed it
      clearTimeout(timers.current.window);
      endRound('fake_fail');
      setTrickReveal('fake prompt — you fell for it');
      return;
    }

    if (promptState === 'active' && expectedKeys.current) {
      if (expectedKeys.current.has(key)) {
        pressedInCombo.current.add(key);
        if (pressedInCombo.current.size >= expectedKeys.current.size) {
          clearTimeout(timers.current.window);
          cancelAnimationFrame(timers.current.timerAnim);
          endRound('hit');
          if (currentTrick) setTrickReveal(`beat: ${currentTrick.replace(/_/g,' ')}`);
        }
      }
    } else if (promptState === 'waiting') {
      // Pressed too early
      endRound('early');
    } else {
      // False press
      if (currentPhase.current === 'learning') learningData.current.falsePresses++;
      showFeedback('no prompt active', 'miss', 600);
    }
  }, [screen, promptState, endRound, currentTrick]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const startGame = (phase) => {
    clearTimers();
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
    setFeedback({ msg: '', type: '' });
    setPromptState('waiting');
    setCurrentKey(null);
    setCurrentCombo(null);
    setDecoyKey(null);
    setPromptBoxState('');
    currentPhase.current = phase;
    gameActive.current = true;
    setScreen(phase);
    scheduleNextRound(1200);
  };

  const startAdversarial = () => {
    clearTimers();
    roundRef.current = LEARNING_ROUNDS;
    scoreRef.current = 0;
    comboRef.current = 0;
    hitsRef.current = 0;
    missesRef.current = 0;
    aiExploitsRef.current = 0;
    setRound(LEARNING_ROUNDS);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHits(0);
    setMisses(0);
    setAiExploits(0);
    setFeedback({ msg: '', type: '' });
    setPromptState('waiting');
    setCurrentKey(null);
    setCurrentCombo(null);
    setDecoyKey(null);
    setPromptBoxState('');
    currentPhase.current = 'adversarial';
    gameActive.current = true;
    setScreen('adversarial');
    scheduleNextRound(1400);
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const learningProgress = Math.min(1, round / LEARNING_ROUNDS);
  const advRound = Math.max(0, round - LEARNING_ROUNDS);
  const advProgress = Math.min(1, advRound / 30);

  const renderGameUI = (phase) => {
    const timerDanger = timeLeft < 0.3;
    const displayKey = decoyKey || currentKey;
    const displayCombo = currentCombo;

    return (
      <div className="main-area">
        <div className="game-panel">
          <div className="hud-row">
            <div>
              <span style={{ display: 'block', fontSize: 9, letterSpacing: 2, color: 'rgba(200,255,212,0.3)', marginBottom: 2 }}>SCORE</span>
              <span className="hud-val">{score.toLocaleString()}</span>
            </div>
            <div>
              <span className={`phase-label ${phase}`}>
                {phase === 'learning' ? '◉ LEARNING' : '⚠ ADVERSARIAL'}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: 9, letterSpacing: 2, color: 'rgba(200,255,212,0.3)', marginBottom: 2 }}>COMBO</span>
              <span className="hud-val" style={{ color: combo > 3 ? '#ffb000' : '#c8ffd4' }}>×{combo}</span>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, letterSpacing: 2, color: 'rgba(200,255,212,0.25)', marginBottom: 6, textTransform: 'uppercase' }}>
              <span>{phase === 'learning' ? `round ${round}/${LEARNING_ROUNDS}` : `round ${advRound}/30`}</span>
              <span>{phase === 'learning' ? 'profiling' : `exploits: ${aiExploits}`}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(phase === 'learning' ? learningProgress : advProgress) * 100}%` }} />
            </div>
          </div>

          <div className={`prompt-box ${promptBoxState}`}>
            {trickReveal && <div className="trick-reveal">{trickReveal}</div>}
            {combo > 2 && <div className="combo-display">STREAK ×{combo}</div>}

            {promptState === 'waiting' && (
              <div className="waiting-text">STANDBY<span className="waiting-dots">...</span></div>
            )}
            {(promptState === 'active' || promptState === 'result') && displayKey && (
              <>
                {displayCombo && isCombo ? (
                  <div className={`key-display combo ${decoyKey ? 'fake-flash' : ''}`}>
                    {displayCombo.join('+')}
                  </div>
                ) : (
                  <div className={`key-display ${decoyKey ? 'fake-flash' : ''}`} style={promptBoxState === 'fake' ? { color: '#ff3c3c' } : {}}>
                    {displayKey}
                  </div>
                )}
                <div className="key-label">
                  {promptBoxState === 'fake' ? '[ FAKE ]' : isCombo ? 'PRESS BOTH' : 'PRESS KEY'}
                </div>
              </>
            )}
          </div>

          <div className="timer-track">
            <div
              className={`timer-fill ${timerDanger ? 'danger' : ''}`}
              style={{ width: `${timeLeft * 100}%` }}
            />
          </div>

          <div className="key-grid">
            {KEYS.map(k => {
              const isTarget = expectedKeys.current?.has(k);
              const isDecoy = decoyKey === k;
              const missRate = (learningData.current.misses[k] || 0) / Math.max(1, LEARNING_ROUNDS / KEYS.length);
              const weaknessWidth = Math.min(100, missRate * 200);
              return (
                <div
                  key={k}
                  className={`key-chip ${isDecoy ? 'combo-target' : isTarget ? (isCombo ? 'combo-target' : 'target') : profile && profile.weakestKeys?.slice(0,2).includes(k) && phase === 'adversarial' ? 'weak' : ''}`}
                >
                  {k}
                  {weaknessWidth > 10 && <div className="weakness-bar" style={{ width: `${weaknessWidth}%` }} />}
                </div>
              );
            })}
          </div>

          <div className={`feedback ${feedback.type}`}>{feedback.msg}</div>
        </div>

        {phase === 'adversarial' && profile && (
          <div className="ai-panel">
            <div className="ai-panel-title">⚠ AI PROFILE</div>
            <div className="ai-stat">
              <div className="ai-stat-label">avg reaction</div>
              <div className="ai-stat-val">{Math.round(profile.avgRT)}ms</div>
            </div>
            <div className="ai-stat">
              <div className="ai-stat-label">weakest key</div>
              <div className="ai-stat-val">{profile.weakestKey}</div>
            </div>
            <div className="ai-stat">
              <div className="ai-stat-label">anticipates</div>
              <div className="ai-stat-val">{profile.anticipates ? 'YES — exploiting' : 'NO'}</div>
            </div>
            <div className="ai-stat">
              <div className="ai-stat-label">rhythm detected</div>
              <div className="ai-stat-val">{profile.rhythmInterval > 0 ? `~${Math.round(profile.rhythmInterval)}ms` : 'irregular'}</div>
            </div>
            <div className="ai-stat">
              <div className="ai-stat-label">miss rate</div>
              <div className="ai-stat-val">{Math.round(profile.overallMissRate * 100)}%</div>
            </div>
            {aiLastAction && (
              <div className="ai-exploit">
                <strong>last move</strong>
                {aiLastAction}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

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

        {screen === 'intro' && (
          <div className="intro">
            <div className="game-title">HABITUAL</div>
            <div className="game-subtitle">adversarial reflex engine</div>
            <div className="intro-desc">
              You will play a simple key-press game.<br/>
              The system will watch. The system will learn.<br/>
              Then it will use everything it knows to<br/>
              <strong style={{ color: '#c8ffd4' }}>exploit your patterns against you.</strong>
            </div>
            <div className="phase-badges">
              <div className="phase-badge learn">Phase I — Profiling ({LEARNING_ROUNDS} rounds)</div>
              <div className="phase-badge adv">Phase II — Adversarial (30 rounds)</div>
            </div>
            <button className="start-btn" onClick={() => startGame('learning')}>
              <span>begin profiling</span>
            </button>
          </div>
        )}

        {screen === 'learning' && renderGameUI('learning')}

        {screen === 'transition' && profile && (
          <div className="transition-screen">
            <div className="transition-title">PROFILE COMPLETE</div>
            <p style={{ fontSize: 11, letterSpacing: 3, color: 'rgba(200,255,212,0.4)', marginBottom: 28, textTransform: 'uppercase' }}>
              exploitation strategy computed
            </p>
            <div className="profile-grid">
              <div className="profile-item">
                <div className="profile-item-label">avg reaction time</div>
                <div className="profile-item-val">{Math.round(profile.avgRT)}ms</div>
                <div className="profile-item-detail">windows will shrink to {Math.round(profile.avgRT * 0.7)}ms</div>
              </div>
              <div className="profile-item">
                <div className="profile-item-label">weakest key</div>
                <div className="profile-item-val">{profile.weakestKey}</div>
                <div className="profile-item-detail">will be targeted disproportionately</div>
              </div>
              <div className="profile-item">
                <div className="profile-item-label">anticipation</div>
                <div className="profile-item-val">{profile.anticipates ? 'DETECTED' : 'NOT DETECTED'}</div>
                <div className="profile-item-detail">{profile.anticipates ? 'patience traps enabled' : 'no delay exploitation'}</div>
              </div>
              <div className="profile-item">
                <div className="profile-item-label">rhythm interval</div>
                <div className="profile-item-val">{profile.rhythmInterval > 0 ? `${Math.round(profile.rhythmInterval)}ms` : 'random'}</div>
                <div className="profile-item-detail">{profile.rhythmInterval > 0 ? 'will be broken deliberately' : 'no rhythm to exploit'}</div>
              </div>
              <div className="profile-item">
                <div className="profile-item-label">miss rate</div>
                <div className="profile-item-val">{Math.round(profile.overallMissRate * 100)}%</div>
              </div>
              <div className="profile-item">
                <div className="profile-item-label">weak key pool</div>
                <div className="profile-item-val">{profile.weakestKeys?.slice(0,3).join(' · ')}</div>
                <div className="profile-item-detail">combo attacks will use these</div>
              </div>
            </div>
            <button className="adv-btn" onClick={startAdversarial}>
              <span>enter adversarial phase</span>
            </button>
          </div>
        )}

        {screen === 'adversarial' && renderGameUI('adversarial')}

        {screen === 'gameover' && (
          <div className="gameover">
            <div className="gameover-title" style={{ color: aiExploits > hitsRef.current ? '#ff3c3c' : '#00ff50' }}>
              {aiExploits > hits ? 'OWNED' : 'SURVIVED'}
            </div>
            <p style={{ fontSize: 11, letterSpacing: 3, color: 'rgba(200,255,212,0.3)', textTransform: 'uppercase' }}>
              adversarial phase complete
            </p>
            <div className="final-stats">
              <div className="stat-box">
                <span className="stat-box-val green">{score.toLocaleString()}</span>
                <div className="stat-box-label">score</div>
              </div>
              <div className="stat-box">
                <span className="stat-box-val green">{hits}</span>
                <div className="stat-box-label">hits</div>
              </div>
              <div className="stat-box">
                <span className="stat-box-val red">{misses}</span>
                <div className="stat-box-label">misses</div>
              </div>
              <div className="stat-box">
                <span className="stat-box-val yellow">{maxCombo}</span>
                <div className="stat-box-label">max combo</div>
              </div>
              <div className="stat-box">
                <span className="stat-box-val red">{aiExploits}</span>
                <div className="stat-box-label">ai exploits</div>
              </div>
              <div className="stat-box">
                <span className="stat-box-val" style={{ color: '#c8ffd4', fontSize: 24 }}>
                  {hits > 0 ? Math.round(hits / (hits + misses) * 100) : 0}%
                </span>
                <div className="stat-box-label">accuracy</div>
              </div>
            </div>
            {profile && (
              <p style={{ fontSize: 11, color: 'rgba(200,255,212,0.4)', marginBottom: 28, lineHeight: 1.8 }}>
                The AI exploited your {profile.weakestKey} hesitation,
                {profile.anticipates ? ' your anticipatory presses,' : ''}
                {profile.rhythmInterval > 0 ? ` your ${Math.round(profile.rhythmInterval)}ms rhythm,` : ''}
                {' '}and shrunk windows to ~{Math.round(profile.avgRT * 0.7)}ms.
              </p>
            )}
            <button className="start-btn" onClick={() => {
              learningData.current = {
                reactionTimes: { A:[], S:[], D:[], F:[], J:[], K:[], L:[] },
                misses: { A:0, S:0, D:0, F:0, J:0, K:0, L:0 },
                earlyPresses: 0, falsePresses: 0, totalRounds: 0, totalMisses: 0, intervals: []
              };
              setProfile(null);
              profileRef.current = null;
              setScreen('intro');
            }}>
              <span>play again</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
