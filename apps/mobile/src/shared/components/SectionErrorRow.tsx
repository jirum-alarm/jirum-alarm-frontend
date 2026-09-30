import React from 'react';
import {Pressable, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';

/**
 * 섹션 단위 실패 표시.
 *
 * 데이터가 없는 것과 못 불러온 것은 다르다. 지금까지는 둘 다 조용히 숨겨서
 * 사용자에겐 "이 상품은 원래 없네"로 보였고, 장애가 지표로도 안 잡혔다
 * (디자인 리뷰 2026-08-12).
 *
 * 빈 상태는 계속 숨긴다 — 가격이력 없는 상품이 다수라 그걸 다 에러처럼
 * 띄우면 오해를 산다. 이 컴포넌트는 isError 일 때만 쓴다.
 */
/** 받침 있으면 '을', 없으면 '를' ("커뮤니티를"). 한글로 안 끝나면 '을(를)'. */
export const objectParticle = (word: string): string => {
  const code = word.trim().charCodeAt(word.trim().length - 1) - 0xac00;
  if (!(code >= 0 && code <= 11171)) return '을(를)';
  return code % 28 ? '을' : '를';
};

export default function SectionErrorRow({
  label,
  onRetry,
}: {
  label: string;
  onRetry: () => void;
}) {
  return (
    <View className="mx-5 mt-3 flex-row items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
      <Text className="shrink text-sm text-gray-600" numberOfLines={1}>
        {label}
        {objectParticle(label)} 불러오지 못했어요
      </Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel={`${label} 다시 시도`}
        // ★함수형 style 엔 opacity 만 — 터치 영역·정렬은 안쪽 View 가 받는다
        // (섞으면 NativeWind 가 레이아웃을 떨군다).
        style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
        <View
          style={{minHeight: 44, minWidth: 64}}
          className="items-end justify-center">
          <Text className="text-sm font-medium text-primary-800">
            다시 시도
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
