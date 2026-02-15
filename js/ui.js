// ============================================
// UI — Config panel, stats, tier info, toast
// ============================================

// ===== TOAST =====
function showToast(message) {
  const toast = document.createElement("div");
  toast.className =
    "fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-gray-900/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/10 font-medium text-sm";
  toast.textContent = message;
  document.body.appendChild(toast);

  gsap.fromTo(
    toast,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" },
  );

  setTimeout(() => {
    gsap.to(toast, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      onComplete: () => toast.remove(),
    });
  }, 2000);
}

// ===== CONFIG PANEL =====
function renderConfigPanel() {
  const tierConfigsEl = document.querySelector("#tier-configs");
  tierConfigsEl.innerHTML = "";
  TIERS.forEach((tier) => {
    const tierCfg = config[tier.id];
    const card = document.createElement("div");
    card.className = "tier-config-card";
    card.style.background = tier.bgColor;
    card.style.borderColor = tier.color + "30";

    card.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <span class="text-xl">${tier.emoji}</span>
          <span class="font-bold text-base" style="color: ${tier.color};">${tier.name}</span>
          <span class="text-white/40 text-xs">(${tier.nameVi})</span>
        </div>
      </div>

      <div class="grid grid-cols-[auto_1fr] gap-3 items-center">
        <label class="text-sm text-white/60 whitespace-nowrap">Drop rate:</label>
        <div class="flex items-center gap-2">
          <input type="number" class="rate-input !w-24 text-center" data-tier="${tier.id}"
            value="${tierCfg.rate}" min="0" max="100" step="0.5" />
          <span class="text-white/40">%</span>
        </div>

        <label class="text-sm text-white/60 whitespace-nowrap">Giá trị tiền:</label>
        <div>
          <input type="text" class="values-input" data-tier="${tier.id}"
            value="${tierCfg.values.join(", ")}"
            placeholder="VD: 500000, 200000, 100000" />
          <p class="text-xs text-white/30 mt-1">Phân cách bằng dấu phẩy (đơn vị: VNĐ)</p>
        </div>
      </div>
    `;
    tierConfigsEl.appendChild(card);
  });

  document.querySelectorAll(".rate-input").forEach((input) => {
    input.addEventListener("input", validateDropRates);
  });

  validateDropRates();
}

function validateDropRates() {
  const droprateWarning = document.querySelector("#droprate-warning");
  const droprateOk = document.querySelector("#droprate-ok");
  const droprateTotal = document.querySelector("#droprate-total");

  let total = 0;
  document.querySelectorAll(".rate-input").forEach((input) => {
    total += parseFloat(input.value) || 0;
  });
  total = Math.round(total * 100) / 100;

  if (Math.abs(total - 100) < 0.01) {
    droprateWarning.classList.add("hidden");
    droprateOk.classList.remove("hidden");
  } else {
    droprateWarning.classList.remove("hidden");
    droprateOk.classList.add("hidden");
    droprateTotal.textContent = total;
  }
}

function saveConfig() {
  const configPanel = document.querySelector("#config-panel");
  let totalRate = 0;
  const newConfig = {};

  TIERS.forEach((tier) => {
    const rateInput = document.querySelector(`.rate-input[data-tier="${tier.id}"]`);
    const valuesInput = document.querySelector(`.values-input[data-tier="${tier.id}"]`);

    const rate = parseFloat(rateInput.value) || 0;
    totalRate += rate;

    const values = valuesInput.value
      .split(",")
      .map((v) => parseInt(v.trim()))
      .filter((v) => !isNaN(v) && v > 0);

    newConfig[tier.id] = {
      rate,
      values: values.length > 0 ? values : tier.defaultValues,
    };
  });

  totalRate = Math.round(totalRate * 100) / 100;

  if (Math.abs(totalRate - 100) > 0.01) {
    gsap.to(configPanel, {
      x: 10,
      duration: 0.05,
      repeat: 5,
      yoyo: true,
      ease: "none",
    });
    return;
  }

  config = newConfig;
  saveConfigToStorage();
  closeConfig();
  renderTierInfoPanel();
  showToast("✅ Đã lưu cài đặt!");
}

function resetConfig() {
  config = getDefaultConfig();
  saveConfigToStorage();
  renderConfigPanel();
  renderTierInfoPanel();
  showToast("🔄 Đã khôi phục mặc định!");
}

function openConfig() {
  const configOverlay = document.querySelector("#config-overlay");
  const configPanel = document.querySelector("#config-panel");
  configOverlay.classList.remove("hidden");
  renderConfigPanel();
  requestAnimationFrame(() => {
    configPanel.classList.remove("translate-x-full");
    configPanel.classList.add("translate-x-0");
  });
}

function closeConfig() {
  const configOverlay = document.querySelector("#config-overlay");
  const configPanel = document.querySelector("#config-panel");
  configPanel.classList.remove("translate-x-0");
  configPanel.classList.add("translate-x-full");
  setTimeout(() => {
    configOverlay.classList.add("hidden");
  }, 500);
}

// ===== TIER INFO PANEL =====
function renderTierInfoPanel() {
  const tierInfoRows = document.querySelector("#tier-info-rows");
  const droprateBar = document.querySelector("#droprate-bar");

  tierInfoRows.innerHTML = "";

  TIERS.forEach((tier) => {
    const tierCfg = config[tier.id];
    const row = document.createElement("div");
    row.className = "tier-info-row flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 hover:bg-white/5";

    const valuesStr = tierCfg.values
      .map((v) => formatMoney(v) + "đ")
      .join(" · ");

    row.innerHTML = `
      <div class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl" style="background: ${tier.bgColor}; border: 1px solid ${tier.color}30;">
        ${tier.emoji}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="font-bold text-sm" style="color: ${tier.color};">${tier.name}</span>
          <span class="text-white/30 text-xs">${tier.nameVi}</span>
        </div>
        <div class="text-xs text-white/50 truncate" title="${valuesStr}">
          💰 ${valuesStr}
        </div>
      </div>
      <div class="flex-shrink-0 text-right">
        <div class="text-sm font-bold px-3 py-1 rounded-lg" style="color: ${tier.color}; background: ${tier.bgColor};">
          ${tierCfg.rate}%
        </div>
      </div>
    `;
    tierInfoRows.appendChild(row);
  });

  // Stacked drop rate bar
  droprateBar.innerHTML = "";
  TIERS.forEach((tier) => {
    const tierCfg = config[tier.id];
    if (tierCfg.rate <= 0) return;

    const segment = document.createElement("div");
    segment.style.width = tierCfg.rate + "%";
    segment.style.background = `linear-gradient(135deg, ${tier.color}, ${tier.glowColor})`;
    segment.style.transition = "width 0.5s ease";
    segment.title = `${tier.name}: ${tierCfg.rate}%`;
    segment.className = "h-full relative group";

    const tooltip = document.createElement("span");
    tooltip.className = "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap";
    tooltip.style.background = tier.color;
    tooltip.style.color = "#fff";
    tooltip.textContent = `${tier.emoji} ${tier.name} ${tierCfg.rate}%`;
    segment.appendChild(tooltip);

    droprateBar.appendChild(segment);
  });
}

function openRates() {
  const overlay = document.querySelector("#droprate-overlay");
  const panel = document.querySelector("#droprate-panel");
  overlay.classList.remove("hidden");
  renderTierInfoPanel();
  requestAnimationFrame(() => {
    panel.classList.remove("scale-95", "opacity-0");
    panel.classList.add("scale-100", "opacity-100");
  });
}

function closeRates() {
  const overlay = document.querySelector("#droprate-overlay");
  const panel = document.querySelector("#droprate-panel");
  panel.classList.remove("scale-100", "opacity-100");
  panel.classList.add("scale-95", "opacity-0");
  setTimeout(() => {
    overlay.classList.add("hidden");
  }, 300);
}

// ===== STATS PANEL =====
function openStats() {
  const statsOverlay = document.querySelector("#stats-overlay");
  const statsPanel = document.querySelector("#stats-panel");
  const statsFilter = document.querySelector("#stats-filter");
  statsOverlay.classList.remove("hidden");
  statsFilter.value = "all";
  renderStats();
  requestAnimationFrame(() => {
    statsPanel.classList.remove("translate-x-full");
    statsPanel.classList.add("translate-x-0");
  });
}

function closeStats() {
  const statsOverlay = document.querySelector("#stats-overlay");
  const statsPanel = document.querySelector("#stats-panel");
  statsPanel.classList.remove("translate-x-0");
  statsPanel.classList.add("translate-x-full");
  setTimeout(() => {
    statsOverlay.classList.add("hidden");
  }, 500);
}

function renderStats() {
  const statsSummary = document.querySelector("#stats-summary");
  const statsTierBreakdown = document.querySelector("#stats-tier-breakdown");
  const statsDetailList = document.querySelector("#stats-detail-list");
  const statsEmpty = document.querySelector("#stats-empty");

  if (history.length === 0) {
    statsEmpty.classList.remove("hidden");
    statsSummary.classList.add("hidden");
    statsTierBreakdown.classList.add("hidden");
    statsDetailList.innerHTML = "";
    return;
  }

  statsEmpty.classList.add("hidden");
  statsSummary.classList.remove("hidden");
  statsTierBreakdown.classList.remove("hidden");

  const totalOpens = history.length;
  const totalMoney = history.reduce((s, h) => s + h.value, 0);
  const avgMoney = Math.round(totalMoney / totalOpens);
  const bestPull = history.reduce((best, h) => h.value > best.value ? h : best, history[0]);
  const bestTier = TIERS.find((t) => t.id === bestPull.tier);

  statsSummary.innerHTML = `
    <div class="bg-white/5 rounded-2xl p-4 border border-white/10">
      <div class="text-xs text-white/40 mb-1">Tổng lần mở</div>
      <div class="text-2xl font-bold text-white" style="font-family: 'Outfit', sans-serif;">${totalOpens}</div>
    </div>
    <div class="bg-white/5 rounded-2xl p-4 border border-white/10">
      <div class="text-xs text-white/40 mb-1">Tổng tiền</div>
      <div class="text-2xl font-bold text-yellow-400" style="font-family: 'Outfit', sans-serif;">${formatMoney(totalMoney)}đ</div>
    </div>
    <div class="bg-white/5 rounded-2xl p-4 border border-white/10">
      <div class="text-xs text-white/40 mb-1">Trung bình / lần</div>
      <div class="text-2xl font-bold text-blue-400" style="font-family: 'Outfit', sans-serif;">${formatMoney(avgMoney)}đ</div>
    </div>
    <div class="bg-white/5 rounded-2xl p-4 border border-white/10">
      <div class="text-xs text-white/40 mb-1">Lần mở tốt nhất</div>
      <div class="text-lg font-bold" style="color: ${bestTier.color}; font-family: 'Outfit', sans-serif;">${bestTier.emoji} ${formatMoney(bestPull.value)}đ</div>
    </div>
  `;

  statsTierBreakdown.innerHTML = "";
  TIERS.forEach((tier) => {
    const count = history.filter((h) => h.tier === tier.id).length;
    const actualRate = totalOpens > 0 ? ((count / totalOpens) * 100).toFixed(1) : 0;
    const configRate = config[tier.id].rate;

    const row = document.createElement("div");
    row.className = "flex items-center gap-3 p-2 rounded-xl";

    row.innerHTML = `
      <span class="text-lg w-7">${tier.emoji}</span>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-semibold" style="color: ${tier.color};">${tier.name}</span>
          <div class="text-xs text-white/40">
            <span class="font-bold" style="color: ${tier.color};">${actualRate}%</span>
            <span class="text-white/20 mx-1">|</span>
            <span>cài đặt: ${configRate}%</span>
          </div>
        </div>
        <div class="h-2 rounded-full bg-white/5 overflow-hidden relative">
          <div class="h-full rounded-full transition-all duration-500" style="width: ${actualRate}%; background: linear-gradient(90deg, ${tier.color}, ${tier.glowColor});"></div>
        </div>
      </div>
      <span class="text-xs font-bold text-white/40 w-8 text-right">${count}x</span>
    `;
    statsTierBreakdown.appendChild(row);
  });

  renderStatsDetail();
}

function renderStatsDetail() {
  const statsFilter = document.querySelector("#stats-filter");
  const statsDetailList = document.querySelector("#stats-detail-list");
  const filter = statsFilter.value;
  const filtered = filter === "all" ? history : history.filter((h) => h.tier === filter);

  statsDetailList.innerHTML = "";
  statsDetailList.className = "space-y-2 mb-6 stats-detail-scroll";

  if (filtered.length === 0) {
    statsDetailList.innerHTML = '<p class="text-center text-white/20 py-6 text-sm">Không có dữ liệu cho bộ lọc này</p>';
    return;
  }

  filtered.forEach((item, i) => {
    const tier = TIERS.find((t) => t.id === item.tier);
    if (!tier) return;

    const time = new Date(item.time);
    const timeStr = time.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });

    const row = document.createElement("div");
    row.className = "flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/8 transition-colors";

    row.innerHTML = `
      <span class="text-sm w-6 text-white/20 text-right">#${i + 1}</span>
      <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style="background: ${tier.bgColor}; border: 1px solid ${tier.color}30;">
        ${tier.emoji}
      </div>
      <div class="flex-1 min-w-0">
        <span class="font-bold text-sm" style="color: ${tier.color}; font-family: 'Outfit', sans-serif;">${formatMoney(item.value)}đ</span>
      </div>
      <span class="text-xs text-white/30">${timeStr}</span>
    `;
    statsDetailList.appendChild(row);
  });
}

function clearHistory() {
  if (history.length === 0) {
    showToast("📭 Không có lịch sử để xóa");
    return;
  }

  const confirmed = confirm("Bạn có chắc muốn xóa toàn bộ lịch sử mở lì xì?");
  if (!confirmed) return;

  history = [];
  localStorage.removeItem("hb_history");
  renderHistory();
  renderStats();
  showToast("🗑️ Đã xóa toàn bộ lịch sử!");
}
