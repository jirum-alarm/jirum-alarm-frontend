'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { ThemeQueries } from '@/entities/notification';

// 홈 노출: 알림 묶음 가로 캐러셀. 신규가 마이페이지 안 들어가도 묶음을 발견 → 활성화 레버.
const ThemeCarousel = () => {
  const { data: themes } = useSuspenseQuery(ThemeQueries.themes());

  if (!themes.length) return null;

  return (
    <section className="py-1">
      <div className="flex items-center justify-between px-5">
        <h2 className="text-sm font-bold text-gray-900">관심 묶음 알림 받기</h2>
        <Link href="/themes" className="text-xs text-gray-400">
          전체보기
        </Link>
      </div>
      {/* 칩 형태(이모지+이름 한 줄)로 세로 높이 최소화 */}
      <ul className="mt-2 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {themes.map((theme) => (
          <li key={theme.id} className="shrink-0">
            <Link
              href={`/themes/${theme.id}`}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-900"
            >
              <span aria-hidden>{theme.emoji || '🔔'}</span>
              <span className="whitespace-nowrap">{theme.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ThemeCarousel;
