import { cardLabel } from '@jirum/design-system/recipes';

import { cn } from '@/shared/lib/cn';
import { formatDateToMMD } from '@/shared/lib/utils/date';
import HotdealBadge from '@/shared/ui/HotdealBadge';

import type { ProductCardType } from '@/entities/product-list/model/types';

import type { ReactNode } from 'react';

/** 사진 왼쪽 아래 모서리 라벨(판매종료·베스트판매자). light = 흰 면, dark = 사진 위 어두운 면. */
export const CardCornerLabel = ({
  tone,
  children,
}: {
  tone: keyof typeof cardLabel.tone;
  children: ReactNode;
}) => (
  <div
    className={cn(
      'absolute bottom-0 left-0 z-10 flex items-center',
      cardLabel.corner.box,
      cardLabel.tone[tone].box,
      cardLabel.corner.text,
      cardLabel.tone[tone].text,
    )}
  >
    {children}
  </div>
);

/**
 * 상품 카드 사진 위 상태 — 판매종료 / 핫딜 배지 / 유통기한 띠. 카드 4종(그리드·2단·리스트·캐러셀)이 같이 쓴다.
 * ★같은 상품을 홈·검색·상세를 오가며 다시 보므로 카드마다 다르게 그리면 버그로 읽힌다 — 여기서만 그린다.
 * 유통기한 띠가 있으면 핫딜 배지는 숨긴다(같은 자리라 배지가 띠를 덮었다 — 앱 ProductCardStatus 와 같은 규칙).
 */
export const ProductCardStatus = ({
  product,
  showHotdealBadge = true,
}: {
  product: Pick<ProductCardType, 'isEnd' | 'hotDealType' | 'earliestExpiryDate'>;
  /** 2단·리스트 카드는 핫딜 배지를 사진 대신 글자 줄에 둔다. */
  showHotdealBadge?: boolean;
}) => {
  const { isEnd, hotDealType, earliestExpiryDate } = product;
  return (
    <>
      {isEnd ? (
        <CardCornerLabel tone="light">판매종료</CardCornerLabel>
      ) : showHotdealBadge && hotDealType && !earliestExpiryDate ? (
        <div className="absolute bottom-0 left-0 z-10">
          <HotdealBadge badgeVariant="card" hotdealType={hotDealType} />
        </div>
      ) : null}
      {earliestExpiryDate && !isEnd ? (
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 flex items-center justify-center',
            cardLabel.strip.box,
            cardLabel.strip.text,
          )}
        >
          유통기한 {formatDateToMMD(earliestExpiryDate)}
        </div>
      ) : null}
    </>
  );
};
