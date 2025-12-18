'use client';

import { Suspense, useState } from 'react';

import SectionHeader from '@/components/SectionHeader';
import { ContentPromotionSection, PromotionTab } from '@/entities/promotion/model/types';
import Link from '@/shared/ui/Link';

import ProductGridList from '@features/products/grid/GridProductList';
import GridProductListSkeleton from '@features/products/grid/GridProductListSkeleton';

import DynamicProductList from './DynamicProductList';
import PromotionTabs from './PromotionTabs';

interface TabbedDynamicProductSectionProps {
  section: ContentPromotionSection;
}

const TabbedDynamicProductSection = ({ section }: TabbedDynamicProductSectionProps) => {
  const tabs = section.tabs || [];
  const [activeTab, setActiveTab] = useState<PromotionTab>(tabs[0]);

  const handleTabClick = (tab: PromotionTab) => {
    setActiveTab(tab);
  };

  // Create a temporary section object for the active tab to pass to DynamicProductList
  // We preserve the main section's type (GRID, etc.) but override the dataSource
  const activeSection: ContentPromotionSection = {
    ...section,
    dataSource: {
      ...section.dataSource,
      variables: {
        ...section.dataSource.variables,
        ...activeTab.variables,
      },
    },
  };

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
        <PromotionTabs tabs={tabs} activeTabId={activeTab.id} onTabClick={handleTabClick} />
      </div>

      <Suspense fallback={<GridProductListSkeleton length={4} />}>
        <DynamicProductList section={activeSection} />
      </Suspense>
    </div>
  );
};

export default TabbedDynamicProductSection;
