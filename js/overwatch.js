// ============================================
// OVERWATCH — Overwatch-style lootbox opening
// ============================================

function owHandleLootboxClick() {
  if (lootboxState !== "idle") return;

  const hasValues = TIERS.some(
    (t) => config[t.id].values.length > 0 && config[t.id].rate > 0,
  );
  if (!hasValues) {
    showToast("⚠️ Hãy cài đặt giá trị tiền trước!");
    return;
  }

  lootboxState = "shaking";
  const instructionText = document.querySelector("#instruction-text");
  instructionText.style.display = "none";

  // Roll once
  const result = rollLootbox();
  const tier = TIERS.find((t) => t.id === result.tier);

  const hongbaoBox = document.querySelector("#hongbao-box-ow");
  const glowRing = document.querySelector("#glow-ring-ow");

  // Phase 1: Gentle shake
  hongbaoBox.classList.remove("lootbox-idle");
  hongbaoBox.classList.add("lootbox-shaking");
  SoundEngine.whoosh();

  // Phase 2: Intense shake after 800ms
  setTimeout(() => {
    if (lootboxState !== "shaking") return;
    hongbaoBox.classList.remove("lootbox-shaking");
    hongbaoBox.classList.add("lootbox-shaking-intense");

    glowRing.style.background = tier.color;
    gsap.to(glowRing, { opacity: 0.6, duration: 0.5 });
  }, 800);

  // Phase 3: Open after 1.8s
  setTimeout(() => {
    lootboxState = "opening";
    owOpenLootbox(result);
  }, 1800);
}

function owOpenLootbox(result) {
  const tier = TIERS.find((t) => t.id === result.tier);
  const hongbaoBox = document.querySelector("#hongbao-box-ow");
  const flashOverlay = document.querySelector("#flash-overlay");
  const rarityBeam = document.querySelector("#rarity-beam");

  hongbaoBox.classList.remove("lootbox-shaking", "lootbox-shaking-intense");

  // Flash screen
  flashOverlay.classList.add("screen-flash");
  setTimeout(() => flashOverlay.classList.remove("screen-flash"), 600);

  // Rarity beam
  const beamEl = rarityBeam.querySelector(".beam-column");
  beamEl.style.setProperty("--beam-color", tier.color);
  gsap.to(rarityBeam, { opacity: 1, duration: 0.3 });

  // Effects
  createBurstParticles(tier.color, 30);
  fireConfetti(tier);

  // Animate box away
  gsap.to(hongbaoBox, {
    scale: 1.3,
    opacity: 0,
    y: -50,
    rotateY: 180,
    duration: 0.6,
    ease: "power2.in",
    onComplete: () => {
      // Collapse the box's layout space so result card doesn't push below viewport
      hongbaoBox.style.display = "none";
    },
  });

  // Show result
  setTimeout(() => {
    lootboxState = "result";
    owShowResult(result, tier);
  }, 800);
}

function owShowResult(result, tier) {
  const rarityBeam = document.querySelector("#rarity-beam");
  const resultCard = document.querySelector("#result-card");
  const resultCardGlow = document.querySelector("#result-card-glow");
  const resultTierBadge = document.querySelector("#result-tier-badge");
  const resultAmount = document.querySelector("#result-amount");
  const resultDisplay = document.querySelector("#result-display");
  const glowRing = document.querySelector("#glow-ring-ow");

  gsap.to(rarityBeam, { opacity: 0, duration: 1 });

  // Style card
  resultCard.style.borderColor = tier.color + "40";
  resultCard.style.boxShadow = `0 8px 32px ${tier.color}25, 0 20px 60px rgba(0,0,0,0.4)`;
  resultCard.style.setProperty("--tier-color", tier.color);
  resultCard.classList.add("result-card-shine");
  resultCardGlow.style.background = `radial-gradient(circle, ${tier.color}30 0%, transparent 70%)`;

  resultTierBadge.className = `inline-block px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5 shadow-lg tier-${tier.id}`;
  resultTierBadge.textContent = `${tier.emoji} ${tier.name}`;

  resultAmount.style.color = tier.glowColor;
  resultAmount.style.textShadow = `0 0 10px ${tier.color}80, 0 2px 4px rgba(0,0,0,0.5)`;

  // Sound
  SoundEngine.playTierSound(tier.id);

  // Number counter
  const targetValue = result.value;
  const duration = 1500;
  const startTime = Date.now();

  resultDisplay.classList.remove("hidden");
  resultDisplay.classList.add("flex");

  // Auto-scroll result into view
  resultDisplay.scrollIntoView({ behavior: "smooth", block: "center" });

  gsap.fromTo(
    resultDisplay,
    { opacity: 0, scale: 0.5 },
    { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
  );

  function updateCounter() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(eased * targetValue);
    resultAmount.textContent = formatMoney(currentValue);

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      resultAmount.textContent = formatMoney(targetValue);
    }
  }
  updateCounter();

  // History
  addToHistory(result, tier);

  glowRing.style.background = tier.color;
  gsap.to(glowRing, { opacity: 0, duration: 2 });
}

function owResetLootbox() {
  lootboxState = "idle";
  const resultDisplay = document.querySelector("#result-display");
  const resultAmount = document.querySelector("#result-amount");
  const hongbaoBox = document.querySelector("#hongbao-box-ow");
  const instructionText = document.querySelector("#instruction-text");
  const resultCard = document.querySelector("#result-card");

  gsap.to(resultDisplay, {
    opacity: 0,
    scale: 0.8,
    duration: 0.3,
    onComplete: () => {
      resultDisplay.classList.add("hidden");
      resultDisplay.classList.remove("flex");
      resultCard.classList.remove("result-card-shine");
    },
  });

  hongbaoBox.style.display = "";
  gsap.set(hongbaoBox, { clearProps: "all" });
  hongbaoBox.classList.add("lootbox-idle");

  setTimeout(() => {
    instructionText.style.display = "block";
    gsap.fromTo(instructionText, { opacity: 0 }, { opacity: 1, duration: 0.5 });
  }, 400);
}
