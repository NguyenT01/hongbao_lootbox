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

// ===== CONFIG PANEL (Quick Edit for Current Lootbox) =====
function renderConfigPanel() {
  if (!currentLootbox) return;
  const cfg = currentLootbox.config;

  const tierConfigsEl = document.querySelector("#tier-configs");
  tierConfigsEl.innerHTML = "";
  TIERS.forEach((tier) => {
    const tierCfg = cfg[tier.id];
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
  if (!currentLootbox) return;
  
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

  // Save to current lootbox
  LootboxData.update(currentLootbox.id, { config: newConfig });
  currentLootbox.config = newConfig; // Local update

  closeConfig();
  renderTierInfoPanel();
  showToast("✅ Đã lưu cài đặt cho " + currentLootbox.name + "!");
}

function resetConfig() {
  if (!currentLootbox) return;
  const defConfig = getDefaultConfig();
  
  LootboxData.update(currentLootbox.id, { config: defConfig });
  currentLootbox.config = defConfig;
  
  renderConfigPanel();
  renderTierInfoPanel();
  showToast("🔄 Đã khôi phục mặc định!");
}

function openConfig() {
  const configOverlay = document.querySelector("#config-overlay");
  const configPanel = document.querySelector("#config-panel");
  configOverlay.classList.remove("hidden");
  
  // Render fresh data
  renderConfigPanel();

  gsap.fromTo(
    configOverlay,
    { opacity: 0 },
    { opacity: 1, duration: 0.3 }
  );
  gsap.fromTo(
    configPanel,
    { y: 50, opacity: 0, scale: 0.95 },
    { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.2)" }
  );
}

function closeConfig() {
  const configOverlay = document.querySelector("#config-overlay");
  const configPanel = document.querySelector("#config-panel");

  gsap.to(configPanel, {
    y: 50,
    opacity: 0,
    scale: 0.95,
    duration: 0.3,
  });
  gsap.to(configOverlay, {
    opacity: 0,
    duration: 0.3,
    onComplete: () => configOverlay.classList.add("hidden"),
  });
}

// ===== TIER INFO PANEL =====
function renderTierInfoPanel() {
  const droprateBar = document.querySelector("#droprate-bar");
  const tierInfoRows = document.querySelector("#tier-info-rows");
  
  // Use current config or default
  const cfg = currentLootbox ? currentLootbox.config : getDefaultConfig();

  tierInfoRows.innerHTML = "";

  TIERS.forEach((tier) => {
    const tierCfg = cfg[tier.id];
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
    const tierCfg = cfg[tier.id];
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

// ===== RESULT DISPLAY =====
function displayResult(amount) {
    const resultAmount = document.querySelector("#result-amount");
    const formatted = formatMoney(amount);
    resultAmount.textContent = formatted;
    
    // Dynamic Font Size for large numbers
    resultAmount.className = "font-black leading-none transition-all duration-300"; // Reset base classes
    resultAmount.style.fontFamily = "'Outfit', sans-serif";
    
    if (amount >= 10000000) { // 10m+
        resultAmount.classList.add("text-4xl", "md:text-5xl");
    } else if (amount >= 1000000) { // 1m+
        resultAmount.classList.add("text-5xl", "md:text-6xl");
    } else {
        resultAmount.classList.add("text-5xl", "md:text-7xl");
    }
}

// ===== STATS PANEL =====
let currentStatsTab = "global"; // "global" | "current"

function initLootboxManagerUI() {
    // Header button
    const btnManage = document.querySelector("#btn-manage-lootboxes");
    if (btnManage) btnManage.addEventListener("click", openLootboxManager);

    // Manager Modal
    document.querySelector("#btn-close-manager").addEventListener("click", closeLootboxManager);
    document.querySelector("#manager-backdrop").addEventListener("click", closeLootboxManager);
    document.querySelector("#btn-create-lootbox").addEventListener("click", () => openLootboxEditor(null));

    // Editor Modal
    document.querySelector("#btn-close-editor").addEventListener("click", closeLootboxEditor);
    document.querySelector("#editor-backdrop").addEventListener("click", closeLootboxEditor);
    document.querySelector("#btn-cancel-editor").addEventListener("click", closeLootboxEditor);
    document.querySelector("#editor-form").addEventListener("submit", saveLootboxEditor);
    
    // Stats UI
    initStatsUI();
}

function initStatsUI() {
    document.querySelector("#btn-stats-global").addEventListener("click", () => switchStatsTab("global"));
    document.querySelector("#btn-stats-current").addEventListener("click", () => switchStatsTab("current"));
    document.querySelector("#stats-filter-lootbox").addEventListener("change", renderStats);
}

function switchStatsTab(tab) {
    currentStatsTab = tab;
    const filterWrapper = document.querySelector("#stats-filter-wrapper");
    
    // Update Buttons
    const btnGlobal = document.querySelector("#btn-stats-global");
    const btnCurrent = document.querySelector("#btn-stats-current");
    
    if (tab === "global") {
        btnGlobal.className = "flex-1 py-2 rounded-lg text-sm font-bold bg-white/20 text-white shadow-sm transition-all";
        btnCurrent.className = "flex-1 py-2 rounded-lg text-sm font-bold text-white/50 hover:text-white transition-all";
        filterWrapper.classList.remove("hidden");
    } else {
        btnGlobal.className = "flex-1 py-2 rounded-lg text-sm font-bold text-white/50 hover:text-white transition-all";
        btnCurrent.className = "flex-1 py-2 rounded-lg text-sm font-bold bg-white/20 text-white shadow-sm transition-all";
        filterWrapper.classList.add("hidden");
    }
    
    renderStats();
}

function openStats() {
  const statsOverlay = document.querySelector("#stats-overlay");
  const statsPanel = document.querySelector("#stats-panel");
  const statsFilter = document.querySelector("#stats-filter");
  const lootboxFilter = document.querySelector("#stats-filter-lootbox");
  
  statsOverlay.classList.remove("hidden");
  
  // Populate Lootbox Filter
  const boxes = LootboxData.getAll();
  // Keep first option "All"
  lootboxFilter.innerHTML = '<option value="all">Tất cả loại hộp</option>';
  boxes.forEach(box => {
      const opt = document.createElement("option");
      opt.value = box.id;
      opt.textContent = box.name;
      opt.className = "text-black"; // Ensure visibility
      lootboxFilter.appendChild(opt);
  });
  lootboxFilter.value = "all";
  
  statsFilter.value = "all";
  switchStatsTab("global"); // Default to global
  
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
  const lootboxFilter = document.querySelector("#stats-filter-lootbox");
  
  // Get Data based on Tab & Filter
  let data = [];
  if (currentStatsTab === "global") {
      data = history; // Global variable
      
      // Apply Filter
      const filterId = lootboxFilter.value;
      if (filterId !== "all") {
          data = data.filter(item => item.lootboxId === filterId);
      }
      
  } else {
      if (currentLootbox && currentLootbox.stats && currentLootbox.stats.history) {
          data = currentLootbox.stats.history;
      }
  }

  if (!data || data.length === 0) {
    statsSummary.innerHTML = "";
    statsTierBreakdown.innerHTML = '<p class="text-center text-white/30 py-4">Chưa có dữ liệu thống kê.</p>';
    statsDetailList.innerHTML = "";
    return;
  }
  
  // Render Summary
  const totalOpens = data.length;
  const totalMoney = data.reduce((s, h) => s + h.value, 0);
  const avgMoney = totalOpens > 0 ? Math.round(totalMoney / totalOpens) : 0;
  const bestPull = data.reduce((best, h) => h.value > best.value ? h : best, data[0]);
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

  // Render Breakdown
  statsTierBreakdown.innerHTML = "";
  TIERS.forEach((tier) => {
    const count = data.filter((h) => h.tier === tier.id).length;
    const actualRate = totalOpens > 0 ? ((count / totalOpens) * 100).toFixed(1) : 0;
    
    // Config rate check
    let configRate = 0;
    let showConfigRate = false;

    if (currentStatsTab === "current" && currentLootbox) {
        configRate = currentLootbox.config[tier.id].rate;
        showConfigRate = true;
    } else {
        // Global tab
        const filterId = lootboxFilter.value;
        if (filterId !== "all") {
             // Find config of that lootbox
             const targetBox = LootboxData.getAll().find(b => b.id === filterId);
             if (targetBox) {
                 configRate = targetBox.config[tier.id].rate;
                 showConfigRate = true;
             }
        }
    }

    const row = document.createElement("div");
    row.className = "flex items-center gap-3 p-2 rounded-xl";

    row.innerHTML = `
      <span class="text-lg w-7">${tier.emoji}</span>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-semibold" style="color: ${tier.color};">${tier.name}</span>
          <div class="text-xs text-white/40">
            <span class="font-bold" style="color: ${tier.color};">${actualRate}%</span>
            ${showConfigRate ? `<span class="text-white/20 mx-1">|</span><span>cài đặt: ${configRate}%</span>` : ""}
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

  renderStatsDetail(data); // Pass data directly
}

function clearHistory() {
  showConfirmModal(() => {
      // Clear Global History
      history = [];
      localStorage.setItem("hb_history", JSON.stringify(history));

      // Clear ALL Lootbox Stats
      LootboxData.resetAllStats();

      renderHistory();
      renderStats();
      
      // Also clear detail list in UI
      document.querySelector("#stats-detail-list").innerHTML = "";
  });
}

function showConfirmModal(onConfirm) {
    const modal = document.querySelector("#confirm-modal");
    const backdrop = document.querySelector("#confirm-backdrop");
    const btnCancel = modal.querySelector(".btn-cancel");
    const btnConfirm = modal.querySelector(".btn-confirm");

    if (!modal) return;

    const close = () => {
        modal.classList.add("hidden");
        // Cleanup
        btnConfirm.onclick = null;
        btnCancel.onclick = null;
        backdrop.onclick = null;
    };

    const confirmAction = () => {
        onConfirm();
        close();
    };

    btnConfirm.onclick = confirmAction;
    btnCancel.onclick = close;
    backdrop.onclick = close;

    modal.classList.remove("hidden");
    
    // Animation
    gsap.fromTo(modal.querySelector("div[class*='relative']"), 
        { scale: 0.95, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.2, ease: "power2.out" }
    );
}

function renderStatsDetail(data) {
  const statsFilter = document.querySelector("#stats-filter");
  const statsDetailList = document.querySelector("#stats-detail-list");
  const filter = statsFilter.value;
  
  // Use passed data or fetch if null (legacy support)
  if (!data) {
      if (currentStatsTab === "global") data = history;
      else if (currentLootbox) data = currentLootbox.stats.history;
      else data = [];
  }
  
  const filtered = filter === "all" ? data : data.filter((h) => h.tier === filter);

  statsDetailList.innerHTML = "";
  // Ensure class for scrolling
  statsDetailList.className = "space-y-2 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2"; 

  if (filtered.length === 0) {
    statsDetailList.innerHTML = '<p class="text-center text-white/20 py-6 text-sm">Không có dữ liệu cho bộ lọc này</p>';
    return;
  }

  filtered.forEach((item, i) => {
    const tier = TIERS.find((t) => t.id === item.tier); // stats history uses 'tier' (id string), lootbox stats uses 'tierId' (string)
    // Legacy mapping: global history uses 'tier', LootboxData uses 'tierId' (from previous step 1192 app.js check)
    // Wait, in app.js addToHistory:
    // const item = { tier: tier.id ... } 
    // So both use 'tier'.
    // BUT LootboxData.addHistoryItem uses the passed item.
    // So they are consistent.
    
    if (!tier) return;

    const time = new Date(item.time || item.timestamp); // Handle both keys if mixed (app.js uses time, ui.js addToHistory used timestamp in previous version)
    // app.js uses 'time'.

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



// ===== LOOTBOX MANAGER LOGIC =====

function openLootboxManager() {
    const modal = document.querySelector("#lootbox-manager-modal");
    modal.classList.remove("hidden");
    renderLootboxGrid();
    
    gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.3 });
}

function closeLootboxManager() {
    const modal = document.querySelector("#lootbox-manager-modal");
    gsap.to(modal, { opacity: 0, duration: 0.3, onComplete: () => modal.classList.add("hidden") });
}

function renderLootboxGrid() {
    const grid = document.querySelector("#lootbox-grid");
    grid.innerHTML = "";
    
    const boxes = LootboxData.getAll();
    const selected = LootboxData.getSelected();

    boxes.forEach(box => {
        const isSelected = selected && selected.id === box.id;
        
        const el = document.createElement("div");
        el.className = `relative p-4 rounded-2xl border-2 transition-all cursor-pointer group ${isSelected ? "border-yellow-500 bg-yellow-500/10" : "border-white/10 bg-white/5 hover:border-white/30"}`;
        
        // Mini Preview
        const gradient = box.style.bgGradient;
        
        el.innerHTML = `
            <div class="flex items-start justify-between gap-3">
                <div class="w-12 h-16 rounded-lg mb-3 shadow-lg" style="background: ${gradient}; border: 1px solid ${box.style.borderColor}"></div>
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button class="p-1.5 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500 hover:text-white btn-edit-lb" data-id="${box.id}" title="Edit">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                     </button>
                     <button class="p-1.5 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500 hover:text-white btn-delete-lb" data-id="${box.id}" title="Delete">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                     </button>
                </div>
            </div>
            
            <h3 class="font-bold text-white text-lg truncate">${box.name}</h3>
            <p class="text-xs text-white/50">${box.stats.totalOpened} đã mở</p>
            
            ${isSelected ? '<div class="absolute top-2 right-2 text-yellow-500"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg></div>' : ''}
        `;
        
        // Select handler (click on card, ignore buttons)
        el.addEventListener("click", (e) => {
            if (e.target.closest("button")) return;
            selectLootbox(box.id);
        });
        
        // Edit handler
        const btnEdit = el.querySelector(".btn-edit-lb");
        if (btnEdit) btnEdit.addEventListener("click", (e) => {
            e.stopPropagation();
            openLootboxEditor(box.id);
        });
        
        // Delete handler
        const btnDelete = el.querySelector(".btn-delete-lb");
        if (btnDelete) btnDelete.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteLootbox(box.id);
        });

        grid.appendChild(el);
    });
}

function selectLootbox(id) {
    if (LootboxData.setSelected(id)) {
        updateLootboxUI(); // From app.js
        renderLootboxGrid(); // Re-render to update highlight
        showToast("✅ Đã chọn hộp!");
    }
}

function deleteLootbox(id) {
    if (confirm("Bạn có chắc muốn xóa Hộp này?")) {
        if (LootboxData.remove(id)) {
            renderLootboxGrid();
            updateLootboxUI(); // In case currently selected was deleted (it defaults to first)
            showToast("🗑️ Đã xóa!");
        }
    }
}

function openLootboxEditor(id) {
    isEditingId = id;
    const modal = document.querySelector("#lootbox-editor-modal");
    const form = document.querySelector("#editor-form");
    const container = document.querySelector("#editor-tiers-container");
    
    // Clear/Populate Form
    if (id) {
        // Edit Mode
        const box = LootboxData.getById(id);
        document.querySelector("#editor-title").textContent = "Chỉnh sửa: " + box.name;
        document.querySelector("#edit-name").value = box.name;
        
        document.querySelector("#edit-color-border").value = box.style.borderColor;
        document.querySelector("#edit-label-main").value = box.style.labelMain;
        document.querySelector("#edit-label-sub").value = box.style.labelSub;
        document.querySelector("#edit-color-text").value = box.style.textColor;
        
        if (box.style.colorStart) {
             document.querySelector("#edit-color-start").value = box.style.colorStart;
             document.querySelector("#edit-color-end").value = box.style.colorEnd;
        }

        // Drop Rates
        container.innerHTML = "";
        TIERS.forEach(tier => {
           const tCfg = box.config[tier.id];
           renderTierEditorRow(container, tier, tCfg);
        });
        
    } else {
        // Create Mode
        document.querySelector("#editor-title").textContent = "Tạo Hồng Bao Mới";
        form.reset();
        
        // Defaults
         document.querySelector("#edit-color-start").value = "#d32f2f";
         document.querySelector("#edit-color-end").value = "#880e0e";
         document.querySelector("#edit-color-border").value = "#fdd835";
         document.querySelector("#edit-color-text").value = "#ffeb3b";
        
        // Tiers
        container.innerHTML = "";
        const defCfg = getDefaultConfig();
        TIERS.forEach(tier => {
           const tCfg = defCfg[tier.id];
           renderTierEditorRow(container, tier, tCfg); 
        });
    }

    modal.classList.remove("hidden");
    gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.3 });
}

function renderTierEditorRow(container, tier, data) {
    const div = document.createElement("div");
    div.className = "p-3 bg-white/5 rounded-xl border border-white/5";
    div.innerHTML = `
        <div class="flex items-center gap-2 mb-2">
            <span>${tier.emoji}</span>
            <span class="font-bold text-sm" style="color: ${tier.color};">${tier.name}</span>
        </div>
        <div class="grid grid-cols-2 gap-3">
             <div>
                <label class="text-xs text-white/40 block mb-1">Tỷ lệ (%)</label>
                <input type="number" step="0.5" class="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-white edit-rate" data-tier="${tier.id}" value="${data.rate}">
             </div>
             <div>
                <label class="text-xs text-white/40 block mb-1">Giá trị (VNĐ)</label>
                <input type="text" class="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-white edit-vals" data-tier="${tier.id}" value="${data.values.join(",")}">
             </div>
        </div>
    `;
    container.appendChild(div);
}

function closeLootboxEditor() {
    const modal = document.querySelector("#lootbox-editor-modal");
    gsap.to(modal, { opacity: 0, duration: 0.3, onComplete: () => modal.classList.add("hidden") });
}

function saveLootboxEditor(e) {
    e.preventDefault();
    
    // Gather Data
    const name = document.querySelector("#edit-name").value;
    const cStart = document.querySelector("#edit-color-start").value;
    const cEnd = document.querySelector("#edit-color-end").value;
    
    // Generate gradient
    const bgGradient = `linear-gradient(170deg, ${cStart} 0%, ${cEnd} 100%)`;
    
    const style = {
        name, 
        bgGradient,
        borderColor: document.querySelector("#edit-color-border").value,
        accentColor: document.querySelector("#edit-color-border").value, 
        labelMain: document.querySelector("#edit-label-main").value,
        labelSub: document.querySelector("#edit-label-sub").value,
        textColor: document.querySelector("#edit-color-text").value,
        colorStart: cStart,
        colorEnd: cEnd 
    };
    
    // Config
    const newConfig = {};
    TIERS.forEach(tier => {
        const rate = parseFloat(document.querySelector(`.edit-rate[data-tier="${tier.id}"]`).value) || 0;
        const valStr = document.querySelector(`.edit-vals[data-tier="${tier.id}"]`).value;
        const values = valStr.split(",").map(v => parseInt(v.trim())).filter(n => !isNaN(n));
        
        newConfig[tier.id] = { rate, values };
    });
    
    // Validate Rates
    const totalRate = Object.values(newConfig).reduce((acc, c) => acc + c.rate, 0);
    if (Math.abs(totalRate - 100) > 0.1) {
        alert(`Tổng tỷ lệ hiện là ${totalRate}%. Hãy điều chỉnh về 100%!`);
        return;
    }
    
    if (isEditingId) {
        // Update
        LootboxData.update(isEditingId, { name, style, config: newConfig });
        showToast("✅ Đã cập nhật!");
    } else {
        // Create
        LootboxData.create(name, style, newConfig);
        showToast("✨ Đã tạo Hồng Bao mới!");
    }
    
    closeLootboxEditor();
    renderLootboxGrid();
    
    // If we edited current lootbox, refresh UI
    if (isEditingId === currentLootbox.id) {
        updateLootboxUI();
    }
}
