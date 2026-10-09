/**
 * 컴포넌트 모양의 원본 — web(DOM)·앱(RN) 컴포넌트가 **같은 클래스 문자열**을 쓴다.
 * 예전엔 같은 배지를 web·앱이 따로 적어 굵기(400↔600)·색(secondary-500↔600)·글자 크기(16↔14)가 갈렸다.
 *
 * box = 겉(배경·테두리·여백·모서리), text = 글자(크기·굵기·색). RN 은 겉=View·글자=Text 라 둘을 나눠 두고,
 * web 은 둘을 한 요소에 같이 건다. 배치(inline-flex·정렬·줄바꿈 금지·위치)는 플랫폼마다 달라 각 컴포넌트가 붙인다.
 * 여기 쓰는 클래스는 web(Tailwind v4)·앱(NativeWind = Tailwind v3) 둘 다에 있는 것만.
 *
 *   web  apps/web/src/shared/ui/common/{Badge,Chip,Switch,BottomSheet,Skeleton} · shared/ui/{SectionHeader,DetailSectionHeader} ·
 *        entities/product-list/ui/ProductCardStatus
 *   앱   apps/mobile/src/shared/components/ui/{Badge,Chip,Switch,SectionHeader} · shared/components/product/ProductCardStatus ·
 *        shared/components/{BottomSheet,Skeletons}
 * 탭(tab)·사진 틀(cardThumb)은 컴포넌트 없이 각 자리가 직접 읽는다 — 자리마다 스크롤·측정 코드가 달라 껍데기를 못 나눈다.
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

/**
 * 버튼. lg = 화면 아래 주 버튼(48px·가득), md·sm = 작은 버튼(주 버튼이면 짙은 판 + 라임 글자).
 * 누르면 면이 한 단계 진해진다(글자색만 바뀌면 잘 안 보였다 — 앱 실측). web 은 여기에 살짝 줄어드는 움직임을 더한다.
 * 비활성은 disabledBox·disabledText 를 더한다 — 앱은 글자가 자식 Text 라 부모의 disabled: 를 못 받아서
 * 두 플랫폼 모두 컴포넌트가 disabled 일 때 직접 붙인다.
 */
const button = {
  size: {
    lg: {box: 'h-12 w-full rounded-lg px-3', text: 'text-base'},
    md: {box: 'rounded-lg px-5 py-1.5', text: 'text-base'},
    sm: {box: 'rounded-lg px-3 py-1', text: 'text-base'},
  },
  tone: {
    primary: {
      box: 'bg-primary-500 active:bg-primary-300',
      text: 'font-semibold text-fixed-900',
      disabledBox: 'bg-gray-300',
      disabledText: 'text-fixed-white',
    },
    dark: {
      box: 'bg-fixed-800 active:bg-fixed-700',
      text: 'font-semibold text-primary-500',
      disabledBox: 'bg-gray-300',
      disabledText: 'text-fixed-white',
    },
    secondary: {box: 'bg-gray-100 active:bg-gray-200', text: 'font-semibold text-gray-700'},
    error: {box: 'bg-error-50 active:bg-error-100', text: 'font-semibold text-error-600'},
    outline: {
      box: 'border border-primary-500 bg-transparent',
      text: 'text-gray-900',
      disabledBox: 'border-transparent bg-gray-50',
      disabledText: 'text-gray-600',
    },
  },
};

/**
 * web·앱 Button 의 (variant, color, size) → button.tone 의 키. 두 컴포넌트가 이 함수 하나로 고른다.
 * @param {'filled' | 'outlined'} [variant]
 * @param {'primary' | 'secondary' | 'error'} [color]
 * @param {'lg' | 'md' | 'sm'} [size]
 * @returns {'primary' | 'dark' | 'secondary' | 'error' | 'outline'}
 */
