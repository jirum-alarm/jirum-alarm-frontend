import type { StorybookConfig } from '@storybook/nextjs';

// Storybook 10: main 설정은 ESM 으로 읽힌다(require.resolve 로 경로를 풀던 getAbsolutePath 제거 — hoisted 라 이름으로 충분).
// actions·controls·viewport·interactions 는 9 부터 코어에 들어가 addon-essentials·addon-interactions 가 없다.
// autodocs(preview 의 tags) 는 addon-docs 가 그린다.
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  addons: ['@storybook/addon-links', '@storybook/addon-onboarding', '@storybook/addon-docs'],

  framework: {
    name: '@storybook/nextjs',
    options: {},
  },

  docs: {},

  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};
export default config;
