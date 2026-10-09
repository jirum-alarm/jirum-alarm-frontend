import { RefObject } from 'react';

import { BrandItem } from '@/hooks/graphql/brandProduct';

type Props = {
  leftScrollRef: RefObject<HTMLDivElement | null>;
  filteredBrandItems: BrandItem[];
  selectedBrandItem: BrandItem | null;
  selectedBrandItemIndex: number;
  isLeftPanelFocused: boolean;
  hasBrandItemMore: boolean;
  isLoadingBrandItemMore: boolean;
  setSelectedBrandItemIndex: (index: number) => void;
  highlightBrandItem: (item: BrandItem) => void;
  setIsLeftPanelFocused: (focused: boolean) => void;
  loadMoreBrandItems: () => Promise<void>;
  /** 스페이스바와 같은 동작 — 키보드가 없는 모바일에서 상세 상품으로 들어가는 길 */
  expandBrandItem: (item: BrandItem) => void;
};

// brands 탭: 브랜드 아이템 목록 (대기 건수 뱃지 + 클릭 시 하이라이트, 끝 3개면 다음 페이지).
const BrandItemList = ({
  leftScrollRef,
  filteredBrandItems,
  selectedBrandItem,
  selectedBrandItemIndex,
  isLeftPanelFocused,
  hasBrandItemMore,
  isLoadingBrandItemMore,
  setSelectedBrandItemIndex,
  highlightBrandItem,
  setIsLeftPanelFocused,
  loadMoreBrandItems,
  expandBrandItem,
}: Props) => (
  <div ref={leftScrollRef} className="flex-1 overflow-y-auto">
    {filteredBrandItems.length > 0 ? (
      <>
        {filteredBrandItems.map((item, index) => (
          <div key={item.id} className="mb-0.5 flex items-stretch">
            <button
              data-product-index={index}
              onClick={() => {
                setSelectedBrandItemIndex(index);
                // 데스크톱은 클릭=하이라이트(펼침은 스페이스), 폰은 키보드가 없으니 탭 한 번에 펼친다
                if (window.innerWidth < 1024) expandBrandItem(item);
                else highlightBrandItem(item);
                setIsLeftPanelFocused(true);
                if (
                  index >= filteredBrandItems.length - 3 &&
                  hasBrandItemMore &&
                  !isLoadingBrandItemMore
                ) {
                  loadMoreBrandItems();
                }
              }}
              className={`flex w-full min-w-0 flex-1 items-center gap-2 p-2 text-left transition-all hover:bg-gray-50 dark:hover:bg-meta-4 ${
                selectedBrandItem?.id === item.id ? 'border-r-4 border-primary bg-primary/5' : ''
              } ${
                isLeftPanelFocused && selectedBrandItemIndex === index
                  ? 'ring-2 ring-inset ring-primary/50'
                  : ''
              }`}
            >
              <div
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                  item.pendingVerificationCount === 0 ? 'bg-success' : 'bg-warning'
                }`}
              >
                {item.pendingVerificationCount === 0 ? (
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  item.pendingVerificationCount
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`line-clamp-2 text-xs font-semibold ${
                    selectedBrandItem?.id === item.id
                      ? 'text-primary'
                      : 'text-black dark:text-white'
                  }`}
                >
                  {item.brandName} {item.productName}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400">매칭 {item.totalMatchCount}건</p>
              </div>
            </button>
          </div>
        ))}
        {isLoadingBrandItemMore && (
          <div className="flex items-center justify-center py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="ml-2 text-xs text-gray-500">불러오는 중...</span>
          </div>
        )}
      </>
    ) : (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <p>브랜드 아이템이 없습니다.</p>
      </div>
    )}
  </div>
);

export default BrandItemList;
