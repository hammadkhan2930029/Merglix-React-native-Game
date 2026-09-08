export function detectMatches(board, rows, columns, matchSize = 3) {
  const matches = [];

  for (let row = 0; row < rows; row += 1) {
    const rowStart = row * columns;

    for (let column = 0; column <= columns - matchSize; column += 1) {
      const start = rowStart + column;
      const item = board[start];

      if (!item) {
        continue;
      }

      const group = Array.from({length: matchSize}, (_, offset) => start + offset);
      if (group.every(index => board[index]?.type === item.type)) {
        matches.push(group);
        column += matchSize - 1;
      }
    }
  }

  return matches;
}

export function swapSlots(board, firstIndex, secondIndex) {
  if (
    firstIndex === secondIndex ||
    firstIndex < 0 ||
    secondIndex < 0 ||
    firstIndex >= board.length ||
    secondIndex >= board.length
  ) {
    return board;
  }

  const nextBoard = [...board];
  [nextBoard[firstIndex], nextBoard[secondIndex]] = [
    nextBoard[secondIndex],
    nextBoard[firstIndex],
  ];
  return nextBoard;
}

export function findHintSwap(board, rows, columns, matchSize = 3) {
  for (let first = 0; first < board.length; first += 1) {
    for (let second = first + 1; second < board.length; second += 1) {
      if (!board[first] && !board[second]) continue;
      if (board[first]?.type === board[second]?.type) continue;
      const candidate = swapSlots(board, first, second);
      if (detectMatches(candidate, rows, columns, matchSize).length > 0) return [first, second];
    }
  }
  return null;
}

export function findMagnetHintIds(board, matchSize = 3) {
  const productsByType = new Map();
  board.forEach(item => {
    if (!item) return;
    const products = productsByType.get(item.type) ?? [];
    products.push(item.id);
    productsByType.set(item.type, products);
  });

  for (const products of productsByType.values()) {
    if (products.length >= matchSize) return products.slice(0, matchSize);
  }
  return null;
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

export function shuffleRemainingBoard(board, config, retryLimit = 200) {
  const originalOrder = board.map(item => item?.id ?? null);
  for (let attempt = 0; attempt < retryLimit; attempt += 1) {
    const candidate = shuffle(board);
    const candidateOrder = candidate.map(item => item?.id ?? null);
    const changed = candidateOrder.some((id, index) => id !== originalOrder[index]);
    if (
      changed &&
      detectMatches(candidate, config.rows, config.columns, config.matchSize).length === 0 &&
      findHintSwap(candidate, config.rows, config.columns, config.matchSize)
    ) {
      return candidate;
    }
  }
  return null;
}

export function createLevelBoard(config) {
  const pool = config.productTypes.flatMap(type =>
    Array.from({
      length: config.copiesByType?.[type] ?? config.copiesPerType,
    }, (_, copy) => ({
      id: `${type}-${copy}`,
      type,
    })),
  );
  const slotCount = config.rows * config.columns;

  if (pool.length > slotCount) {
    throw new Error(`Level ${config.level} has more products than shelf slots`);
  }

  for (let attempt = 0; attempt < 500; attempt += 1) {
    const candidate = shuffle([
      ...pool,
      ...Array.from({length: slotCount - pool.length}, () => null),
    ]);
    if (
      detectMatches(candidate, config.rows, config.columns, config.matchSize)
        .length === 0 &&
      findHintSwap(candidate, config.rows, config.columns, config.matchSize)
    ) {
      return candidate;
    }
  }

  throw new Error(`Unable to create a playable board for level ${config.level}`);
}
