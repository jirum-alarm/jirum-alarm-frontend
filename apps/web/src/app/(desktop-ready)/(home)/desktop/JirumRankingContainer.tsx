import { Suspense } from 'react';
import { SwiperOptions } from 'swiper/types';

import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import SectionHeader from '@/components/SectionHeader';
import { PAGE } from '@/constants/page';

import Link from '@shared/ui/Link';

import JirumRankingSlider from '../components/JirumRankingSlider';
import SliderDots from '../components/SliderDots';

import { RankingSkeleton } from './RankingSkeleton';

const SLIDE_SIZE = 4;

const SLIDER_CONFIG_DESKTOP: SwiperOptions = {
  slidesPerView: SLIDE_SIZE,
  centeredSlides: false,
  loop: false,
  slidesPerGroup: SLIDE_SIZE,
  spaceBetween: 24,
} as const;

const JirumRankingContainer = () => (
  <div className="w-full pt-14">
    <div className="max-w-slider-max mx-auto mt-9">
      <SectionHeader
        title="지름알림 랭킹"
        titleClassName="text-white"
        right={
          <Link className="px-3 text-sm text-gray-100" href={PAGE.TRENDING}>
            더보기
          </Link>
        }
      />
    </div>
    <ApiErrorBoundary>
      <div className="mt-6">
        <Suspense
          fallback={
            <div className="flex flex-col px-16">
              <RankingSkeleton />
              <SliderDots total={7} activeIndex={0} />
            </div>
          }
        >
          <JirumRankingSlider config={SLIDER_CONFIG_DESKTOP} isMobile={false} />
        </Suspense>
      </div>
    </ApiErrorBoundary>
  </div>
);

export default JirumRankingContainer;
