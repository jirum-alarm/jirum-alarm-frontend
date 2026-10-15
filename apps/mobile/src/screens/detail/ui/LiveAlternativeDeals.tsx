import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {cardThumb, sectionTitle} from '@jirum/design-system/recipes';
import {
  formatPriceDiff,
  liveAlternativeKindLabel,
  summarizeLiveAlternatives,
} from '../lib/live-alternatives';

import {prefetchProductDetail} from '@/entities/product/prefetch-detail';
import {ProductQueries} from '@/entities/product/product.queries';
import {useRankingImpressionTracker} from '@/entities/trending/model/useRankingImpressionTracker';
import PressableScale from '@/shared/components/PressableScale';
import Thumbnail from '@/shared/components/product/Thumbnail';
import {Text} from '@/shared/components/ui/Text/AppText';
import {trackProductCardClick} from '@/shared/lib/analytics/card-tracking';
import {displayTime, parsePrice} from '@/shared/lib/format/price';
import {cn} from '@/shared/lib/styling/className';
import DetailBand from './DetailBand';

import type {ProductDetail} from '../model/types';
import {dealFreshnessAt} from '../lib/price-signals';

/** 종료 딜 블록(ExpiredProductWarning)과 같은 7일 — 그보다 오래된 딜은 그쪽이 「최신 핫딜」을 띄운다. */
const MAX_DEAL_AGE_DAYS = 7;
const LIMIT = 3;

/**
 * 막 올라온 딜 상세의 「다른 곳 진행 중인 딜」 — 같은 상품을 다른 값에 파는 딜, 용량·구성이 다른 같은 라인 딜.
 * web features/product-detail/components/LiveAlternativeDeals 와 같은 자리(종료 딜 블록 자리, 가격 이력 위)·같은 문장
 * (@jirum/domain/live-alternatives). 상세 맨 아래 「함께 본 상품」 캐러셀은 노출 본 기기의 0.5% 만 눌러 이걸로 바꿨다.
 */
export default function LiveAlternativeDeals({
  product,
  onPressProduct,
  seen = false,
}: {
  product: ProductDetail;
  onPressProduct: (id: number) => void;
  /** 블록 첫 줄이 화면에 들어왔나(상세 스크롤이 판정) — 노출 기록 시점. */
  seen?: boolean;
}) {
  const freshAt = dealFreshnessAt(product);
  const isTarget =
    !!freshAt &&
    Math.floor((Date.now() - new Date(freshAt).getTime()) / 86_400_000) <
      MAX_DEAL_AGE_DAYS;
  const currentId = Number(product.id);
  const {data: deals = []} = useQuery({
    ...ProductQueries.liveAlternativeDeals({id: currentId, limit: LIMIT}),
    enabled: isTarget,
  });

  // 노출·클릭을 서버(user_history)에 남긴다 — 실험 등록부 obs_detail_live_alternatives 가 이걸로 판독한다.
  const {recordImpression, recordClick} =
    useRankingImpressionTracker('live_alternative');
  const shownKey = deals.map(d => d.product.id).join(',');
  useEffect(() => {
    if (!seen || !shownKey) return;
    shownKey.split(',').forEach((id, i) => recordImpression(Number(id), i));
  }, [seen, shownKey, recordImpression]);

  if (!isTarget || deals.length === 0) return null;
  const summary = summarizeLiveAlternatives(deals);

  return (
    <>
      <DetailBand />
      <View className="px-5 pt-7">
        <Text className={sectionTitle.detail}>{summary.title}</Text>
        <Text className={cn('pt-1', sectionTitle.subtitle)}>
          {summary.subtitle}
        </Text>
        <View className="gap-3 pt-3">
          {deals.map((deal, index) => {
            const item = deal.product;
            const {hasWon, priceWithoutWon} = parsePrice(item.price);
            const diff = formatPriceDiff(deal.priceDiff);
            const where = item.mallName || item.provider?.nameKr;
            return (
              <PressableScale
                key={String(item.id)}
                onPressIn={() =>
                  prefetchProductDetail(
                    Number(item.id),
                    item.thumbnail,
                    item.title,
                  )
                }
                onPress={() => {
                  trackProductCardClick('live_alternative', item.id);
                  recordClick(Number(item.id), index);
                  onPressProduct(Number(item.id));
                }}
                accessibilityRole="button"
                accessibilityLabel={item.title}>
                <View className="flex-row items-center gap-3">
                  <View className={cn('h-16 w-16', cardThumb)}>
                    <Thumbnail
                      uri={item.thumbnail}
                      categoryId={item.categoryId}
                      type="hotDeal"
                    />
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text className="text-sm text-gray-700" numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View className="flex-row items-baseline gap-2">
                      <Text
                        className="text-base font-semibold text-gray-900"
                        numberOfLines={1}>
                        {hasWon ? `${priceWithoutWon}원` : priceWithoutWon}
                      </Text>
                      {diff ? (
                        <Text
                          className={
                            diff.cheaper
                              ? 'text-xs font-semibold text-error-600'
                              : 'text-xs font-semibold text-gray-500'
                          }>
                          {diff.text}
                        </Text>
                      ) : null}
                    </View>
                    <Text className="text-xs text-gray-500" numberOfLines={1}>
                      {[
                        liveAlternativeKindLabel(deal.kind),
                        where,
                        item.postedAt ? displayTime(item.postedAt) : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </Text>
                  </View>
                </View>
              </PressableScale>
            );
          })}
        </View>
      </View>
    </>
  );
}
