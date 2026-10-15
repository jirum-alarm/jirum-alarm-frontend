import React from 'react';
import {Pressable, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';

/**
 * 서버가 「없는 상품」(404)이라고 답한 상세 — 삭제·비공개된 딜.
 *
 * 예전엔 네트워크 실패와 같은 화면(「네트워크 연결을 확인하고 다시 시도」)이 떠서, 푸시·공유 링크로 들어온 사람이
 * 끝나지 않는 「다시 시도」를 눌렀다. 알림 목록의 토스트(AlarmScreen)와 같은 말로 이유를 알려 주고 갈 곳을 준다.
 * web 은 products/[id]/not-found.tsx 가 같은 문구다.
 */
export default function MissingDealView({
  onPressHome,
  onPressSearch,
}: {
  onPressHome: () => void;
  onPressSearch: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="mb-4 text-5xl">🫥</Text>
      <Text className="mb-2 text-lg font-bold text-gray-900">
        판매가 끝났거나 내려간 딜이에요
      </Text>
      <Text className="mb-6 text-center text-sm text-gray-500">
        지금 진행 중인 핫딜을 둘러보거나{'\n'}찾던 상품을 검색해 보세요
      </Text>
      <View className="w-full max-w-xs gap-2">
        <Pressable
          accessibilityRole="button"
          onPress={onPressHome}
          className="items-center rounded-lg bg-gray-900 py-3">
          <Text className="text-sm font-semibold text-white">
            다른 핫딜 보기
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onPressSearch}
          className="items-center rounded-lg bg-gray-100 py-3">
          <Text className="text-sm font-semibold text-gray-900">검색하기</Text>
        </Pressable>
      </View>
    </View>
  );
}
