export function getTotalBestScore(levelScores = {}) {
  return Object.values(levelScores).reduce(
    (total, score) => total + Math.max(0, Number(score) || 0),
    0,
  );
}

export function getTotalStars(levelStars = {}) {
  return Object.values(levelStars).reduce(
    (total, stars) => total + Math.max(0, Number(stars) || 0),
    0,
  );
}

export function getCompletedLevelScores(levelScores = {}, levelStars = {}) {
  return Object.keys({...levelStars, ...levelScores})
    .map(Number)
    .filter(level => Number.isFinite(level) && (levelStars[level] ?? 0) > 0)
    .sort((a, b) => a - b)
    .map(level => ({
      level,
      score: Math.max(0, Number(levelScores[level]) || 0),
      stars: Math.max(0, Number(levelStars[level]) || 0),
    }));
}
