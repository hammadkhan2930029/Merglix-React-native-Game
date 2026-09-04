export const PRODUCT_ASSETS = {
  apple: require('../assets/splash elements/apple without bg.png'),
  milk: require('../assets/splash elements/milk bottle without bg.png'),
  juice: require('../assets/splash elements/orange bottle wthout bg.png'),
  can: require('../assets/splash elements/red bottle without bg.png'),
};

export const LEVEL_CONFIGS = {
  1: {
    level: 1,
    rows: 3,
    columns: 4,
    productTypes: ['apple', 'milk', 'juice', 'can'],
    copiesPerType: 3,
    matchSize: 3,
    matchReward: 3,
    completionReward: 0,
    durationSeconds: 150,
    difficulty: 'easy',
  },
};
