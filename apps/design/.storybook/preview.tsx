import '../src/styles.css';

import type { Preview } from '@storybook/nextjs-vite';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    // 접근성 검사 위반은 경고가 아니라 실패 — 대비(AA)·이름 없는 버튼을 스토리 단계에서 막는다.
    a11y: { test: 'error' },
    options: {
      storySort: { order: ['소개', '기초', '조립 규칙', '레시피', '패턴', 'components', '*'] },
    },
  },
  // 웹 다크는 <html class="dark"> 에서만 켜진다(globals.css) — 툴바 「테마」나 URL `&globals=theme:dark` 로 본다.
  globalTypes: {
    theme: {
      description: '라이트/다크',
      toolbar: { title: '테마', icon: 'mirror', items: ['light', 'dark'], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, { globals }) => {
      // 테스트(vitest.setup.ts)는 프로젝트마다 테마를 고정해 넘긴다. 놀이터 화면에선 툴바 값.
      const forced = (globalThis as { __STORY_THEME__?: string }).__STORY_THEME__;
      document.documentElement.classList.toggle('dark', (forced ?? globals.theme) === 'dark');
      return (
        <div className="bg-white p-4 text-gray-900">
          <Story />
        </div>
      );
    },
  ],
  tags: ['autodocs'],
};

export default preview;
