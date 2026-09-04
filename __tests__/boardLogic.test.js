import {createLevelBoard, detectMatches, swapSlots} from '../src/game/boardLogic';
import {LEVEL_CONFIGS} from '../src/game/levelConfigs';

describe('Level 1 board logic', () => {
  const config = LEVEL_CONFIGS[1];

  test('generates a complete shuffled board without an initial match', () => {
    const board = createLevelBoard(config);
    const counts = board.reduce((result, item) => {
      result[item.type] = (result[item.type] ?? 0) + 1;
      return result;
    }, {});

    expect(board).toHaveLength(config.rows * config.columns);
    expect(counts).toEqual({apple: 3, milk: 3, juice: 3, can: 3});
    expect(
      detectMatches(board, config.rows, config.columns, config.matchSize),
    ).toEqual([]);
  });

  test('detects only adjacent triples inside the same row', () => {
    const item = (id, type) => ({id, type});
    const board = [
      item('a1', 'apple'),
      item('a2', 'apple'),
      item('a3', 'apple'),
      item('m1', 'milk'),
      item('m2', 'milk'),
      item('j1', 'juice'),
      item('m3', 'milk'),
      item('j2', 'juice'),
      item('c1', 'can'),
      item('j3', 'juice'),
      item('c2', 'can'),
      item('c3', 'can'),
    ];

    expect(detectMatches(board, 3, 4, 3)).toEqual([[0, 1, 2]]);
  });

  test('swaps two slots without mutating the original board', () => {
    const board = [{id: 'a'}, {id: 'b'}];
    const swapped = swapSlots(board, 0, 1);

    expect(swapped).toEqual([{id: 'b'}, {id: 'a'}]);
    expect(board).toEqual([{id: 'a'}, {id: 'b'}]);
  });
});
