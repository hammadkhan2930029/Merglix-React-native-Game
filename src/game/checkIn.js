export const CHECK_IN_REWARDS = [20, 25, 30, 35, 40, 50, 100];
export const GAMEPLAY_COINS_TO_UNLOCK_NEXT_CYCLE = 100;

export const INITIAL_CHECK_IN = {
  cycle: 1,
  currentDayIndex: 0,
  lastClaimedDayIndex: null,
  lastClaimDate: null,
  lastCompletedCycleDate: null,
  cycleLocked: false,
  gameplayCoinsSinceCycle: 0,
  lifetimeClaims: 0,
};

// V1 intentionally uses device-local time. Keep this provider boundary small so
// server-authoritative time can replace it later without rewriting the feature.
export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function normalizeCheckIn(checkIn) {
  return {...INITIAL_CHECK_IN, ...(checkIn ?? {})};
}

export function getCheckInStatus(checkIn, dateKey = getLocalDateKey()) {
  const state = normalizeCheckIn(checkIn);
  if (state.cycleLocked) return 'locked';
  if (state.lastClaimDate === dateKey && state.currentDayIndex === 0 && state.cycle > 1) {
    return 'waiting';
  }
  if (state.lastClaimDate && dateKey <= state.lastClaimDate) return 'claimed';
  return 'available';
}

export function applyDailyCheckInClaim(progress, dateKey = getLocalDateKey()) {
  const checkIn = normalizeCheckIn(progress.dailyCheckIn);
  if (getCheckInStatus(checkIn, dateKey) !== 'available') return progress;

  const dayIndex = Math.min(checkIn.currentDayIndex, CHECK_IN_REWARDS.length - 1);
  const reward = CHECK_IN_REWARDS[dayIndex];
  const completesCycle = dayIndex === CHECK_IN_REWARDS.length - 1;

  return {
    ...progress,
    coins: Math.max(0, (progress.coins ?? 0) + reward),
    dailyCheckIn: {
      ...checkIn,
      currentDayIndex: completesCycle ? dayIndex : dayIndex + 1,
      lastClaimedDayIndex: dayIndex,
      lastClaimDate: dateKey,
      lastCompletedCycleDate: completesCycle
        ? dateKey
        : checkIn.lastCompletedCycleDate,
      cycleLocked: completesCycle,
      gameplayCoinsSinceCycle: completesCycle
        ? 0
        : checkIn.gameplayCoinsSinceCycle,
      lifetimeClaims: checkIn.lifetimeClaims + 1,
    },
  };
}

export function applyGameplayCoinsToCheckInGate(progress, amount) {
  const checkIn = normalizeCheckIn(progress.dailyCheckIn);
  if (!checkIn.cycleLocked || amount <= 0) return progress;

  const gateProgress = Math.min(
    GAMEPLAY_COINS_TO_UNLOCK_NEXT_CYCLE,
    checkIn.gameplayCoinsSinceCycle + amount,
  );
  if (gateProgress < GAMEPLAY_COINS_TO_UNLOCK_NEXT_CYCLE) {
    return {
      ...progress,
      dailyCheckIn: {...checkIn, gameplayCoinsSinceCycle: gateProgress},
    };
  }

  return {
    ...progress,
    dailyCheckIn: {
      ...checkIn,
      cycle: checkIn.cycle + 1,
      currentDayIndex: 0,
      lastClaimedDayIndex: null,
      cycleLocked: false,
      gameplayCoinsSinceCycle: 0,
    },
  };
}

export function getDisplayedCheckInDayIndex(checkIn, status) {
  const state = normalizeCheckIn(checkIn);
  const index = status === 'available'
    ? state.currentDayIndex
    : state.lastClaimedDayIndex ?? state.currentDayIndex;
  return Math.min(index, CHECK_IN_REWARDS.length - 1);
}
