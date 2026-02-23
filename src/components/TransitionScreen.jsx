export default function TransitionScreen({ profile, onStart }) {
  return (
    <div className="transition-screen">
      <div className="transition-title">PROFILE COMPLETE</div>
      <p style={{ fontSize: 11, letterSpacing: 3, color: "rgba(200,255,212,0.4)", marginBottom: 28, textTransform: "uppercase" }}>
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
          <div className="profile-item-val">{profile.anticipates ? "DETECTED" : "NOT DETECTED"}</div>
          <div className="profile-item-detail">
            {profile.anticipates ? "patience traps enabled" : "no delay exploitation"}
          </div>
        </div>
        <div className="profile-item">
          <div className="profile-item-label">rhythm interval</div>
          <div className="profile-item-val">
            {profile.rhythmInterval > 0 ? `${Math.round(profile.rhythmInterval)}ms` : "random"}
          </div>
          <div className="profile-item-detail">
            {profile.rhythmInterval > 0 ? "will be broken deliberately" : "no rhythm to exploit"}
          </div>
        </div>
        <div className="profile-item">
          <div className="profile-item-label">miss rate</div>
          <div className="profile-item-val">{Math.round(profile.overallMissRate * 100)}%</div>
        </div>
        <div className="profile-item">
          <div className="profile-item-label">weak key pool</div>
          <div className="profile-item-val">{profile.weakestKeys?.slice(0, 3).join(" · ")}</div>
          <div className="profile-item-detail">combo attacks will use these</div>
        </div>
      </div>
      <button className="adv-btn" onClick={onStart}>
        <span>enter adversarial phase</span>
      </button>
    </div>
  );
}
