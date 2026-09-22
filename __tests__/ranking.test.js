import {getCompletedLevelScores, getTotalBestScore, getTotalStars} from '../src/game/ranking';

test('totals the locally saved best scores and stars', () => {
  expect(getTotalBestScore({1: 100, 2: 80, 3: 0})).toBe(180);
  expect(getTotalStars({1: 3, 2: 2})).toBe(5);
});

test('builds a sorted score board for completed levels only', () => {
  expect(getCompletedLevelScores({2: 90, 1: 100, 3: 70}, {1: 3, 2: 2})).toEqual([
    {level: 1, score: 100, stars: 3},
    {level: 2, score: 90, stars: 2},
  ]);
});
