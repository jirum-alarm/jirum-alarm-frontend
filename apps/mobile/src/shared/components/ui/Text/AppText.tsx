import React from 'react';
import {
  Text as RNText,
  TextInput as RNTextInput,
  StyleSheet,
  type StyleProp,
  type TextStyle,
} from 'react-native';

/**
 * 앱의 모든 Text·TextInput 은 이걸 쓴다(react-native 에서 직접 import 하지 않는다).
 *
 * 1) 글자 크기 확대 상한 1.3배 — 고정 높이 배지(h-[22px])·카드가 200% 에서 잘렸다.
 *    1.3 이면 text-xs 줄높이 16 → 20.8 로 22 안에 든다.
 * 2) Pretendard(web 과 같은 글꼴) — RN 은 커스텀 글꼴에 fontWeight 만 줘서는 굵기별
 *    파일을 골라 주지 않는다. 그래서 `font-bold` → Pretendard-Bold 처럼 파일을 직접 고른다.
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

export function Text({
  className,
  style,
  maxFontSizeMultiplier = MAX_FONT_SIZE_MULTIPLIER,
  ...rest
}: React.ComponentPropsWithRef<typeof RNText>) {
  const fontFamily = resolveFontFamily(className, style);
  return (
    <RNText
      {...rest}
      className={className}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={fontFamily ? [{fontFamily}, style] : style}
    />
  );
}

export function TextInput({
  className,
  style,
  maxFontSizeMultiplier = MAX_FONT_SIZE_MULTIPLIER,
  ...rest
}: React.ComponentPropsWithRef<typeof RNTextInput>) {
  const fontFamily = resolveFontFamily(className, style);
  return (
    <RNTextInput
      {...rest}
      className={className}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={fontFamily ? [{fontFamily}, style] : style}
    />
  );
}

/** `useRef<TextInput>(null)` 처럼 인스턴스 타입으로 쓰던 자리를 그대로 두기 위해. */
export type TextInput = RNTextInput;
export type Text = RNText;
