import React from 'react';
import {View} from 'react-native';
import {cardThumb} from '@jirum/design-system/recipes';
import {
  formatCountdown,
  getTimeDealOpening,
  getTossTimeDeal,
} from '@jirum/domain/toss-time-deal';
import {Text} from '@/shared/components/ui/Text/AppText';

import Thumbnail from '@/shared/components/product/Thumbnail';
import {useNow} from '@/shared/hooks/useNow';
import {parsePrice} from '@/shared/lib/format/price';
import {cn} from '@/shared/lib/styling';

import type {ProductCardType} from '../../model/types';
import ProductCardStatus from '@/shared/components/product/ProductCardStatus';

/**
 * 홈 카드 4종이 공유하는 조각들.
 * web: apps/web/src/entities/product-list/ui/card/*
 *
 * ⚠️ 홈이 네이티브가 돼도 발견·커뮤니티 탭은 웹뷰라 **같은 상품 카드가 두 벌**이 된다.
 * 표기가 갈리면 유저는 버그로 읽는다(partial-ui-rollout-reads-as-bug).
 * 여백·글자 크기까지 web 과 대조해서 맞췄다 — 임의로 바꾸지 말 것.
 */

// MM.DD 표기는 shared/lib/format/date 로 옮겼다(카드 상태 오버레이와 같이 쓴다).
export {formatMMD} from '@/shared/lib/format/date';

/**
 * 썸네일 + 좌하단 뱃지들.
 * 판매종료 / 핫딜 뱃지는 상호배타, 유통기한은 그 위에 덮인다(web 과 동일 순서).
 */
export function CardThumbnail({
  product,
  style,
  thumbnailType = 'product',
  showHotdealBadge = true,
}: {
  product: ProductCardType;
  style: {width: number | `${number}%`; height?: number; aspectRatio?: number};
  thumbnailType?: 'product' | 'hotDeal';
  /**
   * 썸네일 좌하단 핫딜 뱃지. **목록형 카드는 끈다** — 거기선 가격 옆에
   * `badgeVariant="page"` 뱃지가 이미 붙어 한 행에 같은 뱃지가 두 번 나온다
   * (web `ListProductCard` 는 썸네일에 핫딜 뱃지를 안 그린다).
   */
  showHotdealBadge?: boolean;
}) {
  return (
    <View className={cardThumb} style={style}>
      <Thumbnail
        uri={product.thumbnail}
        categoryId={product.categoryId}
        type={thumbnailType}
      />

      {/* 판매종료·핫딜 배지·유통기한 띠 — 카드 종류와 무관하게 한 곳에서(굵기 400, recipes cardLabel). */}
      <ProductCardStatus
        product={product}
        showHotdealBadge={showHotdealBadge}
      />
    </View>
  );
}

/**
 * 목록용 가격. web DisplayListPrice — 기본 text-lg(18), grid 만 text-base(16) 로 덮는다.
 * 상세의 DisplayPrice(24px + 원 18px)와는 다른 물건이다.
 */
export function DisplayListPrice({
  price,
  className,
}: {
  price?: string | null;
  className?: string;
}) {
  const {hasWon, priceWithoutWon} = parsePrice(price);
  const text = hasWon ? `${priceWithoutWon}원` : priceWithoutWon;

  return (
    <Text
      className={cn('text-lg font-semibold text-gray-900', className)}
      numberOfLines={1}>
      {text}
    </Text>
  );
}

/**
 * 제목 2줄 고정.
 * ★ web 은 `line-clamp-2 h-12` = **48px**. 40px 로 잡으면 2줄이 잘리고
 * 아래 가격 줄이 카드마다 어긋난다(초기 네이티브 카드가 40이었음 — 교정).
 */
export function CardTitle({
  title,
  className,
  fixedHeight = true,
}: {
  title: string;
  className?: string;
  fixedHeight?: boolean;
}) {
  return (
    <Text
      className={cn('pt-2 text-sm text-gray-700', className)}
      style={fixedHeight ? {height: 48} : undefined}
      numberOfLines={2}>
      {title}
    </Text>
  );
}

/** 카드 한 줄 「오픈까지 2:10:33」 — 오픈 시각이 지나면 「지금 오픈」. web TimeDealCountdown 과 같다. */
function TimeDealCountdown({openAt}: {openAt: number}) {
  const now = useNow();
  const left = openAt - now;
  return (
    <Text
      className="pt-0.5 text-xs font-semibold text-error-600"
      style={{fontVariant: ['tabular-nums']}}
      numberOfLines={1}>
      {left > 0 ? `오픈까지 ${formatCountdown(left)}` : '지금 오픈'}
    </Text>
  );
}

/**
 * 카드 가격 줄 — 토스 하루특가면 토스 앱처럼 「하루만 N원」과 「N명이 봤어요」를 붙이고,
 * 아직 안 연 시간 한정 딜(토스 다음 날 특가·커뮤니티 예고 글)이면 「오픈까지 H:MM:SS」를 단다.
 * 그 밖의 상품은 DisplayListPrice 그대로. web entities/product-list/ui/card/TossTimeDealPrice 와 같다.
 */
export function TossTimeDealPrice({
  product,
  priceClassName,
}: {
  product: Pick<
    ProductCardType,
    'price' | 'data' | 'title' | 'postedAt' | 'isEnd'
  >;
  priceClassName?: string;
}) {
  const timeDeal = getTossTimeDeal(product.data);
  const opening = getTimeDealOpening(product);
  return (
    <>
      <View className="flex-row items-center gap-1 pt-1">
        {timeDeal?.pricePrefix ? (
          <Text className="text-xs font-semibold text-error-600">
            {timeDeal.pricePrefix}
          </Text>
        ) : null}
        <View className="min-w-0 flex-1">
          <DisplayListPrice price={product.price} className={priceClassName} />
        </View>
      </View>
      {opening ? (
        <TimeDealCountdown openAt={opening.openAt} />
      ) : timeDeal?.viewCountText ? (
        <Text className="pt-0.5 text-xs text-gray-500" numberOfLines={1}>
          {timeDeal.viewCountText}
        </Text>
      ) : null}
    </>
  );
}
