import React from 'react';
import {Image, Text, View} from 'react-native';

import HotdealBadge from '@/shared/components/product/HotdealBadge';
import NoImage from '@/shared/components/product/NoImage';
import {parsePrice} from '@/shared/lib/format/price';
import {cn} from '@/shared/lib/styling';
import type {HotDealType} from '@/shared/api/gql/graphql';

import type {ProductCardType} from '../../model/types';

/**
 * 홈 카드 4종이 공유하는 조각들.
 * web: apps/web/src/entities/product-list/ui/card/*
 *
 * ⚠️ 홈이 네이티브가 돼도 발견·커뮤니티 탭은 웹뷰라 **같은 상품 카드가 두 벌**이 된다.
 * 표기가 갈리면 유저는 버그로 읽는다(partial-ui-rollout-reads-as-bug).
 * 여백·글자 크기까지 web 과 대조해서 맞췄다 — 임의로 바꾸지 말 것.
 */

/** web formatDateToMMD 와 같은 표기(MM.DD). */
export function formatMMD(date?: string | null): string {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}.${dd}`;
}

/**
 * 썸네일 + 좌하단 뱃지들.
 * 판매종료 / 핫딜 뱃지는 상호배타, 유통기한은 그 위에 덮인다(web 과 동일 순서).
 */
export function CardThumbnail({
  product,
  style,
  thumbnailType = 'product',
}: {
  product: ProductCardType;
  style: {width: number | `${number}%`; height?: number; aspectRatio?: number};
  thumbnailType?: 'product' | 'hotDeal';
}) {
  return (
    <View
      className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
      style={style}>
      {product.thumbnail ? (
        <Image
          source={{uri: product.thumbnail}}
          style={{width: '100%', height: '100%'}}
          resizeMode="cover"
        />
      ) : (
        <NoImage categoryId={product.categoryId} type={thumbnailType} />
      )}

      {product.isEnd ? (
        <View className="absolute bottom-0 left-0 h-[22px] justify-center rounded-tr-lg rounded-bl-lg bg-white px-2">
          <Text className="text-xs font-semibold text-gray-700">판매종료</Text>
        </View>
      ) : product.hotDealType ? (
        <View className="absolute bottom-0 left-0">
          <HotdealBadge
            hotdealType={product.hotDealType as HotDealType}
            badgeVariant="card"
          />
        </View>
      ) : null}

      {product.earliestExpiryDate && !product.isEnd ? (
        <View className="absolute inset-x-0 bottom-0 h-[22px] items-center justify-center rounded-b-lg bg-gray-700/80 px-2">
          <Text className="text-xs font-semibold text-white">
            유통기한 {formatMMD(product.earliestExpiryDate)}
          </Text>
        </View>
      ) : null}
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
