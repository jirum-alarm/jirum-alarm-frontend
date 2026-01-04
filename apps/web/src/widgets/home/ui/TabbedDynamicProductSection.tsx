'use client';

import { Suspense, useMemo, useState } from 'react';

import { ContentPromotionSection, PromotionTab } from '@entities/promotion';

import Link from '@/shared/ui/Link';
import SectionHeader from '@/shared/ui/SectionHeader';

import GridProductListSkeleton from '@/features/product-list/grid/GridProductListSkeleton';

import DynamicProductList from './DynamicProductList';
import PromotionTabs from './PromotionTabs';

interface TabbedDynamicProductSectionProps {
  section: ContentPromotionSection;
}

const TabbedDynamicProductSection = ({ section }: TabbedDynamicProductSectionProps) => {
  const tabs = section.tabs || [];
  const [activeTab, setActiveTab] = useState<PromotionTab | null>(tabs[0] ?? null);

  const handleTabClick = (tab: PromotionTab) => {
    setActiveTab(tab);
  };

  const activeSection: ContentPromotionSection = useMemo(() => {
    const variables = activeTab?.variables ?? {};
    return {
      ...section,
      dataSource: {
        ...section.dataSource,
        variables: {
          ...section.dataSource.variables,
          ...variables,
        },
      },
    };
  }, [activeTab, section]);

  return (
    <div className="pc:pt-7 pc:px-0 pc:space-y-0 space-y-2">
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
      <div className="mx-auto w-fit max-w-full">
        <PromotionTabs tabs={tabs} activeTabId={activeTab?.id ?? ''} onTabClick={handleTabClick} />
      </div>

      <Suspense fallback={<GridProductListSkeleton length={4} />}>
        <DynamicProductList section={activeSection} />
      </Suspense>
    </div>
  );
};

export default TabbedDynamicProductSection;
