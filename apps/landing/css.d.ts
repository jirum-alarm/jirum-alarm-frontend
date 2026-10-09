// TS 6 은 noUncheckedSideEffectImports 가 기본 true 라 `import './x.css'` 도 선언을 찾는다.
// Next 15 의 next/types 는 *.module.css 만 선언한다(16 부터 *.css 도 선언) — Next 16 으로 올리면 이 파일은 지워도 된다.
declare module '*.css';
