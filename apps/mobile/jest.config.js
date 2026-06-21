module.exports = {
  preset: 'react-native',
  moduleNameMapper: {
    '^react$': '<rootDir>/node_modules/react',
    '^react/jsx-runtime$': '<rootDir>/node_modules/react/jsx-runtime',
    '^react/jsx-dev-runtime$': '<rootDir>/node_modules/react/jsx-dev-runtime',
  },
  // react-native 프리셋은 node_modules를 변환 제외하지만, expo/Mixpanel 등
  // ESM(예: expo/virtual/env.js의 `export const env`)을 끌어오는 패키지는
  // 변환 대상에 포함해야 한다. (App.test.tsx의 "Unexpected token 'export'" 원인)
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|mixpanel-react-native|react-native-get-random-values|uuid)/)',
  ],
};
