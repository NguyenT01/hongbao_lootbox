// ============================================
// APP — Main init, mode toggle, history, events
// ============================================

// ===== STATE =====
let config = loadConfig();
let lootboxState = "idle"; // idle | shaking | opening | result
let history = JSON.parse(localStorage.getItem("hb_history") || "[]");
let currentMode = localStorage.getItem("hb_mode") || "overwatch"; // "overwatch" | "csgo"

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
  renderConfigPanel();
  renderHistory();
  renderTierInfoPanel();
  startBackgroundParticles();

  // Sound
  SoundEngine.loadMuted();
  updateMuteBtn();

  // CS:GO settings
  CSGO.loadSettings();
  initCsgoSettingsUI();

  // Mode
  applyMode(currentMode);

  // === Event listeners ===

  // Overwatch lootbox click
  const owContainer = document.querySelector("#lootbox-container-ow");
  if (owContainer) {
    owContainer.addEventListener("click", () => {
      if (currentMode === "overwatch") owHandleLootboxClick();
    });
  }

  // CS:GO lootbox click
  const csgoContainer = document.querySelector("#hongbao-container-csgo");
  if (csgoContainer) {
    csgoContainer.addEventListener("click", () => {
      if (currentMode === "csgo") CSGO.handleOpen();
    });
  }

  // Reopen button — works for both modes
  document.querySelector("#btn-reopen").addEventListener("click", () => {
    if (currentMode === "overwatch") {
      owResetLootbox();
    } else {
      CSGO.reset();
    }
  });

  // Config
  document.querySelector("#btn-config").addEventListener("click", openConfig);
  document.querySelector("#btn-close-config").addEventListener("click", closeConfig);
  document.querySelector("#config-backdrop").addEventListener("click", closeConfig);
  document.querySelector("#btn-save-config").addEventListener("click", saveConfig);
  document.querySelector("#btn-reset-config").addEventListener("click", resetConfig);
  document.querySelector("#btn-open-config-inline").addEventListener("click", openConfig);

  // Tier info modal
  document.querySelector("#btn-show-rates").addEventListener("click", openRates);
  document.querySelector("#btn-close-rates").addEventListener("click", closeRates);
  document.querySelector("#droprate-backdrop").addEventListener("click", closeRates);

  // Stats
  document.querySelector("#btn-history-stats").addEventListener("click", openStats);
  document.querySelector("#btn-close-stats").addEventListener("click", closeStats);
  document.querySelector("#stats-backdrop").addEventListener("click", closeStats);
  document.querySelector("#stats-filter").addEventListener("change", renderStatsDetail);
  document.querySelector("#btn-clear-history").addEventListener("click", clearHistory);

  // Mute toggle
  document.querySelector("#btn-mute").addEventListener("click", toggleMute);

  // Mode toggle
  document.querySelectorAll(".mode-toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      if (mode !== currentMode) {
        // Allow toggle if idle OR result. Block only if mid-opening.
        if (lootboxState === "shaking" || lootboxState === "opening") return;
        
        setMode(mode);
        SoundEngine.click();
      }
    });
  });

  // CS:GO settings popover
  document.querySelector("#btn-csgo-settings").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleCsgoPopover();
  });

  // Close popover on outside click
  document.addEventListener("click", (e) => {
    const popover = document.querySelector("#csgo-settings-popover");
    const wrapper = document.querySelector("#csgo-settings-wrapper");
    if (!popover.classList.contains("hidden") && !wrapper.contains(e.target)) {
      popover.classList.add("hidden");
    }
  });
});

// ===== MODE MANAGEMENT =====
function setMode(mode) {
  currentMode = mode;
  localStorage.setItem("hb_mode", mode);
  applyMode(mode);
}

