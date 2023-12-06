import { css } from 'styled-components';

const clampText = css`
  display: -webkit-box;
  word-break: break-all;
  -o-text-overflow: ellipsis;
  text-overflow: ellipsis;
  overflow: hidden;
  -webkit-box-orient: vertical;
`;

export const clamp = {
  line1: () => css`
    ${clampText};
    -webkit-line-clamp: 1;
  `,
  line2: () => css`
    ${clampText};
    -webkit-line-clamp: 2;
  `,
  line3: () => css`
    ${clampText};
    -webkit-line-clamp: 3;
  `,
  line4: () => css`
    ${clampText};
    -webkit-line-clamp: 4;
  `,
};

export type ClampTheme = typeof clamp;
