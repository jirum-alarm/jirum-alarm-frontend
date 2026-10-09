/**
 * 서버가 주는 영문 코드 → 화면 이름. 화면마다 따로 들고 있으면 한 곳만 영문이 새어 나간다.
 * 모르는 코드는 그대로 보여준다(새 provider 가 생겨도 화면이 깨지지 않게).
 */

// 수익·발급 출처. 색은 차트·막대·점이 화면이 달라도 같은 출처면 같은 색이게
export const SOURCES: Record<string, { name: string; color: string }> = {
  toss: { name: '토스', color: '#3182F6' },
  adpick: { name: '애드픽', color: '#10B981' },
  ali_express: { name: '알리', color: '#F97316' },
  naver: { name: '네이버', color: '#22C55E' },
  link_price: { name: '링크프라이스', color: '#8B5CF6' },
  coupang: { name: '쿠팡', color: '#EF4444' },
  adsense: { name: '애드센스', color: '#EAB308' },
  ohou: { name: '오늘의집', color: '#06B6D4' },
  kakao: { name: '카카오쇼핑', color: '#FACC15' },
};
export const sourceName = (code: string) => SOURCES[code]?.name ?? code;
export const sourceColor = (code: string) => SOURCES[code]?.color ?? '#94A3B8';

export const GENDER_LABEL: Record<string, string> = { MALE: '남성', FEMALE: '여성' };

export const labelOf = (map: Record<string, string>, code?: string | null) =>
  code == null ? '-' : (map[code] ?? code);

export const AD_SLOT_TYPE_LABEL: Record<string, string> = {
  banner: '배너',
  pinnedProduct: '상품 고정',
};

export const AD_SLOT_LOCATION_LABEL: Record<string, string> = {
  home_carousel_banner: '홈 캐러셀 배너',
  home_main_banner: '홈 메인 배너',
  home_ranking_product: '홈 상품형 배너',
  product_main_banner: '프로덕트 메인 배너',
};

export const PRICE_TARGET_LABEL: Record<string, string> = {
  DANAWA: '다나와',
  MALL: '쇼핑몰',
  JIRUM_ALARM: '지름알림',
};

export const CURRENCY_LABEL: Record<string, string> = { WON: '원', DOLLOR: '달러' };
