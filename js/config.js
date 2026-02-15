// ============================================
// CONFIG — Tier definitions, config load/save
// ============================================

const TIERS = [
  {
    id: "legendary",
    name: "Legendary",
    nameVi: "Huyền Thoại",
    color: "#ff9800",
    glowColor: "#ffb74d",
    bgColor: "rgba(255, 152, 0, 0.15)",
    emoji: "🌟",
    defaultRate: 5,
    defaultValues: [500000, 200000, 100000],
  },
  {
    id: "epic",
    name: "Epic",
    nameVi: "Sử Thi",
    color: "#9c27b0",
    glowColor: "#ce93d8",
    bgColor: "rgba(156, 39, 176, 0.15)",
    emoji: "💜",
    defaultRate: 10,
    defaultValues: [100000, 50000],
  },
  {
    id: "rare",
    name: "Rare",
    nameVi: "Hiếm",
    color: "#2196f3",
    glowColor: "#64b5f6",
    bgColor: "rgba(33, 150, 243, 0.15)",
    emoji: "💎",
    defaultRate: 20,
    defaultValues: [50000, 20000],
  },
  {
    id: "uncommon",
    name: "Uncommon",
    nameVi: "Không Phổ Biến",
    color: "#4caf50",
    glowColor: "#81c784",
    bgColor: "rgba(76, 175, 80, 0.15)",
    emoji: "🍀",
    defaultRate: 30,
    defaultValues: [20000, 10000],
  },
  {
    id: "common",
    name: "Common",
    nameVi: "Phổ Thông",
    color: "#9e9e9e",
    glowColor: "#bdbdbd",
    bgColor: "rgba(158, 158, 158, 0.15)",
    emoji: "⚪",
    defaultRate: 35,
    defaultValues: [10000, 5000, 2000],
  },
];

// ===== CONFIG MANAGEMENT =====

function getDefaultConfig() {
  const cfg = {};
  TIERS.forEach((tier) => {
    cfg[tier.id] = {
      rate: tier.defaultRate,
      values: [...tier.defaultValues],
    };
  });
  return cfg;
}

function loadConfig() {
  const saved = localStorage.getItem("hb_config");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // fall through to default
    }
  }
  return getDefaultConfig();
}

function saveConfigToStorage() {
  localStorage.setItem("hb_config", JSON.stringify(config));
}

// ===== ROLL LOGIC =====

function rollLootbox() {
  const rand = Math.random() * 100;
  let cumulative = 0;

  for (const tier of TIERS) {
    cumulative += config[tier.id].rate;
    if (rand <= cumulative) {
      const values = config[tier.id].values;
      const value = values[Math.floor(Math.random() * values.length)];
      return { tier: tier.id, value };
    }
  }

  // Fallback to last tier
  const lastTier = TIERS[TIERS.length - 1];
  const values = config[lastTier.id].values;
  return {
    tier: lastTier.id,
    value: values[Math.floor(Math.random() * values.length)],
  };
}

// ===== UTILITY =====

function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN").format(value);
}
