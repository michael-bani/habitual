/**
 * AIPanel — live display of what the AI has learned about the player.
 * Shown during the adversarial phase alongside the game panel.
 */
export default function AIPanel({ profile, aiLastAction }) {
  return (
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
        <div className="ai-stat-val">{profile.anticipates ? "YES — exploiting" : "NO"}</div>
      </div>
      <div className="ai-stat">
        <div className="ai-stat-label">rhythm detected</div>
        <div className="ai-stat-val">
          {profile.rhythmInterval > 0
            ? `~${Math.round(profile.rhythmInterval)}ms`
            : "irregular"}
        </div>
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
  );
}
