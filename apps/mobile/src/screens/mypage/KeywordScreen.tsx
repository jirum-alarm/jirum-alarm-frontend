import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {MAX_KEYWORD_COUNT} from '@/entities/mypage';
import {ThemeQueries} from '@/entities/theme';
import {HomeQueries} from '@/entities/home/api/home.queries';
import type {TabStackParamList} from '@/navigations/tab/types';
import {CircleXIcon} from '@/shared/components/icons';
import Close from '@/shared/components/icons/Close';
import PressableScale from '@/shared/components/PressableScale';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import Button from '@/shared/components/ui/Button';
import TextField from '@/shared/components/ui/Text/TextField';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import KeywordOptions from '@/features/mypage/ui/KeywordOptions';
import PriceDropSwitch from '@/features/mypage/ui/PriceDropSwitch';
import StackHeader from '@/features/mypage/ui/StackHeader';
import {FORM_CTA_BOTTOM} from '@/features/mypage/ui/Rows';
import {SubscribedThemeRow} from '@/features/mypage/ui/ThemeCards';
import {useKeywordViewModel} from '@/features/mypage/model/useKeywordViewModel';
import {useThemeSubscription} from '@/features/mypage/model/useThemeSubscription';
import {KEYWORD_HELPER_TEXT} from '@/features/mypage/lib/validation';
import {useColors} from '@/shared/theme/useColors';

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
  const c = useColors();
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
    addDirect,
    isAdding,
    removeKeyword,
    updatePriceDropOnly,
    isTogglingPriceDrop,
  } = useKeywordViewModel();

  return (
    <View className="flex-1 bg-white">
      <StackHeader title="키워드 알림" onBack={navigation.goBack} />
      <KeyboardAwareScrollView
        className="flex-1 bg-white"
        // 포커스 칸을 키보드 위 이만큼 띄운다 — 하단 등록 바(pt-6 24 + 버튼 48 + 20 = 92)보다 커야 칸이 바 뒤에 안 숨는다.
        bottomOffset={120}
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
                <Text className="text-primary-800">{keywords.length}</Text>
                {`/${MAX_KEYWORD_COUNT}`}
              </Text>
            </View>
            <Text className="mt-1 text-xs text-gray-500">
              {
                '‘가격 하락 알림’을 켜면 평소 시세보다 싸게 뜬 딜만, ‘알림 조건’에서 제외할 단어와 가격 범위를 정할 수 있어요'
              }
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
              <ActivityIndicator size="small" className="text-gray-500" />
            </View>
          ) : keywords.length === 0 ? (
            <EmptyKeywords onPick={addDirect} disabled={isAdding} />
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
                    accessibilityLabel={`${keyword.keyword} 삭제`}
                    className="shrink-0 p-2"
                    style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
                    {/* web 은 gray-400(AA 미달) — gray-500 을 쓴다. */}
                    <Close width={20} height={20} color={c.gray[500]} />
                  </Pressable>
                </View>
                <KeywordOptions keyword={keyword} />
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

  // ★구독이 0개여도 들어갈 길은 남긴다 — 예전엔 섹션째 사라져 신규 사용자는
  // 원탭으로 묶음 알림을 받는 기능이 있는지조차 몰랐다.
  if (mine.length === 0) {
    return (
      <View className="pb-6">
        <PressableScale
          onPress={onOpenThemes}
          scaleTo={0.98}
          accessibilityRole="button"
          accessibilityLabel="관심사 알림 둘러보기"
          className="flex-row items-center gap-x-3 rounded-xl bg-gray-50 px-4 py-3.5">
          <View className="min-w-0 flex-1">
            <Text className="text-sm font-semibold text-gray-900">
              관심사 알림 둘러보기
            </Text>
            <Text className="mt-0.5 text-xs text-gray-500">
              키워드를 몰라도, 관심사 하나로 관련 핫딜을 한 번에 받아요
            </Text>
          </View>
          <Text className="text-lg text-gray-500">›</Text>
        </PressableScale>
      </View>
    );
  }

  return (
    <View className="pb-6">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-gray-900">
          받고 있는 관심사 알림
        </Text>
        <Pressable
          onPress={onOpenThemes}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="관심사 더 둘러보기"
          style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
          <Text className="text-xs text-gray-500">더 둘러보기</Text>
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

/**
 * 키워드 0개 — 빈 목록 대신 "무엇을 하면 되는지" 를 보여준다. 인기 키워드를 누르면 바로 등록된다
 * (입력창을 거치지 않는다). 알림 탭·검색에서 넘어온 신규 사용자가 빈 화면에 서 있던 자리다.
 */
function EmptyKeywords({
  onPick,
  disabled,
}: {
  onPick: (keyword: string) => void;
  disabled: boolean;
}) {
  const {data} = useQuery(HomeQueries.recommendedKeywords());
  const chips = (data ?? []).slice(0, 8);

  return (
    <View className="items-center py-8">
      <Text className="text-base font-semibold text-gray-900">
        아직 등록한 키워드가 없어요
      </Text>
      <Text className="mt-1 text-center text-sm text-gray-500">
        {'갖고 싶은 상품 이름을 등록하면\n새 핫딜이 올라올 때 바로 알려드려요'}
      </Text>
      {chips.length > 0 ? (
        <>
          <Text className="mt-6 text-xs text-gray-500">
            요즘 많이 받는 키워드
          </Text>
          <View className="mt-2 flex-row flex-wrap justify-center gap-2">
            {chips.map(keyword => (
              <PressableScale
                key={keyword}
                disabled={disabled}
                onPress={() => onPick(keyword)}
                accessibilityRole="button"
                accessibilityLabel={`${keyword} 키워드 알림 등록`}
                hitSlop={{top: 4, bottom: 4}}
                className="flex-row items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2">
                <Text className="text-sm font-medium text-gray-900">
                  {keyword}
                </Text>
                <Text className="text-sm text-gray-500">+</Text>
              </PressableScale>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grow: {flex: 1},
});
