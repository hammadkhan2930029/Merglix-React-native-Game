import {BOOSTER_CONFIG} from './boosterConfig';

export const INITIAL_BOOSTER_STATE = {
  magnetUnlockSeen: false,
  shuffleUnlockSeen: false,
  freezeUnlockSeen: false,
};

export const INITIAL_ATTEMPT_BOOSTER_USES = {magnet: 0, shuffle: 0, freeze: 0};

export function normalizeBoosterState(state) {
  return {...INITIAL_BOOSTER_STATE, ...(state ?? {})};
}

export function isBoosterUnlocked(name, level) {
  return level >= (BOOSTER_CONFIG[name]?.unlockLevel ?? Infinity);
}

export function canAffordBooster(coins, name) {
  return coins >= (BOOSTER_CONFIG[name]?.coinCost ?? Infinity);
}

export function hasAttemptUseRemaining(uses, name) {
  return (uses?.[name] ?? 0) < (BOOSTER_CONFIG[name]?.maxUsesPerAttempt ?? 0);
}

export function getBoosterAvailability({name, level, coins, boosterState, uses}) {
  const config = BOOSTER_CONFIG[name];
  if (!config || !isBoosterUnlocked(name, level)) {
    return {allowed: false, reason: 'locked', unlockLevel: config?.unlockLevel};
  }
  if (!hasAttemptUseRemaining(uses, name)) {
    return {allowed: false, reason: 'limit'};
  }
  if (coins < config.coinCost) {
    return {allowed: false, reason: 'coins', cost: config.coinCost};
  }
  return {allowed: true, cost: config.coinCost};
}

export function applySuccessfulBoosterUse(progress, name) {
  const config = BOOSTER_CONFIG[name];
  if (!config) return progress;
  const boosterState = normalizeBoosterState(progress.boosterState);
  if ((progress.coins ?? 0) < config.coinCost) return progress;

  return {
    ...progress,
    coins: Math.max(0, (progress.coins ?? 0) - config.coinCost),
    boosterState,
  };
}

export function markBoosterUnlockSeen(progress, name) {
  const key = `${name}UnlockSeen`;
  return {
    ...progress,
    boosterState: {...normalizeBoosterState(progress.boosterState), [key]: true},
  };
}
