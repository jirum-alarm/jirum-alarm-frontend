/**
 * 컴포넌트 모양의 원본 — web(DOM)·앱(RN) 컴포넌트가 **같은 클래스 문자열**을 쓴다.
 * 예전엔 같은 배지를 web·앱이 따로 적어 굵기(400↔600)·색(secondary-500↔600)·글자 크기(16↔14)가 갈렸다.
 *
 * box = 겉(배경·테두리·여백·모서리), text = 글자(크기·굵기·색). RN 은 겉=View·글자=Text 라 둘을 나눠 두고,
 * web 은 둘을 한 요소에 같이 건다. 배치(inline-flex·정렬·줄바꿈 금지·위치)는 플랫폼마다 달라 각 컴포넌트가 붙인다.
 * 여기 쓰는 클래스는 web(Tailwind v4)·앱(NativeWind = Tailwind v3) 둘 다에 있는 것만.
 *
 *   web  apps/web/src/shared/ui/common/{Badge,Chip} · entities/product-list/ui/ProductCardStatus
 *   앱   apps/mobile/src/shared/components/ui/{Badge,Chip} · shared/components/product/ProductCardStatus
 */

/** 작은 라벨(상태·판정·정보). 누를 수 없다 — 누르는 건 Chip. */
const badge = {
  size: {
    // 정보 태그(4px 모서리) — 작을수록 굵게 해야 읽힌다.
    xs: {box: 'rounded px-1.5 py-0.5', text: 'text-10 font-semibold'},
    sm: {box: 'rounded px-1.5 py-0.5', text: 'text-11 font-semibold'},
    md: {box: 'rounded px-1.5 py-0.5', text: 'text-xs font-semibold'},
    // 상태 태그(판매종료·핫딜) — 높이 고정·보통 굵기. 22px 안 12px 글자를 600 으로 하면 뭉개져 보인다.
    tag: {box: 'h-[22px] rounded-lg px-2', text: 'text-xs'},
  },
  // 판정 배지(역대 최저·평소보다 비싸요)는 알약 — 정보 태그와 모양으로 구분한다.
  pill: {box: 'rounded-full px-2'},
  variant: {
    soft: {
      gray: {box: 'bg-gray-100', text: 'text-gray-600'},
      secondary: {box: 'bg-secondary-50', text: 'text-secondary-700'},
      success: {box: 'bg-success-50', text: 'text-success-700'},
      warning: {box: 'bg-warning-50', text: 'text-warning-700'},
      error: {box: 'bg-error-50', text: 'text-error-600'},
    },
    solid: {
      // 사진 위(이미지 수·베스트판매자) — 테마 무관 어두운 면.
      gray: {box: 'bg-fixed-900/80', text: 'text-fixed-white'},
      // white 가 다크에서 어두워지므로 600(다크에선 밝은 파랑)과 짝이 맞는다 — 두 테마 모두 AA.
      secondary: {box: 'bg-secondary-600', text: 'text-white'},
      error: {box: 'bg-error-500', text: 'text-fixed-white'},
    },
    outline: {
      gray: {box: 'border border-gray-400 bg-white', text: 'text-gray-700'},
    },
  },
};

/** 고르는 칩(필터·탭). 고르면 굵어지지만 너비는 그대로여야 한다 — 각 컴포넌트가 굵은 글자 너비를 미리 잡는다. */
const chip = {
  size: {
    md: {box: 'rounded-full border px-4 py-1.5', text: 'text-sm'},
    sm: {box: 'rounded-full border px-3 py-1.5', text: 'text-sm'},
    xs: {box: 'rounded-full border px-3 py-1', text: 'text-xs'},
  },
  selected: {box: 'border-secondary-500 bg-secondary-50', text: 'text-secondary-800 font-semibold'},
  idle: {box: 'border-gray-300 bg-white', text: 'text-gray-700'},
};

/** 상품 카드 사진 위 라벨 — 왼쪽 아래 모서리(판매종료·베스트판매자)와 아래 띠(유통기한). */
const cardLabel = {
  corner: {box: 'h-[22px] rounded-tr-lg rounded-bl-lg px-2', text: 'text-xs'},
  tone: {
    light: {box: 'bg-white', text: 'text-gray-700'},
    dark: {box: 'bg-fixed-900/80', text: 'text-fixed-white font-medium'},
  },
  strip: {box: 'h-[22px] rounded-b-lg bg-fixed-700/80 px-2', text: 'text-xs text-fixed-white'},
};

module.exports = {badge, chip, cardLabel};
