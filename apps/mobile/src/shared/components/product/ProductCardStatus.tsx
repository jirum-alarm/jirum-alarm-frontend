import React from 'react';
import {View} from 'react-native';
import {cardLabel} from '@jirum/design-system/recipes';
import {
  getTimeDealOpening,
  getTossTimeDeal,
} from '@jirum/domain/toss-time-deal';
import HotdealBadge from '@/shared/components/product/HotdealBadge';
import Badge from '@/shared/components/ui/Badge';
import {Text} from '@/shared/components/ui/Text/AppText';
import {formatMMD} from '@/shared/lib/format/date';
import {cn} from '@/shared/lib/styling';
import type {HotDealType} from '@/shared/api/gql/graphql';

/** 사진 왼쪽 아래 모서리 라벨(판매종료·베스트판매자). light = 흰 면, dark = 사진 위 어두운 면. */
export function CardCornerLabel({
  tone,
  squareThumb,
  children,
}: {
  tone: keyof typeof cardLabel.tone;
  squareThumb?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      className={cn(
        'absolute bottom-0 left-0 z-10 justify-center',
        cardLabel.corner.box,
        cardLabel.tone[tone].box,
        squareThumb && cardLabel.squareThumb.corner,
      )}>
      <Text className={cn(cardLabel.corner.text, cardLabel.tone[tone].text)}>
        {children}
      </Text>
    </View>
  );
}

/**
 * 상품 카드 사진 위 상태 — 판매종료 / 토스 하루특가(선착순특가·선착순 마감) / 핫딜 배지 / 유통기한 띠 / 급상승. 홈 카드·검색 카드가 같이 쓴다.
 * ★같은 상품을 홈·검색·상세를 오가며 다시 보므로 카드마다 다르게 그리면 버그로 읽힌다 — 여기서만 그린다.
 * 유통기한 띠(22px)가 있으면 핫딜 배지(24px)는 숨긴다 — 같은 자리라 띠가 배지를 덮고 윗변 2px 만 삐져나왔다.
 * 모양은 recipes 의 cardLabel — web ProductCardStatus 와 같다.
 */
export default function ProductCardStatus({
  product,
  showHotdealBadge = true,
  squareThumb = false,
}: {
  product: {
    isEnd?: boolean | null;
    hotDealType?: HotDealType | string | null;
    earliestExpiryDate?: string | null;
    isRising?: boolean | null;
    data?: unknown;
    title?: string | null;
    postedAt?: string | null;
  };
  showHotdealBadge?: boolean;
  /** 사진 틀 아래 모서리가 각진 카드(랭킹) — 라벨이 둥근 모서리를 가정하면 사진 귀퉁이가 삐져나온다(web 과 같다). */
  squareThumb?: boolean;
}) {
  const {isEnd, hotDealType, earliestExpiryDate, isRising} = product;
  // 토스 하루특가는 핫딜 배지 자리에 토스 앱 배지를 그대로 단다(web ProductCardStatus 와 같다).
  // 선착순이 끝나면 crawler 가 isEnd 도 켠다 — 「판매종료」보다 「선착순 마감」이 무슨 일인지 말해 주므로 먼저 본다.
  const timeDeal = getTossTimeDeal(product.data);
  const showTimeDeal =
    timeDeal != null && (!isEnd || timeDeal.status !== 'ON_SALE');
  // 커뮤니티 예고 글(「오늘 17시 오픈」)이 아직 안 열렸으면 「오늘 17:00 오픈」.
  const opening = showTimeDeal ? null : getTimeDealOpening(product);
  return (
    <>
      {/* 급상승(랭킹 목록만) — 오른쪽 위. 왼쪽 위는 순위 숫자, 아래는 핫딜 배지·유통기한 띠 자리. web 과 같다. */}
      {isRising && !isEnd ? (
        <Badge
          variant="solid"
          tone="error"
          size="xs"
          className="absolute right-1.5 top-1.5 z-10">
          급상승
        </Badge>
      ) : null}
      {showTimeDeal ? (
        <CardCornerLabel
          squareThumb={squareThumb}
          tone={
            timeDeal.status === 'ON_SALE'
              ? 'deal'
              : timeDeal.status === 'UPCOMING'
              ? 'dark'
              : 'light'
          }>
          {timeDeal.label}
        </CardCornerLabel>
      ) : isEnd ? (
        <CardCornerLabel squareThumb={squareThumb} tone="light">
          판매종료
        </CardCornerLabel>
      ) : opening ? (
        <CardCornerLabel squareThumb={squareThumb} tone="dark">
          {opening.label}
        </CardCornerLabel>
      ) : showHotdealBadge && hotDealType && !earliestExpiryDate ? (
        <View className="absolute bottom-0 left-0">
          <HotdealBadge
            hotdealType={hotDealType as HotDealType}
            badgeVariant={squareThumb ? 'cardSquare' : 'card'}
          />
        </View>
      ) : null}
      {earliestExpiryDate && !isEnd ? (
        <View
          className={cn(
            'absolute inset-x-0 bottom-0 items-center justify-center',
            cardLabel.strip.box,
            squareThumb && cardLabel.squareThumb.strip,
          )}>
          <Text className={cardLabel.strip.text}>
            유통기한 {formatMMD(earliestExpiryDate)}
          </Text>
        </View>
      ) : null}
    </>
  );
}
