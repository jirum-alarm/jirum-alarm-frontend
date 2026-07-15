// product.data — 소스별 확장 정보 컨테이너(범용 JSON). 소스가 늘어도 product 스키마는 안 늘린다.
// 사용: product.data?.toss?.images
export interface ProductData {
  toss?: TossProductData;
  // 나중에: ohou?, ...
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
}
