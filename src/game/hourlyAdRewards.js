export const ADS_PER_REWARD = 5;
export const HOURLY_REWARD_COINS = 100;
export const REWARD_COOLDOWN_MS = 60 * 60 * 1000;

export const INITIAL_HOURLY_AD_REWARD = {
  adsWatched: 0,
  cooldownUntil: null,
  cyclesCompleted: 0,
};

export function normalizeHourlyAdReward(reward, now = Date.now()) {
  const state = {...INITIAL_HOURLY_AD_REWARD, ...(reward ?? {})};
  if (state.cooldownUntil && now >= state.cooldownUntil) {
    return {...state, adsWatched: 0, cooldownUntil: null};
  }
  return state;
}

export function getHourlyRewardStatus(reward, now = Date.now()) {
  const state = normalizeHourlyAdReward(reward, now);
  return state.cooldownUntil && now < state.cooldownUntil ? 'cooldown' : 'available';
}

export function applyCompletedRewardAd(progress, now = Date.now()) {
  const current = normalizeHourlyAdReward(progress.hourlyAdReward, now);
  if (getHourlyRewardStatus(current, now) === 'cooldown') return progress;

  const adsWatched = Math.min(ADS_PER_REWARD, current.adsWatched + 1);
  const completed = adsWatched === ADS_PER_REWARD;

  return {
    ...progress,
    coins: Math.max(0, (progress.coins ?? 0) + (completed ? HOURLY_REWARD_COINS : 0)),
    hourlyAdReward: {
      adsWatched,
      cooldownUntil: completed ? now + REWARD_COOLDOWN_MS : null,
      cyclesCompleted: current.cyclesCompleted + (completed ? 1 : 0),
    },
  };
}

export function getCooldownRemaining(reward, now = Date.now()) {
  const state = normalizeHourlyAdReward(reward, now);
  return Math.max(0, (state.cooldownUntil ?? 0) - now);
}
