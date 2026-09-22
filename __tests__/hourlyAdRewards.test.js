import {
  ADS_PER_REWARD,
  HOURLY_REWARD_COINS,
  REWARD_COOLDOWN_MS,
  applyCompletedRewardAd,
  getHourlyRewardStatus,
  normalizeHourlyAdReward,
} from '../src/game/hourlyAdRewards';

test('only the fifth completed ad awards 100 coins and starts one-hour cooldown', () => {
  let progress = {coins: 10};
  const now = 1000;
  for (let index = 0; index < ADS_PER_REWARD - 1; index += 1) {
    progress = applyCompletedRewardAd(progress, now + index);
  }
  expect(progress.coins).toBe(10);
  expect(progress.hourlyAdReward.adsWatched).toBe(4);

  progress = applyCompletedRewardAd(progress, now + 4);
  expect(progress.coins).toBe(10 + HOURLY_REWARD_COINS);
  expect(progress.hourlyAdReward.cooldownUntil).toBe(now + 4 + REWARD_COOLDOWN_MS);
  expect(applyCompletedRewardAd(progress, now + 5)).toBe(progress);
});

test('a new five-ad cycle becomes available after cooldown', () => {
  const cooldownUntil = 5000;
  const reward = {adsWatched: 5, cooldownUntil, cyclesCompleted: 1};
  expect(getHourlyRewardStatus(reward, cooldownUntil - 1)).toBe('cooldown');
  expect(normalizeHourlyAdReward(reward, cooldownUntil)).toEqual({
    adsWatched: 0,
    cooldownUntil: null,
    cyclesCompleted: 1,
  });
});
