// TS 6 은 noUncheckedSideEffectImports 가 기본 true 라 side-effect import 도 선언을 찾는다.
// next/types 의 `*.css` 선언은 확장자가 없는 패키지 exports 경로(swiper/css)를 덮지 못한다.
declare module 'swiper/css';
