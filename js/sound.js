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

  // Reveal — Tier specific sounds
  function playTierSound(tierId) {
    if (muted) return;
    const ctx = getCtx();
    const now = ctx.currentTime;

    // Helper: Play a tone
    const playTone = (freq, type, startTime, duration, vol = 0.1) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = type;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Helper: Play a chord
    const playChord = (freqs, type, startTime, duration, vol = 0.1) => {
      freqs.forEach(f => playTone(f, type, startTime, duration, vol));
    };

    switch (tierId) {
      case "common":
        // Simple ding (Gray)
        playChord([523.3, 659.3], "sine", now, 0.8, 0.05); // C, E
        break;

      case "uncommon":
        // Pleasant chime (Green)
        playChord([523.3, 659.3, 784.0], "sine", now, 1.0, 0.05); // C Major
        break;

      case "rare":
        // Magical bright sound (Blue)
        playChord([659.3, 830.6, 987.8, 1318.5], "triangle", now, 1.5, 0.04); // E Minor 7
        // Sparkles
        setTimeout(() => playTone(1568.0, "sine", now + 0.1, 0.5, 0.02), 100);
        setTimeout(() => playTone(1975.5, "sine", now + 0.2, 0.5, 0.02), 200);
        break;

      case "epic":
        // Heroic swell (Purple) - Sawtooth for "Brass" feel
        // Fanfare: C -> G -> C high
        playChord([261.6, 329.6, 392.0], "sawtooth", now, 0.4, 0.03); // C Maj low
        playChord([392.0, 493.9, 587.3], "sawtooth", now + 0.3, 0.4, 0.03); // G Maj
        playChord([523.3, 659.3, 784.0, 1046.5], "sawtooth", now + 0.6, 2.0, 0.05); // C Maj high
        break;

      case "legendary":
        // HEAVENLY VICTORY (Gold) - Smoother, magical sound
        // Base chord pad (smooth triangle -> flute/organ like)
        playChord([261.6, 329.6, 392.0, 523.3], "triangle", now, 2.5, 0.08); // C Major 7

        // Fast harp run up (Sine waves -> bell/harp like)
        const harp = [261.6, 329.6, 392.0, 523.3, 659.3, 784.0, 1046.5, 1318.5, 1568.0, 2093.0];
        harp.forEach((f, i) => {
           playTone(f, "sine", now + (i * 0.06), 0.8, 0.05);
        });

        // Final High Shimmer Impact
        const shimmerTime = now + 0.6;
        playChord([1046.5, 1318.5, 1568.0, 2093.0], "sine", shimmerTime, 2.0, 0.06); 
        playChord([1056.0, 1328.0, 1578.0, 2103.0], "sine", shimmerTime, 1.5, 0.03); // Slight detune for shimmer effect
        break;
        
      default:
        playChord([440], "sine", now, 0.5);
    }
  }

  // Click — UI interaction
  function click() {
    if (muted) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  return { tick, whoosh, playTierSound, click, isMuted, setMuted, loadMuted, getCtx };
})();
