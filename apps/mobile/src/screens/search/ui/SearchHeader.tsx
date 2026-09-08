import React, {forwardRef} from 'react';
import {Pressable, StyleSheet, TextInput, View} from 'react-native';

import CaretLeft from '@/shared/components/icons/caret_left';
import CircleX from '@/shared/components/icons/circle_x';
import SearchIcon from '@/shared/components/icons/search';

/** web PageHeader 와 같은 높이(h-14). 내정보 StackHeader·알림 헤더와도 같은 값. */
export const SEARCH_HEADER_HEIGHT = 56;

/**
 * 검색 화면 상단 바. web: app/(desktop-ready)/search/layout.tsx 의
 * MobileSearchLayout(PageHeader + BackButton + SearchInput).
 *
 * ★부모(레이아웃)를 같이 옮겼다 — 입력창만 옮기면 뒤로가기가 사라진다.
 * 이 스택은 `headerShown: false` 라 헤더를 화면이 직접 그린다.
 *
 * ★`TextField`(shared)를 쓰지 않는다 — 그 컴포넌트의 variant 는 밑줄
 * (standard) 하나뿐이라 web 의 회색 박스 검색창이 안 나온다.
 *
 * ★web `useInputHideOnScroll`(아래로 스크롤하면 검색바 숨김)은 옮기지 않았다.
 * web 은 헤더가 문서와 같이 스크롤되는 sticky 라 필요했지만, 앱 헤더는 화면
 * 밖 고정이라 목록을 가리지 않는다. 스크롤로 헤더를 숨기려면 결과 그리드
 * (`CurationGrid`)에 onScroll 을 뚫어야 하는데, 그 파일은 홈·발견·큐레이션이
 * 함께 쓰는 공용이라 이 작업 범위에서 건드리지 않는다.
 */
const SearchHeader = forwardRef<
  TextInput,
  {
    value: string;
    onChangeText: (text: string) => void;
    onSubmit: () => void;
    onClear: () => void;
    onBack: () => void;
    onFocus: () => void;
    /** 결과 화면(키워드 존재)에서 진입할 때는 자동 포커스를 주지 않는다. */
    autoFocus: boolean;
  }
>(function SearchHeader(
  {value, onChangeText, onSubmit, onClear, onBack, onFocus, autoFocus},
  ref,
) {
  return (
    <View className="bg-white px-5">
      <View
        className="flex-row items-center gap-2"
        style={{height: SEARCH_HEADER_HEIGHT}}>
        {/*
          헤더 아이콘 버튼은 PressableScale 을 쓰지 않는다 — 눌러 축소되면
          옆 입력창까지 흔들려 보인다(런북: 행과 버튼은 다르다).
        */}
        <Pressable
          onPress={onBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
          <CaretLeft />
        </Pressable>

        {/* web: bg-gray-50 rounded-sm h-10, 왼쪽 돋보기 + 오른쪽 지우기 */}
        <View
          className="flex-row items-center rounded-md bg-gray-50 pl-3"
          style={styles.box}>
          <SearchIcon width={20} height={20} color="#98A2B3" />
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            onFocus={onFocus}
            onSubmitEditing={onSubmit}
            // ★결과 화면에서는 autoFocus 금지 — 포커스가 걸리면 제안어 목록이
            // 결과·필터를 가리고 키보드가 올라온다(web 운영 실측 주석과 같은 이유).
            autoFocus={autoFocus}
            placeholder="핫딜 제품을 검색해 주세요"
            placeholderTextColor="#98A2B3"
            returnKeyType="search"
            // 검색어는 사람 이름이 아니다 — 자동 대문자·교정이 켜지면 영문
            // 모델명이 엉뚱하게 바뀐다(web 도 전부 off).
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            selectionColor="#000000"
            className="flex-1 text-sm text-gray-900"
            style={styles.input}
            accessibilityLabel="검색어 입력"
          />
          {value.length > 0 ? (
            <Pressable
              onPress={onClear}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="입력 지우기"
              className="px-2"
              style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
              <CircleX width={24} height={24} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
});

export default SearchHeader;

const styles = StyleSheet.create({
  /** flex·height 는 style 로 준다 — NativeWind 크기 클래스는 이 자리에서 폭이 0 이 된 전례가 있다. */
  box: {flex: 1, height: 40},
  /** RN 은 기본 padding 이 있어 40px 박스에서 글자가 아래로 밀린다. */
  input: {paddingVertical: 0, paddingHorizontal: 8},
});
