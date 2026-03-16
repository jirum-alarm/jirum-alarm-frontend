module.exports = {
  presets: ['babel-preset-expo', 'nativewind/babel'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@': './src',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
