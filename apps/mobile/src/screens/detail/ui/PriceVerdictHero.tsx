import React, {useEffect} from 'react';
import {Dimensions, Pressable, Text, View} from 'react-native';

import {Analytics} from '@/shared/lib/analytics/ga4';

import {isStrongPriceVerdict, type PriceVerdict} from '../lib/price-signals';

/**
 * 상세 가격 아래 판정 카드. web `features/product-detail/ui/PriceVerdictHero.tsx` 이식.
 * READY+STRONG 만 노출하고, "기준 보기"는 가격 추이 섹션으로 스크롤한다.
 * 이벤트명·파라미터는 web dataLayer 와 같다(같은 GA4 속성으로 합쳐 본다).
 */
export default function PriceVerdictHero({
  productId,
  verdict,
  onPressHistory,
}: {
  productId: number;
  verdict?: PriceVerdict | null;
  onPressHistory: () => void;
}) {
  const visible = isStrongPriceVerdict(verdict);

  useEffect(() => {
    if (!visible || !verdict) return;
    Analytics.track('price_verdict_impression', {
      productId,
      status: verdict.status,
      displayTier: verdict.displayTier,
      nullReason: verdict.nullReason,
      labelKey: verdict.labelKey,
      basis: verdict.basis,
      historyPointCount: verdict.historyPointCount,
      rangeDays: verdict.rangeDays,
      screen_width: Dimensions.get('window').width,
    });
  }, [visible, productId, verdict]);

  if (!isStrongPriceVerdict(verdict)) return null;

  return (
    <View className="pt-3">
      <Pressable
        onPress={() => {
          Analytics.track('price_verdict_click_history', {
            productId,
            labelKey: verdict.labelKey,
            screen_width: Dimensions.get('window').width,
          });
          onPressHistory();
        }}
        className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
        accessibilityRole="button"
        accessibilityLabel="가격 추이 기준 보기">
        <Text className="text-sm font-semibold text-gray-800">
          {verdict.headline}
        </Text>
        {verdict.subline ? (
          <Text className="mt-1 text-xs text-gray-500">{verdict.subline}</Text>
        ) : null}
        <Text className="mt-2 text-xs font-medium text-gray-400">
          기준 보기 ↓
        </Text>
      </Pressable>
    </View>
  );
}
