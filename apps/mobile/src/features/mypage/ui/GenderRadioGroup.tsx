import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {Gender} from '@/shared/api/gql/graphql';

/**
 * 성별 선택. web `entities/user/ui/GenderRadioGroup`.
 *
 * ★web 은 라디오가 아니라 **checkbox** 다 — 같은 값을 다시 누르면 해제된다
 * (`handleRadioChange` 가 gender === value 면 null 로 만든다). 그 동작을 유지한다.
 */
export default function GenderRadioGroup({
  gender,
  onChange,
}: {
  gender?: Gender | null;
  onChange: (next: Gender | null) => void;
}) {
  const options: Array<{value: Gender; emoji: string; label: string}> = [
    {value: Gender.Female, emoji: '👩', label: '여자'},
    {value: Gender.Male, emoji: '👨', label: '남자'},
  ];

  return (
    <View>
      <Text className="text-sm text-gray-500">성별</Text>
      <View className="h-4" />
      <View className="flex-row gap-2">
        {options.map(option => {
          const checked = gender === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(checked ? null : option.value)}
              accessibilityRole="radio"
              accessibilityState={{selected: checked}}
              accessibilityLabel={option.label}
              style={styles.half}
              className={
                checked
                  ? 'border-primary-500 bg-primary-50 h-[88px] items-center justify-center rounded-lg border'
                  : 'h-[88px] items-center justify-center rounded-lg border border-gray-300'
              }>
              <View className="items-center gap-2">
                <Text className="text-2xl">{option.emoji}</Text>
                <Text className="text-sm text-gray-700">{option.label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  half: {flex: 1},
});
