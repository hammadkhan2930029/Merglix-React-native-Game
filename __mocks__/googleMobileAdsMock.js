const createAd = () => ({
  loaded: true,
  addAdEventListener: jest.fn(() => jest.fn()),
  load: jest.fn(),
  removeAllListeners: jest.fn(),
  show: jest.fn(() => Promise.resolve()),
});

module.exports = {
  __esModule: true,
  default: () => ({
    initialize: jest.fn(() => Promise.resolve([])),
    setRequestConfiguration: jest.fn(() => Promise.resolve()),
  }),
  AdEventType: {
    CLOSED: 'closed',
    ERROR: 'error',
    OPENED: 'opened',
  },
  RewardedAd: {
    createForAdRequest: jest.fn(createAd),
  },
  RewardedAdEventType: {
    EARNED_REWARD: 'rewarded_earned_reward',
    LOADED: 'rewarded_loaded',
  },
  TestIds: {REWARDED: 'test-rewarded'},
};
