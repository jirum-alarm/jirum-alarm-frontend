'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Suspense, useState } from 'react';

import Link from '@/shared/ui/Link';
import SectionHeader from '@/shared/ui/SectionHeader';

import ProductImageCardSkeleton from '@/entities/product-list/ui/card/ProductImageCardSkeleton';
import {
  getPromotionQueryOptions,
  selectPromotionProducts,
} from '@/entities/promotion/lib/getPromotionQueryOptions';
import { ContentPromotionSection, PromotionTab } from '@/entities/promotion/model/types';

import DynamicProductList from './DynamicProductList';
import PromotionTabs from './PromotionTabs';

interface TabbedDynamicProductSectionProps {
  section: ContentPromotionSection;
  isMobile: boolean;
}

// Suspense 경계 안쪽에서만 쿼리를 걸어야 탭 전환 시 탭바까지 스켈레톤으로 대체되지 않는다.
const TabProductList = ({
  section,
  isMobile,
}: {
  section: ContentPromotionSection;
  isMobile: boolean;
}) => {
  const { data } = useSuspenseQuery(getPromotionQueryOptions(section) as any);

  return (
    <DynamicProductList
      type={section.type}
      products={selectPromotionProducts(section, data)}
      isMobile={isMobile}
    />
  );
};

const TabbedDynamicProductSection = ({ section, isMobile }: TabbedDynamicProductSectionProps) => {
  const tabs = section.tabs || [];
  const [activeTabId, setActiveTabId] = useState<string | undefined>(tabs[0]?.id);
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];

  if (!activeTab) return null;

  const handleTabClick = (tab: PromotionTab) => {
    setActiveTabId(tab.id);
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
            activeTab.viewMoreLink ? (
              <motion.div
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="rounded-lg"
              >
                <Link
                  href={activeTab.viewMoreLink}
                  className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
                  aria-label={`${section.title} 더보기`}
                >
                  더보기
                </Link>
              </motion.div>
            ) : undefined
          }
        />
      </div>
      <div className="pc:mx-auto w-fit max-w-full">
        <PromotionTabs tabs={tabs} activeTabId={activeTab.id} onTabClick={handleTabClick} />
      </div>

      <Suspense
        fallback={
          <div className="pc:py-4 pc:px-0 px-5">
            <div className="pc:grid-cols-6 grid animate-pulse grid-cols-3 gap-x-3 gap-y-5">
              {Array.from({ length: 6 }).map((_, index) => (
                <ProductImageCardSkeleton key={index} />
              ))}
            </div>
          </div>
        }
      >
        <TabProductList section={activeSection} isMobile={isMobile} />
      </Suspense>
    </div>
  );
};

export default TabbedDynamicProductSection;
