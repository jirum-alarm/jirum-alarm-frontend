import React, {createContext, useContext} from 'react';
import {
  Text as RNText,
  TextInput as RNTextInput,
  StyleSheet,
  useColorScheme,
  type StyleProp,
  type TextStyle,
} from 'react-native';

import {dark} from '@/shared/theme/palette';

/**
 * 앱의 모든 Text·TextInput 은 이걸 쓴다(react-native 에서 직접 import 하지 않는다).
 *
 * 1) 글자 크기 확대 상한 1.3배 — 고정 높이 배지(h-[22px])·카드가 200% 에서 잘렸다.
 *    1.3 이면 text-xs 줄높이 16 → 20.8 로 22 안에 든다.
 * 2) Pretendard(web 과 같은 글꼴) — RN 은 커스텀 글꼴에 fontWeight 만 줘서는 굵기별
 *    파일을 골라 주지 않는다. 그래서 `font-bold` → Pretendard-Bold 처럼 파일을 직접 고른다.
 *
 * 3) 다크모드 기본 글자색 — RN Text·TextInput 은 색을 안 주면 **검정**이라 다크 바탕에서 사라진다.
 *    색 클래스·style.color 가 없는 최상위 Text 에만 밝은 색을 깐다(라이트는 손대지 않는다 = 검정 그대로).
 *    중첩 Text 는 부모 색을 물려받아야 하므로 건너뛴다.
 *
 * ★React 19 는 함수 컴포넌트의 defaultProps 를 무시해서 `Text.defaultProps` 로는 전역
 * 기본값을 줄 수 없다 — 래퍼가 유일한 길이다.
 */
export const MAX_FONT_SIZE_MULTIPLIER = 1.3;

const FAMILY_BY_WEIGHT: Record<string, string> = {
  '100': 'Pretendard-Thin',
  '200': 'Pretendard-ExtraLight',
  '300': 'Pretendard-Light',
  '400': 'Pretendard-Regular',
  normal: 'Pretendard-Regular',
  '500': 'Pretendard-Medium',
  '600': 'Pretendard-SemiBold',
  '700': 'Pretendard-Bold',
  bold: 'Pretendard-Bold',
  '800': 'Pretendard-ExtraBold',
  '900': 'Pretendard-Black',
};

const WEIGHT_BY_CLASS: Record<string, string> = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

// 접두사(active:·pc: 등) 없는 굵기 클래스만 본다. 마지막 것이 이긴다(CSS 와 같다).
const WEIGHT_CLASS_RE =
  /(?:^|\s)font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)(?=\s|$)/g;

/**
 * 쓸 글꼴 파일. 호출부가 글꼴을 직접 정했으면(`font-pretendard-*`·style.fontFamily) 손대지 않는다.
 * className 은 NativeWind 가 아래 RN Text 에서 풀기 때문에 여기선 문자열로 읽는다.
 */
export function resolveFontFamily(
  className: string | undefined,
  style: StyleProp<TextStyle>,
): string | undefined {
  const flat = StyleSheet.flatten(style);
  if (flat?.fontFamily) return undefined;
  if (className && /(?:^|\s)font-pretendard/.test(className)) return undefined;

  let weight = flat?.fontWeight ? String(flat.fontWeight) : undefined;
  if (!weight && className) {
    for (const m of className.matchAll(WEIGHT_CLASS_RE)) {
      weight = WEIGHT_BY_CLASS[m[1]];
    }
  }
  return FAMILY_BY_WEIGHT[weight ?? '400'] ?? FAMILY_BY_WEIGHT['400'];
}

// 색 유틸리티 클래스(text-gray-900·text-green-600·text-white·text-[#ffb200] …). text-sm·text-[13px]·text-2xl·text-center 는 아니다.
const COLOR_CLASS_RE =
  /(?:^|\s)text-(?:white|black|kakao|link|fixed-white|\[#|[a-z]+-\d)/;

/** 이 Text 가 다른 Text 안에 있나 — 안에 있으면 부모 색을 물려받게 둔다. */
const NestedText = createContext(false);

/**
 * 다크모드에서 색이 정해지지 않은 글자에 깔 색. 라이트·중첩·색 지정이면 undefined(아무것도 안 깐다).
 * ⚠️style 로 넣으면 NativeWind className 보다 우선하므로 "색이 없을 때만" 넣어야 한다.
 */
export function useDefaultTextColor(
  className: string | undefined,
  style: StyleProp<TextStyle>,
  nested = false,
): string | undefined {
  const isDark = useColorScheme() === 'dark';
  if (!isDark || nested || hasTextColor(className, style)) return undefined;
  return dark.gray[900];
}

/** 호출부가 글자색을 정했나(색 클래스 또는 style.color). */
export function hasTextColor(
  className: string | undefined,
  style: StyleProp<TextStyle>,
): boolean {
  if (className && COLOR_CLASS_RE.test(className)) return true;
  return !!StyleSheet.flatten(style)?.color;
}

/** 값이 있는 키만 담는다 — undefined 키가 className 의 같은 속성을 덮지 않게. */
function baseStyle(fontFamily?: string, color?: string): TextStyle | null {
  if (!fontFamily && !color) return null;
  return {...(fontFamily ? {fontFamily} : null), ...(color ? {color} : null)};
}

export function Text({
  className,
  style,
  maxFontSizeMultiplier = MAX_FONT_SIZE_MULTIPLIER,
  ...rest
}: React.ComponentPropsWithRef<typeof RNText>) {
  const fontFamily = resolveFontFamily(className, style);
  const nested = useContext(NestedText);
  const color = useDefaultTextColor(className, style, nested);
  const base = baseStyle(fontFamily, color);
  const text = (
    <RNText
      {...rest}
      className={className}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={base ? [base, style] : style}
    />
  );
  return nested ? (
    text
  ) : (
    <NestedText.Provider value={true}>{text}</NestedText.Provider>
  );
}

export function TextInput({
  className,
  style,
  maxFontSizeMultiplier = MAX_FONT_SIZE_MULTIPLIER,
  ...rest
}: React.ComponentPropsWithRef<typeof RNTextInput>) {
  const fontFamily = resolveFontFamily(className, style);
  const color = useDefaultTextColor(className, style);
  const base = baseStyle(fontFamily, color);
  return (
    <RNTextInput
      {...rest}
      className={className}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={base ? [base, style] : style}
    />
  );
}

/** `useRef<TextInput>(null)` 처럼 인스턴스 타입으로 쓰던 자리를 그대로 두기 위해. */
export type TextInput = RNTextInput;
export type Text = RNText;
