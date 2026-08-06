import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getQueryClient } from '@/app/(app)/react-query/query-client';

import InteractiveMoreLink from '@/shared/ui/InteractiveMoreLink';
import SectionHeader from '@/shared/ui/SectionHeader';

import {
  fetchPromotionProducts,
  getPromotionQueryOptions,
} from '@/entities/promotion/lib/getPromotionQueryOptions';
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
  // 탭 섹션은 탭 전환마다 다른 쿼리가 필요해 클라이언트가 데이터를 소유한다.
  // 첫 탭만 서버에서 프리페치해 HydrationBoundary로 넘긴다(첫 탭 재요청 방지).
  if (section.tabs && section.tabs.length > 0) {
    const queryClient = getQueryClient();
    const firstTabSection: ContentPromotionSection = {
      ...section,
      dataSource: {
        ...section.dataSource,
        variables: { ...section.dataSource.variables, ...section.tabs[0].variables },
      },
    };
    await queryClient.prefetchQuery(getPromotionQueryOptions(firstTabSection) as any);

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <TabbedDynamicProductSection section={section} isMobile={isMobile} />
      </HydrationBoundary>
    );
  }

  const products = await fetchPromotionProducts(section);

  // 게스트 추천 섹션은 개인화 결과가 없으면(빈 배열) 섹션 전체를 숨긴다.
  // (선호 없음/부스트 OFF 시 백엔드가 [] 반환 → 메인 핫딜과 중복 노출 방지)
  if (section.dataSource.queryName === 'guestRecommendedHotDeals' && products.length === 0) {
    return null;
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
                className="text-sm text-gray-500 hover:text-gray-700"
                aria-label={`${section.title} 더보기`}
              >
                더보기
              </InteractiveMoreLink>
            ) : undefined
          }
        />
      </div>
      <DynamicProductList
        type={section.type}
        products={products}
        isMobile={isMobile}
        priorityCount={priorityCount}
      />
    </div>
  );
};

export default DynamicProductSection;
