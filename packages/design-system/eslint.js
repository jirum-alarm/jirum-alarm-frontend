/**
 * 토큰을 우회하는 className 을 막는다 — 새 화면이 다시 hex·기본 팔레트·임의 크기로 흩어지지 않게.
 *
 * ESLint 기본 규칙(no-restricted-syntax)만 쓴다 → 플러그인 없이 ESLint 8(앱)·10(web·ai·landing) 둘 다 된다.
 * 문자열 리터럴(className="…", cn('…'), cva 설정)과 템플릿 문자열을 본다. 주석·JSX 텍스트는 안 본다.
 *
 *   web/ai/landing (flat):  { files: ['src/**\/*.{ts,tsx}'], rules: require('@jirum/design-system/eslint').rules }
 *   mobile (eslintrc):      overrides: [{ files: ['src/**\/*.{ts,tsx}'], rules: require('@jirum/design-system/eslint').rules }]
 *
 * ⚠️ no-restricted-syntax 는 설정끼리 합쳐지지 않고 마지막 것이 이긴다. 다른 금지 문법을 더하려면 이 배열에 붙일 것.
 *
 * 정말 예외인 자리(캠페인 페이지·광고 소재·외부 브랜드 그림)는 이유를 남기고 끈다:
 *   // eslint-disable-next-line no-restricted-syntax -- 캠페인 전용 색
 *   파일 전체면 맨 위에 eslint-disable no-restricted-syntax 블록 주석(이유 포함).
 */

// 색을 받는 유틸리티. border-x·border-t 같은 방향형도 포함.
const COLOR_UTIL = '(?:bg|text|border(?:-[xytrblse])?|from|via|to|fill|stroke|ring|outline|decoration|divide|placeholder|caret|accent|shadow)';
// Tailwind 기본 팔레트 중 토큰과 이름이 겹치지 않는 것(gray 는 토큰이 덮어쓴다).
const DEFAULT_PALETTE =
  'slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';

const GUIDE = ' (규칙·예외: packages/design-system/README.md)';

const banned = [
  {
    pattern: `${COLOR_UTIL}-\\[#[0-9a-fA-F]{3,8}`,
    message:
      '임의 hex 색 대신 토큰 — gray·primary·secondary·error·success·warning·fixed·kakao·naver. hex 는 다크모드에서 안 뒤집힌다.',
  },
  {
    pattern: `${COLOR_UTIL}-(?:${DEFAULT_PALETTE})-\\d`,
    message:
      'Tailwind 기본 팔레트 대신 토큰 — red·rose→error, green·emerald→success, amber·yellow·orange→warning, blue·sky·indigo→secondary, slate·zinc·neutral→gray.',
  },
  {
    // 30px 미만만 — 30px 이상(히어로·캠페인 제목)은 화면마다 달라 토큰으로 묶지 않는다.
    pattern: 'text-\\[(?:[0-9]|[12][0-9])(?:\\.[0-9]+)?px\\]',
    message:
      '임의 글자 크기 대신 토큰 — 10→text-10, 11→text-11, 12→text-xs, 13→text-13, 14→text-sm, 15→text-15, 16→text-base, 18→text-lg, 20→text-xl, 22→text-22, 24→text-2xl, 28→text-28.',
  },
  {
    pattern: 'rounded(?:-[a-z]{1,2})?-\\[',
    message:
      '임의 모서리 대신 토큰 — 2→rounded-xs, 4→rounded-sm, 6→rounded-md, 8→rounded-lg, 12→rounded-xl, 16→rounded-2xl, 20→rounded-sheet, 24→rounded-3xl, 원·알약→rounded-full.',
  },
  {
    pattern: 'shadow-\\[',
    message: '임의 그림자 대신 토큰 — 카드 경계는 shadow-card, 형광펜 밑줄은 shadow-highlight, 그 밖엔 shadow-sm·shadow-md·shadow-lg.',
  },
  // ↓ Tailwind 에 없는 클래스 — 아무 효과가 없어 "적용됐다"고 착각하게 만든다(실제로 web 에 12곳·7곳 있었다).
  {
    pattern: '(?:^|[\\s:\'"`])text-(?:thin|extralight|light|medium|semibold|bold|extrabold)(?![\\w-])',
    message: 'text-semibold 같은 클래스는 없다(효과 없음) — 굵기는 font-medium·font-semibold·font-bold.',
  },
  {
    pattern: 'rounded(?:-[a-z]{1,2})?-[0-9]+(?![\\w.])',
    message: 'rounded-5 같은 숫자 모서리는 없다(효과 없음) — rounded-lg·rounded-xl·rounded-sheet 같은 이름을 쓴다.',
  },
  {
    pattern: '(?:bg|text|border|divide|ring|placeholder)-opacity-[0-9]',
    message: 'bg-opacity-* 는 Tailwind v4 에 없다(효과 없음) — bg-black/50 처럼 색 뒤에 /투명도.',
  },
];

module.exports = {
  // 테스트용(정규식이 잡을 것만 잡는지) — 설정에선 rules 만 펼친다.
  patterns: banned.map(({pattern}) => pattern),
  rules: {
    'no-restricted-syntax': [
      'error',
      ...banned.flatMap(({pattern, message}) => [
        {selector: `Literal[value=/${pattern}/]`, message: message + GUIDE},
        {selector: `TemplateElement[value.raw=/${pattern}/]`, message: message + GUIDE},
      ]),
    ],
  },
};
