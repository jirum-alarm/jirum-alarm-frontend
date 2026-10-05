'use client';

import { useQuery } from '@tanstack/react-query';
import { m } from 'motion/react';
import { useState } from 'react';

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

// Suspense 대신 isPending 으로 스켈레톤을 그린다. 첫 탭은 서버가 프리페치해 둬서 SSR HTML 에
// 상품이 바로 박히는데, Suspense 경계로 감싸면 React 19 가 큰 경계를 따로 떼어 스트리밍하고
// 공개를 잠깐 미뤄 스켈레톤 → 상품으로 바뀌는 게 보였다. 탭 전환 때만 스켈레톤이 뜬다.
const TabProductList = ({
  section,
  isMobile,
}: {
  section: ContentPromotionSection;
  isMobile: boolean;
}) => {
  const { data, isPending } = useQuery(getPromotionQueryOptions(section) as any);

  if (isPending) {
    return (
      <div className="pc:py-4 pc:px-0 px-5">
        <div className="pc:grid-cols-6 grid animate-pulse grid-cols-3 gap-x-3 gap-y-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProductImageCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

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
              <m.div
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
              </m.div>
            ) : undefined
          }
        />
      </div>
      <div className="pc:mx-auto w-fit max-w-full">
        <PromotionTabs tabs={tabs} activeTabId={activeTab.id} onTabClick={handleTabClick} />
      </div>

      <TabProductList section={activeSection} isMobile={isMobile} />
    </div>
  );
};

export default TabbedDynamicProductSection;
