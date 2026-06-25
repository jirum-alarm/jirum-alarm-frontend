'use client';

import 'swiper/css';

import { useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';

import { ThemeQueries } from '@/entities/notification';

// PC 홈: 알림 묶음 캐러셀. 랭킹/핫딜과 동일하게 Swiper 스와이프(slidesPerView auto).
// 적당한 카드(이모지+이름+키워드 1줄) 1줄, 넘치면 스와이프.
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
      <Swiper
        className="mt-3 w-full"
        slidesPerView="auto"
        spaceBetween={12}
        edgeSwipeThreshold={100}
      >
        {themes.map((theme) => (
          <SwiperSlide key={theme.id} className="!w-[200px]">
            <Link
              href={`/themes/${theme.id}`}
              className="flex h-full flex-col gap-1 rounded-2xl border border-gray-200 p-3.5 transition-colors hover:border-gray-300"
            >
              <span className="flex items-center gap-1.5">
                <span className="text-lg" aria-hidden>
                  {theme.emoji || '🔔'}
                </span>
                <span className="line-clamp-1 text-sm font-semibold text-gray-900">
                  {theme.name}
                </span>
              </span>
              <span className="line-clamp-1 text-xs text-gray-400">
                {theme.representativeKeywords.slice(0, 4).join('·')}
              </span>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default ThemeSection;
