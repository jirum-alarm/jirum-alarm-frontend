import { inject } from 'vitest';

declare module 'vitest' {
  export interface ProvidedContext {
    storyTheme: 'light' | 'dark';
  }
}

// 프로젝트(stories-light·stories-dark)마다 테마를 고정한다 — preview 데코레이터가 globals 보다 이 값을 먼저 본다.
(globalThis as { __STORY_THEME__?: string }).__STORY_THEME__ = inject('storyTheme');
