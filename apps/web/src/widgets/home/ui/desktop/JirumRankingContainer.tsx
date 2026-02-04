import { Suspense } from 'react';
import { SwiperOptions } from 'swiper/types';

import { PAGE } from '@/shared/config/page';
import ApiErrorBoundary from '@/shared/ui/ApiErrorBoundary';
import InteractiveMoreLink from '@/shared/ui/InteractiveMoreLink';
import Link from '@/shared/ui/Link';
import SectionHeader from '@/shared/ui/SectionHeader';

import JirumRankingSlider from '../JirumRankingSlider';
import SliderDots from '../SliderDots';

import { RankingSkeleton } from './RankingSkeleton';

const SLIDE_SIZE = 4;

const SLIDER_CONFIG_DESKTOP: SwiperOptions = {
  slidesPerView: SLIDE_SIZE,
  centeredSlides: false,
  loop: true,
  spaceBetween: 24,
  touchStartForcePreventDefault: true,
  preventClicksPropagation: true,
} as const;

const JirumRankingContainer = () => (
  <div className="w-full pt-14">
    <div className="max-w-slider-max mx-auto mt-9">
      <SectionHeader
        title="지름알림 랭킹"
        titleClassName="text-white"
        right={
          <InteractiveMoreLink className="px-3 text-sm text-gray-100" href={PAGE.TRENDING}>
            더보기
          </InteractiveMoreLink>
        }
      />
    </div>
    <ApiErrorBoundary>
      <div className="mt-6">
        <Suspense
          fallback={
            <div className="flex flex-col px-16">
              <RankingSkeleton />
              <SliderDots total={10} visibleSlides={[0, 1, 2, 3]} />
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
