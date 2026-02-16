// ============================================
// LOOTBOX DATA — Manage multiple box types
// ============================================

const LootboxData = (() => {
  const STORAGE_KEY = "hb_lootboxes";
  const SELECTED_KEY = "hb_selected_id";

  // Default Lootbox Style for migration
  const DEFAULT_STYLE = {
    name: "Hồng Bao Mặc Định",
    bgGradient: "linear-gradient(170deg, #d32f2f 0%, #b71c1c 40%, #880e0e 100%)",
    borderColor: "#fdd835", // Yellow-600/50 approx
    accentColor: "#fbc02d", // Yellow-500
    labelMain: "LÌ XÌ",
    labelSub: "HỒNG BAO",
    textColor: "#ffeb3b"
  };

  let lootboxes = [];
  let selectedId = null;

  // --- CRUD Operations ---

  function getAll() {
    return lootboxes;
  }

  function getById(id) {
    return lootboxes.find(lb => lb.id === id);
  }

  function getSelected() {
    return getById(selectedId) || lootboxes[0];
  }

  function setSelected(id) {
    if (getById(id)) {
      selectedId = id;
      save();
      return true;
    }
    return false;
  }

  function create(name, style, initialConfig) {
    if (lootboxes.length >= 20) {
        alert("Đã đạt giới hạn 20 loại Hồng Bao!");
        return null;
    }
    
    const newBox = {
      id: "lb_" + Date.now(),
      name: name || "Hồng Bao Mới",
      style: { ...DEFAULT_STYLE, ...style },
      config: initialConfig || getDefaultConfigCopy(), // From config.js logic
      stats: {
        totalOpened: 0,
        totalMoney: 0,
        history: [] // Last 20 items specific to this box? Or keep global history separated?
      }
    };
    
    lootboxes.push(newBox);
    save();
    return newBox;
  }

  function update(id, updates) {
    const idx = lootboxes.findIndex(lb => lb.id === id);
    if (idx !== -1) {
      lootboxes[idx] = { ...lootboxes[idx], ...updates };
      save();
      return true;
    }
    return false;
  }

  function remove(id) {
    if (lootboxes.length <= 1) {
        alert("Phải giữ ít nhất 1 loại Hồng Bao!");
        return false;
    }
    
    lootboxes = lootboxes.filter(lb => lb.id !== id);
    
    // If selected was deleted, select first
    if (selectedId === id) {
        selectedId = lootboxes[0].id;
    }
    
    save();
    return true;
  }

  // --- Storage & Migration ---

  function load() {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedSel = localStorage.getItem(SELECTED_KEY);

    if (stored) {
      try {
        lootboxes = JSON.parse(stored);
        selectedId = storedSel || lootboxes[0].id;
      } catch (e) {
        console.error("Lootbox load error", e);
        resetToDefault();
      }
    } else {
      // First time or Migration scenario
      migrateLegacyConfig();
    }
    
    // Ensure at least one exists
    if (!lootboxes || lootboxes.length === 0) {
        resetToDefault();
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lootboxes));
    localStorage.setItem(SELECTED_KEY, selectedId);
  }

  function migrateLegacyConfig() {
    // Check if there's old config
    const oldConfigStr = localStorage.getItem("hb_config");
    let initialConfig = null;
    
    if (oldConfigStr) {
        try {
            initialConfig = JSON.parse(oldConfigStr);
        } catch (e) {}
    }

    // Create default box with old config (or default tiers)
    lootboxes = [{
      id: "default",
      name: "Hồng Bao Cổ Điển",
      style: DEFAULT_STYLE,
      config: initialConfig || getDefaultConfigCopy(), // Need access to this function from config.js
      stats: { totalOpened: 0, totalMoney: 0, history: [] }
    }];
    
    selectedId = "default";
    save();
  }

  function resetToDefault() {
    localStorage.removeItem(STORAGE_KEY);
    migrateLegacyConfig(); // Will re-create default
  }

  // Helper to get default config (duplicated/moved from config.js logic)
  function getDefaultConfigCopy() {
    // We expect TIERS to be available globally from config.js
    if (typeof TIERS === 'undefined') return {}; 
    const cfg = {};
    TIERS.forEach((tier) => {
        cfg[tier.id] = {
        rate: tier.defaultRate,
        values: [...tier.defaultValues],
        };
    });
    return cfg;
  }
    
  function addHistoryItem(boxId, item) {
      const box = getById(boxId);
      if (box) {
          box.stats.totalOpened++;
          box.stats.totalMoney += item.value;
          box.stats.history.unshift(item);
          if (box.stats.history.length > 20) box.stats.history.pop();
          save();
      }
  }

  function resetAllStats() {
      lootboxes.forEach(box => {
          box.stats.totalOpened = 0;
          box.stats.totalMoney = 0;
          box.stats.history = [];
      });
      save();
  }

  return {
    load,
    save,
    getAll,
    getById,
    getSelected,
    setSelected,
    create,
    update,
    remove,
    addHistoryItem,
    resetToDefault,
    resetAllStats
  };
})();
