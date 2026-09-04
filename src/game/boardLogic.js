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
    if (!board[first]) continue;
    for (let second = first + 1; second < board.length; second += 1) {
      if (!board[second] || board[first].type === board[second].type) continue;
      const candidate = swapSlots(board, first, second);
      if (detectMatches(candidate, rows, columns, matchSize).length > 0) return [first, second];
    }
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

export function createLevelBoard(config) {
  const pool = config.productTypes.flatMap(type =>
    Array.from({length: config.copiesPerType}, (_, copy) => ({
      id: `${type}-${copy}`,
      type,
    })),
  );

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const candidate = shuffle(pool);
    if (
      detectMatches(candidate, config.rows, config.columns, config.matchSize)
        .length === 0
    ) {
      return candidate;
    }
  }

  return pool;
}
