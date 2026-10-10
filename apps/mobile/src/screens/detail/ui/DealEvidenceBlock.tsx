import {infoBox} from '@jirum/design-system/recipes';
import React, {useEffect, useRef} from 'react';
import {Dimensions, Pressable, View} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';

import {
  DealEvidenceKind,
  DealEvidenceStrength,
  type ProductDealEvidenceQuery,
} from '@/shared/api/gql/graphql';
import {ProductService} from '@/shared/api/product/product.service';
import {Text} from '@/shared/components/ui/Text/AppText';
import {Analytics} from '@/shared/lib/analytics/ga4';
import {cn} from '@/shared/lib/styling';
import {useColors} from '@/shared/theme/useColors';

export type DealEvidence = NonNullable<
  NonNullable<ProductDealEvidenceQuery['product']>['dealEvidence']
>;

/** 「근거 보기」가 내려갈 섹션 — 다나와 근거는 블록 안 숫자가 근거라 없다. */
export type EvidenceTarget = 'priceHistory' | 'community';

/**
 * 왜 핫딜인지 — 가격 바로 아래 블록 하나. web `features/product-detail/ui/DealEvidenceBlock.tsx` 이식.
 * 무엇을 쓸지는 서버(dealEvidence)가 정하고 여기선 그리기만. 판정 카드·다나와 배지를 대신한다.
 * 이벤트명은 판정 카드 때 그대로(web dataLayer 와 같은 GA4 속성으로 합쳐 본다).
 */
export default function DealEvidenceBlock({
  productId,
  evidence,
  onPressMore,
}: {
  productId: number;
  evidence?: DealEvidence | null;
  onPressMore: (target: EvidenceTarget) => void;
}) {
  const c = useColors();
  const headline = evidence?.headline ?? null;
  const impressedRef = useRef<number | null>(null);

  useEffect(() => {
    if (!headline || impressedRef.current === productId) return;
    impressedRef.current = productId;
    Analytics.track('price_verdict_impression', {
      productId,
      kind: headline.kind,
      strength: headline.strength,
      screen_width: Dimensions.get('window').width,
    });
    void ProductService.collectPriceContextImpression({
      productId,
      source: 'app_detail',
      detail: `evidence:${headline.kind}`,
    }).catch(() => {});
  }, [headline, productId]);

  if (!evidence || !headline) return null;

  const target: EvidenceTarget | null =
    headline.kind === DealEvidenceKind.History
      ? 'priceHistory'
      : headline.kind === DealEvidenceKind.Community
      ? 'community'
      : null;
  const strong = headline.strength === DealEvidenceStrength.Strong;
  const isPeople = headline.kind === DealEvidenceKind.Community;
  const part = strong ? headline.highlight : null;
  const at = part ? headline.title.indexOf(part) : -1;
  const hasFooter = !!(evidence.support || evidence.caveat);
  const moreButton = target ? (
    <Pressable
      onPress={() => {
        Analytics.track('price_verdict_click_history', {
          productId,
          kind: headline.kind,
          screen_width: Dimensions.get('window').width,
        });
        void ProductService.collectPriceContextClick({
          productId,
          source: 'app_detail',
          detail: `evidence:${headline.kind}`,
        }).catch(() => {});
        onPressMore(target);
      }}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="근거 보기"
      // ★함수형 style 엔 opacity 만(레이아웃을 섞으면 NativeWind 가 떨군다).
      style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
      <Text className="text-xs text-gray-500">근거 보기 ›</Text>
    </Pressable>
  ) : null;

  return (
    <View className={cn('mt-3 px-4 py-3', infoBox)}>
      <View className="flex-row gap-x-2.5">
        <View
          className={cn(
            'h-7 w-7 items-center justify-center rounded-full',
            isPeople
              ? 'bg-secondary-100'
              : strong
              ? 'bg-error-50'
              : 'bg-gray-200',
          )}>
          {isPeople ? (
            <PeopleIcon size={16} color={c.secondary[600]} />
          ) : (
            <TagIcon size={16} color={strong ? c.error[500] : c.gray[600]} />
          )}
        </View>
        <View className="min-w-0 flex-1 pt-0.5">
          <Text className="text-sm font-semibold text-gray-900">
            {part && at >= 0 ? (
              <>
                {headline.title.slice(0, at)}
                <Text className="text-sm font-bold text-error-500">{part}</Text>
                {headline.title.slice(at + part.length)}
              </>
            ) : (
              headline.title
            )}
          </Text>
          {headline.detail ? (
            <Text className="mt-0.5 text-xs text-gray-500">
              {headline.detail}
            </Text>
          ) : null}
          {/* 덧붙일 줄이 없으면 구분선 없이 본문 아래에(web 과 같다). */}
          {!hasFooter && moreButton ? (
            <View className="mt-1.5 flex-row">{moreButton}</View>
          ) : null}
        </View>
      </View>

      {hasFooter ? (
        <View className="mt-2.5 flex-row items-start gap-x-3 border-t border-gray-200 pt-2.5">
          <View className="min-w-0 flex-1 gap-y-1">
            {evidence.support ? (
              <View className="flex-row items-start gap-x-1.5">
                <PeopleIcon size={14} color={c.secondary[600]} />
                <Text className="flex-1 text-xs text-gray-600">
                  {evidence.support}
                </Text>
              </View>
            ) : null}
            {evidence.caveat ? (
              <View className="flex-row items-start gap-x-1.5">
                <InfoIcon size={14} color={c.warning[700]} />
                <Text className="flex-1 text-xs text-warning-700">
                  {evidence.caveat}
                </Text>
              </View>
            ) : null}
          </View>
          {moreButton}
        </View>
      ) : null}
    </View>
  );
}

function TagIcon({size, color}: {size: number; color: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"
        stroke={color}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
      <Circle cx={7.5} cy={7.5} r={1.6} fill={color} />
    </Svg>
  );
}

function PeopleIcon({size, color}: {size: number; color: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={8} r={3.5} stroke={color} strokeWidth={2} />
      <Path
        d="M2.5 20c.6-3.6 3.3-6 6.5-6s5.9 2.4 6.5 6M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.4c1.7.8 2.8 2.9 3 5.6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function InfoIcon({size, color}: {size: number; color: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9.5} stroke={color} strokeWidth={2} />
      <Path
        d="M12 7.5v6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx={12} cy={16.8} r={1.1} fill={color} />
    </Svg>
  );
}
