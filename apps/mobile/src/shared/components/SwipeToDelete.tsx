import React from 'react';
import {Pressable, View} from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import {Text} from '@/shared/components/ui/Text/AppText';
import {tick} from '@/shared/lib/feedback';
import {cn} from '@/shared/lib/styling';

/**
 * 왼쪽으로 밀면 오른쪽에 빨간 「삭제」가 나온다 — iOS 메일·메시지와 같은 목록 관행.
 * 기존 삭제 버튼은 그대로 두고 지름길만 더한다(VoiceOver 는 기존 버튼으로 지운다).
 *
 * ★콜백은 ReanimatedSwipeable 이 runOnJS 로 감싸 JS 스레드에서 부른다 — 직접 Gesture 를
 * 짜면 runOnJS(true) 가 빠져 앱이 죽는다(mobile-runtime-crashes-found-only-on-device).
 */
export default function SwipeToDelete({
  onDelete,
  accessibilityLabel,
  enabled = true,
  actionClassName,
  children,
}: {
  onDelete: () => void;
  accessibilityLabel: string;
  enabled?: boolean;
  /** 카드형 행(둥근 테두리)은 삭제 칸도 둥글게. */
  actionClassName?: string;
  children: React.ReactNode;
}) {
  if (!enabled) return <>{children}</>;
  return (
    <ReanimatedSwipeable
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      onSwipeableWillOpen={tick}
      renderRightActions={(_progress, _translation, methods) => (
        <View className={cn('bg-error-500 justify-center', actionClassName)}>
          <Pressable
            onPress={() => {
              methods.close();
              onDelete();
            }}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            className="h-full justify-center px-6"
            style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
            <Text className="text-sm font-semibold text-fixed-white">삭제</Text>
          </Pressable>
        </View>
      )}>
      {children}
    </ReanimatedSwipeable>
  );
}
