import {
  formatFreeShipping,
  type OhouProductData,
  type TossProductData,
} from '@/entities/product/model/toss-data';

/** 상세 정보 표 「배송비」 값. 토스는 배송비·무료배송 기준, 오늘의집은 받은 문구 그대로. 없으면 null(줄을 안 그린다). */
export function formatDeliveryText(
  toss?: TossProductData | null,
  ohou?: OhouProductData | null,
): string | null {
  if (toss) {
    if (!toss.deliveryFee) return '무료배송';
    const threshold = toss.freeShippingThreshold
      ? ` (${formatFreeShipping(toss.freeShippingThreshold)})`
      : '';
    return `${toss.deliveryFee.toLocaleString()}원${threshold}`;
  }
  return ohou?.delivery || null;
}
