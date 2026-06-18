import {
  ColorBlack,
  ColorWhite,
  ColorPrimary600,
  ColorGray200,
  ColorGray300,
  ColorGray400,
  ColorGray500,
  ColorGray800,
  ColorGray900,
  ColorError500,
} from '@jirum/design-tokens/tokens';

// 디자인 토큰 SSOT(@jirum/design-tokens). 전부 토큰 값과 동일(무손실).
// 키 이름(COLORS.GRAY_900 등)은 그대로 유지 — 값만 토큰 상수에서 받는다.
export const COLORS = {
  BLACK: ColorBlack,
  WHITE: ColorWhite,
  PRIMARY_600: ColorPrimary600,
  GRAY_900: ColorGray900,
  GRAY_800: ColorGray800,
  GRAY_500: ColorGray500,
  GRAY_400: ColorGray400,
  GRAY_300: ColorGray300,
  GRAY_200: ColorGray200,
  ERROR_500: ColorError500,
};
