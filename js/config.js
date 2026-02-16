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

// ===== CONFIG MANAGEMENT — LEGACY DEPRECATED =====
// Config is now managed by LootboxData per instance.
// This file keeps TIERS and Logic helper.

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

// ===== ROLL LOGIC =====

function rollLootbox(lootboxConfig) { 
  // Safety check
  const cfg = lootboxConfig || getDefaultConfig();
  
  const rand = Math.random() * 100;
  let cumulative = 0;

  for (const tier of TIERS) {
    // If tier config missing, skip or use default? 
    // Assume cfg has all tiers if created properly.
    const tierCfg = cfg[tier.id] || { rate: 0, values: [] };
    
    cumulative += tierCfg.rate;
    if (rand <= cumulative) {
      const values = tierCfg.values;
      // If no values defined, fallback or return 0?
      const value = (values && values.length > 0) 
        ? values[Math.floor(Math.random() * values.length)]
        : 0;
      return { tier: tier.id, value };
    }
  }

  // Fallback to last tier
  const lastTier = TIERS[TIERS.length - 1];
  const values = cfg[lastTier.id] ? cfg[lastTier.id].values : [];
  return {
    tier: lastTier.id,
    value: (values && values.length > 0) ? values[Math.floor(Math.random() * values.length)] : 0,
  };
}

// ===== UTILITY =====

function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN").format(value);
}
