import {
  CHECK_IN_REWARDS,
  GAMEPLAY_COINS_TO_UNLOCK_NEXT_CYCLE,
  INITIAL_CHECK_IN,
  applyDailyCheckInClaim,
  applyGameplayCoinsToCheckInGate,
  getCheckInStatus,
  getLocalDateKey,
} from '../src/game/checkIn';

function progress(overrides = {}) {
  return {
    coins: 0,
    dailyCheckIn: {...INITIAL_CHECK_IN},
    ...overrides,
  };
}

test('uses the exact seven-day reward configuration', () => {
  expect(CHECK_IN_REWARDS).toEqual([20, 25, 30, 35, 40, 50, 100]);
  expect(GAMEPLAY_COINS_TO_UNLOCK_NEXT_CYCLE).toBe(100);
});

test('creates a stable local calendar date key', () => {
  expect(getLocalDateKey(new Date(2026, 8, 11, 23, 59))).toBe('2026-09-11');
});

test('new user claims Day 1 once and waits for another calendar day', () => {
  const first = applyDailyCheckInClaim(progress(), '2026-09-11');
  expect(first.coins).toBe(20);
  expect(first.dailyCheckIn.currentDayIndex).toBe(1);
  expect(first.dailyCheckIn.lastClaimedDayIndex).toBe(0);
  expect(getCheckInStatus(first.dailyCheckIn, '2026-09-11')).toBe('claimed');
  expect(applyDailyCheckInClaim(first, '2026-09-11')).toBe(first);
});

test('missed dates do not reset or skip the next reward', () => {
  const first = applyDailyCheckInClaim(progress(), '2026-09-01');
  const second = applyDailyCheckInClaim(first, '2026-09-06');
  expect(second.coins).toBe(45);
  expect(second.dailyCheckIn.lastClaimedDayIndex).toBe(1);
  expect(second.dailyCheckIn.currentDayIndex).toBe(2);
});

test('Day 7 locks the next cycle and resets gameplay gate progress', () => {
  const beforeDaySeven = progress({
    coins: 210,
    dailyCheckIn: {
      ...INITIAL_CHECK_IN,
      currentDayIndex: 6,
      gameplayCoinsSinceCycle: 85,
      lastClaimDate: '2026-09-10',
    },
  });
  const claimed = applyDailyCheckInClaim(beforeDaySeven, '2026-09-11');
  expect(claimed.coins).toBe(310);
  expect(claimed.dailyCheckIn.cycleLocked).toBe(true);
  expect(claimed.dailyCheckIn.gameplayCoinsSinceCycle).toBe(0);
  expect(getCheckInStatus(claimed.dailyCheckIn, '2026-09-12')).toBe('locked');
});

test('only explicitly applied gameplay coins advance the locked gate', () => {
  const locked = progress({
    coins: 310,
    dailyCheckIn: {...INITIAL_CHECK_IN, cycleLocked: true},
  });
  const partial = applyGameplayCoinsToCheckInGate(locked, 35);
  expect(partial.dailyCheckIn.gameplayCoinsSinceCycle).toBe(35);
  expect(partial.coins).toBe(310);
});

test('100 gameplay coins unlock next cycle without a same-day second claim', () => {
  const locked = progress({
    dailyCheckIn: {
      ...INITIAL_CHECK_IN,
      currentDayIndex: 6,
      lastClaimedDayIndex: 6,
      lastClaimDate: '2026-09-11',
      lastCompletedCycleDate: '2026-09-11',
      cycleLocked: true,
      gameplayCoinsSinceCycle: 70,
    },
  });
  const unlocked = applyGameplayCoinsToCheckInGate(locked, 30);
  expect(unlocked.dailyCheckIn.cycle).toBe(2);
  expect(unlocked.dailyCheckIn.currentDayIndex).toBe(0);
  expect(unlocked.dailyCheckIn.gameplayCoinsSinceCycle).toBe(0);
  expect(getCheckInStatus(unlocked.dailyCheckIn, '2026-09-11')).toBe('waiting');
  expect(applyDailyCheckInClaim(unlocked, '2026-09-11')).toBe(unlocked);

  const nextDay = applyDailyCheckInClaim(unlocked, '2026-09-12');
  expect(nextDay.coins).toBe(20);
  expect(nextDay.dailyCheckIn.cycle).toBe(2);
});
