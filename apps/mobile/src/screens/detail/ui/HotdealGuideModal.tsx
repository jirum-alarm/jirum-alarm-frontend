import React from 'react';
import {View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';

import BottomSheet from '@/shared/components/BottomSheet';
import Button from '@/shared/components/ui/Button';

import {HotDealType} from '@/shared/api/gql/graphql';
import HotdealBadge from '@/shared/components/product/HotdealBadge';

/** web HotdealGuideModal 과 같은 3단계 설명. */
const STEPS: {type: HotDealType; label: string}[] = [
  {type: HotDealType.HotDeal, label: '기존가 대비 할인폭이 큰 딜'},
  {type: HotDealType.SuperDeal, label: '할인폭이 더 큰 상위 딜'},
  {type: HotDealType.UltraDeal, label: '역대급 할인폭'},
];

/**
 * 핫딜 기준 안내 시트.
 *
 * web 은 vaul 드로어에 그라디언트 게이지로 3단계를 보여준다. 여기서는 같은
 * 설명을 뱃지 + 한 줄로 세운다 — 게이지는 정보가 아니라 장식이라 RN 에서
 * 재현 비용 대비 얻는 게 없다.
 */
export default function HotdealGuideModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      accessibilityLabel="핫딜 기준 안내">
      <View className="px-5 pt-4">
        <Text className="pb-3 text-center text-lg font-bold text-gray-900">
          핫딜 기준 안내
        </Text>
        <Text className="pb-6 text-center text-gray-700">
          AI를 활용해서 상품의 기존 가격과 할인된 가격을{'\n'}
          비교해서 3단계로 구분해드려요!
        </Text>

        <View className="gap-y-3">
          {STEPS.map(step => (
            <View key={step.type} className="flex-row items-center gap-x-3">
              <HotdealBadge hotdealType={step.type} badgeVariant="page" />
              <Text className="shrink text-sm text-gray-700">{step.label}</Text>
            </View>
          ))}
        </View>

        <Button onPress={onClose} className="mt-7">
          확인
        </Button>
      </View>
    </BottomSheet>
  );
}
