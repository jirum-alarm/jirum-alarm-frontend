import React, {useState} from 'react';
import {View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';

import BottomSheet from '@/shared/components/BottomSheet';
import PressableScale from '@/shared/components/PressableScale';
import Button from '@/shared/components/ui/Button';
import HotdealBadge, {
  HOTDEAL_TYPES_IN_ORDER,
  hotdealCriteria,
  hotdealTextMap,
} from '@/shared/components/product/HotdealBadge';
import {HotDealType} from '@/shared/api/gql/graphql';
import {cn} from '@/shared/lib/styling/className';

/**
 * 상세 배지 + 뜻 한 줄 — 누르면 세 배지의 기준을 시트로 보여 준다. web `features/product-detail/ui/HotdealCriteriaBadge.tsx` 와 같은 내용.
 *
 * 10/10 에 옛 안내 시트(「AI 가 기존 가격과 비교해 3단계」)를 지웠다 — 배지 95%가 커뮤니티 인기글이라 사실이 아니었다.
 * 이제 기준이 서버 한 곳(hot-deal-criteria.ts)에 숫자로 있어 그 문장을 그대로 보여 준다.
 */
export default function HotdealCriteriaBadge({
  hotdealType,
}: {
  hotdealType: HotDealType;
}) {
  const [open, setOpen] = useState(false);
  const criteria = hotdealCriteria[hotdealType];

  return (
    <>
      <PressableScale
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${hotdealTextMap[hotdealType]} — ${criteria.title}. 배지 기준 보기`}
        // 24pt 배지라 위아래로 넓혀 44pt 에 맞춘다.
        hitSlop={10}
        className="shrink flex-row items-center gap-x-1.5">
        <HotdealBadge hotdealType={hotdealType} badgeVariant="page" />
        <Text className="shrink text-xs text-gray-500" numberOfLines={1}>
          {criteria.short} ›
        </Text>
      </PressableScale>

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        accessibilityLabel="배지 기준">
        <View className="px-5 pt-6">
          <Text className="text-xl font-bold text-gray-900">
            배지는 이렇게 붙어요
          </Text>
          <Text className="pt-1 pb-4 text-sm text-gray-500">
            둘 이상 해당하면 높은 배지 하나만 보여요.
          </Text>
          <View className="gap-y-1">
            {HOTDEAL_TYPES_IN_ORDER.map(type => (
              <View
                key={type}
                className={cn(
                  'flex-row gap-x-3 rounded-lg px-3 py-3',
                  type === hotdealType && 'bg-gray-50',
                )}>
                <View className="w-[62px]">
                  <HotdealBadge hotdealType={type} badgeVariant="page" />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-sm font-semibold text-gray-900">
                    {hotdealCriteria[type].title}
                    {type === hotdealType ? (
                      <Text className="text-xs font-medium text-error-600">
                        {'  '}이 딜
                      </Text>
                    ) : null}
                  </Text>
                  <Text className="mt-0.5 text-xs text-gray-500">
                    {hotdealCriteria[type].detail}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <Button onPress={() => setOpen(false)} className="mt-6">
            확인
          </Button>
        </View>
      </BottomSheet>
    </>
  );
}
