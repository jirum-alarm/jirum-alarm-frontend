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

// 간격·크기 유틸리티(max-w 는 v3·v4 눈금이 달라 뺀다).
const SPACE_UTIL = '(?:p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|ms|me|gap|gap-x|gap-y|space-x|space-y)';
const SIZE_UTIL = '(?:w|h|size|min-w|min-h|max-h|top|left|right|bottom|inset|inset-x|inset-y|translate-x|translate-y|basis)';
// 두 플랫폼(web Tailwind v4·앱 NativeWind = v3) 모두 같은 이름이 있는 값 — Tailwind v3 기본 spacing 눈금 그대로.
const SCALE_PX = '(?:2|4|6|8|10|12|14|16|20|24|28|32|36|40|44|48|56|64|80|96|112|128|144|160|176|192|208|224|240|256|288|320|384)px';
const SCALE_REM =
  '(?:0\\.125|0\\.25|0\\.375|0\\.5|0\\.625|0\\.75|0\\.875|1|1\\.25|1\\.5|1\\.75|2|2\\.25|2\\.5|2\\.75|3|3\\.5|4|5|6|7|8|9|10|11|12|13|14|15|16|18|20|24)rem';
const START = '(?:^|[\\s:\'"`])-?';

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
    // 앞 경계 — drop-shadow-[…]·text-shadow-[…] 는 다른 유틸리티라 잡지 않는다.
    pattern: '(?:^|[\\s:\'"`!])shadow-\\[',
    message: '임의 그림자 대신 토큰 — 카드 경계는 shadow-card, 형광펜 밑줄은 shadow-highlight, 그 밖엔 shadow-sm·shadow-md·shadow-lg.',
  },
  // ↓ 조립 규칙(layout.js)의 눈금. 이름이 있는 값을 숫자로 적으면 같은 값이 화면마다 다른 글자로 흩어진다.
  {
    pattern: `${START}(?:${SPACE_UTIL}|${SIZE_UTIL})-\\[-?(?:${SCALE_PX}|${SCALE_REM})\\]`,
    message:
      '눈금에 있는 값은 이름으로 — 4px→1, 8px→2, 12px→3, 16px→4, 20px→5, 24px→6, 32px→8, 40px→10, 48px→12 (예: w-[48px]→w-12, gap-[8px]→gap-2). 조립 규칙: @jirum/design-system/layout',
  },
  {
    // 여백·간격은 2px 격자 안에서만. 레이아웃 고유 치수(w·h·max-w 의 120px·81px 등)는 막지 않는다.
    pattern: `${START}${SPACE_UTIL}-\\[[0-9]*[13579]px\\]`,
    message: '여백·간격은 4px 격자(최소 2px 단위) — 7px→px-2(8), 3px→py-1(4), 25px→gap-6(24). 조립 규칙: @jirum/design-system/layout',
  },
  // ↓ 겹침 층(layout.js layer). 9999·999·100 이 섞여 토스트가 시트 아래에 깔렸다(2026-10-16).
  {
    pattern: '(?:^|[\\s:\'"`!])-?z-(?:\\[|[1-9][0-9]{2,}(?![\\w-]))',
    message:
      '겹침은 층 이름으로 — sticky z-40·header z-50·nav z-60·dropdown z-70·overlay(시트·대화창) z-80·toast z-90. 콘텐츠 안 작은 겹침은 z-10~30. 조립 규칙: @jirum/design-system/layout',
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
  // ↓ 다크에서 안 뒤집히는 글자색 — black 은 토큰이 아니라 #000 그대로다(white=바탕과 달리). 10/10 /deals 제목 실측.
  {
    pattern: '(?:^|[\\s:\'"`])text-black(?![\\w-])',
    message: 'text-black 은 다크에서 안 뒤집혀 검은 바탕에 검은 글자가 된다 — 바탕 위 글자는 text-gray-900, 색 판(라임 버튼 등) 위는 text-fixed-900.',
  },
  {
    pattern: '(?:bg|text|border|divide|ring|placeholder)-opacity-[0-9]',
    message: 'bg-opacity-* 는 Tailwind v4 에 없다(효과 없음) — bg-black/50 처럼 색 뒤에 /투명도.',
  },
  // ↓ 읽히지 않는 회색 글자 — gray-400 은 흰 바탕 2.58:1, gray-300 은 1.47:1(AA 4.5 미달). 2026-10-16 리뷰에 web 글자 68곳.
  // gray-300·400 은 아이콘·구분선·비활성 표시엔 정당하므로, 글자 크기 클래스와 **같은 문자열**에 있을 때만 막는다
  // (크기를 부모에서 물려받는 글자는 못 잡는다 — 리뷰에서 본다). disabled: 상태는 WCAG 예외라 막지 않는다.
  {
    pattern:
      '^(?=[\\s\\S]*(?:^|[\\s\'"`:])text-(?:10|11|xs|13|sm|15|base|lg|xl|22|2xl|28)(?![\\w-]))[\\s\\S]*(?:^|[\\s\'"`])(?!disabled:)(?:[a-z0-9-]+:)*text-gray-[34]00(?![\\w-])',
    message:
      '글자에 text-gray-300·400 금지(흰 바탕 1.5·2.6:1, AA 미달) — 보조 글자는 text-gray-500 부터. 아이콘·구분점이면 크기 클래스를 떼거나 이유를 적고 끈다.',
  },
  {
    pattern: '(?:^|[\\s\'"`:])placeholder(?:-|:text-)gray-[34]00(?![\\w-])',
    message: 'placeholder 글자도 text-gray-500 부터(gray-300·400 은 AA 미달) — placeholder-gray-500 / placeholder:text-gray-500.',
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
