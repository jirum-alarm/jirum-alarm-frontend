import Link from 'next/link';
import { Suspense } from 'react';

import { getQueryClient } from '@/app/(app)/react-query/query-client';
import SectionHeader from '@/components/SectionHeader';
import { getPromotionQueryOptions } from '@/entities/promotion/lib/getPromotionQueryOptions';
import { ContentPromotionSection } from '@/entities/promotion/model/types';

import GridProductListSkeleton from '@features/products/grid/GridProductListSkeleton';

import DynamicProductList from './DynamicProductList';
import TabbedDynamicProductSection from './TabbedDynamicProductSection';

interface DynamicProductSectionProps {
  section: ContentPromotionSection;
}

const DynamicProductSection = async ({ section }: DynamicProductSectionProps) => {
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
    return <TabbedDynamicProductSection section={section} />;
  }

  return (
    <div className="pc:pt-7 pc:px-0 pc:space-y-4 space-y-2">
      <div className="px-5">
        <SectionHeader
          title={section.title}
          right={
            section.viewMoreLink ? (
              <Link
                href={section.viewMoreLink}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                더보기
              </Link>
            ) : undefined
          }
        />
      </div>
      <Suspense fallback={<GridProductListSkeleton length={4} />}>
        <DynamicProductList section={section} />
      </Suspense>
    </div>
  );
};

export default DynamicProductSection;
