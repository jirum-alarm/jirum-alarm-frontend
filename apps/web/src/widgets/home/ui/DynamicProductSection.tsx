import { Suspense } from 'react';

import { getQueryClient } from '@/app/(app)/react-query/query-client';

import InteractiveMoreLink from '@/shared/ui/InteractiveMoreLink';
import SectionHeader from '@/shared/ui/SectionHeader';

import ProductGridListSkeleton from '@/entities/product-list/ui/grid/ProductGridListSkeleton';
import { getPromotionQueryOptions } from '@/entities/promotion/lib/getPromotionQueryOptions';
import { ContentPromotionSection } from '@/entities/promotion/model/types';

import DynamicProductList from './DynamicProductList';
import TabbedDynamicProductSection from './TabbedDynamicProductSection';

interface DynamicProductSectionProps {
  section: ContentPromotionSection;
  isMobile: boolean;
  priorityCount?: number;
}

const DynamicProductSection = async ({
  section,
  isMobile,
  priorityCount = 0,
}: DynamicProductSectionProps) => {
  const queryClient = getQueryClient();

  let sectionToPrefetch = section;
  if (section.tabs && section.tabs.length > 0) {
    sectionToPrefetch = {
      ...section,
      dataSource: {
        ...section.dataSource,
        variables: {
          ...section.dataSource.variables,
          ...section.tabs[0].variables,
        },
      },
    };
  }

  const queryOptions = getPromotionQueryOptions(sectionToPrefetch);
  await queryClient.prefetchQuery(queryOptions as any);

  if (section.tabs && section.tabs.length > 0) {
    return <TabbedDynamicProductSection section={section} isMobile={isMobile} />;
  }

  // 게스트 추천 섹션은 개인화 결과가 없으면(빈 배열) 섹션 전체를 숨긴다.
  // (선호 없음/부스트 OFF 시 백엔드가 [] 반환 → 메인 핫딜과 중복 노출 방지)
  if (section.dataSource.queryName === 'guestRecommendedHotDeals') {
    const prefetched = queryClient.getQueryData((queryOptions as any).queryKey) as
      | { guestRecommendedHotDeals?: unknown[] }
      | undefined;
    if (!prefetched?.guestRecommendedHotDeals?.length) {
      return null;
    }
  }

  return (
    <div className="pc:pt-7 pc:px-0 pc:space-y-4 space-y-2">
      <div className="px-5">
        <SectionHeader
          title={section.title}
          right={
            section.viewMoreLink ? (
              <InteractiveMoreLink
                href={section.viewMoreLink}
                className="text-fg-secondary hover:text-fg-secondary-strong text-sm"
                aria-label={`${section.title} 더보기`}
              >
                더보기
              </InteractiveMoreLink>
            ) : undefined
          }
        />
      </div>
      <Suspense
        fallback={
          <div className="px-5">
            <ProductGridListSkeleton length={4} />
          </div>
        }
      >
        <DynamicProductList section={section} isMobile={isMobile} priorityCount={priorityCount} />
      </Suspense>
    </div>
  );
};

export default DynamicProductSection;
