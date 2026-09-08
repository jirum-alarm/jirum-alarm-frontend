import React from 'react';
import {Text, View} from 'react-native';

/**
 * 섹션 제목 줄. web `shared/ui/SectionHeader`(h-14, text-lg font-bold) 의
 * 모바일 모양만 옮긴 것 — 발견 탭 랭킹의 CarouselSection 과 같은 값이다.
 */
export default function SectionTitle({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <View className="h-11 flex-row items-center justify-between px-5">
      <Text className="text-lg font-bold text-gray-900">{title}</Text>
      {right}
    </View>
  );
}
