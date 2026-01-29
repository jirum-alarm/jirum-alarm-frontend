'use client';

import { Suspense, useMemo, useState } from 'react';

import Link from '@/shared/ui/Link';
import SectionHeader from '@/shared/ui/SectionHeader';

import { ProductImageCardSkeleton } from '@/entities/product-list';
import { ContentPromotionSection, PromotionTab } from '@/entities/promotion';

import DynamicProductList from './DynamicProductList';
import PromotionTabs from './PromotionTabs';

interface TabbedDynamicProductSectionProps {
  isMobile: boolean;
  section: ContentPromotionSection;
}

const TabbedDynamicProductSection = ({ isMobile, section }: TabbedDynamicProductSectionProps) => {
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
            activeTab?.viewMoreLink ? (
              <Link
                href={activeTab.viewMoreLink}
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

      <Suspense
        fallback={
          <div className="pc:py-4 pc:px-0 px-5">
            <div className="pc:grid-cols-6 grid animate-pulse grid-cols-3 gap-x-3 gap-y-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductImageCardSkeleton key={i} />
              ))}
            </div>
          </div>
        }
      >
        <DynamicProductList isMobile={isMobile} section={activeSection} />
      </Suspense>
    </div>
  );
};

export default TabbedDynamicProductSection;