function applyMode(mode) {
  const owArea = document.querySelector("#ow-area");
  const csgoArea = document.querySelector("#csgo-area");
  const toggleBtns = document.querySelectorAll(".mode-toggle-btn");
  const slider = document.querySelector("#mode-slider");

  // Reset state of the OTHER mode before switching
  if (mode === "overwatch") {
    // Ensure CS:GO state is reset
    CSGO.reset();
  } else {
    // Ensure Overwatch state is reset
    owResetLootbox();
  }

  // Toggle areas
  if (mode === "overwatch") {
    owArea.classList.remove("hidden");
    csgoArea.classList.add("hidden");
  } else {
    owArea.classList.add("hidden");
    csgoArea.classList.remove("hidden");
  }
  
  document.querySelector("#instruction-text").style.display = "block";

  // Toggle buttons
  toggleBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  // Slider position
  const activeBtn = document.querySelector(`.mode-toggle-btn[data-mode="${mode}"]`);
  if (activeBtn && slider) {
    slider.style.left = activeBtn.offsetLeft + "px";
    slider.style.width = activeBtn.offsetWidth + "px";
  }

  // CS:GO settings button visibility
  const csgoSettingsWrapper = document.querySelector("#csgo-settings-wrapper");
  const csgoPopover = document.querySelector("#csgo-settings-popover");
  if (mode === "csgo") {
    csgoSettingsWrapper.classList.remove("hidden");
  } else {
    csgoSettingsWrapper.classList.add("hidden");
    csgoPopover.classList.add("hidden");
  }

  // Reset state
  lootboxState = "idle";
  const resultDisplay = document.querySelector("#result-display");
  resultDisplay.classList.add("hidden");
  resultDisplay.classList.remove("flex");
}

// ===== HISTORY =====
function addToHistory(result, tier) {
  history.unshift({ tier: tier.id, value: result.value, time: Date.now() });
  if (history.length > 200) history = history.slice(0, 200);
  localStorage.setItem("hb_history", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const historySection = document.querySelector("#history-section");
  const historyList = document.querySelector("#history-list");

  if (history.length === 0) {
    historySection.classList.add("hidden");
    return;
  }

  historySection.classList.remove("hidden");
  historyList.innerHTML = "";

  history.slice(0, 5).forEach((item, i) => {
    const tier = TIERS.find((t) => t.id === item.tier);
    if (!tier) return;

    const el = document.createElement("div");
    el.className = `history-item tier-${tier.id}`;
    el.textContent = `${tier.emoji} ${formatMoney(item.value)}đ`;
    el.style.animationDelay = i * 0.05 + "s";
    historyList.appendChild(el);
  });
}

// ===== MUTE =====
function toggleMute() {
  SoundEngine.setMuted(!SoundEngine.isMuted());
  updateMuteBtn();
}

function updateMuteBtn() {
  const btn = document.querySelector("#btn-mute");
  const icon = btn.querySelector(".mute-icon");
  if (SoundEngine.isMuted()) {
    icon.textContent = "🔇";
    btn.classList.add("opacity-50");
  } else {
    icon.textContent = "🔊";
    btn.classList.remove("opacity-50");
  }
}

// ===== CS:GO SETTINGS =====
function initCsgoSettingsUI() {
  const slider = document.querySelector("#csgo-spin-duration");
  const valLabel = document.querySelector("#csgo-spin-duration-val");

  // Sync slider to saved value
  const savedDuration = CSGO.getSpinDuration();
  slider.value = savedDuration;
  valLabel.textContent = savedDuration + "s";

  // Live update on drag
  slider.addEventListener("input", () => {
    const val = Number(slider.value);
    valLabel.textContent = val + "s";
    CSGO.setSpinDuration(val);
  });

  // Spin Width logic
  const widthSlider = document.querySelector("#csgo-spin-width");
  const widthLabel = document.querySelector("#csgo-width-val");

  if (widthSlider && widthLabel) {
    const savedWidth = CSGO.getSpinWidth ? CSGO.getSpinWidth() : 80;
    widthSlider.value = savedWidth;
    widthLabel.textContent = savedWidth + "%";

    widthSlider.addEventListener("input", () => {
      const val = Number(widthSlider.value);
      widthLabel.textContent = val + "%";
      if (CSGO.setSpinWidth) CSGO.setSpinWidth(val);
    });
  }
}

function toggleCsgoPopover() {
  const popover = document.querySelector("#csgo-settings-popover");
  popover.classList.toggle("hidden");
  SoundEngine.click();
}
