import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';

import {MyPageQueries} from '@/entities/mypage';
import type {TabStackParamList} from '@/navigations/tab/types';
import Button from '@/shared/components/ui/Button';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import CategoryCheckboxGroup from '@/features/mypage/ui/CategoryCheckboxGroup';
import StackHeader from '@/features/mypage/ui/StackHeader';
import {FORM_CTA_BOTTOM} from '@/features/mypage/ui/Rows';
import {useUpdateCategories} from '@/features/mypage/model/mutations';
import {MAX_SELECTION_COUNT} from '@/features/mypage/lib/categories';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.MYPAGE_CATEGORIES
>;

/**
 * 관심 카테고리 수정. web `/mypage/categories`(CategoriesForm).
 *
 * ★web `handleCheckChange` 의 `if (checked && !isMaxSelection()) return;` —
 * 5개를 다 골랐으면 **추가 선택만** 막고 해제는 허용한다. 그 규칙을 그대로 옮긴다
 * (반대로 짜면 5개에서 아무것도 못 바꾸는 화면이 된다).
 */
export default function CategoriesScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const bottomClip = useHiddenTabBarClipPadding();
  const {data: me, isPending, isError, refetch} = useQuery(MyPageQueries.me());

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!me || touched) return;
    setSelected(new Set(me.favoriteCategories ?? []));
  }, [me, touched]);

  const {mutate, isPending: isSaving} = useUpdateCategories(navigation.goBack);

  // ★위 PersonalScreen 과 같은 이유로 safe area 를 직접 더한다(실측 32pt).
  const contentStyle = [
    styles.content,
    {paddingBottom: FORM_CTA_BOTTOM + insets.bottom + bottomClip},
  ];

  const toggle = (value: number, next: boolean) => {
    setTouched(true);
    setSelected(prev => {
      if (next && prev.size >= MAX_SELECTION_COUNT) return prev;
      const copy = new Set(prev);
      if (next) copy.add(value);
      else copy.delete(value);
      return copy;
    });
  };

  return (
    <View className="flex-1 bg-white">
      <StackHeader title="관심 카테고리 수정" onBack={navigation.goBack} />
      {isError ? (
        <SectionErrorRow label="관심 카테고리" onRetry={refetch} />
      ) : isPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#667085" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={contentStyle}>
          <View className="px-5 pt-6" style={styles.grow}>
            <Text className="pb-7 text-sm text-gray-700">
              {'내 관심사는 최대 5개까지\n선택할 수 있어요.'}
            </Text>
            <CategoryCheckboxGroup selected={selected} onToggle={toggle} />
            <View className="justify-end pt-10" style={styles.grow}>
              <Button
                onPress={() =>
                  mutate({
                    favoriteCategories: [...selected].sort((a, b) => a - b),
                  })
                }
                // ★0개는 저장할 게 없다 — 형제 화면(키워드 `등록`)은 이미
                // 비활성 회색을 쓰는데 여기만 활성 초록이었다.
                disabled={isSaving || selected.size === 0}
                loading={isSaving}>
                {`저장 (${selected.size}/${MAX_SELECTION_COUNT})`}
              </Button>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {flexGrow: 1},
  grow: {flex: 1},
});
