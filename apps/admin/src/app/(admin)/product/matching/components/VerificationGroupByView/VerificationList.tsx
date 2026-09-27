import { RefObject } from 'react';

import { BrandProduct } from '@/hooks/graphql/brandProduct';

import { PendingVerificationItem } from '../../types';
import VerificationItem from '../VerificationItem';

type Props = {
  rightScrollRef: RefObject<HTMLDivElement | null>;
  rightPanelRef: RefObject<HTMLDivElement | null>;
  pendingLoading: boolean;
  verificationItems: PendingVerificationItem[];
  verificationError: string | null;
  itemSelections: Record<string, boolean>;
  focusedPostIndex: number;
  isLeftPanelFocused: boolean;
  isLoadingVerificationMore: boolean;
  includeVerified: boolean;
  selectedBrandProduct: BrandProduct;
  handleItemClick: (idx: number) => void;
  toggleItemSelection: (itemId: string) => void;
  handleImageClick: (thumbnail: string, title: string) => void;
  handleRemoveMapping: (item: PendingVerificationItem) => Promise<void>;
};

// 우측 검증 항목 목록 (첫 로딩 / 항목 + 추가 로딩 / 빈 목록·에러 사유).
const VerificationList = ({
  rightScrollRef,
  rightPanelRef,
  pendingLoading,
  verificationItems,
  verificationError,
  itemSelections,
  focusedPostIndex,
  isLeftPanelFocused,
  isLoadingVerificationMore,
  includeVerified,
  selectedBrandProduct,
  handleItemClick,
  toggleItemSelection,
  handleImageClick,
  handleRemoveMapping,
}: Props) => (
  <div ref={rightScrollRef} className="flex-1 overflow-y-auto p-2">
    <div ref={rightPanelRef} />
    {pendingLoading && verificationItems.length === 0 ? (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-2 text-gray-500">검증 대기 목록 불러오는 중...</span>
      </div>
    ) : (
      <div className="space-y-1">
        {verificationItems.length > 0 ? (
          <>
            {verificationItems.map((item, index) => (
              <VerificationItem
                key={item.id}
                item={item}
                isSelected={itemSelections[item.id] ?? true}
                index={index}
                isFocused={focusedPostIndex === index && !isLeftPanelFocused}
                brandName={selectedBrandProduct.brandName}
                productName={selectedBrandProduct.productName}
                volume={selectedBrandProduct.volume}
                amount={selectedBrandProduct.amount}
                onItemClick={handleItemClick}
                onToggleSelection={toggleItemSelection}
                onImageClick={handleImageClick}
                onRemove={handleRemoveMapping}
              />
            ))}
            {isLoadingVerificationMore && (
              <div className="flex items-center justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="ml-2 text-xs text-gray-500">불러오는 중...</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stroke bg-white py-16 dark:border-strokedark dark:bg-boxdark">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <svg
                className="h-6 w-6 text-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              {verificationError ? '목록을 불러오지 못했습니다' : '매칭 항목이 없습니다'}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {verificationError
                ? verificationError
                : !includeVerified
                  ? '검증 완료된 항목은 필터에서 숨겨져 있습니다'
                  : '이 상품에 매칭된 게시물이 없습니다'}
            </p>
          </div>
        )}
      </div>
    )}
  </div>
);

export default VerificationList;
