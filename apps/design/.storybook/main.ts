import { fileURLToPath } from 'node:url';

import { mergeConfig } from 'vite';

import type { StorybookConfig } from '@storybook/nextjs-vite';

// 놀이터는 web 컴포넌트를 복사하지 않고 web 의 스토리를 그대로 모아 보여 준다 — 스토리는 컴포넌트 옆(apps/web/src)에 산다.
// 기초(색·글자·조립 규칙)와 레시피 갤러리는 이 앱의 src 에 있다.
const webSrc = fileURLToPath(new URL('../../web/src', import.meta.url));
const repoRoot = fileURLToPath(new URL('../../..', import.meta.url));

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(ts|tsx)',
    '../../web/src/**/*.stories.@(ts|tsx)',
  ],
  // a11y = 스토리마다 axe 접근성 검사(대비·이름 없는 버튼 등). vitest = 스토리를 테스트로 돌린다(play 함수 포함).
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: { name: '@storybook/nextjs-vite', options: {} },
  viteFinal: (vite) =>
    mergeConfig(vite, {
      resolve: {
        // web 소스의 `@/…` import. web tsconfig paths 와 같은 뜻.
        alias: { '@': webSrc },
        // web 소스는 apps/web 아래라 react 를 따로 찾으면 두 벌이 된다.
        dedupe: ['react', 'react-dom'],
      },
      // 디자인 시스템 패키지는 CommonJS(앱 metro·tailwind 설정이 require 한다) — 워크스페이스 링크라 Vite 가 기본으로 변환하지 않는다.
      optimizeDeps: {
        include: [
          '@jirum/design-system',
          '@jirum/design-system/recipes',
          '@jirum/design-system/layout',
          '@jirum/design-system/catalog',
        ],
      },
      build: { commonjsOptions: { include: [/design-system/, /node_modules/] } },
      server: { fs: { allow: [repoRoot] } },
    }),
};
export default config;
