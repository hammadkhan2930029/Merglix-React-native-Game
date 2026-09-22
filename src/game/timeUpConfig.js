export const CONTINUE_SECONDS = [30, 20];
export const MAX_CONTINUES_PER_ATTEMPT = CONTINUE_SECONDS.length;

export function getContinueSeconds(continuesUsed) {
  return CONTINUE_SECONDS[continuesUsed] ?? 0;
}

export function canContinueAfterTimeUp(continuesUsed) {
  return continuesUsed >= 0 && continuesUsed < MAX_CONTINUES_PER_ATTEMPT;
}

export function calculateGameplayScore(completedMatches, timeLeft, continuesUsed) {
  const matchScore = Math.max(0, completedMatches) * 10;
  const eligibleTimeLeft = continuesUsed === 0 ? Math.max(0, timeLeft) : 0;
  return matchScore + eligibleTimeLeft;
}

export function capStarsAfterContinues(stars, continuesUsed) {
  const maximumStars = continuesUsed === 0 ? 3 : continuesUsed === 1 ? 2 : 1;
  return Math.min(Math.max(1, stars), maximumStars);
}
