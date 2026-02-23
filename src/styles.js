export const css = `
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
