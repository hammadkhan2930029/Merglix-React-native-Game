export const LEVELS_PER_WORLD = 50;

export function getWorldLevels(worldId) {
  const firstLevel = (worldId - 1) * LEVELS_PER_WORLD + 1;
  return Array.from({length: LEVELS_PER_WORLD}, (_, index) => firstLevel + index);
}

export function isLevelCompleted(levelStars, level) {
  return (levelStars?.[level] ?? 0) > 0;
}

export function isWorldCompleted(levelStars, worldId) {
  return getWorldLevels(worldId).every(level => isLevelCompleted(levelStars, level));
}
