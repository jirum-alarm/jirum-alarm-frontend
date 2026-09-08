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
import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import CategoryCheckboxGroup from '@/features/mypage/ui/CategoryCheckboxGroup';
import StackHeader from '@/features/mypage/ui/StackHeader';
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
  const bottomClip = useHiddenTabBarClipPadding();
  const {data: me, isPending, isError, refetch} = useQuery(MyPageQueries.me());

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!me || touched) return;
    setSelected(new Set(me.favoriteCategories ?? []));
  }, [me, touched]);

  const {mutate, isPending: isSaving} = useUpdateCategories(navigation.goBack);

  const contentStyle = [styles.content, {paddingBottom: 32 + bottomClip}];

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
                disabled={isSaving}
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
