'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { ThemeQueries } from '@/entities/notification';

// 홈 노출: 알림 묶음 가로 캐러셀. 신규가 마이페이지 안 들어가도 묶음을 발견 → 활성화 레버.
const ThemeCarousel = () => {
  const { data: themes } = useSuspenseQuery(ThemeQueries.themes());

  if (!themes.length) return null;

  return (
    <section className="py-2">
      <div className="flex items-center justify-between px-5">
        <h2 className="text-base font-bold text-gray-900">관심 묶음 알림 받기</h2>
        <Link href="/themes" className="text-xs text-gray-400">
          전체보기
        </Link>
      </div>
      <p className="mt-0.5 px-5 text-xs text-gray-400">
        한 번 구독하면 묶음 안 키워드 딜이 뜰 때 알려드려요.
      </p>
      <ul className="mt-3 flex gap-2.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {themes.map((theme) => (
          <li key={theme.id} className="shrink-0">
            <Link
              href={`/themes/${theme.id}`}
              className="flex w-[140px] flex-col gap-1 rounded-2xl border border-gray-200 p-3"
            >
              <span className="text-xl" aria-hidden>
                {theme.emoji || '🔔'}
              </span>
              <span className="line-clamp-1 text-sm font-semibold text-gray-900">{theme.name}</span>
              <span className="line-clamp-1 text-xs text-gray-400">
                {theme.representativeKeywords.slice(0, 3).join('·')}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ThemeCarousel;
