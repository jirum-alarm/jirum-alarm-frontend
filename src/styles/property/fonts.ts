import { css } from 'styled-components';

export const fonts = {
  s_Bold_24: () => css`
    font-family: 'Pretendard-SemiBold';
    font-size: 24px;
    font-weight: 600;
    line-height: 36px;
  `,
  s_Bold_16: () => css`
    font-family: 'Pretendard-SemiBold';
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
  `,
  s_Bold_14: () => css`
    font-family: 'Pretendard-SemiBold';
    font-size: 14px;
    font-weight: 600;
    line-height: 14px;
  `,

  Regular_16: () => css`
    font-family: 'Pretendard-Regular';
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
  `,
  Regular_14: () => css`
    font-family: 'Pretendard-Regular';
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
  `,
  Regular_13: () => css`
    font-family: 'Pretendard-Regular';
    font-size: 13px;
    font-weight: 400;
    line-height: 16px;
  `,
  Regular_12: () => css`
    font-family: 'Pretendard-Regular';
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
  `,
} as const;

export type FontType = typeof fonts;
