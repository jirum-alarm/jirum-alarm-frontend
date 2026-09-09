import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {MAX_KEYWORD_COUNT} from '@/entities/mypage';
import {ThemeQueries} from '@/entities/theme';
import type {TabStackParamList} from '@/navigations/tab/types';
import {CircleXIcon} from '@/shared/components/icons';
import Close from '@/shared/components/icons/Close';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import Button from '@/shared/components/ui/Button';
import TextField from '@/shared/components/ui/Text/TextField';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import PriceDropSwitch from '@/features/mypage/ui/PriceDropSwitch';
import StackHeader from '@/features/mypage/ui/StackHeader';
import {FORM_CTA_BOTTOM} from '@/features/mypage/ui/Rows';
import {SubscribedThemeRow} from '@/features/mypage/ui/ThemeCards';
import {useKeywordViewModel} from '@/features/mypage/model/useKeywordViewModel';
import {useThemeSubscription} from '@/features/mypage/model/useThemeSubscription';
import {KEYWORD_HELPER_TEXT} from '@/features/mypage/lib/validation';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.MYPAGE_KEYWORD
>;

/**
 * 키워드 알림. web `/mypage/keyword`
 * (KeywordInput + MySubscribedThemes + KeywordList).
 *
 * ★web 은 등록 버튼을 `fixed bottom-[var(--bottom-nav-padding)]` 로 화면 하단에
 * 붙인다. 앱은 `KeyboardStickyView` 로 키보드 위에 붙인다 — 입력창에 오토포커스가
 * 걸려 있어 키보드가 늘 떠 있고, 고정 위치면 버튼이 키보드에 가려진다.
 */
export default function KeywordScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const bottomClip = useHiddenTabBarClipPadding();
  const {
    keywords,
    isPending,
    isError,
    refetch,
    value,
    error,
    canSubmit,
    handleChange,
    reset,
    submit,
    removeKeyword,
    updatePriceDropOnly,
    isTogglingPriceDrop,
  } = useKeywordViewModel();

  return (
    <View className="flex-1 bg-white">
      <StackHeader title="키워드 알림" onBack={navigation.goBack} />
      <KeyboardAwareScrollView
        className="flex-1 bg-white"
        bottomOffset={88}
        keyboardShouldPersistTaps="handled">
        <View className="px-5 py-6">
          <TextField
            value={value}
            onChangeText={handleChange}
            placeholder="키워드를 입력해주세요."
            autoFocus
            returnKeyType="done"
            onSubmitEditing={submit}
            error={error}
            helperText={KEYWORD_HELPER_TEXT}
            suffixIcon={
              !!value && (
                <Pressable
                  onPress={reset}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="입력 지우기">
                  <CircleXIcon />
                </Pressable>
              )
            }
          />
          <View className="h-8" />

          {/* 구독한 묶음 — web MySubscribedThemes(키워드와 한 화면에서 관리) */}
          <SubscribedThemes
            onOpenThemes={() => navigation.push(tabStackNavigations.THEMES)}
            // ★`title` 파라미터는 넘기지 않는다 — 상세 헤더는 web 과 같이
            // 항상 '알림 묶음' 이다. 진입 경로마다 헤더가 달라지면 같은 화면이
            // 두 개처럼 보인다(묶음 이름은 본문 맨 위에 이미 있다).
            onOpenTheme={themeId =>
              navigation.push(tabStackNavigations.THEME_DETAIL, {themeId})
            }
          />

          {/* 내 키워드 — web KeywordList */}
          <View>
            <View className="flex-row justify-between">
              <Text className="text-sm font-medium text-gray-900">
                나의 지름 키워드
              </Text>
              <Text className="text-sm text-gray-900">
                <Text className="text-primary-700">{keywords.length}</Text>
                {`/${MAX_KEYWORD_COUNT}`}
              </Text>
            </View>
            <Text className="mt-1 text-xs text-gray-500">
              {'‘가격 하락 알림’을 켜면 평소 시세보다 싸게 뜬 딜만 알려드려요'}
            </Text>
          </View>
          <View className="h-4" />

          {/* ★스위치 열 제목을 한 번만 둔다 — 행마다 붙이면 문구가 반복돼
              키워드가 묻힌다. 위 안내문이 이미 뜻을 설명한다. */}
          {!isError && !isPending && keywords.length > 0 ? (
            <View className="flex-row justify-end px-2 pb-1">
              <Text className="text-xs text-gray-500">가격 하락 알림</Text>
            </View>
          ) : null}

          {isError ? (
            <SectionErrorRow label="키워드" onRetry={refetch} />
          ) : isPending ? (
            <View className="items-center py-8">
              <ActivityIndicator size="small" color="#667085" />
            </View>
          ) : (
            keywords.map(keyword => (
              <View
                key={keyword.id}
                className="border-b border-gray-200 px-2 py-3">
                <View className="w-full flex-row items-center justify-between gap-3">
                  <Text
                    className="min-w-0 text-sm text-gray-900"
                    numberOfLines={1}
                    style={styles.grow}>
                    {keyword.keyword}
                  </Text>
                  <PriceDropSwitch
                    value={keyword.priceDropOnly ?? false}
                    disabled={isTogglingPriceDrop}
                    onChange={next => updatePriceDropOnly(keyword.id, next)}
                    showLabel={false}
                  />
                  <Pressable
                    onPress={() => removeKeyword(keyword.id)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="키워드 삭제"
                    className="shrink-0 p-2"
                    style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
                    {/* web 은 gray-400(AA 미달) — gray-500 을 쓴다. */}
                    <Close width={20} height={20} color="#667085" />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </KeyboardAwareScrollView>
      <KeyboardStickyView offset={{closed: -insets.bottom, opened: 0}}>
        <View
          className="bg-white px-5 pt-6"
          style={{paddingBottom: FORM_CTA_BOTTOM + bottomClip}}>
          <Button onPress={submit} disabled={!canSubmit}>
            등록
          </Button>
        </View>
      </KeyboardStickyView>
    </View>
  );
}

/**
 * 내가 구독한 묶음. web `MySubscribedThemes` — 구독한 게 없으면 아무것도 안 그린다.
 * ★목록·구독 조회가 실패해도 키워드 화면 전체를 에러로 만들지 않는다(web 은
 * Suspense 로 감싸 부분 실패를 감췄다). 조용히 비운다.
 */
function SubscribedThemes({
  onOpenThemes,
  onOpenTheme,
}: {
  onOpenThemes: () => void;
  onOpenTheme: (themeId: string) => void;
}) {
  const {data: themes} = useQuery(ThemeQueries.themes());
  const {data: subscribedIds} = useQuery(ThemeQueries.mySubscribedIds());
  const {unsubscribe, isPending} = useThemeSubscription();

  const subscribed = new Set(subscribedIds ?? []);
  const mine = (themes ?? []).filter(theme => subscribed.has(Number(theme.id)));

  if (mine.length === 0) return null;

  return (
    <View className="pb-6">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-gray-900">구독한 묶음</Text>
        <Pressable
          onPress={onOpenThemes}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="묶음 더보기"
          style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
          <Text className="text-xs text-gray-500">묶음 더보기</Text>
        </Pressable>
      </View>
      <View className="gap-2">
        {mine.map(theme => (
          <SubscribedThemeRow
            key={theme.id}
            theme={theme}
            isPending={isPending}
            onPress={() => onOpenTheme(theme.id)}
            onUnsubscribe={() => unsubscribe(Number(theme.id))}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grow: {flex: 1},
});