const buttonTone = (variant = 'filled', color = 'primary', size = 'lg') => {
  if (variant === 'outlined') return 'outline';
  if (color !== 'primary') return color;
  return size === 'lg' ? 'primary' : 'dark';
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

/**
 * 면을 채우는 탭(목록 전환) — 테두리만 있는 Chip(필터·섹션 탭)과 모양으로 구분한다.
 *   neutral  커뮤니티 전체·인기·공지, 토스 하위 카테고리, 큐레이션 탭
 *   brand    랭킹·핫딜 모음 카테고리(라임)
 *   segment  기간 고르기(가격 추이) — 네모 + 테두리
 * 높이는 size(sm 32·md 36)로 고르고, 앱 기간 버튼처럼 손가락 크기가 필요한 자리는 그 자리에서 키운다.
 */
const tab = {
  size: {sm: 'h-8', md: 'h-9'},
  neutral: {
    selected: {box: 'rounded-full px-3 bg-gray-900', text: 'text-sm font-medium text-white'},
    idle: {box: 'rounded-full px-3 bg-gray-100 hover:bg-gray-200', text: 'text-sm font-medium text-gray-600'},
  },
  brand: {
    // 다크에선 fixed-800 이 비활성 gray-100 과 거의 같은 색이라 neutral 처럼 밝은 면으로 뒤집는다.
    selected: {
      box: 'rounded-full px-3 bg-fixed-800 dark:bg-gray-900',
      text: 'text-sm font-bold text-primary-500 dark:text-white',
    },
    idle: {box: 'rounded-full px-3 bg-gray-100 hover:bg-gray-200', text: 'text-sm font-medium text-gray-600'},
  },
  segment: {
    selected: {box: 'rounded-lg border px-3 border-gray-900 bg-gray-900', text: 'text-sm font-semibold text-white'},
    idle: {
      box: 'rounded-lg border px-3 border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
      text: 'text-sm text-gray-600',
    },
  },
};

/**
 * 켜고 끄는 스위치(알림 설정). web·앱 같은 44x24 — 20px 노브가 켜지면 20px(translate-x-5) 오른쪽으로.
 * 노브는 테마 무관 흰색: white 는 다크에서 어두워져 꺼진 트랙에 묻힌다.
 */
const toggle = {
  track: 'h-6 w-11 rounded-full',
  on: 'bg-primary-500',
  off: 'bg-gray-300',
  knob: 'h-5 w-5 rounded-full bg-fixed-white',
};

/** 섹션 제목 — page = 홈·목록 섹션(SectionHeader), detail = 상세 안 섹션(DetailSectionHeader, 한 단계 덜 굵게). */
const sectionTitle = {
  page: 'text-lg font-bold text-gray-900',
  detail: 'text-lg font-semibold text-gray-900',
  subtitle: 'text-sm text-gray-500',
};

/** 상품 카드 사진 틀 — 사진이 늦거나 투명 PNG 여도 카드 자리가 보이게 옅은 면 + 테두리. */
const cardThumb = 'overflow-hidden rounded-lg border border-gray-200 bg-gray-50';

/**
 * 다른 페이지로 가는 칩 모양 링크(키워드 허브·관련 모델). 고르는 칩(chip)보다 옅은 테두리, hover 에 옅은 면.
 * 배치(inline-block 등)는 자리마다. web 만(앱엔 이 화면들이 없다).
 */
const linkChip = 'rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50';

/**
 * 최근 검색어 칩 — 눌러서 다시 검색, 옆 ✕ 로 지운다. web 40px·text-base 와 앱 36px·text-sm 이 갈려 있었다 → 앱 값.
 * 배치(가로 정렬·간격)와 ✕ 아이콘은 자리마다.
 */
const keywordChip = {box: 'h-9 rounded-full border border-gray-200 px-3', text: 'text-sm text-gray-900'};

/** 눌러서 키워드 알림을 바로 등록하는 칩(내 키워드의 「요즘 많이 받는 키워드」) — 글자 뒤에 옅은 +. */
const addChip = {
  box: 'rounded-full border border-gray-200 bg-white px-4 py-2',
  text: 'text-sm font-medium text-gray-900',
  plus: 'text-sm text-gray-500',
};

/**
 * 누를 수 없는 단어 나열(관심사의 키워드·제외어)과 그 끝의 「+N개 더 보기」. 고르는 칩·배지와 다른 물건.
 * web 은 알약(rounded-full)·키워드 gray-100, 앱은 6px 사각(rounded-md)·gray-50 으로 갈려 있었다 → 알약·gray-100.
 */
const wordTag = {
  box: 'rounded-full px-2.5 py-1',
  text: 'text-xs',
  tone: {
    fill: {box: 'bg-gray-100', text: 'text-gray-700'},
    more: {box: 'border border-gray-200', text: 'font-medium text-gray-700'},
    struck: {box: 'border border-gray-200', text: 'text-gray-500 line-through'},
  },
};

/** 딜 목록 한 줄(사진·제목·가격) — 옅은 테두리, 누르는 줄이라 hover 에 옅은 면. web /deals 상세·같은 상품 다른 가격. */
const dealRow = 'rounded-lg border border-gray-100 p-3 hover:bg-gray-50';

/** 본문 안 정보 상자(가격 판정 요약·공유 미리보기 등) — 옅은 면 + 테두리. 여백은 내용마다 다르다. */
const infoBox = 'rounded-xl border border-gray-200 bg-gray-50';

/**
 * 아래에서 올라오는 시트의 겉 — 가림막·판(위 모서리 rounded-t-sheet 20px)·손잡이(40x4).
 * 안쪽 여백·높이는 내용마다 달라 각 자리가 붙인다. 앱 BottomSheet 도 같은 값(가림막 40% 검정).
 */
const sheet = {
  overlay: 'bg-black/40',
  // 다크에선 판(white=바탕색)과 가림막 뒤 화면의 대비가 1.06:1 이라 판 경계가 안 보인다 → 위 테두리 한 줄.
  // 판을 gray-50 으로 띄우면 시트 안의 gray-50 면(공유 미리보기·태그 상자·입력창)이 묻혀서 테두리로 간다.
  panel: 'rounded-t-sheet bg-white dark:border-t dark:border-gray-100',
  handle: 'mx-auto h-1 w-10 rounded-full bg-gray-300',
};

/**
 * 로딩 자리표시 판. gray-100 에 깜빡임(투명도 0.5)까지 겹치면 흰 바탕과 거의 구분이 안 됐다
 * (앱 상세 "스켈레톤이 잘 안 보인다" 지적) — 그래서 gray-200. 앱 SkeletonBox 와 같은 색.
 */
const skeleton = 'bg-gray-200';

/**
 * 잠깐 떴다 사라지는 알림(토스트) — 짙은 판(테마 무관)에 왼쪽 정렬 글자, 오른쪽에 라임 동작 버튼.
 * 앱 AppToast 의 모양이 기준. web 은 가운데 정렬 gray-600 상자(280px)라 같은 알림이 두 모양이었다.
 */
const toast = {
  box: 'rounded-xl bg-fixed-800 px-4 py-[13px]',
  text: 'text-sm text-fixed-white',
  action: 'text-sm font-semibold text-primary-500',
};

/**
 * 목록이 비었을 때 한 줄 안내. 정렬·여백은 자리마다(가운데 정렬 빈 목록·카드 안 왼쪽 정렬).
 * web 은 gray-400(AA 미달)·text-base 가 섞여 있었다 — 앱과 같은 text-sm gray-500.
 * 그림·큰 제목이 있는 빈 화면(검색 결과 없음·알림 없음)은 화면별이다.
 */
const emptyText = 'text-sm text-gray-500';

/** 상품 카드 사진 위 라벨 — 왼쪽 아래 모서리(판매종료·베스트판매자)와 아래 띠(유통기한). */
const cardLabel = {
  corner: {box: 'h-[22px] rounded-tr-lg rounded-bl-lg px-2', text: 'text-xs'},
  tone: {
    light: {box: 'bg-white', text: 'text-gray-700'},
    dark: {box: 'bg-fixed-900/80', text: 'text-fixed-white font-medium'},
  },
  strip: {box: 'h-[22px] rounded-b-lg bg-fixed-700/80 px-2', text: 'text-xs text-fixed-white'},
};

module.exports = {addChip, badge, button, buttonTone, chip, tab, toggle, sectionTitle, cardThumb, dealRow, infoBox, keywordChip, linkChip, wordTag, sheet, skeleton, toast, emptyText, cardLabel};
