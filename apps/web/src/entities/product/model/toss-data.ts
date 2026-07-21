// product.data — 소스별 확장 정보 컨테이너(범용 JSON). 소스가 늘어도 product 스키마는 안 늘린다.
// 사용: product.data?.toss?.images
export interface ProductData {
  toss?: TossProductData;
  naverbc?: NaverbcProductData;
  // 나중에: ohou?, ...
}

// 네이버 브랜드커넥트 소싱 상품의 추가 정보. crawler naverbc 드라이버가 채움.
// ⚠️ affiliateProductId(발급 키)·수수료는 내부 정보 — 유저 화면에 쓰지 말 것.
export interface NaverbcProductData {
  storeName?: string; // 켄뷰 공식몰
  categoryName?: string; // 생활/건강
  salePrice?: number; // 판매가
  originalPrice?: number; // 정가
  discountRate?: number; // 45
  rating?: number;
  reviewCount?: number;
  promotionBadge?: string; // 슈퍼적립 추천 등
}

// 토스 딜에서 온 상품의 추가 정보. 일반 크롤링/유저 상품엔 없음(옵셔널).
// ⚠️ commissionRate(수수료)는 내부 마진 정보 — 절대 유저 화면에 넣지 말 것.
export interface TossProductData {
  sellerName?: string; // 주식회사 메종
  salePrice?: number; // 14900 (실제 판매가)
  originalPrice?: number; // 40000 (할인 전)
  discountRate?: number; // 62
  deliveryFee?: number; // 3000 (0 이면 무료)
  freeShippingThreshold?: number; // 20000 (이상 무료배송)
  images?: string[]; // 상세 상품 이미지 URL (썸네일과 별개, 원본 URL 참조)
  rating?: number; // 4.8 (별점)
  reviewCount?: number; // 3185
  unitPrice?: string; // "100g당 2,092원"
  delivery?: string; // "무료배송 · 오늘출발"
  lowestIn30Days?: boolean; // 30일 최저가
  bestSeller?: boolean; // 베스트판매자
  arrivalGuaranteed?: boolean; // 도착보장
  lowestPriceCompensation?: boolean; // 최저가 보상
  specialProduct?: boolean; // 토스 특가
  couponDiscount?: number; // 표시가 외 추가 쿠폰 할인액
}
