export const BOOSTER_CONFIG = {
  magnet: {
    initialQuantity: 3,
    highlightDurationMs: 2500,
  },
  shuffle: {
    initialQuantity: 2,
    animationDurationMs: 260,
    retryLimit: 200,
  },
  freeze: {
    initialQuantity: 2,
    durationMs: 10000,
  },
};

export const INITIAL_BOOSTERS = Object.fromEntries(
  Object.entries(BOOSTER_CONFIG).map(([name, config]) => [
    name,
    config.initialQuantity,
  ]),
);
