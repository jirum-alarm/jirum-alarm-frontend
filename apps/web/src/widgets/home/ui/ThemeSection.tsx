'use client';

import 'swiper/css';

import { useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';

import InteractiveMoreLink from '@/shared/ui/InteractiveMoreLink';
import SectionHeader from '@/shared/ui/SectionHeader';

import { ThemeQueries } from '@/entities/notification';

// 홈 알림 묶음 캐러셀. 헤더·여백은 DynamicProductSection 과 같은 틀(SectionHeader + 더보기)을 쓴다.
const ThemeSection = ({ isMobile }: { isMobile: boolean }) => {
  const { data: allThemes } = useSuspenseQuery(ThemeQueries.themes());
  // 최근 7일 알림 0건인 묶음은 구독해도 아무것도 안 온다 → 홈에서 숨김(목록·상세는 유지).
  const themes = allThemes.filter((theme) => theme.weeklyAlertCount > 0);

  if (!themes.length) return null;

  return (
    <section className="pc:pt-7 pc:space-y-4 space-y-2">
      <div className="pc:px-0 px-5">
        <SectionHeader
          title="관심 묶음 알림 받기"
          right={
            <InteractiveMoreLink
              href="/themes"
              className="text-sm text-gray-500 hover:text-gray-700"
              aria-label="알림 묶음 더보기"
            >
              더보기
            </InteractiveMoreLink>
          }
        />
      </div>
      <Swiper
        className="w-full"
        slidesPerView="auto"
        spaceBetween={isMobile ? 10 : 12}
        slidesOffsetBefore={isMobile ? 20 : 0}
        slidesOffsetAfter={isMobile ? 20 : 0}
      >
        {themes.map((theme) => (
          <SwiperSlide key={theme.id} className={isMobile ? '!w-[180px]' : '!w-[220px]'}>
            <Link
              href={`/themes/${theme.id}`}
              className="flex h-full flex-col gap-1.5 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100"
            >
              <span className="text-2xl" aria-hidden>
                {theme.emoji || '🔔'}
              </span>
              <span className="line-clamp-1 text-sm font-semibold text-gray-900">{theme.name}</span>
              <span className="line-clamp-1 text-xs text-gray-500">
                {theme.representativeKeywords.slice(0, isMobile ? 3 : 4).join('·')}
              </span>
              <span className="text-xs text-gray-500">
                최근 7일 알림{' '}
                <b className="font-semibold text-gray-900">{theme.weeklyAlertCount}건</b>
              </span>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default ThemeSection;
