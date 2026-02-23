import { KEYS, LEARNING_ROUNDS } from "../constants.js";
import AIPanel from "./AIPanel.jsx";

/**
 * GameScreen — renders the main game panel for both the learning and
 * adversarial phases. Receives all display state as props; no game logic lives here.
 *
 * Props:
 *   phase         'learning' | 'adversarial'
 *   score, combo, round, advRound
 *   learningProgress, advProgress   (0–1 fill for the progress bar)
 *   promptState   'waiting' | 'active' | 'result'
 *   promptBoxState  '' | 'active' | 'fake' | 'fail' | 'success'
 *   currentKey    string | null
 *   currentCombo  string[] | null
 *   isCombo       bool
 *   decoyKey      string | null
 *   timeLeft      0–1 (timer fill fraction)
 *   feedback      { msg, type }
 *   trickReveal   string — trick name shown in the corner
 *   aiExploits    number
 *   profile       player profile object | null
 *   aiLastAction  string
 *   targetKeys    Set<string> | null — keys the player must press this round
 *   keyMisses     { [key]: number } — per-key miss counts for weakness bars
 */
export default function GameScreen({
  phase,
  score,
  combo,
  round,
  advRound,
  learningProgress,
  advProgress,
  promptState,
  promptBoxState,
  currentKey,
  currentCombo,
  isCombo,
  decoyKey,
  timeLeft,
  feedback,
  trickReveal,
  aiExploits,
  profile,
  aiLastAction,
  targetKeys,
  keyMisses,
}) {
  const timerDanger = timeLeft < 0.3;
  const displayKey = decoyKey || currentKey;
  const displayCombo = currentCombo;

  return (
    <div className="main-area">
      <div className="game-panel">
        {/* HUD row */}
        <div className="hud-row">
          <div>
            <span style={{ display: "block", fontSize: 9, letterSpacing: 2, color: "rgba(200,255,212,0.3)", marginBottom: 2 }}>
              SCORE
            </span>
            <span className="hud-val">{score.toLocaleString()}</span>
          </div>
          <div>
            <span className={`phase-label ${phase}`}>
              {phase === "learning" ? "◉ LEARNING" : "⚠ ADVERSARIAL"}
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ display: "block", fontSize: 9, letterSpacing: 2, color: "rgba(200,255,212,0.3)", marginBottom: 2 }}>
              COMBO
            </span>
            <span className="hud-val" style={{ color: combo > 3 ? "#ffb000" : "#c8ffd4" }}>
              ×{combo}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, letterSpacing: 2, color: "rgba(200,255,212,0.25)", marginBottom: 6, textTransform: "uppercase" }}>
            <span>{phase === "learning" ? `round ${round}/${LEARNING_ROUNDS}` : `round ${advRound}/30`}</span>
            <span>{phase === "learning" ? "profiling" : `exploits: ${aiExploits}`}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${(phase === "learning" ? learningProgress : advProgress) * 100}%` }} />
          </div>
        </div>

        {/* Prompt box */}
        <div className={`prompt-box ${promptBoxState}`}>
          {trickReveal && <div className="trick-reveal">{trickReveal}</div>}
          {combo > 2 && <div className="combo-display">STREAK ×{combo}</div>}

          {promptState === "waiting" && (
            <div className="waiting-text">
              STANDBY<span className="waiting-dots">...</span>
            </div>
          )}

          {(promptState === "active" || promptState === "result") && displayKey && (
            <>
              {displayCombo && isCombo ? (
                <div className={`key-display combo ${decoyKey ? "fake-flash" : ""}`}>
                  {displayCombo.join("+")}
                </div>
              ) : (
                <div
                  className={`key-display ${decoyKey ? "fake-flash" : ""}`}
                  style={promptBoxState === "fake" ? { color: "#ff3c3c" } : {}}
                >
                  {displayKey}
                </div>
              )}
              <div className="key-label">
                {promptBoxState === "fake" ? "[ FAKE ]" : isCombo ? "PRESS BOTH" : "PRESS KEY"}
              </div>
            </>
          )}
        </div>

        {/* Timer bar */}
        <div className="timer-track">
          <div className={`timer-fill ${timerDanger ? "danger" : ""}`} style={{ width: `${timeLeft * 100}%` }} />
        </div>

        {/* Key grid */}
        <div className="key-grid">
          {KEYS.map((k) => {
            const isTarget = targetKeys?.has(k);
            const isDecoy = decoyKey === k;
            const missRate = (keyMisses[k] || 0) / Math.max(1, LEARNING_ROUNDS / KEYS.length);
            const weaknessWidth = Math.min(100, missRate * 200);
            const isWeak = profile?.weakestKeys?.slice(0, 2).includes(k) && phase === "adversarial";
            return (
              <div
                key={k}
                className={`key-chip ${isDecoy ? "combo-target" : isTarget ? (isCombo ? "combo-target" : "target") : isWeak ? "weak" : ""}`}
              >
                {k}
                {weaknessWidth > 10 && (
                  <div className="weakness-bar" style={{ width: `${weaknessWidth}%` }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Feedback line */}
        <div className={`feedback ${feedback.type}`}>{feedback.msg}</div>
      </div>

      {/* AI profile panel — adversarial phase only */}
      {phase === "adversarial" && profile && (
        <AIPanel profile={profile} aiLastAction={aiLastAction} />
      )}
    </div>
  );
}
