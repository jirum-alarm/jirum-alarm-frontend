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
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">관심 묶음 알림 받기</h2>
          <p className="mt-1 text-sm text-gray-500">
            한 번 구독하면 묶음 안 키워드 딜이 뜰 때 알려드려요.
          </p>
        </div>
        <Link href="/themes" className="text-sm text-gray-400">
          전체보기
        </Link>
      </div>
      <ul className="mt-5 grid grid-cols-4 gap-3">
        {themes.map((theme) => (
          <li key={theme.id}>
            <Link
              href={`/themes/${theme.id}`}
              className="flex h-full flex-col gap-1.5 rounded-2xl border border-gray-200 p-4 transition-colors hover:border-gray-300"
            >
              <span className="text-2xl" aria-hidden>
                {theme.emoji || '🔔'}
              </span>
              <span className="line-clamp-1 text-base font-semibold text-gray-900">
                {theme.name}
              </span>
              <span className="line-clamp-1 text-xs text-gray-400">
                {theme.representativeKeywords.slice(0, 4).join('·')}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ThemeSection;
