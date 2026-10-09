import type { Preview } from '@storybook/react';
import '../src/shared/style/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
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
      document.documentElement.classList.toggle('dark', globals.theme === 'dark');
      return Story();
    },
  ],
  tags: ['autodocs'],
};

export default preview;
