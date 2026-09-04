const {Animated, Easing} = require('react-native');

const immediate = value => value;

module.exports = {
  __esModule: true,
  default: Animated,
  Easing,
  runOnJS: fn => fn,
  useAnimatedStyle: updater => updater(),
  useSharedValue: value => ({value}),
  withDelay: (_delay, animation) => animation,
  withRepeat: immediate,
  withSequence: (...animations) => animations[animations.length - 1],
  withSpring: immediate,
  withTiming: immediate,
};
