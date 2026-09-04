module.exports = {
  preset: '@react-native/jest-preset',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-screens|react-native-vector-icons|react-native-gesture-handler|react-native-reanimated|react-native-worklets)/)',
  ],
  setupFiles: ['react-native-gesture-handler/jestSetup.js'],
  moduleNameMapper: {
    '^react-native-reanimated$': '<rootDir>/__mocks__/reanimatedMock.js',
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    '\\.mp3$': '<rootDir>/__mocks__/fileMock.js',
    '^react-native-sound$': '<rootDir>/__mocks__/soundMock.js',
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/__mocks__/asyncStorageMock.js',
  },
};
