'use client';

import 'swiper/css';

import { useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';

import { ThemeQueries } from '@/entities/notification';

// 홈 모바일: 알림 묶음 캐러셀. 랭킹/핫딜과 동일 Swiper 스와이프. 신규 발견 → 활성화 레버.
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
      <Swiper
        className="mt-2 w-full"
        slidesPerView="auto"
        spaceBetween={10}
        slidesOffsetBefore={20}
        slidesOffsetAfter={20}
      >
        {themes.map((theme) => (
          <SwiperSlide key={theme.id} className="!w-[180px]">
            <Link
              href={`/themes/${theme.id}`}
              className="flex h-full flex-col gap-1 rounded-2xl border border-gray-200 p-3"
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
                {theme.representativeKeywords.slice(0, 3).join('·')}
              </span>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default ThemeCarousel;
