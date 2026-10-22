import React from 'react';
import {View} from 'react-native';
import PressableOpacity from '@/shared/components/PressableOpacity';
import Svg, {Path} from 'react-native-svg';

import BottomSheet from '@/shared/components/BottomSheet';
import {Text} from '@/shared/components/ui/Text/AppText';
import {
  COLOR_SCHEME_LABEL,
  type ColorSchemePreference,
} from '@/shared/theme/color-scheme-preference';
import {tick} from '@/shared/lib/feedback/haptic';
import {useColors} from '@/shared/theme/useColors';
import {text} from '@jirum/design-system/recipes';
import {cn} from '@/shared/lib/styling/className';

const OPTIONS: ColorSchemePreference[] = ['system', 'light', 'dark'];

/** 내정보 > 화면 모드. 고르면 바로 적용되고 시트는 닫힌다. */
export default function ColorSchemeSheet({
  visible,
  value,
  onChange,
  onClose,
}: {
  visible: boolean;
  value: ColorSchemePreference;
  onChange: (next: ColorSchemePreference) => void;
  onClose: () => void;
}) {
  const c = useColors();
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      accessibilityLabel="화면 모드">
      <View className="px-5 pb-4">
        <Text className="pb-2 text-lg font-bold text-gray-900">화면 모드</Text>
        {OPTIONS.map(option => {
          const selected = option === value;
          return (
            <PressableOpacity
              key={option}
              onPress={() => {
                tick();
                onChange(option);
                onClose();
              }}
              accessibilityRole="radio"
              accessibilityState={{selected}}
              accessibilityLabel={COLOR_SCHEME_LABEL[option]}
              android_ripple={{color: c.gray[100]}}
              className="h-14 flex-row items-center justify-between">
              <Text
                className={
                  selected ? text.subtitle : 'text-base text-gray-700'
                }>
                {COLOR_SCHEME_LABEL[option]}
              </Text>
              {selected ? (
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M5 12.5l4.2 4.2L19 7.5"
                    stroke={c.gray[900]}
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              ) : null}
            </PressableOpacity>
          );
        })}
        <Text className={cn(text.caption, 'pt-1')}>
          시스템 설정은 휴대폰의 라이트·다크 설정을 따라가요.
        </Text>
      </View>
    </BottomSheet>
  );
}
