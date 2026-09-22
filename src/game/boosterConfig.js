export const BOOSTER_CONFIG = {
  magnet: {
    unlockLevel: 11,
    coinCost: 20,
    maxUsesPerAttempt: 2,
    highlightDurationMs: 2500,
  },
  shuffle: {
    unlockLevel: 16,
    coinCost: 25,
    maxUsesPerAttempt: 2,
    animationDurationMs: 260,
    retryLimit: 200,
  },
  freeze: {
    unlockLevel: 21,
    coinCost: 30,
    maxUsesPerAttempt: 1,
    durationMs: 10000,
  },
};

// Retained only to migrate saves made by the old inventory-based booster system.
export const INITIAL_BOOSTERS = {magnet: 0, shuffle: 0, freeze: 0};
