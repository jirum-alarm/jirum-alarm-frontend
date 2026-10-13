/**
 * 지름알림 뷰티의 고정값. 카테고리 UI 가 없다 — 모든 목록이 화장품(categoryId 3) 하나로 고정이다.
 * (apps/web shared/config/categories 의 '화장품', 랭킹 탭 ?tab=3 과 같은 카테고리)
 */
export const BEAUTY_CATEGORY_ID = 3;

export const SERVICE_NAME = '지름알림 뷰티';

/** basePath(next.config.ts) — next/link 는 알아서 붙이고, 절대 URL(canonical·JSON-LD)을 만들 때만 쓴다. */
export const BASE_PATH = '/beauty';

/** 이 앱 안 경로(next/link 용 — basePath 를 빼고 적는다). */
export const BEAUTY_ROUTE = {
  HOME: '/',
  RANKING: '/ranking',
} as const;

/**
 * 본 서비스(apps/web) 경로. basePath 밖이라 next/link 로 걸면 /beauty 가 붙는다 → 일반 <a> 로 건다(ServiceLink).
 * 로그인·마이페이지·알림은 이번엔 뷰티 전용 화면 없이 본 서비스 것을 쓴다.
 */
export const SERVICE_ROUTE = {
  HOME: '/',
  SEARCH: '/search',
  ALARM: '/alarm',
  MYPAGE: '/mypage',
  TERMS: '/policies/terms',
  PRIVACY: '/policies/privacy',
} as const;

export const productPath = (id: string | number) => `/products/${id}`;

/** 토스 코너에서 상세로 갈 때 붙이는 쿼리 — apps/web entities/product/lib/from-toss.ts tossDetailHref 와 같다. */
export const tossProductPath = (id: string | number) => `/products/${id}?from=toss`;

/** 노출 기록·카드 클릭 출처(recordProductImpressions.source, data-source). web 출처와 겹치지 않는 이름. */
export const CARD_SOURCE = {
  HOME: 'beauty_home',
  RANKING: 'beauty_ranking',
} as const;
export type CardSource = (typeof CARD_SOURCE)[keyof typeof CARD_SOURCE];

/** GA4/GTM 에 싣는 서비스 구분값 — 같은 컨테이너·같은 이벤트 이름을 쓰는 web 과 갈라 보기 위함. */
export const SERVICE_TAG = 'beauty';

/** 오카방 계측 placement — web okachat 의 beauty_landing 과 갈라 본다. */
export const OKACHAT_PLACEMENT = 'beauty_home';
