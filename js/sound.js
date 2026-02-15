// ============================================
// SOUND — Web Audio API synthesized sounds
// ============================================

const SoundEngine = (() => {
  let audioCtx = null;
  let muted = false;

  function getCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function isMuted() {
    return muted;
  }

  function setMuted(val) {
    muted = val;
    localStorage.setItem("hb_muted", val ? "1" : "0");
  }

  function loadMuted() {
    muted = localStorage.getItem("hb_muted") === "1";
    return muted;
  }

  // Short tick — CS:GO reel item passing
  function tick() {
    if (muted) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800 + Math.random() * 200;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }

  // Whoosh — rising pitch for shaking
  function whoosh() {
    if (muted) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.8);
    osc.type = "sawtooth";
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  }

  // Reveal — major chord burst
  function reveal(isEpic) {
    if (muted) return;
    const ctx = getCtx();
    const freqs = isEpic ? [261.6, 329.6, 392, 523.3] : [523.3, 659.3, 784];
    const duration = isEpic ? 1.5 : 0.8;

    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(isEpic ? 0.08 : 0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    });
  }

  // Click — UI interaction
  function click() {
    if (muted) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1200;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.03);
  }

  return { tick, whoosh, reveal, click, isMuted, setMuted, loadMuted, getCtx };
})();
