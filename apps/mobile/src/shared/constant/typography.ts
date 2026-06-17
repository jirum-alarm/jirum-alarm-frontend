import type {TextStyle} from 'react-native';

import {
  TypographyHeadline28sb,
  TypographyHeadline24sb,
  TypographyHeadline20sb,
  TypographyHeadline20m,
  TypographyTitle18b,
  TypographyTitle16sb,
  TypographyTitle16m,
  TypographyTitle16r,
  TypographyBody14sb,
  TypographyBody14m,
  TypographyBody14r,
  TypographyCaption13m,
  TypographyCaption13r,
  TypographyCaption12m,
} from '@jirum/design-tokens/tokens';

/**
 * 디자인 토큰 SSOT(@jirum/design-tokens)의 typography 14종을 RN <Text> 스타일로 제공한다.
 *
 * web은 `@utility typography-*` 한 클래스로 size+lineHeight+weight를 싣지만, RN/NativeWind는
 * 그게 안 된다(NativeWind 4.2.2는 fontSize 배열의 fontWeight를 className으로 안 실음). 게다가
 * RN은 굵기를 CSS fontWeight가 아니라 **font family**로 고른다(Pretendard-SemiBold 등).
 * → 토큰의 `{fontSize:"14px", lineHeight:"20px", fontWeight:600}` 를 RN이 쓰는
 *   `{fontSize:14, lineHeight:20, fontFamily:"Pretendard-SemiBold"}` 로 변환해 프리셋으로 제공.
 *
 * 값은 전부 토큰 상수에서 파생 = 시각 변화 0(무손실), Figma=web=mobile 단일 출처.
 */

// 토큰 fontWeight(숫자) → mobile에 로드된 Pretendard OTF family.
// tailwind.config.js의 fontFamily 매핑과 일치해야 한다.
const PRETENDARD_FAMILY: Record<number, string> = {
  400: 'Pretendard-Regular',
  500: 'Pretendard-Medium',
  600: 'Pretendard-SemiBold',
  700: 'Pretendard-Bold',
};

type Token = {
  fontFamily: string;
  fontWeight: number;
  fontSize: string;
  lineHeight: string;
};

// "28px" → 28. RN 스타일은 단위 없는 숫자만 받는다.
const px = (value: string): number => parseFloat(value);

const toTextStyle = (token: Token): TextStyle => ({
  fontFamily: PRETENDARD_FAMILY[token.fontWeight] ?? 'Pretendard-Regular',
  fontSize: px(token.fontSize),
  lineHeight: px(token.lineHeight),
});

/**
 * 토큰 typography 프리셋. 사용: `<Text style={TYPOGRAPHY.body14r}>`.
 * 색은 별도(className `text-gray-900` 또는 style color) — 프리셋은 size/lineHeight/family만.
 */
export const TYPOGRAPHY = {
  headline28sb: toTextStyle(TypographyHeadline28sb),
  headline24sb: toTextStyle(TypographyHeadline24sb),
  headline20sb: toTextStyle(TypographyHeadline20sb),
  headline20m: toTextStyle(TypographyHeadline20m),
  title18b: toTextStyle(TypographyTitle18b),
  title16sb: toTextStyle(TypographyTitle16sb),
  title16m: toTextStyle(TypographyTitle16m),
  title16r: toTextStyle(TypographyTitle16r),
  body14sb: toTextStyle(TypographyBody14sb),
  body14m: toTextStyle(TypographyBody14m),
  body14r: toTextStyle(TypographyBody14r),
  caption13m: toTextStyle(TypographyCaption13m),
  caption13r: toTextStyle(TypographyCaption13r),
  caption12m: toTextStyle(TypographyCaption12m),
} as const;

export type TypographyPreset = keyof typeof TYPOGRAPHY;
