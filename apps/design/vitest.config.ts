import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// 모든 스토리를 테스트 하나로 돌린다: 렌더 오류 없음 + play 함수(조작 시나리오) 통과 + 접근성(axe) 위반 없음.
// 라이트·다크 둘 다 — 다크에서만 깨지는 대비가 이 레포에서 가장 흔한 회귀였다.
const configDir = fileURLToPath(new URL('./.storybook', import.meta.url));

const project = (theme: 'light' | 'dark') => ({
  extends: true as const,
  plugins: [storybookTest({ configDir, tags: { exclude: ['skip-test'] } })],
  test: {
    name: `stories-${theme}`,
    provide: { storyTheme: theme },
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({}),
      instances: [{ browser: 'chromium' as const }],
    },
    setupFiles: ['./.storybook/vitest.setup.ts'],
  },
});

export default defineConfig({ test: { projects: [project('light'), project('dark')] } });
