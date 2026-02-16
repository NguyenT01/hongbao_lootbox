// ============================================
// CS:GO — Reel spin-style lootbox opening
// ============================================

const CSGO = (() => {

  // Physics: constant initial speed regardless of duration
  // With expo.out, derivative at t=0 = ~6.93
  // initialSpeed = totalDist × 6.93 / duration
  // → totalDist = INITIAL_SPEED × duration / 6.93
  // This ensures the reel always starts at the SAME fast speed;
  // longer durations = more items to scroll through, not slower start.
  const INITIAL_SPEED = 3500; // px/s — constant blazing start speed
  const EXPO_DERIV = 6.931; // derivative of expo.out at t=0

  // ===== Settings (persisted) =====
  const DEFAULTS = { spinDuration: 12, spinWidth: 80 };
  let settings = { ...DEFAULTS };

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem("hb_csgo_settings") || "{}");
      settings = { ...DEFAULTS, ...saved };
      settings.spinDuration = Math.max(10, Math.min(30, settings.spinDuration));
      settings.spinWidth = Math.max(40, Math.min(90, settings.spinWidth));
    } catch (e) {
      settings = { ...DEFAULTS };
    }
    // Apply settings on load
    applySpinWidth();
    return settings;
  }

  function saveSettings() {
    localStorage.setItem("hb_csgo_settings", JSON.stringify(settings));
  }

  function getSpinDuration() {
    return settings.spinDuration;
  }

  function setSpinDuration(val) {
    settings.spinDuration = Math.max(10, Math.min(30, Number(val) || 12));
    saveSettings();
  }

  function getSpinWidth() {
    return settings.spinWidth;
  }

  function setSpinWidth(val) {
    settings.spinWidth = Math.max(40, Math.min(90, Number(val) || 80));
    saveSettings();
    applySpinWidth();
  }

  function applySpinWidth() {
    const wrapper = document.querySelector("#csgo-reel-wrapper");
    if (wrapper) {
      // Desktop: use setting width (vw)
      // Mobile rules in CSS will override this with !important or via media query specificity if needed
      // But simpler to just set the style and let CSS media query handle mobile override (width: 100%)
      // We'll set a custom property or direct width, but CSS media query @media (max-width: 768px) { width: 100% } needs to win.
      // Inline styles invoke high specificity. We should set it as a variable or handle it carefully.
      // Let's check window width or trust the CSS !important if we added it?
      // Actually, the CSS for mobile uses a media query. Inline style will override CSS rule unless !important.
      // Better approach: Set a CSS variable --csgo-width and use it in CSS.
      // Or just check if not mobile before applying?
      // User requirement: "mobile keep as is (100%)".
      if (window.innerWidth > 768) {
         wrapper.style.width = settings.spinWidth + "vw";
      } else {
         wrapper.style.width = ""; // clear inline style to let CSS take over
      }
    }
  }

  // Listen for resize to re-apply logic
  window.addEventListener("resize", applySpinWidth);

  let isSpinning = false;

  function show() {
    document.querySelector("#csgo-area").classList.remove("hidden");
  }

  function hide() {
    document.querySelector("#csgo-area").classList.add("hidden");
  }

  function handleOpen() {
    if (isSpinning) return;
    
    // Check if we can afford it (if implementing currency later)
    // For now, check if user set values
    const hasValues = TIERS.some(t => config[t.id].values.length > 0 && config[t.id].rate > 0);
    if (!hasValues) {
      showToast("⚠️ Hãy cài đặt giá trị tiền trước!");
      return;
    }

    isSpinning = true;
    lootboxState = "opening";
    
    // Hide instruction text
    const instructionText = document.querySelector("#instruction-text");
    if (instructionText) instructionText.style.display = "none";

    // OPENING ANIMATION SEQUENCE
    const box = document.querySelector("#hongbao-box-csgo");
    const container = document.querySelector("#hongbao-container-csgo");
    
    // 1. Shake
    box.classList.remove("lootbox-idle");
    box.classList.add("lootbox-shaking");
    SoundEngine.whoosh();
    
    setTimeout(() => {
       // 2. Burst/Open effect
       box.classList.remove("lootbox-shaking");
       
       gsap.to(container, {
         scale: 1.5,
         opacity: 0,
         duration: 0.4,
         ease: "power2.in",
         onComplete: () => {
           try {
             // 3. Switch to reel
             container.classList.add("hidden");
             const reelWrapper = document.querySelector("#csgo-reel-wrapper");
             
             if (!reelWrapper) {
                console.error("Reel wrapper not found!");
                isSpinning = false;
                lootboxState = "idle";
                return;
             }

             reelWrapper.classList.remove("hidden");
             
             // Force reflow to ensure display:block is applied before measuring
             void reelWrapper.offsetWidth;

             // Animate reel entry
             gsap.fromTo(reelWrapper, 
               { opacity: 0, scale: 0.8 }, 
               { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.2)" }
             );
             
             // 4. Start spin (with small delay to ensure rendering)
             setTimeout(() => {
                const result = rollLootbox();
                startSpin(result);
             }, 100);

           } catch (err) {
             console.error("CSGO Open Error:", err);
             isSpinning = false; 
             lootboxState = "idle";
             container.classList.remove("hidden"); // Restore box if error
             gsap.set(container, { clearProps: "all" });
           }
         }
       });
    }, 600);
  }

  function generateStrip(winnerResult, totalItems, winnerIdx) {
    const items = [];

    for (let i = 0; i < totalItems; i++) {
      const roll = rollLootbox();
      const tier = TIERS.find((t) => t.id === roll.tier);
      items.push({ tier, value: roll.value });
    }

    // Place winner at the calculated position
    const winnerTier = TIERS.find((t) => t.id === winnerResult.tier);
    items[winnerIdx] = { tier: winnerTier, value: winnerResult.value };

    return items;
  }

  function renderStrip(items) {
    const strip = document.querySelector("#csgo-strip");
    strip.innerHTML = "";

    items.forEach((item) => {
      const el = document.createElement("div");
      el.className = "csgo-item";
      el.style.background = item.tier.bgColor;
      el.style.borderBottom = `3px solid ${item.tier.color}`;

      el.innerHTML = `
        <span class="csgo-item-emoji">${item.tier.emoji}</span>
        <span class="csgo-item-value" style="color: ${item.tier.glowColor};">${formatMoney(item.value)}đ</span>
        <span class="csgo-item-tier" style="color: ${item.tier.color};">${item.tier.name}</span>
      `;
      strip.appendChild(el);
    });
  }

  function getItemWidth() {
    // Read actual rendered width from CSS (responsive: 120/100/80px)
    const item = document.querySelector("#csgo-strip .csgo-item");
    // Safety check: if offsetWidth is 0 (hidden/disconnected), fallback to default 120
    return (item && item.offsetWidth > 0) ? item.offsetWidth : 120;
  }

  function startSpin(result) {
    // isSpinning already true
    const duration = settings.spinDuration;

    // Render a temporary strip to measure actual item width
    const tempItems = generateStrip(result, 5, 2);
    renderStrip(tempItems);
    const itemWidth = getItemWidth();

    // Calculate total distance so initial speed is always INITIAL_SPEED
    const totalDistance = (INITIAL_SPEED * duration) / EXPO_DERIV;

    // Winner at index
    const winnerIndex = Math.floor(totalDistance / itemWidth);
    const totalItems = winnerIndex + 20;

    const items = generateStrip(result, totalItems, winnerIndex);
    renderStrip(items);

    const strip = document.querySelector("#csgo-strip");
    const wrapper = document.querySelector("#csgo-reel-wrapper");

    wrapper.classList.add("spinning");

    // Target: winner lands at center of viewport
    const wrapperWidth = wrapper.offsetWidth;
    const centerOffset = wrapperWidth / 2;
    const targetX = -(winnerIndex * itemWidth) + centerOffset - itemWidth / 2;
    const jitter = (Math.random() - 0.5) * (itemWidth * 0.6);
    const finalX = targetX + jitter;

    // Tick sound logic
    let lastTickIndex = -1;
    const tickInterval = setInterval(() => {
      const currentX = gsap.getProperty(strip, "x");
      if (typeof currentX === "number") {
        const currentIndex = Math.floor(-currentX / itemWidth);
        if (currentIndex !== lastTickIndex && currentIndex >= 0) {
          lastTickIndex = currentIndex;
          SoundEngine.tick();
        }
      }
    }, 30);

    // Spin animation
    gsap.to(strip, {
      x: finalX,
      duration: duration,
      ease: "expo.out",
      onComplete: () => {
        clearInterval(tickInterval);
        onSpinComplete(result, items, winnerIndex, wrapper);
      },
    });
  }

  function onSpinComplete(result, items, winnerIndex, wrapper) {
    const tier = TIERS.find((t) => t.id === result.tier);

    // Highlight winner
    const stripItems = document.querySelectorAll("#csgo-strip .csgo-item");
    if (stripItems[winnerIndex]) {
      const winnerItem = stripItems[winnerIndex];
      winnerItem.classList.add("winner-highlight");
      winnerItem.style.setProperty("--winner-color", tier.color);
      // Optional: keep background color logic if needed, but highlight class handles glow
      winnerItem.style.background = tier.bgColor;
    }

    // Sound
    SoundEngine.playTierSound(tier.id);

    // Confetti
    fireConfetti(tier);

    // Show result card
    setTimeout(() => {
      lootboxState = "result";
      showCsgoResult(result, tier);
    }, 600);

    wrapper.classList.remove("spinning");

    // Add to history
    addToHistory(result, tier);
  }

  function showCsgoResult(result, tier) {
    const resultCard = document.querySelector("#result-card");
    const resultCardGlow = document.querySelector("#result-card-glow");
    const resultTierBadge = document.querySelector("#result-tier-badge");
    const resultAmount = document.querySelector("#result-amount");
    const resultDisplay = document.querySelector("#result-display");

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

    // Number counter
    const targetValue = result.value;
    const counterDuration = 1500;
    const startTime = Date.now();

    resultDisplay.classList.remove("hidden");
    resultDisplay.classList.add("flex");

    gsap.fromTo(
      resultDisplay,
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
    );

    function updateCounter() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / counterDuration, 1);
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
  }

  function reset() {
    isSpinning = false;
    lootboxState = "idle";

    const resultDisplay = document.querySelector("#result-display");
    const resultCard = document.querySelector("#result-card");
    const strip = document.querySelector("#csgo-strip");
    const instructionText = document.querySelector("#instruction-text");
    const reelWrapper = document.querySelector("#csgo-reel-wrapper");
    const container = document.querySelector("#hongbao-container-csgo");
    const box = document.querySelector("#hongbao-box-csgo");

    // Hide result
    gsap.to(resultDisplay, {
      opacity: 0,
      scale: 0.8,
      duration: 0.3,
      onComplete: () => {
        resultDisplay.classList.add("hidden");
        resultDisplay.classList.remove("flex");
        resultCard.classList.remove("result-card-shine");
        
        // Hide reel wrapper
        reelWrapper.classList.add("hidden");
        
        // Show lootbox container again
        container.classList.remove("hidden");
        gsap.set(container, { clearProps: "all" }); // Clear scale/opacity
        
        box.classList.remove("lootbox-shaking", "lootbox-shaking-intense");
        box.classList.add("lootbox-idle");
        
        // Reset strip
        if (strip) {
          gsap.killTweensOf(strip);
          gsap.set(strip, { clearProps: "all" });
          strip.innerHTML = "";
        }
      },
    });

    setTimeout(() => {
      if (instructionText) {
        instructionText.style.display = "block";
        gsap.fromTo(instructionText, { opacity: 0 }, { opacity: 1, duration: 0.5 });
      }
    }, 400);
  }

  return { show, hide, handleOpen, reset, loadSettings, getSpinDuration, setSpinDuration, getSpinWidth, setSpinWidth };
})();
