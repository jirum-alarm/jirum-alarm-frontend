'use client';

import { m } from 'motion/react';

import { setColorScheme } from '@/shared/config/color-scheme';

/**
 * 헤더 우측 화면 모드 버튼. 지금 모드를 보여 준다(라이트=해, 다크=달) — 누르면 반대로.
 * 어느 아이콘을 보일지는 html.dark 를 CSS(`dark:`)로 가른다. 서버가 쿠키로 class 를 심으므로
 * 상태를 JS 로 들고 있지 않아도 첫 화면부터 맞다(하이드레이션 불일치 없음).
 * 앱 HomeHeader 의 ThemeButton 과 같은 아이콘·동작.
 */
const ColorSchemeButton = ({ color }: { color: string }) => (
  <button
    type="button"
    aria-label="화면 모드 바꾸기"
    onClick={() => setColorScheme(!document.documentElement.classList.contains('dark'))}
    className="pc:m-0 pc:size-9 pc:p-0 pc:rounded-full pc:hover:bg-gray-400/20 -m-2 flex items-center justify-center p-2 duration-300"
  >
    <m.div whileTap={{ scale: 0.9 }} transition={{ duration: 0.1 }}>
      <svg className="pc:size-7 size-6 dark:hidden" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx={12} cy={12} r={4.5} fill={color} />
        <path
          d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
      <svg
        className="pc:size-7 hidden size-6 dark:block"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1Z" fill={color} />
      </svg>
    </m.div>
  </button>
);

export default ColorSchemeButton;
