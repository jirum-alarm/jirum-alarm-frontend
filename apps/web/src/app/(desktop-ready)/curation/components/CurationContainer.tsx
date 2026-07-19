'use client';

import { Suspense, useState } from 'react';

import { cn } from '@/shared/lib/cn';

import ProductGridListSkeleton from '@/entities/product-list/ui/grid/ProductGridListSkeleton';
import { ContentPromotionSection } from '@/entities/promotion/model/types';

import CurationProductList from './CurationProductList';

interface CurationContainerProps {
  section: ContentPromotionSection;
}

const CurationContainer = ({ section }: CurationContainerProps) => {
  const [activeTabId, setActiveTabId] = useState<string | undefined>(section.tabs?.[0]?.id);

  const activeTab = section.tabs?.find((tab) => tab.id === activeTabId);

  const activeSection: ContentPromotionSection = activeTab
    ? {
        ...section,
        dataSource: {
          ...section.dataSource,
          variables: {
            ...section.dataSource.variables,
            ...activeTab.variables,
          },
        },
      }
    : section;

  return (
    <>
      {section.tabs && (
        <div className="pc:flex pc:justify-center pc:py-3 sticky top-14 z-40 w-full bg-white px-5 py-2">
          <div className="no-scrollbar flex gap-x-2 overflow-x-auto">
            {section.tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                  activeTabId === tab.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* sticky 탭 바로 아래 그리드. 모바일 상단 여백 최소(pt-6), 하단 pb-14, PC는 pt-7 유지 (toss/recommend와 동일 패턴) */}
      <div className="pc:pt-7 px-5 pt-6 pb-14">
        <Suspense fallback={<ProductGridListSkeleton length={12} />}>
          <CurationProductList key={activeSection.id + activeTabId} section={activeSection} />
        </Suspense>
      </div>
    </>
  );
};

export default CurationContainer;
