import { BrandItem, BrandProduct } from '@/hooks/graphql/brandProduct';

type Props = {
  selectedBrandItem: BrandItem | null;
  selectedBrandProduct: BrandProduct | null;
  expandedItems: BrandProduct[];
  expandedSelectedIndex: number;
  isLeftPanelFocused: boolean;
  setActiveTab: (tab: 'brands' | 'details') => void;
  setIsLeftPanelFocused: (focused: boolean) => void;
  setExpandedSelectedIndex: (index: number) => void;
  setSelectedBrandProduct: (bp: BrandProduct) => void;
  onOpenDetail: () => void;
};

// details 탭: 펼친 BrandItem 헤더(← 돌아가기) + 하위 BrandProduct 목록.
const ExpandedProductList = ({
  selectedBrandItem,
  selectedBrandProduct,
  expandedItems,
  expandedSelectedIndex,
  isLeftPanelFocused,
  setActiveTab,
  setIsLeftPanelFocused,
  setExpandedSelectedIndex,
  setSelectedBrandProduct,
  onOpenDetail,
}: Props) => (
  <div className="flex-1 overflow-y-auto p-3">
    {selectedBrandItem && (
      <div className="mb-3">
        <button
          onClick={() => {
            setActiveTab('brands');
            setIsLeftPanelFocused(true);
          }}
          className="flex w-full items-center gap-2 rounded border border-stroke p-2 text-left transition-all hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4"
        >
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
            ←
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-primary">
              {selectedBrandItem.brandName} {selectedBrandItem.productName}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400">
              매칭 {selectedBrandItem.totalMatchCount}건
            </p>
          </div>
        </button>
      </div>
    )}
    {expandedItems.length > 0 ? (
      expandedItems.map((expandedBp, expandedIndex) => (
        <button
          key={expandedBp.id}
          data-expanded-index={expandedIndex}
          onClick={() => {
            setExpandedSelectedIndex(expandedIndex);
            setSelectedBrandProduct(expandedBp);
            setIsLeftPanelFocused(true);
            onOpenDetail();
          }}
          className={`mb-1 flex w-full items-center gap-1.5 px-2 py-2.5 text-left transition-all hover:bg-gray-100 dark:hover:bg-meta-4 lg:py-1.5 ${
            selectedBrandProduct?.id === expandedBp.id
              ? 'border-r-3 border-primary bg-primary/10'
              : ''
          } ${
            isLeftPanelFocused && expandedSelectedIndex === expandedIndex
              ? 'ring-1 ring-inset ring-primary/50'
              : ''
          }`}
        >
          <div
            className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${
              expandedBp.pendingVerificationCount === 0 ? 'bg-success/80' : 'bg-warning/80'
            }`}
          >
            {expandedBp.pendingVerificationCount === 0 ? (
              <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              expandedBp.pendingVerificationCount
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`line-clamp-1 text-sm font-medium lg:text-[11px] ${
                selectedBrandProduct?.id === expandedBp.id
                  ? 'text-primary'
                  : 'text-black dark:text-white'
              }`}
            >
              {expandedBp.volume || '-'} · {expandedBp.amount || '-'}
            </p>
          </div>
        </button>
      ))
    ) : (
      <div className="flex flex-col items-center justify-center py-10 text-gray-500">
        <p className="text-xs">
          <span className="lg:hidden">브랜드 아이템을 탭해</span>
          <span className="hidden lg:inline">스페이스바로 브랜드 상품을 선택하여</span>
        </p>
        <p className="text-xs">상세 상품 목록을 확인하세요.</p>
      </div>
    )}
  </div>
);

export default ExpandedProductList;
