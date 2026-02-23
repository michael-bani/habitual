import { LEARNING_ROUNDS } from "../constants.js";

export default function IntroScreen({ onStart }) {
  return (
    <div className="intro">
      <div className="game-title">HABITUAL</div>
      <div className="game-subtitle">adversarial reflex engine</div>
      <div className="intro-desc">
        You will play a simple key-press game.<br />
        The system will watch. The system will learn.<br />
        Then it will use everything it knows to<br />
        <strong style={{ color: "#c8ffd4" }}>exploit your patterns against you.</strong>
      </div>
      <div className="phase-badges">
        <div className="phase-badge learn">Phase I — Profiling ({LEARNING_ROUNDS} rounds)</div>
        <div className="phase-badge adv">Phase II — Adversarial (30 rounds)</div>
      </div>
      <button className="start-btn" onClick={() => onStart("learning")}>
        <span>begin profiling</span>
      </button>
    </div>
  );
}
