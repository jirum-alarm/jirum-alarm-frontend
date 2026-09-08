import React, {useMemo, useState} from 'react';
import {FlatList, Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import ArrowRight from '@/shared/components/icons/ArrowRight';

import {buildBirthYearOptions} from '../lib/birth-year';

/**
 * 출생년도 선택. web `entities/user/ui/BirthYearSelect`(자작 `Select`).
 *
 * RN 엔 `<select>` 가 없다. 새 의존성(picker 패키지) 없이 `Modal` + `FlatList`
 * 로 고른다 — 101개 항목이라 시트가 오히려 web 드롭다운보다 고르기 쉽다.
 */
export default function BirthYearSelect({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (next: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const options = useMemo(() => buildBirthYearOptions(), []);

  const selected = options.find(option => option.value === (value ?? null));
  // 정적 스타일은 StyleSheet, 동적(safe area)만 여기서 합친다.
  const sheetStyle = [
    styles.sheet,
    {paddingBottom: Math.max(insets.bottom, 12)},
  ];

  return (
    <View>
      <Text className="pb-2 text-sm text-gray-500">출생년도</Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="출생년도 선택"
        style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}
        className="flex-row items-center justify-between border-b border-b-gray-400 px-2 py-2.5">
        <Text
          className={
            value ? 'text-base text-gray-900' : 'text-base text-gray-400'
          }>
          {selected?.text ?? '출생년도'}
        </Text>
        {/* 아래쪽을 가리키는 아이콘이 없어 오른쪽 화살표를 쓴다(행 이동과 같은 신호). */}
        <ArrowRight width={20} height={20} />
      </Pressable>

      <Modal
        transparent
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setOpen(false)}>
          <Pressable onPress={() => {}}>
            <View className="rounded-t-[20px] bg-white" style={sheetStyle}>
              <View className="border-b border-gray-100 px-5 py-4">
                <Text className="text-base font-semibold text-gray-900">
                  출생년도
                </Text>
              </View>
              <FlatList
                data={options}
                keyExtractor={option => option.value ?? 'none'}
                renderItem={({item}) => {
                  const isSelected = item.value === (value ?? null);
                  return (
                    <Pressable
                      onPress={() => {
                        onChange(item.value);
                        setOpen(false);
                      }}
                      accessibilityRole="button"
                      accessibilityState={{selected: isSelected}}
                      accessibilityLabel={item.text}
                      style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}
                      className="px-5 py-3">
                      <Text
                        className={
                          isSelected
                            ? 'text-primary-700 text-base font-semibold'
                            : 'text-base text-gray-700'
                        }>
                        {item.text}
                      </Text>
                    </Pressable>
                  );
                }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // 시트 높이는 화면의 절반 남짓. 목록이 101개라 스크롤이 필요하다.
  sheet: {maxHeight: 420},
});
