import React from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';

import {ProductQueries} from '@/entities/product/product.queries';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {displayTime} from '@/shared/lib/format/price';
import {cn} from '@/shared/lib/styling';

import {
  buildDealStatusSummary,
  splitReactionKeywords,
  type ReactionKeywordItem,
} from '../model/deal-status-reaction';

function KeywordChip({
  item,
  positive,
}: {
  item: ReactionKeywordItem;
  positive: boolean;
}) {
  return (
    <View
      className={cn(
        'rounded-full px-2.5 py-1',
        positive ? 'bg-primary-50' : 'bg-gray-100',
      )}>
      <Text
        className={cn(
          'text-xs font-medium',
          positive ? 'text-primary-800' : 'text-gray-600',
        )}>
        {item.name} {item.count}
      </Text>
    </View>
  );
}

/**
 * 커뮤니티 반응 — 실제 댓글을 AI 로 요약한 칩.
 *
 * 퍼센트 계산은 QUALITY 칩만 쓴다(DEAL_STATUS 는 품절·종료 같은 상태라
 * 추천/비추천이 아니다). web 과 같은 정책.
 */
export default function CommunityReaction({productId}: {productId: number}) {
  const {data, isPending, isError, refetch} = useQuery(
    ProductQueries.reactionKeywords({id: productId}),
  );

  if (isError) {
    return <SectionErrorRow label="커뮤니티 반응" onRetry={refetch} />;
  }
  if (isPending) {
    return (
      <View className="h-[100px] items-center justify-center">
        <ActivityIndicator size="small" color="#667085" />
      </View>
    );
  }

  const items = (data?.items ?? []) as ReactionKeywordItem[];
  if (!items.length) return null;

  const {quality, status} = splitReactionKeywords(items);
  const positiveItems = quality.filter(i => i.type === 'POSITIVE');
  const negativeItems = quality.filter(i => i.type === 'NEGATIVE');
  const statusSummary = buildDealStatusSummary(status);

  const positiveCount = positiveItems.reduce((s, i) => s + i.count, 0);
  const negativeCount = negativeItems.reduce((s, i) => s + i.count, 0);
  const allCount = positiveCount + negativeCount;
  const positivePercent =
    allCount === 0 ? 0 : Math.round((positiveCount / allCount) * 100);
  const isPositive = positivePercent >= 50;
  const dominantPercent = isPositive ? positivePercent : 100 - positivePercent;

  return (
    <View className="pt-7">
      <Text className="px-5 text-lg font-semibold text-gray-900">
        커뮤니티 반응
      </Text>
      <Text className="px-5 pt-1 text-xs text-gray-500">
        실제 커뮤니티 반응을 AI로 요약한 내용이에요
      </Text>

      <View className="mx-5 mt-3 rounded-xl bg-gray-50 p-4">
        {allCount > 0 ? (
          <Text className="pb-3 text-base font-semibold text-gray-900">
            <Text
              className={isPositive ? 'text-primary-800' : 'text-error-500'}>
              {dominantPercent}%
            </Text>
            <Text className="text-gray-700">
              {isPositive ? '가 추천해요' : '가 아쉬워했어요'}
            </Text>
          </Text>
        ) : null}

        {positiveItems.length ? (
          <View className="flex-row flex-wrap gap-1.5 pb-2">
            {positiveItems.map(i => (
              <KeywordChip key={i.tag ?? i.name} item={i} positive />
            ))}
          </View>
        ) : null}
        {negativeItems.length ? (
          <View className="flex-row flex-wrap gap-1.5">
            {negativeItems.map(i => (
              <KeywordChip key={i.tag ?? i.name} item={i} positive={false} />
            ))}
          </View>
        ) : null}

        {statusSummary ? (
          <Text className="pt-3 text-sm text-error-500">
            {statusSummary.message}
          </Text>
        ) : null}

        {data?.lastUpdatedAt ? (
          <Text className="pt-3 text-xs text-gray-500">
            {displayTime(data.lastUpdatedAt)} 업데이트
          </Text>
        ) : null}
      </View>
    </View>
  );
}
