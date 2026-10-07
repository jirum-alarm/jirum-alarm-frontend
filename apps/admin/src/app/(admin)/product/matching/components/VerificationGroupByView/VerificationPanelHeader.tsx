import { BrandProduct } from '@/hooks/graphql/brandProduct';

type Props = {
  selectedBrandProduct: BrandProduct;
  canUndo: boolean;
  isUndoing: boolean;
  handleUndo: () => Promise<void>;
  selectAll: () => void;
  deselectAll: () => void;
  handleConfirmMatching: () => Promise<void>;
  handleConfirmAndNext: () => Promise<void>;
  onBack: () => void;
};

// 우측 헤더: 선택된 BrandProduct 이름 + 되돌리기/전체승인/전체거절/확정 버튼.
const VerificationPanelHeader = ({
  selectedBrandProduct,
  canUndo,
  isUndoing,
  handleUndo,
  selectAll,
  deselectAll,
  handleConfirmMatching,
  handleConfirmAndNext,
  onBack,
}: Props) => (
  <div className="flex items-center justify-between gap-2 border-b border-stroke bg-white px-3 py-2 dark:border-strokedark dark:bg-boxdark">
    <button
      type="button"
      onClick={onBack}
      className="-ml-1 flex h-9 flex-shrink-0 items-center px-1 text-sm font-medium text-primary lg:hidden"
    >
      ‹ 목록
    </button>
    <div className="min-w-0 flex-1">
      <h3 className="break-words text-sm font-bold text-black dark:text-white">
        {selectedBrandProduct.brandName} {selectedBrandProduct.productName}
        {(selectedBrandProduct.volume || selectedBrandProduct.amount) && (
          <span className="ml-2 text-xs font-normal text-gray-400">
            {selectedBrandProduct.volume}
            {selectedBrandProduct.volume && selectedBrandProduct.amount && ' · '}
            {selectedBrandProduct.amount}
          </span>
        )}
      </h3>
    </div>
    {/* 폰에선 엄지가 닿는 하단 바(MobileActionBar)로 옮긴다 */}
    <div className="hidden flex-wrap items-center gap-1.5 lg:flex">
      {/* #7: Undo 버튼 */}
      <button
        onClick={handleUndo}
        disabled={!canUndo}
        className={`rounded px-2 py-2 text-[11px] font-medium transition-colors sm:py-1 ${
          canUndo
            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-300'
            : 'cursor-not-allowed bg-gray-50 text-gray-300 dark:bg-meta-4/50 dark:text-gray-600'
        }`}
        title="Ctrl+Z"
      >
        {isUndoing ? (
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
            취소 중
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4"
              />
            </svg>
            되돌리기
          </span>
        )}
      </button>
      <div className="mx-0.5 h-4 w-px bg-gray-200 dark:bg-strokedark" />
      <button
        onClick={selectAll}
        className="rounded bg-success/10 px-2 py-2 text-[11px] font-medium text-success transition-colors hover:bg-success/20 sm:py-1"
        title="Shift+A"
      >
        전체승인
      </button>
      <button
        onClick={deselectAll}
        className="rounded bg-gray-100 px-2 py-2 text-[11px] font-medium text-gray-500 transition-colors hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-400 sm:py-1"
        title="N"
      >
        전체거절
      </button>
      <div className="mx-0.5 h-4 w-px bg-gray-200 dark:bg-strokedark" />
      <button
        onClick={handleConfirmMatching}
        className="flex items-center gap-1 rounded bg-primary px-2.5 py-2 text-[11px] font-bold text-white transition-colors hover:bg-opacity-90 sm:py-1"
        title="Enter"
      >
        확정
      </button>
      <button
        onClick={handleConfirmAndNext}
        className="flex items-center gap-0.5 rounded bg-primary/80 px-2 py-2 text-[11px] font-bold text-white transition-colors hover:bg-primary sm:py-1"
        title="Ctrl+Enter"
      >
        확정+다음
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
);

/** 폰 전용 하단 고정 바 — 확정은 크게, 나머지는 작게 */
export const MobileActionBar = ({
  canUndo,
  handleUndo,
  selectAll,
  deselectAll,
  handleConfirmMatching,
  handleConfirmAndNext,
}: Pick<
  Props,
  | 'canUndo'
  | 'handleUndo'
  | 'selectAll'
  | 'deselectAll'
  | 'handleConfirmMatching'
  | 'handleConfirmAndNext'
>) => (
  <div className="flex flex-col gap-2 border-t border-stroke bg-white p-2 dark:border-strokedark dark:bg-boxdark lg:hidden">
    <div className="flex gap-2">
      <button
        onClick={handleUndo}
        disabled={!canUndo}
        className="h-9 flex-1 rounded bg-gray-100 text-xs font-medium text-gray-600 disabled:opacity-40"
      >
        되돌리기
      </button>
      <button
        onClick={selectAll}
        className="h-9 flex-1 rounded bg-success/10 text-xs font-medium text-success"
      >
        전체승인
      </button>
      <button
        onClick={deselectAll}
        className="h-9 flex-1 rounded bg-gray-100 text-xs font-medium text-gray-500"
      >
        전체거절
      </button>
    </div>
    <div className="flex gap-2">
      <button
        onClick={handleConfirmMatching}
        className="h-11 flex-1 rounded-lg border border-primary text-sm font-bold text-primary"
      >
        확정
      </button>
      <button
        onClick={handleConfirmAndNext}
        className="h-11 flex-[2] rounded-lg bg-primary text-sm font-bold text-white"
      >
        확정 + 다음 상품 ›
      </button>
    </div>
  </div>
);

export default VerificationPanelHeader;
