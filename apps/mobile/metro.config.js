const path = require('node:path');
const {getDefaultConfig} = require('expo/metro-config');
const {withNativeWind} = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: './global.css',
  configPath: path.join(__dirname, 'tailwind.config.js'),
  // ★1rem = 16px (web 과 같게). NativeWind 기본값은 14 라 text-sm·text-base·px-5 같은
  // rem 클래스가 전부 web 의 87.5% 로 나왔다(text-sm 12.25px, px-5 17.5px) —
  // 같은 화면에서 text-[16px]·StyleSheet 숫자만 web 크기라 크기가 섞였다.
  inlineRem: 16,
});
