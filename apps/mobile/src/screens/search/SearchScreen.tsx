import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import {SystemBars} from 'react-native-edge-to-edge';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useRecentKeywords} from '@/features/search/model/useRecentKeywords';
import {useSearchFilters} from '@/features/search/model/useSearchFilters';
import {useSearchSuggestions} from '@/features/search/model/useSearchSuggestions';
import type {
  SearchStackParamList,
  TabStackParamList,
} from '@/navigations/tab/types';
import {
  searchStackNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';
import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';

import SearchHeader, {SEARCH_HEADER_HEIGHT} from './ui/SearchHeader';
import SearchInitial from './ui/SearchInitial';
import SearchResults from './ui/SearchResults';
import SuggestionList from './ui/SuggestionList';

/**
 * 검색 화면. web: app/(desktop-ready)/search (layout + SearchPage)
 *
 * ★2026-09-08 까지 이 화면만 웹뷰였다(`StackWebView path="/search"`).
 * 앱의 다른 화면이 전부 네이티브가 된 뒤로는 검색만 폰트·터치·스크롤이
 * 달라서 앱 안에서 유일하게 이질적이었다.
 *
 * ★web 은 `?keyword=` 유무로 초기화면/결과를 가른다. 앱엔 URL 이 없으니
 * **제출된 검색어**(submitted)가 그 자리다. 입력값(input)과 따로 두는 것도
 * web 과 같다 — 타이핑 중에 결과가 바뀌면 안 된다.
 *
 * ★web 의 `isJirumAlarmApp` 분기(입력을 비웠을 때 URL 을 그대로 두는 것)는
 * 웹뷰에서 `router.replace` 가 히스토리를 어지럽히던 회피책이다. 네이티브는
 * 상태를 직접 들고 있으므로 web 의 기본 동작(입력을 비우면 초기화면)을 따른다.
 */
type Nav = NativeStackNavigationProp<
  SearchStackParamList,
  typeof searchStackNavigations.HOME
>;

export default function SearchScreen({
  navigation,
  route,
}: {
  navigation: Nav;
  route: {params?: {keyword?: string}};
}) {
  const insets = useSafeAreaInsets();
  const bottomInset = useHiddenTabBarClipPadding();
  const inputRef = useRef<TextInput>(null);

  /** 딥링크(`/search?keyword=…`)로 들어오면 그 검색어로 시작한다. */
  const initialKeyword = route.params?.keyword?.trim() ?? '';

  const [input, setInput] = useState(initialKeyword);
  const [submitted, setSubmitted] = useState(initialKeyword);
  /** 입력창이 포커스돼 제안어를 열어야 하는지. */
  const [isEditing, setIsEditing] = useState(false);

  const recent = useRecentKeywords();
  const filterController = useSearchFilters();
  const {resetFilters} = filterController;

  const {suggestions, hasPrefix} = useSearchSuggestions({
    value: input,
    enabled: isEditing,
  });
  const showSuggestions = isEditing && hasPrefix && suggestions.length > 0;

  /**
   * 딥링크로 받은 검색어도 최근 검색어에 남는다(web 은 searchParams 변화마다
   * `setRecentKeyord` 를 부른다 — 같은 규칙).
   */
  useEffect(() => {
    if (initialKeyword) recent.push(initialKeyword);
    // 최초 진입 1회. recent.push 는 useCallback 이라 참조가 안정적이지만,
    // 의존성에 넣으면 hydrate 후 재실행돼 순서가 흔들린다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKeyword]);

  const submit = useCallback(
    (keyword: string) => {
      const trimmed = keyword.trim();
      if (!trimmed) return;
      setInput(trimmed);
      setSubmitted(trimmed);
      recent.push(trimmed);
      // ★새 검색 = 새 의도. 필터·정렬을 리셋한다(web 2026-07-22 결정 6A) —
      // 잔존 필터로 0건이 되는 함정을 막는다.
      resetFilters();
      setIsEditing(false);
      inputRef.current?.blur();
    },
    [recent, resetFilters],
  );

  const handleChangeText = useCallback((text: string) => {
    setInput(text);
    setIsEditing(true);
    // 입력을 다 지우면 초기화면으로. web(앱 분기가 아닌 쪽)도 `/search` 로
    // 되돌린다 — 결과를 남겨두면 입력창과 화면이 어긋난다.
    if (text.length === 0) setSubmitted('');
  }, []);

  const handleClear = useCallback(() => {
    setInput('');
    setSubmitted('');
    setIsEditing(true);
    inputRef.current?.focus();
  }, []);

  const handlePressProduct = useCallback(
    (id: number) => {
      navigation.push(tabStackNavigations.DETAIL, {path: `/products/${id}`});
    },
    [navigation],
  );

  /**
   * 키워드 알림 등록으로. 이 라우트는 **검색 스택엔 없고 탭 스택에 있다** —
   * 부모로 올려 push 한다(그래야 뒤로가기로 검색 한 판이 그대로 남는다).
   *
   * ⚠️react-navigation 은 처리 못 하는 navigate 를 던지지 않는다(콘솔 에러만).
   * 그래서 부모가 없을 때 조용히 무시되는 경로를 만들지 않도록 옵셔널로 받는다.
   */
  const handlePressKeywordRegister = useCallback(() => {
    navigation
      .getParent<NativeStackNavigationProp<TabStackParamList>>()
      ?.push(tabStackNavigations.MYPAGE_KEYWORD);
  }, [navigation]);

  return (
    <View className="flex-1 bg-white" style={{paddingTop: insets.top}}>
      {/* 흰 배경이라 상태바 글씨는 어둡게(발견 탭과 같다). */}
      <SystemBars style="dark" hidden={false} />

      <SearchHeader
        ref={inputRef}
        value={input}
        onChangeText={handleChangeText}
        onSubmit={() => submit(input)}
        onClear={handleClear}
        onBack={navigation.goBack}
        onFocus={() => setIsEditing(true)}
        // web: 결과를 들고 진입할 때(공유 URL·딥링크)는 자동 포커스 금지.
        autoFocus={!initialKeyword}
      />

      {submitted ? (
        <SearchResults
          keyword={submitted}
          controller={filterController}
          onPressProduct={handlePressProduct}
          onPressKeywordRegister={handlePressKeywordRegister}
          bottomInset={bottomInset}
        />
      ) : (
        <SearchInitial
          recentKeywords={recent.keywords}
          onSelectKeyword={submit}
          onRemoveKeyword={recent.remove}
          onClearKeywords={recent.clear}
          onPressProduct={handlePressProduct}
          bottomInset={bottomInset}
        />
      )}

      {/*
        ★제안어 목록은 본문의 **형제**로, 헤더 아래에 절대배치한다.
        헤더 안에 넣으면 Android 에서 형제(본문)가 나중에 그려져 목록이 그 아래로
        깔린다(zIndex 만으로는 안정적이지 않다). 그리는 순서를 마지막으로 두면
        두 플랫폼에서 같이 위에 온다.
      */}
      {showSuggestions ? (
        <View
          style={[
            styles.suggestions,
            {top: insets.top + SEARCH_HEADER_HEIGHT},
          ]}>
          <SuggestionList
            suggestions={suggestions}
            highlight={input}
            onSelect={submit}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  /** 헤더 아래에 겹쳐 그린다. top 은 safe area 에 따라 달라 호출부에서 더한다. */
  suggestions: {position: 'absolute', left: 0, right: 0},
});
