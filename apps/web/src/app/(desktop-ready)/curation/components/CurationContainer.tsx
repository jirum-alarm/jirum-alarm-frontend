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
        <div className="pc:flex pc:justify-center pc:py-3 bg-surface-default sticky top-14 z-40 w-full px-5 py-2">
          <div className="no-scrollbar flex gap-x-2 overflow-x-auto">
            {section.tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={cn(
                  'typography-body-14m rounded-full px-4 py-2 whitespace-nowrap transition-colors',
                  activeTabId === tab.id
                    ? 'bg-surface-inverse text-white'
                    : 'bg-surface-muted text-gray-600 hover:bg-gray-200',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pc:pt-7 px-5 py-14">
        <Suspense fallback={<ProductGridListSkeleton length={12} />}>
          <CurationProductList key={activeSection.id + activeTabId} section={activeSection} />
        </Suspense>
      </div>
    </>
  );
};

export default CurationContainer;
