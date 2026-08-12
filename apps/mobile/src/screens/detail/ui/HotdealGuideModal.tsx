import React, {useEffect, useRef, useState} from 'react';
import {Animated, Modal, Pressable, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(slide, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
      return;
    }
    Animated.timing(slide, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(({finished}) => finished && setMounted(false));
  }, [visible, slide]);

  if (!mounted) return null;

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-end bg-black/40"
        onPress={onClose}
        accessibilityLabel="닫기">
        <Pressable onPress={() => {}}>
          <Animated.View
            className="rounded-t-2xl bg-white px-5 pt-8"
            style={{
              paddingBottom: Math.max(insets.bottom, 20),
              opacity: slide,
              transform: [
                {
                  translateY: slide.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
            }}>
            <Text className="pb-3 text-center text-xl font-bold text-gray-900">
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
                  <Text className="shrink text-sm text-gray-700">
                    {step.label}
                  </Text>
                </View>
              ))}
            </View>

            <Pressable
              onPress={onClose}
              className="mt-7 rounded-lg bg-primary-500 py-3.5"
              accessibilityRole="button">
              <Text className="text-center text-base font-semibold text-gray-900">
                확인
              </Text>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
