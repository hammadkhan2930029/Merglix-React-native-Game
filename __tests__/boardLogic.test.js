import {
  createLevelBoard,
  detectMatches,
  findMagnetHintIds,
  findHintSwap,
  shuffleRemainingBoard,
  swapSlots,
} from '../src/game/boardLogic';
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

describe('Gameplay booster board helpers', () => {
  test('magnet returns exactly three IDs of one type without changing the board', () => {
    const board = createLevelBoard(LEVEL_CONFIGS[2]);
    const before = board.map(item => item?.id);
    const ids = findMagnetHintIds(board, 3);
    const hintedItems = board.filter(item => ids.includes(item.id));

    expect(ids).toHaveLength(3);
    expect(new Set(hintedItems.map(item => item.type)).size).toBe(1);
    expect(board.map(item => item?.id)).toEqual(before);
  });

  test('shuffle preserves remaining products and returns a playable arrangement', () => {
    const config = LEVEL_CONFIGS[3];
    const board = createLevelBoard(config);
    const shuffled = shuffleRemainingBoard(board, config, 500);

    expect(shuffled).not.toBeNull();
    expect(shuffled).not.toBe(board);
    expect(shuffled.map(item => item?.id).sort()).toEqual(
      board.map(item => item?.id).sort(),
    );
    expect(detectMatches(shuffled, config.rows, config.columns, 3)).toEqual([]);
    expect(findHintSwap(shuffled, config.rows, config.columns, 3)).not.toBeNull();
  });

  test('magnet returns null when fewer than three identical products remain', () => {
    const board = [
      {id: 'apple-1', type: 'apple'},
      {id: 'apple-2', type: 'apple'},
      {id: 'milk-1', type: 'milk'},
    ];
    expect(findMagnetHintIds(board, 3)).toBeNull();
  });
});

describe('Level 2 board configuration', () => {
  const config = LEVEL_CONFIGS[2];

  test('uses a fully matchable 3 by 5 shelf with five new product types', () => {
    expect(config).toMatchObject({
      level: 2,
      rows: 3,
      columns: 5,
      durationSeconds: 135,
      matchSize: 3,
      matchReward: 3,
      targetMatches: 5,
      shelf: 'classic3',
    });
    expect(config.productTypes).toEqual([
      'blueMilk',
      'blueJuice',
      'orangeBottle',
      'redChips',
      'greenHerbal',
    ]);
  });

  test('generates a full board with no initial match and a valid move', () => {
    const board = createLevelBoard(config);
    const counts = board.reduce((result, item) => {
      if (item) result[item.type] = (result[item.type] ?? 0) + 1;
      return result;
    }, {});

    expect(board).toHaveLength(15);
    expect(board.filter(Boolean)).toHaveLength(15);
    expect(counts).toEqual({blueMilk: 3, blueJuice: 3, orangeBottle: 3, redChips: 3, greenHerbal: 3});
    expect(detectMatches(board, 3, 5, 3)).toEqual([]);
    expect(findHintSwap(board, 3, 5, 3)).not.toBeNull();
  });
});

describe('Level 3 board configuration', () => {
  const config = LEVEL_CONFIGS[3];

  test('uses a 3 by 6 shelf with six new product types', () => {
    expect(config).toMatchObject({
      level: 3,
      rows: 3,
      columns: 6,
      durationSeconds: 150,
      matchSize: 3,
      matchReward: 3,
      targetMatches: 6,
      shelf: 'classic3',
      difficulty: 'medium',
    });
    expect(config.productTypes).toEqual([
      'blueFruit',
      'greenBottle',
      'greenFruit',
      'level3Milk',
      'orangeBottleAlt',
      'orangeCan',
    ]);
  });

  test('generates 18 fully matchable items with a valid opening move', () => {
    const board = createLevelBoard(config);
    const counts = board.reduce((result, item) => {
      result[item.type] = (result[item.type] ?? 0) + 1;
      return result;
    }, {});

    expect(board).toHaveLength(18);
    expect(Object.values(counts)).toEqual([3, 3, 3, 3, 3, 3]);
    expect(detectMatches(board, 3, 6, 3)).toEqual([]);
    expect(findHintSwap(board, 3, 6, 3)).not.toBeNull();
  });
});
