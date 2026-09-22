import {calculateGameplayScore, canContinueAfterTimeUp, capStarsAfterContinues, getContinueSeconds} from '../src/game/timeUpConfig';

test('offers exactly two continues with 30 then 20 seconds', () => {
  expect(getContinueSeconds(0)).toBe(30);
  expect(getContinueSeconds(1)).toBe(20);
  expect(getContinueSeconds(2)).toBe(0);
  expect(canContinueAfterTimeUp(0)).toBe(true);
  expect(canContinueAfterTimeUp(1)).toBe(true);
  expect(canContinueAfterTimeUp(2)).toBe(false);
});

test('extra-time matches score normally but rewarded seconds do not', () => {
  expect(calculateGameplayScore(4, 60, 0)).toBe(100);
  expect(calculateGameplayScore(6, 15, 1)).toBe(60);
  expect(calculateGameplayScore(8, 7, 2)).toBe(80);
});

test('continues cap the final stars', () => {
  expect(capStarsAfterContinues(3, 0)).toBe(3);
  expect(capStarsAfterContinues(3, 1)).toBe(2);
  expect(capStarsAfterContinues(3, 2)).toBe(1);
});
