// TypeScript 6 은 부수효과 import(`import './global.css'`)도 모듈 해석을 요구한다(noUncheckedSideEffectImports 기본 켬).
// global.css 는 NativeWind 가 Metro 에서 처리하는 파일이라 타입이 없다 — 여기서 있다고만 알린다.
declare module '*.css';
