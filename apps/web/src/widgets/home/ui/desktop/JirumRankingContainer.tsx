import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { SwiperOptions } from 'swiper/types';

import { getQueryClient } from '@/app/(app)/react-query/query-client';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';
import { PAGE } from '@/shared/config/page';
import { getDayBefore } from '@/shared/lib/utils/date';
import ApiErrorBoundary from '@/shared/ui/ApiErrorBoundary';
import InteractiveMoreLink from '@/shared/ui/InteractiveMoreLink';
import SectionHeader from '@/shared/ui/SectionHeader';

import { ProductQueries } from '@/entities/product';

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

const JirumRankingContainer = async () => {
  const queryClient = getQueryClient();
  const queryOptions = ProductQueries.products({
    limit: 10,
    orderBy: ProductOrderType.CommunityRanking,
    startDate: getDayBefore(3),
    categoryId: null,
    orderOption: OrderOptionType.Desc,
    isEnd: false,
  });

  await queryClient.prefetchQuery(queryOptions);
  // 첫 사진 preload 는 next/image priority(1위 카드)가 <head> 에 낸다. 여기서 react-dom preload() 를 따로 부르면
  // RSC 힌트라 JS 로드 뒤(Slow4G 4.9s)에야 실행되고, srcset(256/384)이 img(sizes 252px → DPR3 750w)와 달라
  // 같은 사진을 한 번 더 받았다(10/14 실측).

  return (
    <div className="w-full pt-14">
      <div className="max-w-slider-max mx-auto mt-9">
        <SectionHeader
          title="지름알림 랭킹"
          titleClassName="text-fixed-white"
          right={
            <InteractiveMoreLink
              className="px-3 text-sm text-gray-100"
              href={PAGE.TRENDING_RANKING}
              aria-label="지름알림 랭킹 더보기"
            >
              더보기
            </InteractiveMoreLink>
          }
        />
      </div>
      <ApiErrorBoundary>
        <div className="mt-6">
          <HydrationBoundary state={dehydrate(queryClient)}>
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
          </HydrationBoundary>
        </div>
      </ApiErrorBoundary>
    </div>
  );
};

export default JirumRankingContainer;
