export default function GameOver({ score, hits, misses, maxCombo, aiExploits, profile, onRestart }) {
  const accuracy = hits > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;
  const aiWon = aiExploits > hits;

  return (
    <div className="gameover">
      <div className="gameover-title" style={{ color: aiWon ? "#ff3c3c" : "#00ff50" }}>
        {aiWon ? "OWNED" : "SURVIVED"}
      </div>
      <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(200,255,212,0.3)", textTransform: "uppercase" }}>
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
          <span className="stat-box-val" style={{ color: "#c8ffd4", fontSize: 24 }}>
            {accuracy}%
          </span>
          <div className="stat-box-label">accuracy</div>
        </div>
      </div>
      {profile && (
        <p style={{ fontSize: 11, color: "rgba(200,255,212,0.4)", marginBottom: 28, lineHeight: 1.8 }}>
          The AI exploited your {profile.weakestKey} hesitation,
          {profile.anticipates ? " your anticipatory presses," : ""}
          {profile.rhythmInterval > 0 ? ` your ${Math.round(profile.rhythmInterval)}ms rhythm,` : ""}
          {" "}and shrunk windows to ~{Math.round(profile.avgRT * 0.7)}ms.
        </p>
      )}
      <button className="start-btn" onClick={onRestart}>
        <span>play again</span>
      </button>
    </div>
  );
}
