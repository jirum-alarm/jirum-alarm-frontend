import React, {useState} from 'react';
import {ActivityIndicator, Pressable, Text, View} from 'react-native';

import PressableScale from '@/shared/components/PressableScale';
import {useQuery} from '@tanstack/react-query';

import {ProductQueries} from '@/entities/product/product.queries';
import ArrowRight from '@/shared/components/icons/ArrowRight';
import Info from '@/shared/components/icons/Info';
import Thumbsdown from '@/shared/components/icons/Thumbsdown';
import Thumbsup from '@/shared/components/icons/Thumbsup';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {displayTime} from '@/shared/lib/format/price';
import {openInAppBrowser} from '@/shared/lib/navigation';
import {cn} from '@/shared/lib/styling';

import ProductReport from './ProductReport';
import Reactions from './Reactions';
import {
  buildDealStatusSummary,
  splitReactionKeywords,
  type ReactionKeywordItem,
} from '../model/deal-status-reaction';

/** web KeywordChip 과 같은 테두리/글자색 규칙. */
function KeywordChip({item}: {item: ReactionKeywordItem}) {
  const positive = item.type === 'POSITIVE';
  const negative = item.type === 'NEGATIVE';

  return (
    <View
      className={cn(
        'flex-row gap-x-1 rounded-[40px] border bg-white px-3 py-1.5',
        positive
          ? 'border-secondary-300'
          : negative
          ? 'border-error-200'
          : 'border-gray-300',
      )}>
      {item.tag ? (
        <Text className="text-xs font-medium text-gray-500">{item.tag}</Text>
      ) : null}
      <Text className="text-xs font-medium text-gray-900">{item.name}</Text>
      <Text
        className={cn(
          'text-xs font-semibold',
          positive
            ? 'text-secondary-700'
            : negative
            ? 'text-error-400'
            : 'text-gray-500',
        )}>
        {item.count}
      </Text>
    </View>
  );
}

function KeywordRow({
  label,
  labelClassName,
  items,
}: {
  label: string;
  labelClassName: string;
  items: ReactionKeywordItem[];
}) {
  if (!items.length) return null;

  return (
    <View className="flex-row items-start gap-2">
      <Text className={cn('mt-1.5 w-8 text-xs font-semibold', labelClassName)}>
        {label}
      </Text>
      <View className="min-w-0 flex-1 flex-row flex-wrap gap-1.5">
        {items.map(item => (
          <KeywordChip key={`${item.type}-${item.name}`} item={item} />
        ))}
      </View>
    </View>
  );
}

/** 출처 커뮤니티 원문으로 나가는 링크. web CommunityLink 와 같은 색·문구. */
function CommunityLink({url, provider}: {url: string; provider: string}) {
  return (
    <PressableScale
      onPress={() => openInAppBrowser(url)}
      className="flex-row items-center gap-x-1"
      accessibilityRole="button"
      accessibilityLabel={`${provider} 반응 보기`}>
      <Text className="text-xs font-semibold text-secondary-500">
        {provider} 반응 보기
      </Text>
      <View className="h-4 w-4 items-center justify-center rounded-full bg-secondary-500">
        <ArrowRight color="#FFFFFF" width={12} height={12} strokeWidth={1.5} />
      </View>
    </PressableScale>
  );
}

/** web CommunityReaction 헤더 Info 툴팁. */
function InfoTooltip() {
  const [open, setOpen] = useState(false);

  return (
    <View className="relative mt-0.5">
      <Pressable
        onPress={() => setOpen(v => !v)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="커뮤니티 반응">
        <Info />
      </Pressable>
      {open ? (
        <Pressable
          onPress={() => setOpen(false)}
          className="absolute right-0 top-7 z-50"
          accessibilityRole="button">
          <View className="rounded-lg bg-gray-600 px-4 py-2.5">
            <Text className="text-[13px] text-white">
              <Text className="font-semibold text-white">실제 커뮤니티</Text>
              {' 사용자들의\n핫딜 반응을 요약해 확인해요'}
            </Text>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * 커뮤니티 반응 — 품질 반응만(품절·종료·가격변동 등 상태 신호 제외).
 * 레이아웃·색은 web CommunityReaction 과 맞춘다.
 */
export default function CommunityReaction({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  const {data, isPending, isError, refetch} = useQuery(
    ProductQueries.reactionKeywords({id: productId}),
  );
  const {data: additional} = useQuery(
    ProductQueries.additionalInfo({id: productId}),
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
  const lastUpdatedAt = data?.lastUpdatedAt
    ? `${displayTime(data.lastUpdatedAt)} 업데이트`
    : null;

  return (
    <View className="px-5 pt-7">
      <View className="flex-row items-start justify-between gap-3">
        <Text className="min-w-0 text-lg font-semibold text-gray-900">
          커뮤니티 반응
        </Text>
        <InfoTooltip />
      </View>
      <Text className="pt-1 pb-3 text-xs text-gray-500">
        실제 커뮤니티 반응을 AI로 요약한 내용이에요
      </Text>

      <View className="rounded-xl bg-secondary-50 p-4">
        <View className="gap-y-3 rounded-xl bg-white px-3 py-3">
          {allCount > 0 ? (
            <View className="flex-row items-center gap-1.5">
              {isPositive ? (
                <Thumbsup width={18} height={18} active />
              ) : (
                <Thumbsdown width={18} height={18} active />
              )}
              <Text className="text-base font-semibold text-gray-800">
                {isPositive ? '추천해요' : '아쉬워요'}
              </Text>
              <Text className="text-sm text-gray-400">
                · {dominantPercent}%
              </Text>
            </View>
          ) : (
            <Text className="text-sm text-gray-500">
              아직 모은 반응이 없어요
            </Text>
          )}

          {positiveItems.length > 0 || negativeItems.length > 0 ? (
            <View className="gap-y-2">
              <KeywordRow
                label="긍정"
                labelClassName="text-secondary-600"
                items={positiveItems}
              />
              <KeywordRow
                label="부정"
                labelClassName="text-error-400"
                items={negativeItems}
              />
            </View>
          ) : null}

          {statusSummary ? (
            <Text className="text-xs text-gray-500">
              {statusSummary.message}
            </Text>
          ) : null}

          <View className="flex-row items-center justify-between gap-2 border-t border-gray-100 pt-2.5">
            <Text className="text-xs text-gray-400">
              {lastUpdatedAt ?? ' '}
            </Text>
            {additional?.url && additional.provider?.nameKr ? (
              <CommunityLink
                url={additional.url}
                provider={additional.provider.nameKr}
              />
            ) : null}
          </View>
        </View>
        {additional?.commentSummary ? (
          <View className="pt-3">
            <Reactions commentSummary={additional.commentSummary} />
          </View>
        ) : null}
        <View className="pt-3">
          <ProductReport productId={productId} isUserLogin={isUserLogin} />
        </View>
      </View>
    </View>
  );
}
