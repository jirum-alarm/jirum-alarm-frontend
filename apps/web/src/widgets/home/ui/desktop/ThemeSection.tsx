'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { ThemeQueries } from '@/entities/notification';

// PC 홈: 알림 묶음 그리드 섹션. 모바일 캐러셀(ThemeCarousel)과 짝 — 넓은 화면이라 그리드로 펼침.
const ThemeSection = () => {
  const { data: themes } = useSuspenseQuery(ThemeQueries.themes());

  if (!themes.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">관심 묶음 알림 받기</h2>
        <Link href="/themes" className="text-sm text-gray-400">
          전체보기
        </Link>
      </div>
      {/* 칩 1줄 가로스크롤 — 개수 많아도 높이 고정(모바일 캐러셀과 통일) */}
      <ul className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {themes.map((theme) => (
          <li key={theme.id} className="shrink-0">
            <Link
              href={`/themes/${theme.id}`}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-1.5 text-sm text-gray-900 transition-colors hover:border-gray-300"
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

export default ThemeSection;
