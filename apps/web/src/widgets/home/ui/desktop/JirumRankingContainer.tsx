import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { preload } from 'react-dom';
import { SwiperOptions } from 'swiper/types';

import { getQueryClient } from '@/app/(app)/react-query/query-client';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';
import { PAGE } from '@/shared/config/page';
import { getDayBefore } from '@/shared/lib/utils/date';
import { convertToWebp } from '@/shared/lib/utils/image';
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
  const data = queryClient.getQueryData(queryOptions.queryKey) as
    | { products: Array<{ thumbnail?: string | null }> }
    | undefined;
  const firstThumbnail =
    convertToWebp(data?.products?.[0]?.thumbnail) ?? data?.products?.[0]?.thumbnail;

  if (firstThumbnail) {
    const w252 = `/_next/image?url=${encodeURIComponent(firstThumbnail)}&w=256&q=85`;
    const w384 = `/_next/image?url=${encodeURIComponent(firstThumbnail)}&w=384&q=85`;
    preload(w252, {
      as: 'image',
      fetchPriority: 'high',
      imageSizes: '252px',
      imageSrcSet: `${w252} 1x, ${w384} 1.5x`,
    });
  }

  return (
    <div className="w-full pt-14">
      <div className="max-w-slider-max mx-auto mt-9">
        <SectionHeader
          title="지름알림 랭킹"
          titleClassName="text-white"
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
