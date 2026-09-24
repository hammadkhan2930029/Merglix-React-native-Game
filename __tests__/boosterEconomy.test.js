import {BOOSTER_CONFIG} from '../src/game/boosterConfig';
import {
  applySuccessfulBoosterUse,
  getBoosterAvailability,
  INITIAL_ATTEMPT_BOOSTER_USES,
  INITIAL_BOOSTER_STATE,
  isBoosterUnlocked,
  markBoosterUnlockSeen,
  normalizeBoosterState,
} from '../src/game/boosterEconomy';

describe('booster unlock progression', () => {
  test.each([
    ['magnet', 10, 11],
    ['shuffle', 15, 16],
    ['freeze', 20, 21],
  ])('%s unlocks at its configured level', (name, lockedLevel, unlockLevel) => {
    expect(isBoosterUnlocked(name, lockedLevel)).toBe(false);
    expect(isBoosterUnlocked(name, unlockLevel)).toBe(true);
  });

  test('a locked booster cannot be activated or charge coins', () => {
    const availability = getBoosterAvailability({
      name: 'magnet', level: 10, coins: 500,
      boosterState: INITIAL_BOOSTER_STATE,
      uses: INITIAL_ATTEMPT_BOOSTER_USES,
    });
    expect(availability).toMatchObject({allowed: false, reason: 'locked'});
  });
});

describe('booster economy', () => {
  test.each(['magnet', 'shuffle', 'freeze'])('%s charges its configured cost on the first successful use', name => {
    const before = {coins: 100, boosterState: INITIAL_BOOSTER_STATE};
    const after = applySuccessfulBoosterUse(before, name);
    expect(after.coins).toBe(100 - BOOSTER_CONFIG[name].coinCost);
  });

  test.each(['magnet', 'shuffle', 'freeze'])('%s availability requires its configured cost', name => {
    const availability = getBoosterAvailability({
      name, level: BOOSTER_CONFIG[name].unlockLevel, coins: BOOSTER_CONFIG[name].coinCost - 1,
      boosterState: INITIAL_BOOSTER_STATE, uses: INITIAL_ATTEMPT_BOOSTER_USES,
    });
    expect(availability).toMatchObject({allowed: false, reason: 'coins'});
  });

  test('insufficient funds preserve the exact progress object', () => {
    const before = {
      coins: 19,
      boosterState: INITIAL_BOOSTER_STATE,
    };
    expect(applySuccessfulBoosterUse(before, 'magnet')).toBe(before);
  });

  test('per-attempt limit is enforced', () => {
    const availability = getBoosterAvailability({
      name: 'freeze', level: 21, coins: 500,
      boosterState: INITIAL_BOOSTER_STATE,
      uses: {...INITIAL_ATTEMPT_BOOSTER_USES, freeze: 1},
    });
    expect(availability).toMatchObject({allowed: false, reason: 'limit'});
  });

  test('legacy saves receive defaults and unlock tutorial can be persisted', () => {
    expect(normalizeBoosterState()).toEqual(INITIAL_BOOSTER_STATE);
    const updated = markBoosterUnlockSeen({coins: 0}, 'shuffle');
    expect(updated.boosterState.shuffleUnlockSeen).toBe(true);
  });
});
