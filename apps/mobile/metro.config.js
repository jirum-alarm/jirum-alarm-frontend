const path = require('node:path');
const {getDefaultConfig} = require('expo/metro-config');
const {withNativeWind} = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// ★inlineRequires — 모듈을 import 문 위치가 아니라 **처음 쓰는 순간** 평가한다. 앱 시작 때
// 모든 모듈을 한꺼번에 평가하던 것을 첫 화면에 필요한 만큼으로 줄인다(Expo 기본값은 꺼짐).
// 안전 조건: 등록·폴리필 같은 부수효과는 index.js 최상단 호출이나 bare import(`import './x'`)
// 로만 둔다 — 이름 import 는 쓰일 때까지 평가되지 않는다(2026-10-01 src 전수 확인: 최상단
// 부수효과 호출 0곳).
const baseGetTransformOptions = config.transformer.getTransformOptions;
config.transformer.getTransformOptions = async (...args) => {
  const options = await baseGetTransformOptions(...args);
  return {
    ...options,
    transform: {...options.transform, inlineRequires: true},
  };
};

module.exports = withNativeWind(config, {
  input: './global.css',
  configPath: path.join(__dirname, 'tailwind.config.js'),
  // ★1rem = 16px (web 과 같게). NativeWind 기본값은 14 라 text-sm·text-base·px-5 같은
  // rem 클래스가 전부 web 의 87.5% 로 나왔다(text-sm 12.25px, px-5 17.5px) —
  // 같은 화면에서 text-[16px]·StyleSheet 숫자만 web 크기라 크기가 섞였다.
  inlineRem: 16,
});
