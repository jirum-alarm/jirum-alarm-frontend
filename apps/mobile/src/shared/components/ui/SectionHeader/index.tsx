import React from 'react';
import {View} from 'react-native';
import {sectionTitle} from '@jirum/design-system/recipes';
import PressableScale from '@/shared/components/PressableScale';
import {Text} from '@/shared/components/ui/Text/AppText';
import {cn} from '@/shared/lib/styling';

/**
 * 홈·목록 섹션 제목 줄 — web `shared/ui/SectionHeader`(h-14) + InteractiveMoreLink. 제목 모양은 같은 레시피(sectionTitle.page).
 * onPressMore 를 주면 오른쪽에 "더보기", 다른 걸 두려면 right. 검색 화면처럼 낮은 줄은 className 으로 높이만 덮는다.
 * 상세 안 섹션(한 단계 덜 굵은 제목)은 sectionTitle.detail 을 Text 에 바로 쓴다 — 자리마다 여백이 달라 줄을 못 나눈다.
 */
export default function SectionHeader({
  title,
  onPressMore,
  right,
  className,
}: {
  title: string;
  onPressMore?: () => void;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <View
      className={cn(
        'h-14 w-full flex-row items-center justify-between px-5',
        className,
      )}>
      <Text className={cn('shrink', sectionTitle.page)} numberOfLines={1}>
        {title}
      </Text>
      {onPressMore ? (
        // web InteractiveMoreLink — whileTap scale 0.95.
        <PressableScale
          onPress={onPressMore}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={`${title} 더보기`}>
          <Text className="text-sm text-gray-500">더보기</Text>
        </PressableScale>
      ) : (
        right
      )}
    </View>
  );
}
