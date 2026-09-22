import {applyGameplayCoinsToCheckInGate} from './checkIn';

export const MATCH_REWARD = 5;
export const REWARD_CENTER_AMOUNTS = [10, 15, 20, 25, 30, 50];

export function getLevelCompletionReward(level) {
  if (level <= 10) return 25;
  if (level <= 30) return 25;
  if (level <= 60) return 30;
  if (level <= 80) return 35;
  if (level <= 100) return 40;
  if (level <= 120) return 45;
  return 45 + Math.ceil((level - 120) / 20) * 5;
}

export function getRewardBreakdown({level, matchGroups, replay = false}) {
  const matchCoins = Math.max(0, matchGroups) * MATCH_REWARD;
  const baseCompletionCoins = getLevelCompletionReward(level);
  const completionCoins = replay
    ? Math.floor(baseCompletionCoins / 2)
    : baseCompletionCoins;

  return {
    matchCoins,
    completionCoins,
    totalCoins: matchCoins + completionCoins,
  };
}

export function applyRewardedAdClaim(progress, attemptId, claimedAt = Date.now()) {
  const completedReward = progress.completionRewards?.[attemptId];
  const alreadyClaimed = Boolean(progress.rewardedAdClaims?.[attemptId]) ||
    progress.adRewardClaims?.includes(attemptId);
  if (
    !completedReward ||
    !progress.rewardClaims?.includes(attemptId) ||
    alreadyClaimed
  ) {
    return progress;
  }

  return {
    ...progress,
    coins: Math.max(0, progress.coins + completedReward),
    rewardedAdClaims: Object.fromEntries([
      ...Object.entries(progress.rewardedAdClaims ?? {}).slice(-99),
      [attemptId, {reward: completedReward, claimedAt}],
    ]),
  };
}

export function applyRewardCenterClaim(progress, claimId, amount, claimedAt = Date.now()) {
  if (
    !claimId ||
    !REWARD_CENTER_AMOUNTS.includes(amount) ||
    progress.rewardCenterClaims?.[claimId]
  ) {
    return progress;
  }

  return {
    ...progress,
    coins: Math.max(0, progress.coins + amount),
    rewardCenterClaims: Object.fromEntries([
      ...Object.entries(progress.rewardCenterClaims ?? {}).slice(-59),
      [claimId, {reward: amount, claimedAt}],
    ]),
  };
}

export function applyGameplayMatchClaim(progress, claimId, amount) {
  if (!claimId || amount <= 0 || progress.matchRewardClaims?.includes(claimId)) {
    return progress;
  }
  const credited = {
    ...progress,
    coins: Math.max(0, (progress.coins ?? 0) + amount),
    matchRewardClaims: [...(progress.matchRewardClaims ?? []), claimId].slice(-300),
  };
  return applyGameplayCoinsToCheckInGate(credited, amount);
}
