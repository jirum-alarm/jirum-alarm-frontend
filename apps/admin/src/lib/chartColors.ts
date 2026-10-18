/**
 * 차트·막대 색. TailAdmin 테마(src/css/style.css @theme)와 같은 값 — ApexCharts·SVG 는 className 이 안 닿아 hex 로 넘긴다.
 * 화면마다 hex 를 따로 적으면 같은 뜻(성공·실패)이 화면마다 다른 색이 된다.
 */
export const CHART_COLOR = {
  primary: '#3C50E0',
  primarySoft: '#C7CEF7', // 덜 찬(집계 중) 막대
  sky: '#80CAEE',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#FB5454',
  muted: '#94A3B8',
} as const;
